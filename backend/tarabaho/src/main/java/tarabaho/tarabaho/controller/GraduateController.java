package tarabaho.tarabaho.controller;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import tarabaho.tarabaho.dto.AuthResponse;
import tarabaho.tarabaho.dto.GraduateDuplicateCheckDTO;
import tarabaho.tarabaho.dto.GraduateRegisterDTO;
import tarabaho.tarabaho.dto.GraduateUpdateDTO;
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.jwt.JwtUtil;
import tarabaho.tarabaho.repository.GraduateRepository;
import tarabaho.tarabaho.service.GraduateService;
import tarabaho.tarabaho.service.PasswordEncoderService;
import tarabaho.tarabaho.service.SupabaseRestStorageService;
import tarabaho.tarabaho.service.UserService;

@RestController
@RequestMapping("/api/graduate")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Graduate Controller", description = "Handles registration, login, and management of graduates")
public class GraduateController {

    @Autowired
    private GraduateService graduateService;

    @Autowired
    private GraduateRepository graduateRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @Autowired
    private SupabaseRestStorageService storageService;

    @Autowired
    private PasswordEncoderService passwordEncoderService;

    private String getUsernameFromAuthentication(Authentication authentication) {
        if (authentication.getPrincipal() instanceof OAuth2User) {
            OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
            String email = oauthUser.getAttribute("email");
            System.out.println("GraduateController: OAuth2 authentication detected, using email: " + email);
            return email;
        } else {
            String username = authentication.getName();
            System.out.println("GraduateController: Default authentication detected, using username: " + username);
            return username;
        }
    }
    

    @Operation(summary = "Get graduate by ID", description = "Retrieve a graduate by their ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Graduate retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Graduate not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<?> getGraduateById(@PathVariable Long id) {
        try {
            System.out.println("GraduateController: Handling GET /api/graduate/" + id);
            Optional<Graduate> graduateOpt = graduateRepository.findById(id);
            if (graduateOpt.isPresent()) {
                System.out.println("GraduateController: Graduate found with ID: " + id);
                return ResponseEntity.ok(graduateOpt.get());
            }
            System.out.println("GraduateController: Graduate not found for ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Graduate not found with id: " + id);
        } catch (Exception e) {
            System.out.println("GraduateController: Error retrieving graduate with ID: " + id + ", error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to retrieve graduate: " + e.getMessage());
        }
    }

  

    @Operation(summary = "Check for duplicate graduate details", description = "Checks if username, email, or phone number already exists")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "No duplicates found"),
        @ApiResponse(responseCode = "400", description = "Username, email, or phone number already exists")
    })
    @PostMapping("/check-duplicates")
    public ResponseEntity<?> checkDuplicates(@RequestBody GraduateDuplicateCheckDTO graduateDTO) {
        System.out.println("GraduateController: Checking duplicates for username: " + graduateDTO.getUsername());
        
        if (graduateService.findByUsername(graduateDTO.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("⚠️ Username already exists.");
        }
        if (graduateService.findByEmail(graduateDTO.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("⚠️ Email already exists.");
        }

        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Register new graduate", description = "Registers a new graduate in the system after checking for uniqueness and resets password to avoid double hashing")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Graduate registered successfully"),
        @ApiResponse(responseCode = "400", description = "Username, email, phone, or invalid input"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping("/register")
    public ResponseEntity<?> registerGraduate(@RequestBody GraduateRegisterDTO graduateDTO, HttpServletResponse response) {
        System.out.println("GraduateController: Received registration request for username: " + graduateDTO.getUsername());
        System.out.println("GraduateController: Received raw password: " + graduateDTO.getPassword());

        // Validate input
        if (graduateDTO.getUsername() == null || graduateDTO.getUsername().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("⚠️ Username is required.");
        }
        if (graduateService.findByUsername(graduateDTO.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("⚠️ Username already exists.");
        }
        if (graduateDTO.getEmail() == null || graduateDTO.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("⚠️ Email is required.");
        }
        if (graduateService.findByEmail(graduateDTO.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("⚠️ Email already exists.");
        }
       
        if (graduateDTO.getFirstName() == null || graduateDTO.getFirstName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("⚠️ First name is required.");
        }
        if (graduateDTO.getLastName() == null || graduateDTO.getLastName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("⚠️ Last name is required.");
        }
       
        if (graduateDTO.getPassword() == null || graduateDTO.getPassword().isEmpty()) {
            return ResponseEntity.badRequest().body("⚠️ Password is required.");
        }

        try {
            // Create graduate entity
            Graduate graduate = new Graduate();
            graduate.setUsername(graduateDTO.getUsername());
            // Set initial hashed password
            String hashedPassword = passwordEncoderService.encodePassword(graduateDTO.getPassword());
            System.out.println("GraduateController: Initial hashed password: " + hashedPassword);
            graduate.setPassword(hashedPassword);
            graduate.setFirstName(graduateDTO.getFirstName());
            graduate.setLastName(graduateDTO.getLastName());
            graduate.setEmail(graduateDTO.getEmail());
            graduate.setPhoneNumber(graduateDTO.getPhoneNumber());
            graduate.setAddress(graduateDTO.getAddress());
            

            if (graduateDTO.getBirthday() != null && !graduateDTO.getBirthday().isEmpty()) {
                graduate.setBirthday(LocalDate.parse(graduateDTO.getBirthday()));
            }

            // Register graduate
            Graduate registeredGraduate = graduateService.registerGraduate(graduate);
            System.out.println("GraduateController: Graduate registered successfully, ID: " + registeredGraduate.getId());

            // Immediately reset password to ensure single hashing
            System.out.println("GraduateController: Resetting password for username: " + graduateDTO.getUsername());
            Graduate savedGraduate = graduateRepository.findByUsername(graduateDTO.getUsername());
            if (savedGraduate == null) {
                System.out.println("GraduateController: Graduate not found for username: " + graduateDTO.getUsername() + " after registration");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Graduate not found after registration");
            }
            String newHashedPassword = passwordEncoderService.encodePassword(graduateDTO.getPassword());
            System.out.println("GraduateController: New hashed password after reset: " + newHashedPassword);
            savedGraduate.setPassword(newHashedPassword);
            graduateRepository.save(savedGraduate);
            System.out.println("GraduateController: Password reset successfully for username: " + graduateDTO.getUsername());

            return ResponseEntity.ok(registeredGraduate);
        } catch (Exception e) {
            System.out.println("GraduateController: Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to register graduate: " + e.getMessage());
        }
    }
/* 
    @Operation(summary = "Reset graduate password", description = "Resets the password for a graduate")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Password reset successfully"),
        @ApiResponse(responseCode = "400", description = "Graduate not found or invalid input"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetGraduatePassword(@RequestBody LoginRequest loginData) {
        try {
            System.out.println("GraduateController: Resetting password for username: " + loginData.getUsername());
            Graduate graduate = graduateRepository.findByUsername(loginData.getUsername());
            if (graduate == null) {
                System.out.println("GraduateController: Graduate not found for username: " + loginData.getUsername());
                return ResponseEntity.badRequest().body("Graduate not found");
            }
            if (loginData.getPassword() == null || loginData.getPassword().isEmpty()) {
                System.out.println("GraduateController: Invalid password provided for reset");
                return ResponseEntity.badRequest().body("Password is required");
            }
            String hashedPassword = passwordEncoderService.encodePassword(loginData.getPassword());
            System.out.println("GraduateController: New hashed password: " + hashedPassword);
            graduate.setPassword(hashedPassword);
            graduateRepository.save(graduate);
            System.out.println("GraduateController: Password reset successfully for username: " + loginData.getUsername());
            return ResponseEntity.ok("Password reset successfully");
        } catch (Exception e) {
            System.out.println("GraduateController: Password reset failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to reset password: " + e.getMessage());
        }
    }
*/
    @Operation(summary = "Test raw JSON input", description = "Logs raw JSON payload to debug deserialization")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Raw JSON received and logged"),
        @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PostMapping("/test-raw")
    public ResponseEntity<?> testRawJson(@RequestBody Map<String, String> rawData) {
        System.out.println("GraduateController: Raw JSON password: " + rawData.get("password"));
        return ResponseEntity.ok("Received password: " + rawData.get("password"));
    }

    @Operation(summary = "Test password hash", description = "Tests if a password matches a given hash")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Password match result returned"),
        @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @GetMapping("/test-password")
    public ResponseEntity<?> testPassword(@RequestParam String password, @RequestParam String hashed) {
        boolean matches = passwordEncoderService.matches(password, hashed);
        System.out.println("GraduateController: Testing password: " + password + ", Hash: " + hashed + ", Matches: " + matches);
        return ResponseEntity.ok("Matches: " + matches);
    }

    @Operation(summary = "Upload initial profile picture during registration", description = "Allows uploading a 2x2 profile picture for a newly registered graduate without authentication, only if no picture exists")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile picture uploaded successfully"),
        @ApiResponse(responseCode = "400", description = "No file uploaded, invalid file, or profile picture already exists"),
        @ApiResponse(responseCode = "404", description = "Graduate not found"),
        @ApiResponse(responseCode = "500", description = "Failed to upload file")
    })
    @PostMapping("/{graduateId}/upload-initial-picture")
    public ResponseEntity<?> uploadInitialProfilePicture(
            @PathVariable Long graduateId,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        try {
            System.out.println("GraduateController: Starting upload-initial-picture for graduateId: " + graduateId);

            Graduate graduate = graduateService.findById(graduateId);
            if (graduate == null) {
                System.out.println("GraduateController: Graduate not found for ID: " + graduateId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Graduate not found.");
            }

            if (graduate.getProfilePicture() != null && !graduate.getProfilePicture().isEmpty()) {
                System.out.println("GraduateController: Profile picture already exists for graduateId: " + graduateId);
                return ResponseEntity.badRequest().body("Profile picture already exists.");
            }

            if (file == null || file.isEmpty()) {
                System.out.println("GraduateController: No file uploaded for graduateId: " + graduateId);
                return ResponseEntity.badRequest().body("No file uploaded.");
            }

            // Upload to Supabase
            String publicUrl = storageService.uploadFile(file, "profile-picture");
            graduate.setProfilePicture(publicUrl);
            graduateService.editGraduate(graduateId, graduate);

            System.out.println("GraduateController: Initial profile picture uploaded successfully for graduateId: " + graduateId);
            return ResponseEntity.ok(graduate);
        } catch (IllegalArgumentException e) {
            System.out.println("GraduateController: Initial profile picture upload failed for graduateId: " + graduateId + ", error: " + e.getMessage());
            return ResponseEntity.badRequest().body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            System.out.println("GraduateController: Initial profile picture upload failed for graduateId: " + graduateId + ", error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload file: " + e.getMessage());
        }
    }

    @Operation(summary = "Generate JWT token for graduate", description = "Authenticate graduate with username and password and return JWT token as JSON")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Login successful, token returned"),
        @ApiResponse(responseCode = "401", description = "Invalid username or password")
    })
    @PostMapping("/token")
    public ResponseEntity<AuthResponse> generateToken(
            @RequestBody LoginRequest loginData,
            HttpServletResponse response
    ) {
        try {
            System.out.println("GraduateController: Attempting login for username: " + loginData.getUsername());
            Graduate graduate = graduateService.loginGraduate(loginData.getUsername(), loginData.getPassword());
            String jwtToken = jwtUtil.generateToken(graduate.getUsername(),"GRADUATE");

            Cookie tokenCookie = new Cookie("jwtToken", jwtToken);
            tokenCookie.setHttpOnly(true);
            tokenCookie.setSecure(true);
            tokenCookie.setPath("/");
            tokenCookie.setMaxAge(24 * 60 * 60);
            tokenCookie.setAttribute("SameSite", "None");
            response.addCookie(tokenCookie);
            System.out.println("GraduateController: Token generated and cookie set for username: " + graduate.getUsername());

            AuthResponse body = new AuthResponse(jwtToken, graduate.getId());
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            System.out.println("GraduateController: Login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse(null, null));
        }
    }

    @Operation(summary = "Get JWT token from cookie", description = "Retrieve the JWT token from the HttpOnly cookie for WebSocket authentication")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Token retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "No valid token found")
    })
    @GetMapping("/get-token")
    public ResponseEntity<?> getToken(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("GraduateController: getToken failed: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
            }

            String username;
            if (authentication.getPrincipal() instanceof OAuth2User) {
                OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
                username = oauthUser.getAttribute("email"); // Use email for OAuth2 users
                System.out.println("GraduateController: OAuth2 authentication detected, using email: " + username);
                System.out.println("GraduateController: OAuth2User attributes: " + oauthUser.getAttributes());
            } else {
                username = authentication.getName(); // Use username for default login
                System.out.println("GraduateController: Default authentication detected, using username: " + username);
            }

            if (username == null || username.isEmpty()) {
                System.out.println("GraduateController: getToken failed: Username/email is null or empty");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid authentication: No username/email found");
            }

            Optional<Graduate> graduate = graduateService.findByUsername(username);
            if (!graduate.isPresent()) {
                System.out.println("GraduateController: Graduate not found for username: " + username);
                // Fallback to email-based lookup for robustness
                graduate = graduateService.findByEmail(username);
                if (!graduate.isPresent()) {
                    System.out.println("GraduateController: Graduate not found for email: " + username);
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Graduate not found");
                }
            }

            String token = jwtUtil.generateToken(username,"GRADUATE");
            System.out.println("GraduateController: Generated token for graduate: " + username);
            return ResponseEntity.ok(new TokenResponse(token));
        } catch (Exception e) {
            System.err.println("GraduateController: getToken failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @Operation(summary = "Logout graduate", description = "Logs out the currently authenticated graduate")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Graduate logged out successfully"),
        @ApiResponse(responseCode = "500", description = "Logout failed")
    })
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        try {
            System.out.println("GraduateController: Entering /logout endpoint");

            // Clear theていJWT cookie
            Cookie tokenCookie = new Cookie("jwtToken", null);
            tokenCookie.setMaxAge(0);
            tokenCookie.setPath("/");
            tokenCookie.setHttpOnly(true);
            tokenCookie.setSecure(true);
            tokenCookie.setAttribute("SameSite", "None");
            response.addCookie(tokenCookie);
            System.out.println("GraduateController: Cookie cleared: jwtToken=; Path=/; Max-Age=0; HttpOnly; SameSite=None");

            // Invalidate session
            request.getSession(false).invalidate();

            return ResponseEntity.ok("Graduate logged out successfully.");
        } catch (Exception e) {
            System.err.println("GraduateController: Logout failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Logout failed: " + e.getMessage());
        }
    }

    @Operation(summary = "Login graduate (session-based)", description = "Authenticate a graduate using username and password")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Graduate logged in successfully"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    @PostMapping("/login")
    public ResponseEntity<?> loginGraduate(@RequestBody Graduate graduate) {
        try {
            System.out.println("GraduateController: Attempting session login for username: " + graduate.getUsername());
            Graduate loggedInGraduate = graduateService.loginGraduate(graduate.getUsername(), graduate.getPassword());
            return ResponseEntity.ok(loggedInGraduate);
        } catch (Exception e) {
            System.out.println("GraduateController: Session login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password.");
        }
    }

    @Operation(summary = "Upload profile picture", description = "Uploads a profile picture for a graduate after authentication")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile picture uploaded successfully"),
        @ApiResponse(responseCode = "400", description = "No file uploaded or invalid file"),
        @ApiResponse(responseCode = "401", description = "Graduate not authenticated"),
        @ApiResponse(responseCode = "403", description = "Unauthorized to upload picture for another graduate"),
        @ApiResponse(responseCode = "404", description = "Graduate not found"),
        @ApiResponse(responseCode = "500", description = "Failed to upload file")
    })
    @PostMapping("/{graduateId}/upload-picture")
    public ResponseEntity<?> uploadProfilePicture(
            @PathVariable Long graduateId,
            @RequestPart("file") MultipartFile file,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("GraduateController: Upload picture failed: Graduate not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Graduate not authenticated.");
            }

            String username = getUsernameFromAuthentication(authentication);
            Optional<Graduate> graduateOpt = graduateService.findByUsername(username);
            if (!graduateOpt.isPresent()) {
                graduateOpt = graduateService.findByEmail(username); // Fallback for OAuth2 email
                if (!graduateOpt.isPresent()) {
                    System.out.println("GraduateController: Upload picture failed: Graduate not found for username/email: " + username);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Graduate not found for username/email: " + username);
                }
            }
            Graduate graduate = graduateOpt.get();

            if (!graduate.getId().equals(graduateId)) {
                System.out.println("GraduateController: Upload picture failed: Unauthorized for graduateId: " + graduateId + ", authenticated graduateId: " + graduate.getId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Unauthorized: Cannot upload picture for another graduate");
            }

            if (file == null || file.isEmpty()) {
                System.out.println("GraduateController: Upload picture failed: No file uploaded for graduateId: " + graduateId);
                return ResponseEntity.badRequest().body("No file uploaded.");
            }

            // Delete existing profile picture if it exists
            if (graduate.getProfilePicture() != null && !graduate.getProfilePicture().isEmpty()) {
                String existingFileName = graduate.getProfilePicture().substring(graduate.getProfilePicture().lastIndexOf("/") + 1);
                try {
                    storageService.deleteFile("profile-picture", existingFileName);
                } catch (IOException e) {
                    System.err.println("Failed to delete old profile picture: " + e.getMessage());
                }
            }

            // Upload to Supabase
            String publicUrl = storageService.uploadFile(file, "profile-picture");
            graduate.setProfilePicture(publicUrl);
            graduateService.editGraduate(graduateId, graduate);

            System.out.println("GraduateController: Profile picture uploaded successfully for graduateId: " + graduateId);
            return ResponseEntity.ok(graduate);
        } catch (IllegalArgumentException e) {
            System.out.println("GraduateController: Upload picture failed for graduateId: " + graduateId + ", error: " + e.getMessage());
            return ResponseEntity.badRequest().body("⚠️ " + e.getMessage());
        } catch (IOException e) {
            System.out.println("GraduateController: Upload picture failed for graduateId: " + graduateId + ", error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to upload file: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("GraduateController: Upload picture failed for graduateId: " + graduateId + ", error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to upload file: " + e.getMessage());
        }
    }

    @Operation(summary = "Get all graduates", description = "Retrieve a list of all registered graduates")
    @ApiResponse(responseCode = "200", description = "List of graduates returned successfully")
    @GetMapping("/all")
    public List<Graduate> getAllGraduates() {
        return graduateService.getAllGraduates();
    }

   



    @Operation(summary = "Update graduate profile", description = "Updates profile details for the authenticated graduate")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input or unauthorized"),
        @ApiResponse(responseCode = "401", description = "Graduate not authenticated"),
        @ApiResponse(responseCode = "404", description = "Graduate not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<?> updateGraduate(@PathVariable Long id, @RequestBody GraduateUpdateDTO graduateDTO, Authentication authentication) {
        System.out.println("GraduateController: Received update request for graduate ID: " + id);

        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("GraduateController: Update failed: Graduate not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Graduate not authenticated.");
            }

            String username = getUsernameFromAuthentication(authentication);
            Optional<Graduate> graduateOpt = graduateService.findByUsername(username);
            if (!graduateOpt.isPresent()) {
                graduateOpt = graduateService.findByEmail(username); // Fallback for OAuth2 email
                if (!graduateOpt.isPresent()) {
                    System.out.println("GraduateController: Update failed: Graduate not found for username/email: " + username);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Graduate not found for username/email: " + username);
                }
            }
            Graduate existingGraduate = graduateOpt.get();

            if (!existingGraduate.getId().equals(id)) {
                System.out.println("GraduateController: Update failed: Unauthorized for graduateId: " + id + ", authenticated graduateId: " + existingGraduate.getId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("⚠️ You are not authorized to update this profile.");
            }

            if (graduateDTO.getEmail() != null && !graduateDTO.getEmail().equals(existingGraduate.getEmail())) {
                if (graduateService.findByEmail(graduateDTO.getEmail()).isPresent()) {
                    System.out.println("GraduateController: Update failed: Email already exists: " + graduateDTO.getEmail());
                    return ResponseEntity.badRequest().body("⚠️ Email already exists.");
                }
                existingGraduate.setEmail(graduateDTO.getEmail());
            }
            if (graduateDTO.getPhoneNumber() != null && !graduateDTO.getPhoneNumber().equals(existingGraduate.getPhoneNumber())) {
                if (graduateService.findByPhoneNumber(graduateDTO.getPhoneNumber()).isPresent()) {
                    System.out.println("GraduateController: Update failed: Phone number already exists: " + graduateDTO.getPhoneNumber());
                    return ResponseEntity.badRequest().body("⚠️ Phone number already exists.");
                }
                existingGraduate.setPhoneNumber(graduateDTO.getPhoneNumber());
            }

            if (graduateDTO.getAddress() != null) {
                existingGraduate.setAddress(graduateDTO.getAddress());
            }
            if (graduateDTO.getBiography() != null) {
                existingGraduate.setBiography(graduateDTO.getBiography());
            }
            if (graduateDTO.getFirstName() != null) {
                existingGraduate.setFirstName(graduateDTO.getFirstName());
            }
            if (graduateDTO.getLastName() != null) {
                existingGraduate.setLastName(graduateDTO.getLastName());
            }
            if (graduateDTO.getBirthday() != null && !graduateDTO.getBirthday().isEmpty()) {
                existingGraduate.setBirthday(LocalDate.parse(graduateDTO.getBirthday()));
            }
            if (graduateDTO.getPassword() != null && !graduateDTO.getPassword().isEmpty()) {
                String hashedPassword = passwordEncoderService.encodePassword(graduateDTO.getPassword());
                existingGraduate.setPassword(hashedPassword);
            }

            Graduate updatedGraduate = graduateService.updateGraduate(existingGraduate);
            System.out.println("GraduateController: Graduate updated successfully, ID: " + updatedGraduate.getId());
            return ResponseEntity.ok(updatedGraduate);
        } catch (IllegalArgumentException e) {
            System.out.println("GraduateController: Update failed: " + e.getMessage());
            return ResponseEntity.badRequest().body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            System.out.println("GraduateController: Update failed: " + e.getMessage());
            return ResponseEntity.badRequest().body("⚠️ Failed to update profile: " + e.getMessage());
        }
    }


    

    @Operation(summary = "Get graduate by username", description = "Find a graduate by their username")
    @GetMapping("/username/{username}")
    public ResponseEntity<?> getGraduateByUsername(@PathVariable String username) {
        Optional<Graduate> graduateOpt = graduateService.findByUsername(username);
        if (graduateOpt.isPresent()) {
            return ResponseEntity.ok(graduateOpt.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Graduate not found with username: " + username);
        }
    }

    @Operation(summary = "Request password reset OTP for graduate", description = "Sends a reset OTP to the graduate's email")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "OTP sent successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid email or graduate not found"),
        @ApiResponse(responseCode = "500", description = "Failed to send OTP")
    })
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                System.out.println("GraduateController: Forgot password failed: Email is required");
                return ResponseEntity.badRequest().body("Email is required");
            }
            if (!request.getEmail().matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")) {
                System.out.println("GraduateController: Forgot password failed: Invalid email format");
                return ResponseEntity.badRequest().body("Invalid email format");
            }
            graduateService.sendResetOtp(request.getEmail());
            System.out.println("GraduateController: OTP sent to email: " + request.getEmail());
            return ResponseEntity.ok("OTP sent to your email.");
        } catch (IllegalArgumentException e) {
            System.out.println("GraduateController: Forgot password failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.err.println("GraduateController: Forgot password failed: " + e.getClass().getName() + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }

    @Operation(summary = "Reset graduate password with OTP", description = "Verifies OTP and resets the graduate's password")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Password reset successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid OTP, expired OTP, or invalid input"),
        @ApiResponse(responseCode = "500", description = "Failed to reset password")
    })
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                System.out.println("GraduateController: Reset password failed: Email is required");
                return ResponseEntity.badRequest().body("Email is required");
            }
            if (request.getOtp() == null || request.getOtp().trim().isEmpty()) {
                System.out.println("GraduateController: Reset password failed: OTP is required");
                return ResponseEntity.badRequest().body("OTP is required");
            }
            if (request.getNewPassword() == null || request.getNewPassword().trim().isEmpty()) {
                System.out.println("GraduateController: Reset password failed: New password is required");
                return ResponseEntity.badRequest().body("New password is required");
            }
            graduateService.verifyAndReset(request.getEmail(), request.getOtp(), request.getNewPassword());
            System.out.println("GraduateController: Password reset successfully for email: " + request.getEmail());
            return ResponseEntity.ok("Password reset successfully.");
        } catch (IllegalArgumentException e) {
            System.out.println("GraduateController: Reset password failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.err.println("GraduateController: Reset password failed: " + e.getClass().getName() + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }
    

    


    static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    

   

   

    static class TokenResponse {
        private String token;
        public TokenResponse(String token) { this.token = token; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }

    static class ForgotPasswordRequest {
        private String email;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    static class ResetPasswordRequest {
        private String email;
        private String otp;
        private String newPassword;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getOtp() { return otp; }
        public void setOtp(String otp) { this.otp = otp; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
package tarabaho.tarabaho.controller;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
import tarabaho.tarabaho.entity.CategoryRequest;
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.entity.User;
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

    @GetMapping("/category/{categoryName}/graduates")
    public ResponseEntity<List<Graduate>> getGraduatesByCategory(@PathVariable String categoryName) {
        List<Graduate> graduates = graduateService.getGraduatesByCategory(categoryName);
        return ResponseEntity.ok(graduates);
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
        if (graduateDTO.getPhoneNumber() != null && !graduateDTO.getPhoneNumber().isEmpty() &&
                graduateService.findByPhoneNumber(graduateDTO.getPhoneNumber()).isPresent()) {
            return ResponseEntity.badRequest().body("⚠️ Phone number already exists.");
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
        if (graduateDTO.getPhoneNumber() != null && !graduateDTO.getPhoneNumber().isEmpty() &&
                graduateService.findByPhoneNumber(graduateDTO.getPhoneNumber()).isPresent()) {
            return ResponseEntity.badRequest().body("⚠️ Phone number already exists.");
        }
        if (graduateDTO.getFirstName() == null || graduateDTO.getFirstName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("⚠️ First name is required.");
        }
        if (graduateDTO.getLastName() == null || graduateDTO.getLastName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("⚠️ Last name is required.");
        }
        if (graduateDTO.getHourly() <= 0) {
            return ResponseEntity.badRequest().body("⚠️ Hourly rate must be provided and greater than 0.");
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
            graduate.setHourly(graduateDTO.getHourly());

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
            String jwtToken = jwtUtil.generateToken(graduate.getUsername());

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
            String username = authentication.getName();
            System.out.println("GraduateController: getToken for username: " + username);
            
            Optional<Graduate> graduate = graduateService.findByUsername(username);
            if (!graduate.isPresent()) {
                System.out.println("GraduateController: Graduate not found for username: " + username);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Graduate not found");
            }
            
            String token = jwtUtil.generateToken(username);
            System.out.println("GraduateController: Generated token for graduate: " + username);
            return ResponseEntity.ok(new TokenResponse(token));
        } catch (Exception e) {
            System.err.println("GraduateController: getToken failed: " + e.getMessage());
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

            String username = authentication.getName();
            Optional<Graduate> graduateOpt = graduateService.findByUsername(username);
            if (!graduateOpt.isPresent()) {
                System.out.println("GraduateController: Upload picture failed: Graduate not found for username: " + username);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Graduate not found for username: " + username);
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

    @Operation(summary = "Get available graduates", description = "Retrieve a list of all available graduates")
    @ApiResponse(responseCode = "200", description = "List of available graduates returned successfully")
    @GetMapping("/available")
    public List<Graduate> getAvailableGraduates() {
        return graduateRepository.findAllAvailable();
    }

    @Operation(summary = "Get graduates by minimum rating", description = "Retrieve graduates with a minimum star rating")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "List of graduates returned successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid rating value")
    })
    @GetMapping("/stars/{minStars}")
    public ResponseEntity<List<Graduate>> getGraduatesByMinimumStars(@PathVariable Double minStars) {
        if (minStars < 1.0 || minStars > 5.0) {
            return ResponseEntity.badRequest().body(null);
        }
        return ResponseEntity.ok(graduateRepository.findByMinimumStars(minStars));
    }

    @Operation(summary = "Get graduates by maximum hourly rate", description = "Retrieve graduates with an hourly rate below a specified value")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "List of graduates returned successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid hourly rate")
    })
    @GetMapping("/hourly/{maxHourly}")
    public ResponseEntity<List<Graduate>> getGraduatesByMaxHourly(@PathVariable Double maxHourly) {
        if (maxHourly <= 0) {
            return ResponseEntity.badRequest().body(null);
        }
        return ResponseEntity.ok(graduateRepository.findByMaxHourly(maxHourly));
    }

    @Operation(summary = "Rate a graduate", description = "Submit a rating (1.0–5.0) for a graduate")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Rating submitted successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid rating value"),
        @ApiResponse(responseCode = "404", description = "Graduate not found")
    })
    @PostMapping("/{graduateId}/rate")
    public ResponseEntity<?> rateGraduate(
            @PathVariable Long graduateId,
            @RequestBody RatingRequest ratingRequest,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
            }
            User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new Exception("User not found"));
            Graduate updatedGraduate = graduateService.updateRating(
                graduateId,
                ratingRequest.getBookingId(),
                ratingRequest.getRating(),
                user.getId()
            );
            return ResponseEntity.ok(updatedGraduate);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Post urgent job", description = "Posts an urgent job and finds nearby graduates in the specified category")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Job posted and graduates found"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "User not authenticated or not verified"),
        @ApiResponse(responseCode = "404", description = "No graduates found")
    })
    @PostMapping("/urgent-job")
    public ResponseEntity<?> postUrgentJob(
            @RequestBody UrgentJobRequest urgentJobRequest,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
            }

            String username = authentication.getName();
            Optional<User> userOpt = userService.findByUsername(username);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
            }
            User user = userOpt.get();
            if (!user.getIsVerified()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not verified.");
            }

            if (urgentJobRequest.getCategoryName() == null || urgentJobRequest.getCategoryName().isEmpty()) {
                return ResponseEntity.badRequest().body("⚠️ Category name is required.");
            }
            if (urgentJobRequest.getLatitude() == null || urgentJobRequest.getLongitude() == null) {
                return ResponseEntity.badRequest().body("⚠️ Location (latitude and longitude) is required.");
            }
            if (urgentJobRequest.getRadius() == null || urgentJobRequest.getRadius() <= 0) {
                return ResponseEntity.badRequest().body("⚠️ Radius must be greater than 0.");
            }

            List<Graduate> nearbyGraduates = graduateService.findNearbyGraduatesForUrgentJob(
                urgentJobRequest.getCategoryName(),
                urgentJobRequest.getLatitude(),
                urgentJobRequest.getLongitude(),
                urgentJobRequest.getRadius()
            );

            if (nearbyGraduates.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No available graduates found nearby.");
            }

            System.out.println("Found " + nearbyGraduates.size() + " graduates for urgent job in category: " + urgentJobRequest.getCategoryName());
            return ResponseEntity.ok(new UrgentJobResponse(nearbyGraduates.size()));
        } catch (Exception e) {
            System.out.println("GraduateController: Urgent job posting failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to post urgent job: " + e.getMessage());
        }
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
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Graduate not authenticated.");
            }

            Graduate existingGraduate = graduateService.findById(id);
            String authenticatedUsername = authentication.getName();
            if (!existingGraduate.getUsername().equals(authenticatedUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("⚠️ You are not authorized to update this profile.");
            }

            if (graduateDTO.getEmail() != null && !graduateDTO.getEmail().equals(existingGraduate.getEmail())) {
                if (graduateService.findByEmail(graduateDTO.getEmail()).isPresent()) {
                    return ResponseEntity.badRequest().body("⚠️ Email already exists.");
                }
                existingGraduate.setEmail(graduateDTO.getEmail());
            }

            if (graduateDTO.getPhoneNumber() != null && !graduateDTO.getPhoneNumber().equals(existingGraduate.getPhoneNumber())) {
                if (!graduateDTO.getPhoneNumber().isEmpty() && graduateService.findByPhoneNumber(graduateDTO.getPhoneNumber()).isPresent()) {
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
            if (graduateDTO.getHourly() != null) {
                if (graduateDTO.getHourly() <= 0) {
                    return ResponseEntity.badRequest().body("⚠️ Hourly rate must be greater than 0.");
                }
                existingGraduate.setHourly(graduateDTO.getHourly());
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
            return ResponseEntity.badRequest().body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("⚠️ Failed to update profile: " + e.getMessage());
        }
    }

    @Operation(summary = "Get similar graduates", description = "Retrieve a list of graduates similar to the specified graduate based on categories or other criteria")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "List of similar graduates retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Graduate not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/{id}/similar")
    public ResponseEntity<?> getSimilarGraduates(@PathVariable Long id) {
        try {
            System.out.println("GraduateController: Handling GET /api/graduate/" + id + "/similar");
            List<Graduate> similarGraduates = graduateService.getSimilarGraduates(id);
            if (similarGraduates.isEmpty()) {
                System.out.println("GraduateController: No similar graduates found for ID: " + id);
                return ResponseEntity.status(HttpStatus.OK).body(Collections.emptyList());
            }
            System.out.println("GraduateController: Found " + similarGraduates.size() + " similar graduates for ID: " + id);
            return ResponseEntity.ok(similarGraduates);
        } catch (IllegalArgumentException e) {
            System.out.println("GraduateController: Error retrieving similar graduates for ID: " + id + ", error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Graduate not found: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("GraduateController: Error retrieving similar graduates for ID: " + id + ", error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to retrieve similar graduates: " + e.getMessage());
        }
    }

    @GetMapping("/category/{categoryName}/available")
    public ResponseEntity<List<Graduate>> getAvailableGraduatesByCategory(@PathVariable String categoryName) {
        List<Graduate> graduates = graduateService.getAvailableGraduatesByCategory(categoryName);
        return ResponseEntity.ok(graduates);
    }

    @GetMapping("/category/{categoryName}/nearby/available")
    public ResponseEntity<?> getNearbyAvailableGraduatesByCategory(
            @PathVariable String categoryName,
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam Double radius,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
            }

            String username = authentication.getName();
            Optional<User> userOpt = userService.findByUsername(username);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
            }
            User user = userOpt.get();
            if (!user.getIsVerified()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not verified.");
            }

            List<Graduate> graduates = graduateService.getNearbyAvailableGraduatesByCategory(categoryName, latitude, longitude, radius);
            return ResponseEntity.ok(graduates);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
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
    // NEW: Endpoint for graduates to submit a single category request
    @Operation(summary = "Request to add category", description = "Allows a graduate to request to be added to a category")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Category request submitted successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid category or request already exists"),
        @ApiResponse(responseCode = "401", description = "Graduate not authenticated"),
        @ApiResponse(responseCode = "404", description = "Graduate not found")
    })
    @PostMapping("/{graduateId}/request-category")
    public ResponseEntity<?> requestCategory(
            @PathVariable Long graduateId,
            @RequestBody CategoryRequestDTO categoryRequestDTO,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Graduate not authenticated.");
            }
            String username = authentication.getName();
            Optional<Graduate> graduateOpt = graduateService.findByUsername(username);
            if (!graduateOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Graduate not found.");
            }
            Graduate graduate = graduateOpt.get();
            if (!graduate.getId().equals(graduateId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Unauthorized: Cannot request category for another graduate.");
            }
            CategoryRequest request = graduateService.requestCategory(graduateId, categoryRequestDTO.getCategoryName());
            return ResponseEntity.ok(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to submit category request: " + e.getMessage());
        }
    }

    // NEW: Endpoint to retrieve all category requests for a specific graduate
    @Operation(summary = "Get category requests for a graduate", description = "Retrieve all category requests for a specific graduate")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "List of category requests returned successfully"),
        @ApiResponse(responseCode = "401", description = "Graduate not authenticated"),
        @ApiResponse(responseCode = "404", description = "Graduate not found")
    })
    @GetMapping("/{graduateId}/category-requests")
    public ResponseEntity<?> getCategoryRequests(
            @PathVariable Long graduateId,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Graduate not authenticated.");
            }
            String username = authentication.getName();
            Optional<Graduate> graduateOpt = graduateService.findByUsername(username);
            if (!graduateOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Graduate not found.");
            }
            Graduate graduate = graduateOpt.get();
            if (!graduate.getId().equals(graduateId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Unauthorized: Cannot view category requests for another graduate.");
            }
            List<CategoryRequest> requests = graduateService.getCategoryRequestsByGraduateId(graduateId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to retrieve category requests: " + e.getMessage());
        }
    }
    


    // NEW: DTO class for handling single category request payload
    static class CategoryRequestDTO {
        private String categoryName;
        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    }

    static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    static class RatingRequest {
        private Long bookingId;
        private Double rating;
        public Long getBookingId() { return bookingId; }
        public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
        public Double getRating() { return rating; }
        public void setRating(Double rating) { this.rating = rating; }
    }

    static class UrgentJobRequest {
        private String categoryName;
        private Double latitude;
        private Double longitude;
        private Double radius;

        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
        public Double getRadius() { return radius; }
        public void setRadius(Double radius) { this.radius = radius; }
    }

    static class UrgentJobResponse {
        private int graduatesNotified;

        public UrgentJobResponse(int graduatesNotified) {
            this.graduatesNotified = graduatesNotified;
        }

        public int getGraduatesNotified() { return graduatesNotified; }
        public void setGraduatesNotified(int graduatesNotified) { this.graduatesNotified = graduatesNotified; }
    }

    static class TokenResponse {
        private String token;
        public TokenResponse(String token) { this.token = token; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }
}
package tarabaho.tarabaho.controller;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
import tarabaho.tarabaho.entity.User;
import tarabaho.tarabaho.jwt.JwtUtil;
import tarabaho.tarabaho.service.PasswordEncoderService;
import tarabaho.tarabaho.service.SupabaseRestStorageService;
import tarabaho.tarabaho.service.UserService;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "User Controller", description = "Handles user registration, login, logout, and profile operations")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private SupabaseRestStorageService storageService;

    @Autowired
    private PasswordEncoderService passwordEncoderService;

    @Operation(summary = "Get all users", description = "Retrieve a list of all registered users")
    @ApiResponse(responseCode = "200", description = "List of users returned successfully")
    @GetMapping("/all")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @Operation(summary = "Register a new user", description = "Registers a new user after checking for uniqueness")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User registered successfully"),
        @ApiResponse(responseCode = "400", description = "Username, email, phone, or invalid input")
    })
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        System.out.println("UserController: Received registration request for username: " + user.getUsername());

        if (userService.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("⚠️ Username already exists.");
        }
        if (userService.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("⚠️ Email already exists.");
        }
        if (user.getPhoneNumber() != null && !user.getPhoneNumber().isEmpty() &&
                userService.findByPhoneNumber(user.getPhoneNumber()).isPresent()) {
            return ResponseEntity.badRequest().body("⚠️ Phone number already exists.");
        }
        if (user.getPreferredRadius() != null && user.getPreferredRadius() <= 0) {
            return ResponseEntity.badRequest().body("⚠️ Preferred radius must be greater than 0.");
        }

        User savedUser = userService.registerUser(user);
        System.out.println("UserController: User registered successfully, ID: " + savedUser.getId());
        return ResponseEntity.ok(savedUser);
    }

    @Operation(
        summary = "Generate JWT token",
        description = "Authenticate user with username and password and return JWT token as JSON"
    )
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
            System.out.println("UserController: Attempting login for username: " + loginData.getUsername());
            User user = userService.loginUser(loginData.getUsername(), loginData.getPassword());
            String jwtToken = jwtUtil.generateToken(user.getUsername());

            Cookie tokenCookie = new Cookie("jwtToken", jwtToken);
            tokenCookie.setHttpOnly(true);
            tokenCookie.setSecure(true);
            tokenCookie.setPath("/");
            tokenCookie.setMaxAge(24 * 60 * 60);
            tokenCookie.setAttribute("SameSite", "None");
            response.addCookie(tokenCookie);
            System.out.println("UserController: Token generated and cookie set for username: " + user.getUsername());

            AuthResponse body = new AuthResponse(jwtToken,null);
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            System.out.println("UserController: Login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse(null, null));


        }
    }

    @Operation(summary = "Login user (session-based)", description = "Authenticate user with username and password and store in session")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User logged in successfully"),
        @ApiResponse(responseCode = "401", description = "Invalid username or password")
    })
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginData, HttpServletRequest request) {
        try {
            System.out.println("UserController: Attempting session login for username: " + loginData.getUsername());
            User user = userService.loginUser(loginData.getUsername(), loginData.getPassword());
            request.getSession(true).setAttribute("user", user);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            System.out.println("UserController: Session login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password.");
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
                System.out.println("UserController: getToken failed: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
            }
            String username = authentication.getName();
            System.out.println("UserController: getToken for username: " + username);
            
            Optional<User> user = userService.findByUsername(username);
            if (!user.isPresent()) {
                System.out.println("UserController: User not found for username: " + username);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }
            
            String token = jwtUtil.generateToken(username);
            System.out.println("UserController: Generated token for user: " + username);
            return ResponseEntity.ok(new TokenResponse(token));
        } catch (Exception e) {
            System.err.println("UserController: getToken failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @Operation(summary = "Delete user", description = "Deletes a user by ID")
    @ApiResponse(responseCode = "200", description = "User deleted successfully")
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    @Operation(summary = "Get current logged-in user", description = "Returns the user info of the authenticated user")
    @ApiResponse(responseCode = "200", description = "User retrieved successfully")
    @GetMapping("/me")
    public User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        String username = authentication.getName();
        Optional<User> user = userService.findByUsername(username);
        return user.orElse(null);
    }

    @Operation(summary = "Update phone number", description = "Updates the phone number for the currently logged-in user")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Phone number updated"),
        @ApiResponse(responseCode = "400", description = "Phone number already exists"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/update-phone")
    public ResponseEntity<?> updatePhone(
            Authentication authentication,
            @RequestBody PhoneUpdateRequest request
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
        }
        String username = authentication.getName();
        Optional<User> userOpt = userService.findByUsername(username);

        if (!userOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }

        try {
            User user = userOpt.get();
            userService.updateUserPhone(user.getEmail(), request.getPhoneNumber());
            return ResponseEntity.ok("Phone number updated successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
    }

    @Operation(summary = "Upload profile picture", description = "Uploads a profile picture for the currently logged-in user")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile picture uploaded successfully"),
        @ApiResponse(responseCode = "400", description = "No file uploaded or invalid file"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "500", description = "Failed to upload file")
    })
    @PostMapping("/upload-picture")
    public ResponseEntity<?> uploadProfilePicture(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
        }
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("No file uploaded.");
        }

        try {
            // Validate authentication
            String username = authentication.getName();
            Optional<User> userOpt = userService.findByUsername(username);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
            }

            User user = userOpt.get();

            // Delete existing profile picture if it exists
            if (user.getProfilePicture() != null && !user.getProfilePicture().isEmpty()) {
                String existingFileName = user.getProfilePicture().substring(user.getProfilePicture().lastIndexOf("/") + 1);
                try {
                    storageService.deleteFile("profile-picture", existingFileName);
                } catch (IOException e) {
                    // Log the error but continue with the upload to avoid blocking the user
                    System.err.println("Failed to delete old profile picture: " + e.getMessage());
                }
            }

            // Upload new profile picture to Supabase
            String publicUrl = storageService.uploadFile(file, "profile-picture");

            // Update user profile picture
            user.setProfilePicture(publicUrl);
            userService.saveUser(user);

            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("⚠️ " + e.getMessage());
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload file: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred: " + e.getMessage());
        }
    }

    @Operation(summary = "Update user profile", description = "Updates profile details for the currently logged-in user")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/update-profile")
public ResponseEntity<?> updateProfile(
    Authentication authentication,
    @RequestBody ProfileUpdateRequest request
) {
    if (authentication == null || !authentication.isAuthenticated()) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
    }

    String username = authentication.getName();
    Optional<User> userOpt = userService.findByUsername(username);
    if (!userOpt.isPresent()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
    }

    User user = userOpt.get();
    try {
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            if (userService.findByEmail(request.getEmail()).isPresent() && !request.getEmail().equals(user.getEmail())) {
                return ResponseEntity.badRequest().body("⚠️ Email already exists.");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getLocation() != null) {
            user.setLocation(request.getLocation());
        }
        if (request.getBirthday() != null && !request.getBirthday().isEmpty()) {
            try {
                LocalDate birthday = LocalDate.parse(request.getBirthday());
                user.setBirthday(birthday);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Invalid birthday format. Use YYYY-MM-DD.");
            }
        }
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            if (request.getPassword().length() < 8) {
                return ResponseEntity.badRequest().body("⚠️ Password must be at least 8 characters long.");
            }
            String hashedPassword = passwordEncoderService.encodePassword(request.getPassword());
            user.setPassword(hashedPassword);
        }
        if (request.getLatitude() != null) {
            user.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            user.setLongitude(request.getLongitude());
        }
        if (request.getPreferredRadius() != null) {
            if (request.getPreferredRadius() <= 0) {
                return ResponseEntity.badRequest().body("⚠️ Preferred radius must be greater than 0.");
            }
            user.setPreferredRadius(request.getPreferredRadius());
        }

        User updatedUser = userService.saveUser(user);
        return ResponseEntity.ok(updatedUser);
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Failed to update profile: " + e.getMessage());
    }
}

    @Operation(summary = "Logout user", description = "Logs out the currently authenticated user")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User logged out successfully"),
        @ApiResponse(responseCode = "500", description = "Logout failed")
    })
    @PostMapping("/logout")
public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
    try {
        System.out.println("Entering /logout endpoint");

        // Clear the JWT cookie
        Cookie tokenCookie = new Cookie("jwtToken", null);
        tokenCookie.setMaxAge(0); // Expire immediately
        tokenCookie.setPath("/"); // Match the path used during login
        tokenCookie.setHttpOnly(true); // Match login settings
        tokenCookie.setSecure(true); // Match login settings (use true for production, false for local dev)
        tokenCookie.setAttribute("SameSite", "None"); // Match login settings
        response.addCookie(tokenCookie);
        System.out.println("Cookie cleared: jwtToken=; Path=/; Max-Age=0; HttpOnly; SameSite=None");

        // Invalidate session (optional, if you're not relying on sessions)
        request.getSession(false).invalidate();

        return ResponseEntity.ok("User logged out successfully.");
    } catch (Exception e) {
        System.err.println("Logout failed: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Logout failed: " + e.getMessage());
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

    static class PhoneUpdateRequest {
        private String phoneNumber;

        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    }

    static class ProfileUpdateRequest {
        private String email;
        private String location;
        private String birthday;
        private String password;
        private Double latitude;
        private Double longitude;
        private Double preferredRadius;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public String getBirthday() { return birthday; }
        public void setBirthday(String birthday) { this.birthday = birthday; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
        public Double getPreferredRadius() { return preferredRadius; }
        public void setPreferredRadius(Double preferredRadius) { this.preferredRadius = preferredRadius; }
    }

    static class TokenResponse {
        private String token;
        public TokenResponse(String token) { this.token = token; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }
}
package tarabaho.tarabaho.controller;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import tarabaho.tarabaho.dto.GraduateUpdateDTO;
import tarabaho.tarabaho.dto.UserUpdateDTO;
import tarabaho.tarabaho.entity.Admin;
import tarabaho.tarabaho.entity.Certificate;
import tarabaho.tarabaho.entity.ContactInquiry;
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.entity.User;
import tarabaho.tarabaho.jwt.JwtUtil;
import tarabaho.tarabaho.payload.LoginRequest;
import tarabaho.tarabaho.service.AdminService;
import tarabaho.tarabaho.service.ContactService;
import tarabaho.tarabaho.service.GraduateService;
import tarabaho.tarabaho.service.SupabaseRestStorageService;
import tarabaho.tarabaho.service.UserService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173", "https://tarabaho.vercel.app"}, allowCredentials = "true")
@Tag(name = "Admin Management", description = "Endpoints for managing admin accounts, graduates, users, certificates, and contact inquiries")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserService userService;

    @Autowired
    private GraduateService graduateService;

    @Autowired
    private ContactService contactService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private SupabaseRestStorageService storageService;

    @Operation(summary = "Get all admins", description = "Retrieve a list of all admin accounts")
    @GetMapping("/all")
    public ResponseEntity<List<Admin>> getAllAdmins() {
        return ResponseEntity.ok(adminService.getAllAdmins());
    }

    @Operation(summary = "Get all users", description = "Retrieve a list of all user accounts")
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @Operation(summary = "Get user by ID", description = "Retrieve a user account by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Admin not authenticated"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Unauthorized access to /users/{}: Not authenticated", id);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        Optional<User> user = adminService.findUserById(id);
        return user.map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    @Operation(summary = "Get all graduates", description = "Retrieve a list of all graduate accounts")
    @GetMapping("/graduates")
    public ResponseEntity<List<Graduate>> getAllGraduates() {
        return ResponseEntity.ok(graduateService.getAllGraduates());
    }

    @Operation(summary = "Get all contact inquiries", description = "Retrieve all contact inquiries (admin only)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Inquiries retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Admin not authenticated"),
        @ApiResponse(responseCode = "400", description = "Failed to retrieve inquiries")
    })
    @GetMapping("/contact/inquiries")
    public ResponseEntity<?> getInquiries(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("Unauthorized access to /contact/inquiries: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin not authenticated");
            }
            List<ContactInquiry> inquiries = contactService.findAllInquiries();
            log.debug("Retrieved {} inquiries", inquiries.size());
            return ResponseEntity.ok(inquiries);
        } catch (Exception e) {
            log.error("Failed to retrieve inquiries: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Failed to retrieve inquiries: " + e.getMessage());
        }
    }

    @Operation(summary = "Get contact inquiry by ID", description = "Retrieve a single contact inquiry by ID (admin only)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Inquiry retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Admin not authenticated"),
        @ApiResponse(responseCode = "404", description = "Inquiry not found"),
        @ApiResponse(responseCode = "400", description = "Failed to retrieve inquiry")
    })
    @GetMapping("/contact/{id}")
    public ResponseEntity<?> getInquiryById(@PathVariable Long id, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("Unauthorized access to /contact/{}: Not authenticated", id);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin not authenticated");
            }
            Optional<ContactInquiry> inquiry = contactService.findInquiryById(id);
            if (inquiry.isPresent()) {
                log.debug("Retrieved inquiry: id={}", id);
                return ResponseEntity.ok(inquiry.get());
            } else {
                log.warn("Inquiry not found: id={}", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Inquiry not found");
            }
        } catch (Exception e) {
            log.error("Failed to retrieve inquiry id={}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body("Failed to retrieve inquiry: " + e.getMessage());
        }
    }

    @Operation(summary = "Delete a contact inquiry", description = "Delete a contact inquiry by ID (admin only)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Inquiry deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Admin not authenticated"),
        @ApiResponse(responseCode = "404", description = "Inquiry not found"),
        @ApiResponse(responseCode = "400", description = "Failed to delete inquiry")
    })
    @DeleteMapping("/contact/delete/{id}")
    public ResponseEntity<?> deleteInquiry(@PathVariable Long id, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("Unauthorized access to /contact/delete/{}: Not authenticated", id);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin not authenticated");
            }
            contactService.deleteInquiry(id);
            log.debug("Deleted inquiry: id={}", id);
            return ResponseEntity.ok("Inquiry deleted successfully");
        } catch (IllegalArgumentException e) {
            log.error("Failed to delete inquiry id={}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Inquiry not found");
        } catch (Exception e) {
            log.error("Failed to delete inquiry id={}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body("Failed to delete inquiry: " + e.getMessage());
        }
    }

    @Operation(summary = "Register a new admin", description = "Create a new admin account")
    @PostMapping("/register")
    public ResponseEntity<?> registerAdmin(@RequestBody Admin admin) {
        try {
            Admin registered = adminService.registerAdmin(admin);
            return ResponseEntity.ok(registered);
        } catch (Exception e) {
            log.error("Failed to register admin: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Register a new user", description = "Create a new user account")
    @PostMapping("/users/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User registered = userService.registerUser(user);
            return ResponseEntity.ok(registered);
        } catch (Exception e) {
            log.error("Failed to register user: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Register a new graduate", description = "Create a new graduate account")
    @PostMapping("/graduates/register")
    public ResponseEntity<?> registerGraduate(@RequestBody Graduate graduate) {
        try {
            Graduate registered = graduateService.registerGraduate(graduate);
            return ResponseEntity.ok(registered);
        } catch (Exception e) {
            log.error("Failed to register graduate: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Admin login", description = "Authenticate an admin and return a JWT token")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Login successful, token returned"),
        @ApiResponse(responseCode = "401", description = "Invalid username or password")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginAdmin(
            @RequestBody LoginRequest loginRequest,
            HttpServletResponse response
    ) {
        try {
            log.info("Attempting login for username: {}", loginRequest.getUsername());
            Admin admin = adminService.loginAdmin(loginRequest.getUsername(), loginRequest.getPassword());
            String jwtToken = jwtUtil.generateToken(admin.getUsername(), "ADMIN");

            Cookie tokenCookie = new Cookie("jwtToken", jwtToken);
            tokenCookie.setHttpOnly(true);
            tokenCookie.setSecure(true);
            tokenCookie.setPath("/");
            tokenCookie.setMaxAge(24 * 60 * 60);
            tokenCookie.setAttribute("SameSite", "None");
            response.addCookie(tokenCookie);
            log.info("Token generated and cookie set for username: {}", admin.getUsername());

            AuthResponse body = new AuthResponse(jwtToken, admin.getId());
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            log.error("Login failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse(null, null));
        }
    }

    @Operation(summary = "Get JWT token from cookie", description = "Retrieve the JWT token for WebSocket authentication")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Token retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "No valid token found")
    })
    @GetMapping("/get-token")
    public ResponseEntity<?> getToken(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("getToken failed: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
            }
            String username = authentication.getName();
            log.info("getToken for username: {}", username);
            
            Admin admin = adminService.findByUsername(username);
            if (admin == null) {
                log.warn("Admin not found for username: {}", username);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin not found");
            }
            
            String token = jwtUtil.generateToken(username, "ADMIN");
            log.info("Generated token for admin: {}", username);
            return ResponseEntity.ok(new TokenResponse(token));
        } catch (Exception e) {
            log.error("getToken failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @Operation(summary = "Delete an admin", description = "Delete an admin account by ID")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteAdmin(@PathVariable Long id) {
        try {
            adminService.deleteAdmin(id);
            return ResponseEntity.ok("Admin deleted successfully");
        } catch (Exception e) {
            log.error("Failed to delete admin id={}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body("Admin not found or cannot be deleted");
        }
    }

    @Operation(summary = "Edit an admin", description = "Update an admin account by ID")
    @PutMapping("/edit/{id}")
    public ResponseEntity<?> editAdmin(@PathVariable Long id, @RequestBody Admin updatedAdmin) {
        try {
            Admin admin = adminService.editAdmin(id, updatedAdmin);
            return ResponseEntity.ok(admin);
        } catch (Exception e) {
            log.error("Failed to edit admin id={}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Delete a user", description = "Delete a user account by ID")
    @DeleteMapping("/users/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            log.error("Failed to delete user id={}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body("User not found or cannot be deleted");
        }
    }

    @Operation(summary = "Edit a user", description = "Update a user account by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Admin not authenticated"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/users/edit/{id}")
    public ResponseEntity<?> editUser(
            @PathVariable Long id,
            @RequestBody UserUpdateDTO userDTO,
            Authentication authentication
    ) {
        log.info("editUser - Authentication: {}", authentication != null ? authentication.getName() : "null");
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("editUser - Authentication failed");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin not authenticated.");
            }
            User user = adminService.editUser(id, userDTO);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("editUser - Failed to update user id={}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body("Failed to update user: " + e.getMessage());
        }
    }

    @Operation(summary = "Delete a graduate", description = "Delete a graduate account by ID")
    @DeleteMapping("/graduates/delete/{id}")
    public ResponseEntity<?> deleteGraduate(@PathVariable Long id, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("Unauthorized access to /graduates/delete/{}: Not authenticated", id);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin not authenticated.");
            }
            graduateService.deleteGraduate(id);
            return ResponseEntity.ok("Graduate deleted successfully");
        } catch (Exception e) {
            log.error("Failed to delete graduate id={}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body("Graduate not found or cannot be deleted: " + e.getMessage());
        }
    }

    @Operation(summary = "Edit a graduate", description = "Update a graduate account by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Graduate updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Admin not authenticated"),
        @ApiResponse(responseCode = "404", description = "Graduate not found")
    })
    @PutMapping("/graduates/edit/{id}")
    public ResponseEntity<?> editGraduate(
            @PathVariable Long id,
            @RequestBody GraduateUpdateDTO graduateDTO,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("Unauthorized access to /graduates/edit/{}: Not authenticated", id);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin not authenticated.");
            }
            Graduate graduate = adminService.editGraduate(id, graduateDTO);
            return ResponseEntity.ok(graduate);
        } catch (Exception e) {
            log.error("Failed to edit graduate id={}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body("Failed to update graduate: " + e.getMessage());
        }
    }

    @Operation(summary = "Get certificates for a graduate", description = "Retrieve all certificates associated with a graduate")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "List of certificates returned successfully"),
        @ApiResponse(responseCode = "401", description = "Admin not authenticated"),
        @ApiResponse(responseCode = "404", description = "Graduate not found")
    })
    @GetMapping("/certificates/graduate/{graduateId}")
    public ResponseEntity<?> getCertificatesByGraduateId(
            @PathVariable Long graduateId,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("Unauthorized access to /certificates/graduate/{}: Not authenticated", graduateId);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin not authenticated.");
            }
            List<Certificate> certificates = adminService.getCertificatesByGraduateId(graduateId);
            return ResponseEntity.ok(certificates);
        } catch (Exception e) {
            log.error("Failed to fetch certificates for graduateId={}: {}", graduateId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to fetch certificates: " + e.getMessage());
        }
    }

    @Operation(summary = "Admin logout", description = "Log out an admin by clearing the JWT token")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Admin logged out successfully"),
        @ApiResponse(responseCode = "500", description = "Logout failed")
    })
    @PostMapping("/logout")
    public ResponseEntity<?> logoutAdmin(HttpServletRequest request, HttpServletResponse response) {
        try {
            log.info("Entering /logout endpoint");
            Cookie tokenCookie = new Cookie("jwtToken", null);
            tokenCookie.setMaxAge(0);
            tokenCookie.setPath("/");
            tokenCookie.setHttpOnly(true);
            tokenCookie.setSecure(true);
            tokenCookie.setAttribute("SameSite", "None");
            response.addCookie(tokenCookie);
            log.info("Cookie cleared: jwtToken=; Path=/; Max-Age=0; HttpOnly; SameSite=None");

            request.getSession(false).invalidate();
            return ResponseEntity.ok("Admin logged out successfully.");
        } catch (Exception e) {
            log.error("Logout failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Logout failed: " + e.getMessage());
        }
    }

    @Operation(summary = "Get current admin", description = "Retrieve the currently authenticated admin")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Admin retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Admin not authenticated"),
        @ApiResponse(responseCode = "404", description = "Admin not found")
    })
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentAdmin(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Unauthorized access to /me: Not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin not authenticated");
        }
        String username = authentication.getName();
        Admin admin = adminService.findByUsername(username);
        if (admin == null) {
            log.warn("Admin not found for username: {}", username);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Admin not found");
        }
        return ResponseEntity.ok(admin);
    }

    @Operation(summary = "Upload admin profile picture", description = "Upload a profile picture for the authenticated admin")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile picture uploaded successfully"),
        @ApiResponse(responseCode = "401", description = "Admin not authenticated"),
        @ApiResponse(responseCode = "404", description = "Admin not found"),
        @ApiResponse(responseCode = "500", description = "Failed to upload picture")
    })
    @PostMapping("/upload-picture")
    public ResponseEntity<?> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("Unauthorized access to /upload-picture: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin not authenticated");
            }
            String username = authentication.getName();
            Admin admin = adminService.findByUsername(username);
            if (admin == null) {
                log.warn("Admin not found for username: {}", username);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Admin not found");
            }
            if (file == null || file.isEmpty()) {
                log.warn("No file uploaded for username: {}", username);
                return ResponseEntity.badRequest().body("No file uploaded");
            }

            if (admin.getProfilePicture() != null && !admin.getProfilePicture().isEmpty()) {
                String existingFileName = admin.getProfilePicture().substring(admin.getProfilePicture().lastIndexOf("/") + 1);
                try {
                    storageService.deleteFile("profile-picture", existingFileName);
                    log.info("Deleted old profile picture for username: {}", username);
                } catch (Exception e) {
                    log.error("Failed to delete old profile picture for username {}: {}", username, e.getMessage());
                }
            }

            String publicUrl = storageService.uploadFile(file, "profile-picture");
            Admin updatedAdmin = adminService.updateProfilePicture(admin.getId(), publicUrl);
            log.info("Profile picture uploaded for username: {}", username);
            return ResponseEntity.ok(updatedAdmin);
        } catch (Exception e) {
            log.error("Failed to upload picture for username {}: {}", authentication.getName(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload picture: " + e.getMessage());
        }
    }

    static class TokenResponse {
        private String token;
        public TokenResponse(String token) { this.token = token; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }
}
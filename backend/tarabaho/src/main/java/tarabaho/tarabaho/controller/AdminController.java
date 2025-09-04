package tarabaho.tarabaho.controller;

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
import tarabaho.tarabaho.dto.GraduateUpdateDTO;
import tarabaho.tarabaho.dto.UserUpdateDTO;
import tarabaho.tarabaho.entity.Admin;
import tarabaho.tarabaho.entity.CategoryRequest;
import tarabaho.tarabaho.entity.Certificate;
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.entity.User;
import tarabaho.tarabaho.jwt.JwtUtil;
import tarabaho.tarabaho.payload.LoginRequest;
import tarabaho.tarabaho.repository.CategoryRequestRepository;
import tarabaho.tarabaho.service.AdminService;
import tarabaho.tarabaho.service.GraduateService;
import tarabaho.tarabaho.service.SupabaseRestStorageService;
import tarabaho.tarabaho.service.UserService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Admin Management", description = "Endpoints for managing admin accounts, graduates, users, and certificates")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserService userService;

    @Autowired
    private GraduateService graduateService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CategoryRequestRepository categoryRequestRepository;

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

    @Operation(summary = "Register a new admin", description = "Create a new admin account")
    @PostMapping("/register")
    public ResponseEntity<?> registerAdmin(@RequestBody Admin admin) {
        try {
            Admin registered = adminService.registerAdmin(admin);
            return ResponseEntity.ok(registered);
        } catch (Exception e) {
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
            System.out.println("AdminController: Attempting login for username: " + loginRequest.getUsername());
            Admin admin = adminService.loginAdmin(loginRequest.getUsername(), loginRequest.getPassword());
            String jwtToken = jwtUtil.generateToken(admin.getUsername());

            Cookie tokenCookie = new Cookie("jwtToken", jwtToken);
            tokenCookie.setHttpOnly(true);
            tokenCookie.setSecure(true);
            tokenCookie.setPath("/");
            tokenCookie.setMaxAge(24 * 60 * 60);
            tokenCookie.setAttribute("SameSite", "None");
            response.addCookie(tokenCookie);
            System.out.println("AdminController: Token generated and cookie set for username: " + admin.getUsername());

            AuthResponse body = new AuthResponse(jwtToken, admin.getId());
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            System.out.println("AdminController: Login failed: " + e.getMessage());
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
                System.out.println("AdminController: getToken failed: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
            }
            String username = authentication.getName();
            System.out.println("AdminController: getToken for username: " + username);
            
            Admin admin = adminService.findByUsername(username);
            if (admin == null) {
                System.out.println("AdminController: Admin not found for username: " + username);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin not found");
            }
            
            String token = jwtUtil.generateToken(username);
            System.out.println("AdminController: Generated token for admin: " + username);
            return ResponseEntity.ok(new TokenResponse(token));
        } catch (Exception e) {
            System.err.println("AdminController: getToken failed: " + e.getMessage());
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
        System.out.println("AdminController: editUser - Authentication: " + (authentication != null ? authentication.getName() : "null"));
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("AdminController: editUser - Authentication failed");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin not authenticated.");
            }
            User user = adminService.editUser(id, userDTO);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            System.out.println("AdminController: editUser - Failed to update user: " + e.getMessage());
            return ResponseEntity.badRequest().body("Failed to update user: " + e.getMessage());
        }
    }

    @Operation(summary = "Delete a graduate", description = "Delete a graduate account by ID")
    @DeleteMapping("/graduates/delete/{id}")
    public ResponseEntity<?> deleteGraduate(@PathVariable Long id, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin not authenticated.");
            }
            graduateService.deleteGraduate(id);
            return ResponseEntity.ok("Graduate deleted successfully");
        } catch (Exception e) {
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
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin not authenticated.");
            }
            Graduate graduate = adminService.editGraduate(id, graduateDTO);
            return ResponseEntity.ok(graduate);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update graduate: " + e.getMessage());
        }
    }

    @Operation(summary = "Add categories to a graduate", description = "Add one or more categories to a graduate by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Categories added successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid category IDs or graduate not found"),
        @ApiResponse(responseCode = "401", description = "Admin not authenticated")
    })
    @PostMapping("/graduates/{id}/categories")
    public ResponseEntity<?> addCategoriesToGraduate(
            @PathVariable Long id,
            @RequestBody List<Long> categoryIds,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin not authenticated.");
            }
            Graduate graduate = adminService.addCategoriesToGraduate(id, categoryIds);
            return ResponseEntity.ok(graduate);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to add categories: " + e.getMessage());
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
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin not authenticated.");
            }
            List<Certificate> certificates = adminService.getCertificatesByGraduateId(graduateId);
            return ResponseEntity.ok(certificates);
        } catch (Exception e) {
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
            System.out.println("AdminController: Entering /logout endpoint");

            // Clear the JWT cookie
            Cookie tokenCookie = new Cookie("jwtToken", null);
            tokenCookie.setMaxAge(0);
            tokenCookie.setPath("/");
            tokenCookie.setHttpOnly(true);
            tokenCookie.setSecure(true);
            tokenCookie.setAttribute("SameSite", "None");
            response.addCookie(tokenCookie);
            System.out.println("AdminController: Cookie cleared: jwtToken=; Path=/; Max-Age=0; HttpOnly; SameSite=None");

            // Invalidate session
            request.getSession(false).invalidate();

            return ResponseEntity.ok("Admin logged out successfully.");
        } catch (Exception e) {
            System.err.println("AdminController: Logout failed: " + e.getMessage());
            e.printStackTrace();
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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin not authenticated");
        }
        String username = authentication.getName();
        Admin admin = adminService.findByUsername(username);
        if (admin == null) {
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
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin not authenticated");
            }
            String username = authentication.getName();
            Admin admin = adminService.findByUsername(username);
            if (admin == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Admin not found");
            }
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("No file uploaded");
            }

            // Delete existing profile picture if it exists
            if (admin.getProfilePicture() != null && !admin.getProfilePicture().isEmpty()) {
                String existingFileName = admin.getProfilePicture().substring(admin.getProfilePicture().lastIndexOf("/") + 1);
                try {
                    storageService.deleteFile("profile-picture", existingFileName);
                } catch (Exception e) {
                    System.err.println("Failed to delete old profile picture: " + e.getMessage());
                }
            }

            // Upload to Supabase
            String publicUrl = storageService.uploadFile(file, "profile-picture");
            Admin updatedAdmin = adminService.updateProfilePicture(admin.getId(), publicUrl);
            return ResponseEntity.ok(updatedAdmin);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload picture: " + e.getMessage());
        }
    }

    @GetMapping("/category-requests/pending")
public ResponseEntity<?> getPendingCategoryRequests(
        @RequestParam(required = false) Long graduateId,
        Authentication authentication
) {
    try {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin not authenticated.");
        }
        List<CategoryRequest> pendingRequests;
        if (graduateId != null) {
            pendingRequests = categoryRequestRepository.findByGraduateIdAndStatus(graduateId, "PENDING");
        } else {
            pendingRequests = categoryRequestRepository.findByStatus("PENDING");
        }
        return ResponseEntity.ok(pendingRequests);
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body("Failed to fetch pending category requests: " + e.getMessage());
    }
}

@Operation(summary = "Approve a category request", description = "Approve a pending category request and add the category to the graduate")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Category request approved successfully"),
        @ApiResponse(responseCode = "401", description = "Admin not authenticated"),
        @ApiResponse(responseCode = "404", description = "Category request not found"),
        @ApiResponse(responseCode = "400", description = "Invalid request status"),
        @ApiResponse(responseCode = "500", description = "Failed to approve category request")
    })
    @PostMapping("/category-requests/{requestId}/approve")
    public ResponseEntity<?> approveCategoryRequest(
            @PathVariable Long requestId,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin not authenticated.");
            }
            adminService.approveCategoryRequest(requestId);
            return ResponseEntity.ok("Category request approved successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to approve category request: " + e.getMessage());
        }
    }

    @Operation(summary = "Deny a category request", description = "Deny a pending category request")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Category request denied successfully"),
        @ApiResponse(responseCode = "401", description = "Admin not authenticated"),
        @ApiResponse(responseCode = "404", description = "Category request not found"),
        @ApiResponse(responseCode = "400", description = "Invalid request status"),
        @ApiResponse(responseCode = "500", description = "Failed to deny category request")
    })
    @PostMapping("/category-requests/{requestId}/deny")
    public ResponseEntity<?> denyCategoryRequest(
            @PathVariable Long requestId,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin not authenticated.");
            }
            adminService.denyCategoryRequest(requestId);
            return ResponseEntity.ok("Category request denied successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to deny category request: " + e.getMessage());
        }
    }
   
    


    static class TokenResponse {
        private String token;
        public TokenResponse(String token) { this.token = token; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }
}
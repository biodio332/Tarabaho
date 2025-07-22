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
import tarabaho.tarabaho.dto.WorkerDuplicateCheckDTO;
import tarabaho.tarabaho.dto.WorkerRegisterDTO;
import tarabaho.tarabaho.dto.WorkerUpdateDTO;
import tarabaho.tarabaho.entity.CategoryRequest;
import tarabaho.tarabaho.entity.User;
import tarabaho.tarabaho.entity.Worker;
import tarabaho.tarabaho.jwt.JwtUtil;
import tarabaho.tarabaho.repository.WorkerRepository;
import tarabaho.tarabaho.service.PasswordEncoderService;
import tarabaho.tarabaho.service.SupabaseRestStorageService;
import tarabaho.tarabaho.service.UserService;
import tarabaho.tarabaho.service.WorkerService;

@RestController
@RequestMapping("/api/worker")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Worker Controller", description = "Handles registration, login, and management of workers")
public class WorkerController {

    @Autowired
    private WorkerService workerService;

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @Autowired
    private SupabaseRestStorageService storageService;

    @Autowired
    private PasswordEncoderService passwordEncoderService;

    @Operation(summary = "Get worker by ID", description = "Retrieve a worker by their ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Worker retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Worker not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<?> getWorkerById(@PathVariable Long id) {
        try {
            System.out.println("WorkerController: Handling GET /api/worker/" + id);
            Optional<Worker> workerOpt = workerRepository.findById(id);
            if (workerOpt.isPresent()) {
                System.out.println("WorkerController: Worker found with ID: " + id);
                return ResponseEntity.ok(workerOpt.get());
            }
            System.out.println("WorkerController: Worker not found for ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Worker not found with id: " + id);
        } catch (Exception e) {
            System.out.println("WorkerController: Error retrieving worker with ID: " + id + ", error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to retrieve worker: " + e.getMessage());
        }
    }

    @GetMapping("/category/{categoryName}/workers")
    public ResponseEntity<List<Worker>> getWorkersByCategory(@PathVariable String categoryName) {
        List<Worker> workers = workerService.getWorkersByCategory(categoryName);
        return ResponseEntity.ok(workers);
    }

    @Operation(summary = "Check for duplicate worker details", description = "Checks if username, email, or phone number already exists")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "No duplicates found"),
        @ApiResponse(responseCode = "400", description = "Username, email, or phone number already exists")
    })
    @PostMapping("/check-duplicates")
    public ResponseEntity<?> checkDuplicates(@RequestBody WorkerDuplicateCheckDTO workerDTO) {
        System.out.println("WorkerController: Checking duplicates for username: " + workerDTO.getUsername());
        
        if (workerService.findByUsername(workerDTO.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("⚠️ Username already exists.");
        }
        if (workerService.findByEmail(workerDTO.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("⚠️ Email already exists.");
        }
        if (workerDTO.getPhoneNumber() != null && !workerDTO.getPhoneNumber().isEmpty() &&
                workerService.findByPhoneNumber(workerDTO.getPhoneNumber()).isPresent()) {
            return ResponseEntity.badRequest().body("⚠️ Phone number already exists.");
        }

        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Register new worker", description = "Registers a new worker in the system after checking for uniqueness and resets password to avoid double hashing")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Worker registered successfully"),
        @ApiResponse(responseCode = "400", description = "Username, email, phone, or invalid input"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping("/register")
    public ResponseEntity<?> registerWorker(@RequestBody WorkerRegisterDTO workerDTO, HttpServletResponse response) {
        System.out.println("WorkerController: Received registration request for username: " + workerDTO.getUsername());
        System.out.println("WorkerController: Received raw password: " + workerDTO.getPassword());

        // Validate input
        if (workerDTO.getUsername() == null || workerDTO.getUsername().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("⚠️ Username is required.");
        }
        if (workerService.findByUsername(workerDTO.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("⚠️ Username already exists.");
        }
        if (workerDTO.getEmail() == null || workerDTO.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("⚠️ Email is required.");
        }
        if (workerService.findByEmail(workerDTO.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("⚠️ Email already exists.");
        }
        if (workerDTO.getPhoneNumber() != null && !workerDTO.getPhoneNumber().isEmpty() &&
                workerService.findByPhoneNumber(workerDTO.getPhoneNumber()).isPresent()) {
            return ResponseEntity.badRequest().body("⚠️ Phone number already exists.");
        }
        if (workerDTO.getFirstName() == null || workerDTO.getFirstName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("⚠️ First name is required.");
        }
        if (workerDTO.getLastName() == null || workerDTO.getLastName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("⚠️ Last name is required.");
        }
        if (workerDTO.getHourly() <= 0) {
            return ResponseEntity.badRequest().body("⚠️ Hourly rate must be provided and greater than 0.");
        }
        if (workerDTO.getPassword() == null || workerDTO.getPassword().isEmpty()) {
            return ResponseEntity.badRequest().body("⚠️ Password is required.");
        }

        try {
            // Create worker entity
            Worker worker = new Worker();
            worker.setUsername(workerDTO.getUsername());
            // Set initial hashed password
            String hashedPassword = passwordEncoderService.encodePassword(workerDTO.getPassword());
            System.out.println("WorkerController: Initial hashed password: " + hashedPassword);
            worker.setPassword(hashedPassword);
            worker.setFirstName(workerDTO.getFirstName());
            worker.setLastName(workerDTO.getLastName());
            worker.setEmail(workerDTO.getEmail());
            worker.setPhoneNumber(workerDTO.getPhoneNumber());
            worker.setAddress(workerDTO.getAddress());
            worker.setHourly(workerDTO.getHourly());

            if (workerDTO.getBirthday() != null && !workerDTO.getBirthday().isEmpty()) {
                worker.setBirthday(LocalDate.parse(workerDTO.getBirthday()));
            }

            // Register worker
            Worker registeredWorker = workerService.registerWorker(worker);
            System.out.println("WorkerController: Worker registered successfully, ID: " + registeredWorker.getId());

            // Immediately reset password to ensure single hashing
            System.out.println("WorkerController: Resetting password for username: " + workerDTO.getUsername());
            Worker savedWorker = workerRepository.findByUsername(workerDTO.getUsername());
            if (savedWorker == null) {
                System.out.println("WorkerController: Worker not found for username: " + workerDTO.getUsername() + " after registration");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Worker not found after registration");
            }
            String newHashedPassword = passwordEncoderService.encodePassword(workerDTO.getPassword());
            System.out.println("WorkerController: New hashed password after reset: " + newHashedPassword);
            savedWorker.setPassword(newHashedPassword);
            workerRepository.save(savedWorker);
            System.out.println("WorkerController: Password reset successfully for username: " + workerDTO.getUsername());

            return ResponseEntity.ok(registeredWorker);
        } catch (Exception e) {
            System.out.println("WorkerController: Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to register worker: " + e.getMessage());
        }
    }

    @Operation(summary = "Reset worker password", description = "Resets the password for a worker")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Password reset successfully"),
        @ApiResponse(responseCode = "400", description = "Worker not found or invalid input"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetWorkerPassword(@RequestBody LoginRequest loginData) {
        try {
            System.out.println("WorkerController: Resetting password for username: " + loginData.getUsername());
            Worker worker = workerRepository.findByUsername(loginData.getUsername());
            if (worker == null) {
                System.out.println("WorkerController: Worker not found for username: " + loginData.getUsername());
                return ResponseEntity.badRequest().body("Worker not found");
            }
            if (loginData.getPassword() == null || loginData.getPassword().isEmpty()) {
                System.out.println("WorkerController: Invalid password provided for reset");
                return ResponseEntity.badRequest().body("Password is required");
            }
            String hashedPassword = passwordEncoderService.encodePassword(loginData.getPassword());
            System.out.println("WorkerController: New hashed password: " + hashedPassword);
            worker.setPassword(hashedPassword);
            workerRepository.save(worker);
            System.out.println("WorkerController: Password reset successfully for username: " + loginData.getUsername());
            return ResponseEntity.ok("Password reset successfully");
        } catch (Exception e) {
            System.out.println("WorkerController: Password reset failed: " + e.getMessage());
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
        System.out.println("WorkerController: Raw JSON password: " + rawData.get("password"));
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
        System.out.println("WorkerController: Testing password: " + password + ", Hash: " + hashed + ", Matches: " + matches);
        return ResponseEntity.ok("Matches: " + matches);
    }

    @Operation(summary = "Upload initial profile picture during registration", description = "Allows uploading a 2x2 profile picture for a newly registered worker without authentication, only if no picture exists")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile picture uploaded successfully"),
        @ApiResponse(responseCode = "400", description = "No file uploaded, invalid file, or profile picture already exists"),
        @ApiResponse(responseCode = "404", description = "Worker not found"),
        @ApiResponse(responseCode = "500", description = "Failed to upload file")
    })
    @PostMapping("/{workerId}/upload-initial-picture")
    public ResponseEntity<?> uploadInitialProfilePicture(
            @PathVariable Long workerId,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        try {
            System.out.println("WorkerController: Starting upload-initial-picture for workerId: " + workerId);

            Worker worker = workerService.findById(workerId);
            if (worker == null) {
                System.out.println("WorkerController: Worker not found for ID: " + workerId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Worker not found.");
            }

            if (worker.getProfilePicture() != null && !worker.getProfilePicture().isEmpty()) {
                System.out.println("WorkerController: Profile picture already exists for workerId: " + workerId);
                return ResponseEntity.badRequest().body("Profile picture already exists.");
            }

            if (file == null || file.isEmpty()) {
                System.out.println("WorkerController: No file uploaded for workerId: " + workerId);
                return ResponseEntity.badRequest().body("No file uploaded.");
            }

            // Upload to Supabase
            String publicUrl = storageService.uploadFile(file, "profile-picture");
            worker.setProfilePicture(publicUrl);
            workerService.editWorker(workerId, worker);

            System.out.println("WorkerController: Initial profile picture uploaded successfully for workerId: " + workerId);
            return ResponseEntity.ok(worker);
        } catch (IllegalArgumentException e) {
            System.out.println("WorkerController: Initial profile picture upload failed for workerId: " + workerId + ", error: " + e.getMessage());
            return ResponseEntity.badRequest().body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            System.out.println("WorkerController: Initial profile picture upload failed for workerId: " + workerId + ", error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload file: " + e.getMessage());
        }
    }

    @Operation(summary = "Generate JWT token for worker", description = "Authenticate worker with username and password and return JWT token as JSON")
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
            System.out.println("WorkerController: Attempting login for username: " + loginData.getUsername());
            Worker worker = workerService.loginWorker(loginData.getUsername(), loginData.getPassword());
            String jwtToken = jwtUtil.generateToken(worker.getUsername());

            Cookie tokenCookie = new Cookie("jwtToken", jwtToken);
            tokenCookie.setHttpOnly(true);
            tokenCookie.setSecure(true);
            tokenCookie.setPath("/");
            tokenCookie.setMaxAge(24 * 60 * 60);
            tokenCookie.setAttribute("SameSite", "None");
            response.addCookie(tokenCookie);
            System.out.println("WorkerController: Token generated and cookie set for username: " + worker.getUsername());

            AuthResponse body = new AuthResponse(jwtToken, worker.getId());
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            System.out.println("WorkerController: Login failed: " + e.getMessage());
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
                System.out.println("WorkerController: getToken failed: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
            }
            String username = authentication.getName();
            System.out.println("WorkerController: getToken for username: " + username);
            
            Optional<Worker> worker = workerService.findByUsername(username);
            if (!worker.isPresent()) {
                System.out.println("WorkerController: Worker not found for username: " + username);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Worker not found");
            }
            
            String token = jwtUtil.generateToken(username);
            System.out.println("WorkerController: Generated token for worker: " + username);
            return ResponseEntity.ok(new TokenResponse(token));
        } catch (Exception e) {
            System.err.println("WorkerController: getToken failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @Operation(summary = "Logout worker", description = "Logs out the currently authenticated worker")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Worker logged out successfully"),
        @ApiResponse(responseCode = "500", description = "Logout failed")
    })
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        try {
            System.out.println("WorkerController: Entering /logout endpoint");

            // Clear theていJWT cookie
            Cookie tokenCookie = new Cookie("jwtToken", null);
            tokenCookie.setMaxAge(0);
            tokenCookie.setPath("/");
            tokenCookie.setHttpOnly(true);
            tokenCookie.setSecure(true);
            tokenCookie.setAttribute("SameSite", "None");
            response.addCookie(tokenCookie);
            System.out.println("WorkerController: Cookie cleared: jwtToken=; Path=/; Max-Age=0; HttpOnly; SameSite=None");

            // Invalidate session
            request.getSession(false).invalidate();

            return ResponseEntity.ok("Worker logged out successfully.");
        } catch (Exception e) {
            System.err.println("WorkerController: Logout failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Logout failed: " + e.getMessage());
        }
    }

    @Operation(summary = "Login worker (session-based)", description = "Authenticate a worker using username and password")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Worker logged in successfully"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    @PostMapping("/login")
    public ResponseEntity<?> loginWorker(@RequestBody Worker worker) {
        try {
            System.out.println("WorkerController: Attempting session login for username: " + worker.getUsername());
            Worker loggedInWorker = workerService.loginWorker(worker.getUsername(), worker.getPassword());
            return ResponseEntity.ok(loggedInWorker);
        } catch (Exception e) {
            System.out.println("WorkerController: Session login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password.");
        }
    }

    @Operation(summary = "Upload profile picture", description = "Uploads a profile picture for a worker after authentication")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile picture uploaded successfully"),
        @ApiResponse(responseCode = "400", description = "No file uploaded or invalid file"),
        @ApiResponse(responseCode = "401", description = "Worker not authenticated"),
        @ApiResponse(responseCode = "403", description = "Unauthorized to upload picture for another worker"),
        @ApiResponse(responseCode = "404", description = "Worker not found"),
        @ApiResponse(responseCode = "500", description = "Failed to upload file")
    })
    @PostMapping("/{workerId}/upload-picture")
    public ResponseEntity<?> uploadProfilePicture(
            @PathVariable Long workerId,
            @RequestPart("file") MultipartFile file,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("WorkerController: Upload picture failed: Worker not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Worker not authenticated.");
            }

            String username = authentication.getName();
            Optional<Worker> workerOpt = workerService.findByUsername(username);
            if (!workerOpt.isPresent()) {
                System.out.println("WorkerController: Upload picture failed: Worker not found for username: " + username);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Worker not found for username: " + username);
            }
            Worker worker = workerOpt.get();

            if (!worker.getId().equals(workerId)) {
                System.out.println("WorkerController: Upload picture failed: Unauthorized for workerId: " + workerId + ", authenticated workerId: " + worker.getId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Unauthorized: Cannot upload picture for another worker");
            }

            if (file == null || file.isEmpty()) {
                System.out.println("WorkerController: Upload picture failed: No file uploaded for workerId: " + workerId);
                return ResponseEntity.badRequest().body("No file uploaded.");
            }

            // Delete existing profile picture if it exists
            if (worker.getProfilePicture() != null && !worker.getProfilePicture().isEmpty()) {
                String existingFileName = worker.getProfilePicture().substring(worker.getProfilePicture().lastIndexOf("/") + 1);
                try {
                    storageService.deleteFile("profile-picture", existingFileName);
                } catch (IOException e) {
                    System.err.println("Failed to delete old profile picture: " + e.getMessage());
                }
            }

            // Upload to Supabase
            String publicUrl = storageService.uploadFile(file, "profile-picture");
            worker.setProfilePicture(publicUrl);
            workerService.editWorker(workerId, worker);

            System.out.println("WorkerController: Profile picture uploaded successfully for workerId: " + workerId);
            return ResponseEntity.ok(worker);
        } catch (IllegalArgumentException e) {
            System.out.println("WorkerController: Upload picture failed for workerId: " + workerId + ", error: " + e.getMessage());
            return ResponseEntity.badRequest().body("⚠️ " + e.getMessage());
        } catch (IOException e) {
            System.out.println("WorkerController: Upload picture failed for workerId: " + workerId + ", error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to upload file: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("WorkerController: Upload picture failed for workerId: " + workerId + ", error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to upload file: " + e.getMessage());
        }
    }

    @Operation(summary = "Get all workers", description = "Retrieve a list of all registered workers")
    @ApiResponse(responseCode = "200", description = "List of workers returned successfully")
    @GetMapping("/all")
    public List<Worker> getAllWorkers() {
        return workerService.getAllWorkers();
    }

    @Operation(summary = "Get available workers", description = "Retrieve a list of all available workers")
    @ApiResponse(responseCode = "200", description = "List of available workers returned successfully")
    @GetMapping("/available")
    public List<Worker> getAvailableWorkers() {
        return workerRepository.findAllAvailable();
    }

    @Operation(summary = "Get workers by minimum rating", description = "Retrieve workers with a minimum star rating")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "List of workers returned successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid rating value")
    })
    @GetMapping("/stars/{minStars}")
    public ResponseEntity<List<Worker>> getWorkersByMinimumStars(@PathVariable Double minStars) {
        if (minStars < 1.0 || minStars > 5.0) {
            return ResponseEntity.badRequest().body(null);
        }
        return ResponseEntity.ok(workerRepository.findByMinimumStars(minStars));
    }

    @Operation(summary = "Get workers by maximum hourly rate", description = "Retrieve workers with an hourly rate below a specified value")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "List of workers returned successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid hourly rate")
    })
    @GetMapping("/hourly/{maxHourly}")
    public ResponseEntity<List<Worker>> getWorkersByMaxHourly(@PathVariable Double maxHourly) {
        if (maxHourly <= 0) {
            return ResponseEntity.badRequest().body(null);
        }
        return ResponseEntity.ok(workerRepository.findByMaxHourly(maxHourly));
    }

    @Operation(summary = "Rate a worker", description = "Submit a rating (1.0–5.0) for a worker")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Rating submitted successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid rating value"),
        @ApiResponse(responseCode = "404", description = "Worker not found")
    })
    @PostMapping("/{workerId}/rate")
    public ResponseEntity<?> rateWorker(
            @PathVariable Long workerId,
            @RequestBody RatingRequest ratingRequest,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
            }
            User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new Exception("User not found"));
            Worker updatedWorker = workerService.updateRating(
                workerId,
                ratingRequest.getBookingId(),
                ratingRequest.getRating(),
                user.getId()
            );
            return ResponseEntity.ok(updatedWorker);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Post urgent job", description = "Posts an urgent job and finds nearby workers in the specified category")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Job posted and workers found"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "User not authenticated or not verified"),
        @ApiResponse(responseCode = "404", description = "No workers found")
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

            List<Worker> nearbyWorkers = workerService.findNearbyWorkersForUrgentJob(
                urgentJobRequest.getCategoryName(),
                urgentJobRequest.getLatitude(),
                urgentJobRequest.getLongitude(),
                urgentJobRequest.getRadius()
            );

            if (nearbyWorkers.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No available workers found nearby.");
            }

            System.out.println("Found " + nearbyWorkers.size() + " workers for urgent job in category: " + urgentJobRequest.getCategoryName());
            return ResponseEntity.ok(new UrgentJobResponse(nearbyWorkers.size()));
        } catch (Exception e) {
            System.out.println("WorkerController: Urgent job posting failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to post urgent job: " + e.getMessage());
        }
    }

    @Operation(summary = "Update worker profile", description = "Updates profile details for the authenticated worker")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input or unauthorized"),
        @ApiResponse(responseCode = "401", description = "Worker not authenticated"),
        @ApiResponse(responseCode = "404", description = "Worker not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<?> updateWorker(@PathVariable Long id, @RequestBody WorkerUpdateDTO workerDTO, Authentication authentication) {
        System.out.println("WorkerController: Received update request for worker ID: " + id);

        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Worker not authenticated.");
            }

            Worker existingWorker = workerService.findById(id);
            String authenticatedUsername = authentication.getName();
            if (!existingWorker.getUsername().equals(authenticatedUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("⚠️ You are not authorized to update this profile.");
            }

            if (workerDTO.getEmail() != null && !workerDTO.getEmail().equals(existingWorker.getEmail())) {
                if (workerService.findByEmail(workerDTO.getEmail()).isPresent()) {
                    return ResponseEntity.badRequest().body("⚠️ Email already exists.");
                }
                existingWorker.setEmail(workerDTO.getEmail());
            }

            if (workerDTO.getPhoneNumber() != null && !workerDTO.getPhoneNumber().equals(existingWorker.getPhoneNumber())) {
                if (!workerDTO.getPhoneNumber().isEmpty() && workerService.findByPhoneNumber(workerDTO.getPhoneNumber()).isPresent()) {
                    return ResponseEntity.badRequest().body("⚠️ Phone number already exists.");
                }
                existingWorker.setPhoneNumber(workerDTO.getPhoneNumber());
            }

            if (workerDTO.getAddress() != null) {
                existingWorker.setAddress(workerDTO.getAddress());
            }
            if (workerDTO.getBiography() != null) {
                existingWorker.setBiography(workerDTO.getBiography());
            }
            if (workerDTO.getFirstName() != null) {
                existingWorker.setFirstName(workerDTO.getFirstName());
            }
            if (workerDTO.getLastName() != null) {
                existingWorker.setLastName(workerDTO.getLastName());
            }
            if (workerDTO.getHourly() != null) {
                if (workerDTO.getHourly() <= 0) {
                    return ResponseEntity.badRequest().body("⚠️ Hourly rate must be greater than 0.");
                }
                existingWorker.setHourly(workerDTO.getHourly());
            }
            if (workerDTO.getBirthday() != null && !workerDTO.getBirthday().isEmpty()) {
                existingWorker.setBirthday(LocalDate.parse(workerDTO.getBirthday()));
            }
            if (workerDTO.getPassword() != null && !workerDTO.getPassword().isEmpty()) {
                String hashedPassword = passwordEncoderService.encodePassword(workerDTO.getPassword());
                existingWorker.setPassword(hashedPassword);
            }

            Worker updatedWorker = workerService.updateWorker(existingWorker);
            System.out.println("WorkerController: Worker updated successfully, ID: " + updatedWorker.getId());
            return ResponseEntity.ok(updatedWorker);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("⚠️ Failed to update profile: " + e.getMessage());
        }
    }

    @Operation(summary = "Get similar workers", description = "Retrieve a list of workers similar to the specified worker based on categories or other criteria")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "List of similar workers retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Worker not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/{id}/similar")
    public ResponseEntity<?> getSimilarWorkers(@PathVariable Long id) {
        try {
            System.out.println("WorkerController: Handling GET /api/worker/" + id + "/similar");
            List<Worker> similarWorkers = workerService.getSimilarWorkers(id);
            if (similarWorkers.isEmpty()) {
                System.out.println("WorkerController: No similar workers found for ID: " + id);
                return ResponseEntity.status(HttpStatus.OK).body(Collections.emptyList());
            }
            System.out.println("WorkerController: Found " + similarWorkers.size() + " similar workers for ID: " + id);
            return ResponseEntity.ok(similarWorkers);
        } catch (IllegalArgumentException e) {
            System.out.println("WorkerController: Error retrieving similar workers for ID: " + id + ", error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Worker not found: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("WorkerController: Error retrieving similar workers for ID: " + id + ", error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to retrieve similar workers: " + e.getMessage());
        }
    }

    @GetMapping("/category/{categoryName}/available")
    public ResponseEntity<List<Worker>> getAvailableWorkersByCategory(@PathVariable String categoryName) {
        List<Worker> workers = workerService.getAvailableWorkersByCategory(categoryName);
        return ResponseEntity.ok(workers);
    }

    @GetMapping("/category/{categoryName}/nearby/available")
    public ResponseEntity<?> getNearbyAvailableWorkersByCategory(
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

            List<Worker> workers = workerService.getNearbyAvailableWorkersByCategory(categoryName, latitude, longitude, radius);
            return ResponseEntity.ok(workers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Get worker by username", description = "Find a worker by their username")
    @GetMapping("/username/{username}")
    public ResponseEntity<?> getWorkerByUsername(@PathVariable String username) {
        Optional<Worker> workerOpt = workerService.findByUsername(username);
        if (workerOpt.isPresent()) {
            return ResponseEntity.ok(workerOpt.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Worker not found with username: " + username);
        }
    }
    // NEW: Endpoint for workers to submit a single category request
    @Operation(summary = "Request to add category", description = "Allows a worker to request to be added to a category")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Category request submitted successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid category or request already exists"),
        @ApiResponse(responseCode = "401", description = "Worker not authenticated"),
        @ApiResponse(responseCode = "404", description = "Worker not found")
    })
    @PostMapping("/{workerId}/request-category")
    public ResponseEntity<?> requestCategory(
            @PathVariable Long workerId,
            @RequestBody CategoryRequestDTO categoryRequestDTO,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Worker not authenticated.");
            }
            String username = authentication.getName();
            Optional<Worker> workerOpt = workerService.findByUsername(username);
            if (!workerOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Worker not found.");
            }
            Worker worker = workerOpt.get();
            if (!worker.getId().equals(workerId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Unauthorized: Cannot request category for another worker.");
            }
            CategoryRequest request = workerService.requestCategory(workerId, categoryRequestDTO.getCategoryName());
            return ResponseEntity.ok(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to submit category request: " + e.getMessage());
        }
    }

    // NEW: Endpoint to retrieve all category requests for a specific worker
    @Operation(summary = "Get category requests for a worker", description = "Retrieve all category requests for a specific worker")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "List of category requests returned successfully"),
        @ApiResponse(responseCode = "401", description = "Worker not authenticated"),
        @ApiResponse(responseCode = "404", description = "Worker not found")
    })
    @GetMapping("/{workerId}/category-requests")
    public ResponseEntity<?> getCategoryRequests(
            @PathVariable Long workerId,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Worker not authenticated.");
            }
            String username = authentication.getName();
            Optional<Worker> workerOpt = workerService.findByUsername(username);
            if (!workerOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Worker not found.");
            }
            Worker worker = workerOpt.get();
            if (!worker.getId().equals(workerId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Unauthorized: Cannot view category requests for another worker.");
            }
            List<CategoryRequest> requests = workerService.getCategoryRequestsByWorkerId(workerId);
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
        private int workersNotified;

        public UrgentJobResponse(int workersNotified) {
            this.workersNotified = workersNotified;
        }

        public int getWorkersNotified() { return workersNotified; }
        public void setWorkersNotified(int workersNotified) { this.workersNotified = workersNotified; }
    }

    static class TokenResponse {
        private String token;
        public TokenResponse(String token) { this.token = token; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }
}
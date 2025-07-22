package tarabaho.tarabaho.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import tarabaho.tarabaho.entity.Booking;
import tarabaho.tarabaho.entity.User;
import tarabaho.tarabaho.entity.Worker;
import tarabaho.tarabaho.service.BookingService;
import tarabaho.tarabaho.service.RatingService;
import tarabaho.tarabaho.service.UserService;
import tarabaho.tarabaho.service.WorkerService;

@RestController
@RequestMapping("/api/booking")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Booking Controller", description = "Handles booking creation, acceptance, retrieval, and cancellation")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserService userService;

    @Autowired
    private WorkerService workerService;

    @Autowired
    private RatingService ratingService;

    @Operation(summary = "Create urgent booking", description = "Creates an urgent booking for a user")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Booking created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "User not authenticated or not verified"),
        @ApiResponse(responseCode = "404", description = "User or category not found")
    })
    @PostMapping("/urgent")
    public ResponseEntity<?> createUrgentBooking(
            @RequestBody UrgentBookingRequest request,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
            }
            User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new Exception("User not found"));
            Booking booking = bookingService.createUrgentBooking(
                user.getId(),
                request.getCategoryName(),
                request.getLatitude(),
                request.getLongitude(),
                request.getRadius(),
                request.getPaymentMethod(),
                request.getJobDetails()
            );
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Create category-based booking", description = "Creates a booking for a specific worker")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Booking created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "User not authenticated or not verified"),
        @ApiResponse(responseCode = "404", description = "User, worker, or category not found")
    })
    @PostMapping("/category")
    public ResponseEntity<?> createCategoryBooking(
            @RequestBody CategoryBookingRequest request,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
            }
            User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new Exception("User not found"));
            Booking booking = bookingService.createCategoryBooking(
                user.getId(),
                request.getWorkerId(),
                request.getCategoryName(),
                request.getPaymentMethod(),
                request.getJobDetails()
            );
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Accept booking", description = "Worker accepts a booking")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Booking accepted"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Worker not authenticated"),
        @ApiResponse(responseCode = "404", description = "Booking or worker not found")
    })
    @PostMapping("/{bookingId}/accept")
    public ResponseEntity<?> acceptBooking(
            @PathVariable Long bookingId,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Worker not authenticated.");
            }
            Worker worker = workerService.findByUsername(authentication.getName())
                .orElseThrow(() -> new Exception("Worker not found"));
            Booking booking = bookingService.acceptBooking(bookingId, worker.getId());
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Reject booking", description = "Worker rejects a booking")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Booking rejected"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Worker not authenticated"),
        @ApiResponse(responseCode = "404", description = "Booking or worker not found")
    })
    @PostMapping("/{bookingId}/reject")
    public ResponseEntity<?> rejectBooking(
            @PathVariable Long bookingId,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Worker not authenticated.");
            }
            Worker worker = workerService.findByUsername(authentication.getName())
                .orElseThrow(() -> new Exception("Worker not found"));
            Booking booking = bookingService.rejectBooking(bookingId, worker.getId());
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Cancel booking", description = "User cancels a pending booking")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Booking cancelled"),
        @ApiResponse(responseCode = "400", description = "Invalid input or booking not cancellable"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "Booking or user not found")
    })
    @PostMapping("/{bookingId}/cancel")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long bookingId,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
            }
            User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new Exception("User not found"));
            Booking booking = bookingService.cancelBooking(bookingId, user.getId());
            return ResponseEntity.ok("Booking cancelled successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Start booking", description = "User starts a job that has been accepted")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Job started successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input or booking not in accepted state"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "Booking or user not found")
    })
    @PostMapping("/{bookingId}/start")
    public ResponseEntity<?> startBooking(
            @PathVariable Long bookingId,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
            }
            User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new Exception("User not found"));
            Booking booking = bookingService.startBooking(bookingId, user.getId());
            return ResponseEntity.ok("Job started successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Complete booking", description = "Worker marks a booking as completed and sets the amount")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Booking marked as completed"),
        @ApiResponse(responseCode = "400", description = "Invalid input or booking not in progress"),
        @ApiResponse(responseCode = "401", description = "Worker not authenticated"),
        @ApiResponse(responseCode = "404", description = "Booking or worker not found")
    })
    @PostMapping("/{bookingId}/complete")
    public ResponseEntity<?> completeBooking(
            @PathVariable Long bookingId,
            @RequestBody CompleteBookingRequest request,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Worker not authenticated.");
            }
            Worker worker = workerService.findByUsername(authentication.getName())
                .orElseThrow(() -> new Exception("Worker not found"));
            Booking booking = bookingService.completeBooking(bookingId, worker.getId(), request.getAmount());
            return ResponseEntity.ok("Booking marked as completed successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Confirm payment", description = "Worker confirms payment for a completed booking")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Payment confirmed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input or payment not pending"),
        @ApiResponse(responseCode = "401", description = "Worker not authenticated"),
        @ApiResponse(responseCode = "404", description = "Booking or worker not found")
    })
    @PostMapping("/{bookingId}/payment/confirm")
    public ResponseEntity<?> confirmPayment(
            @PathVariable Long bookingId,
            @RequestBody CompleteBookingRequest request,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Worker not authenticated.");
            }
            Worker worker = workerService.findByUsername(authentication.getName())
                .orElseThrow(() -> new Exception("Worker not found"));
            Booking booking = bookingService.confirmPayment(bookingId, worker.getId(), request.getAmount());
            return ResponseEntity.ok(booking); // Return the Booking object as JSON
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Accept completion", description = "User accepts the completion of a booking")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Completion accepted"),
        @ApiResponse(responseCode = "400", description = "Invalid input or booking not marked as completed by worker"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "Booking or user not found")
    })
    @PostMapping("/{bookingId}/complete/accept")
    public ResponseEntity<?> acceptCompletion(
            @PathVariable Long bookingId,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
            }
            User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new Exception("User not found"));
            Booking booking = bookingService.acceptCompletion(bookingId, user.getId());
            return ResponseEntity.ok("Completion accepted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Submit rating", description = "User submits a rating for a completed booking")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Rating submitted successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input or booking not completed"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "Booking or user not found")
    })
    @PostMapping("/rating")
    public ResponseEntity<?> submitRating(
            @RequestBody RatingRequest ratingRequest,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
            }
            User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new Exception("User not found"));
            ratingService.submitRating(
                user.getId(),
                ratingRequest.getBookingId(),
                ratingRequest.getRating(),
                ratingRequest.getComment()
            );
            return ResponseEntity.ok("Rating submitted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Get user bookings", description = "Retrieve all bookings for a user")
    @ApiResponse(responseCode = "200", description = "List of bookings")
    @GetMapping("/user")
    public ResponseEntity<?> getUserBookings(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
            }
            User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new Exception("User not found"));
            List<Booking> bookings = bookingService.getUserBookings(user.getId());
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Get worker bookings", description = "Retrieve all bookings for a worker")
    @ApiResponse(responseCode = "200", description = "List of bookings")
    @GetMapping("/worker")
    public ResponseEntity<?> getWorkerBookings(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Worker not authenticated.");
            }
            Worker worker = workerService.findByUsername(authentication.getName())
                .orElseThrow(() -> new Exception("Worker not found"));
            List<Booking> bookings = bookingService.getWorkerBookings(worker.getId());
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Get pending urgent bookings", description = "Retrieve all pending urgent bookings for workers")
    @ApiResponse(responseCode = "200", description = "List of pending urgent bookings")
    @GetMapping("/urgent/pending")
    public ResponseEntity<List<Booking>> getPendingUrgentBookings() {
        return ResponseEntity.ok(bookingService.getPendingUrgentBookings());
    }

    @Operation(summary = "Get booking status", description = "Retrieve the status of a specific booking")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Booking status retrieved"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "Booking not found")
    })
    @GetMapping("/{bookingId}/status")
    public ResponseEntity<?> getBookingStatus(
            @PathVariable Long bookingId,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
            }
            Booking booking = bookingService.getBookingById(bookingId);
            return ResponseEntity.ok(new BookingStatusResponse(booking.getStatus().name()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Get booking details", description = "Retrieve full booking details by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Booking details retrieved"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "Booking not found")
    })
    @GetMapping("/{bookingId}")
    public ResponseEntity<?> getBookingById(
            @PathVariable Long bookingId,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
            }

            Booking booking = bookingService.getBookingById(bookingId);

            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Revert booking to IN_PROGRESS", description = "Client is not satisfied, revert booking status to IN_PROGRESS")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Booking reverted to IN_PROGRESS"),
        @ApiResponse(responseCode = "400", description = "Invalid input or booking not in correct state"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "Booking or user not found")
    })
    @PostMapping("/{bookingId}/in-progress")
    public ResponseEntity<?> markBookingInProgress(
            @PathVariable Long bookingId,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
            }
            User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new Exception("User not found"));
            Booking booking = bookingService.markBookingInProgress(bookingId, user.getId());
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    static class BookingStatusResponse {
        private String status;

        public BookingStatusResponse(String status) {
            this.status = status;
        }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    static class UrgentBookingRequest {
        private String categoryName;
        private Double latitude;
        private Double longitude;
        private Double radius;
        private String paymentMethod;
        private String jobDetails;

        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
        public Double getRadius() { return radius; }
        public void setRadius(Double radius) { this.radius = radius; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getJobDetails() { return jobDetails; }
        public void setJobDetails(String jobDetails) { this.jobDetails = jobDetails; }
    }

    static class CategoryBookingRequest {
        private Long workerId;
        private String categoryName;
        private String paymentMethod;
        private String jobDetails;

        public Long getWorkerId() { return workerId; }
        public void setWorkerId(Long workerId) { this.workerId = workerId; }
        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getJobDetails() { return jobDetails; }
        public void setJobDetails(String jobDetails) { this.jobDetails = jobDetails; }
    }

    static class CompleteBookingRequest {
        private Double amount;

        public Double getAmount() { return amount; }
        public void setAmount(Double amount) { this.amount = amount; }
    }

    static class RatingRequest {
        private Long bookingId;
        private Integer rating;
        private String comment;

        public Long getBookingId() { return bookingId; }
        public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }
        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
    }
}
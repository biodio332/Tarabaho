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
import tarabaho.tarabaho.entity.Rating;
import tarabaho.tarabaho.entity.User;
import tarabaho.tarabaho.service.RatingService;
import tarabaho.tarabaho.service.UserService;

@RestController
@RequestMapping("/api/rating")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Rating Controller", description = "Handles rating submissions and retrieval for workers")
public class RatingController {

    @Autowired
    private RatingService ratingService;

    @Autowired
    private UserService userService;

    @Operation(summary = "Get ratings by worker ID", description = "Retrieve all ratings for a specific worker")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Ratings retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/worker/{workerId}")
    public ResponseEntity<?> getRatingsByWorkerId(@PathVariable Long workerId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
            }
            List<Rating> ratings = ratingService.getRatingsByWorkerId(workerId);
            return ResponseEntity.ok(ratings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to retrieve ratings: " + e.getMessage());
        }
    }

    @Operation(summary = "Submit rating", description = "User submits a rating and comment for a completed booking")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Rating submitted successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "User or booking not found")
    })
    @PostMapping
    public ResponseEntity<?> submitRating(
            @RequestBody RatingRequest request,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
            }
            User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new Exception("User not found"));
            Rating rating = ratingService.submitRating(
                user.getId(),
                request.getBookingId(),
                request.getRating(),
                request.getComment()
            );
            return ResponseEntity.ok(rating);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
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
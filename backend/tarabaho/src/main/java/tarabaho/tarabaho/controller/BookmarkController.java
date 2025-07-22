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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import tarabaho.tarabaho.entity.User;
import tarabaho.tarabaho.entity.Worker;
import tarabaho.tarabaho.service.BookmarkService;
import tarabaho.tarabaho.service.UserService;

@RestController
@RequestMapping("/api/bookmarks")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Bookmark Controller", description = "Handles bookmark operations for workers")
public class BookmarkController {

    @Autowired
    private BookmarkService bookmarkService;

    @Autowired
    private UserService userService;

    @Operation(summary = "Toggle bookmark", description = "Add or remove a worker from user's bookmarks")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Bookmark toggled successfully"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "User or worker not found")
    })
    @PostMapping("/worker/{workerId}")
    public ResponseEntity<?> toggleBookmark(@PathVariable Long workerId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
            }
            User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new Exception("User not found"));
            boolean isBookmarked = bookmarkService.toggleBookmark(user.getId(), workerId);
            return ResponseEntity.ok(isBookmarked);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Check bookmark status", description = "Check if a worker is bookmarked by the user")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Bookmark status retrieved"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "User or worker not found")
    })
    @GetMapping("/worker/{workerId}")
    public ResponseEntity<?> isBookmarked(@PathVariable Long workerId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
            }
            User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new Exception("User not found"));
            boolean isBookmarked = bookmarkService.isBookmarked(user.getId(), workerId);
            return ResponseEntity.ok(isBookmarked);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Get bookmarked workers", description = "Retrieve all workers bookmarked by the user")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Bookmarked workers retrieved"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping
    public ResponseEntity<?> getBookmarkedWorkers(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
            }
            User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new Exception("User not found"));
            List<Worker> workers = bookmarkService.getBookmarkedWorkers(user.getId());
            return ResponseEntity.ok(workers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }
}
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
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.entity.User;
import tarabaho.tarabaho.service.BookmarkService;
import tarabaho.tarabaho.service.UserService;

@RestController
@RequestMapping("/api/bookmarks")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Bookmark Controller", description = "Handles bookmark operations for graduates")
public class BookmarkController {

    @Autowired
    private BookmarkService bookmarkService;

    @Autowired
    private UserService userService;

    @Operation(summary = "Toggle bookmark", description = "Add or remove a graduate from user's bookmarks")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Bookmark toggled successfully"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "User or graduate not found")
    })
    @PostMapping("/graduate/{graduateId}")
    public ResponseEntity<?> toggleBookmark(@PathVariable Long graduateId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
            }
            User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new Exception("User not found"));
            boolean isBookmarked = bookmarkService.toggleBookmark(user.getId(), graduateId);
            return ResponseEntity.ok(isBookmarked);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Check bookmark status", description = "Check if a graduate is bookmarked by the user")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Bookmark status retrieved"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "User or graduate not found")
    })
    @GetMapping("/graduate/{graduateId}")
    public ResponseEntity<?> isBookmarked(@PathVariable Long graduateId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
            }
            User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new Exception("User not found"));
            boolean isBookmarked = bookmarkService.isBookmarked(user.getId(), graduateId);
            return ResponseEntity.ok(isBookmarked);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Get bookmarked graduates", description = "Retrieve all graduates bookmarked by the user")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Bookmarked graduates retrieved"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping
    public ResponseEntity<?> getBookmarkedGraduates(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
            }
            User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new Exception("User not found"));
            List<Graduate> graduates = bookmarkService.getBookmarkedGraduates(user.getId());
            return ResponseEntity.ok(graduates);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }
}
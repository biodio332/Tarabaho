package tarabaho.tarabaho.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import tarabaho.tarabaho.entity.AwardRecognition;
import tarabaho.tarabaho.service.AwardRecognitionService;
import java.util.List;

@RestController
@RequestMapping("/api/portfolio/{portfolioId}/awards")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "AwardRecognition Controller", description = "Handles CRUD operations for awards in a portfolio")
public class AwardRecognitionController {

    private static final Logger logger = LoggerFactory.getLogger(AwardRecognitionController.class);
    @Autowired
    private AwardRecognitionService awardRecognitionService;

    private String getUsernameFromAuthentication(Authentication authentication) {
        if (authentication.getPrincipal() instanceof OAuth2User) {
            OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
            String email = oauthUser.getAttribute("email");
            logger.debug("AwardRecognitionController: OAuth2 authentication detected, using email: {}", email);
            return email;
        } else {
            String username = authentication.getName();
            logger.debug("AwardRecognitionController: Default authentication detected, using username: {}", username);
            return username;
        }
    }

    @Operation(summary = "Add an award to a portfolio", description = "Adds an award to the specified portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Award added successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PostMapping
    public ResponseEntity<?> addAwardRecognition(@PathVariable Long portfolioId, @RequestBody AwardRecognition award, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("AwardRecognitionController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = getUsernameFromAuthentication(authentication);
            AwardRecognition savedAward = awardRecognitionService.saveAwardRecognition(portfolioId, award, username);
            logger.info("AwardRecognitionController: Award added successfully for portfolio ID: {}", portfolioId);
            return ResponseEntity.ok(savedAward);
        } catch (Exception e) {
            logger.error("AwardRecognitionController: Failed to add award: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Get awards for a portfolio", description = "Retrieves all awards for the specified portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Awards retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied to private portfolio"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found")
    })
    @GetMapping
    public ResponseEntity<?> getAwardRecognitions(@PathVariable Long portfolioId, Authentication authentication) {
        try {
            String username = authentication != null ? getUsernameFromAuthentication(authentication) : null;
            List<AwardRecognition> awards = awardRecognitionService.getAwardRecognitionsByPortfolioId(portfolioId, username);
            logger.info("AwardRecognitionController: Retrieved {} awards for portfolio ID: {}", awards.size(), portfolioId);
            return ResponseEntity.ok(awards);
        } catch (Exception e) {
            logger.error("AwardRecognitionController: Failed to fetch awards: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Update an award", description = "Updates an award in the specified portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Award updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Award not found")
    })
    @PutMapping("/{awardId}")
    public ResponseEntity<?> updateAwardRecognition(@PathVariable Long portfolioId, @PathVariable Long awardId, @RequestBody AwardRecognition award, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("AwardRecognitionController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = getUsernameFromAuthentication(authentication);
            AwardRecognition updatedAward = awardRecognitionService.updateAwardRecognition(awardId, award, username);
            logger.info("AwardRecognitionController: Award updated successfully, ID: {}", awardId);
            return ResponseEntity.ok(updatedAward);
        } catch (Exception e) {
            logger.error("AwardRecognitionController: Failed to update award: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Delete an award", description = "Deletes an award from the specified portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Award deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Award not found")
    })
    @DeleteMapping("/{awardId}")
    public ResponseEntity<?> deleteAwardRecognition(@PathVariable Long portfolioId, @PathVariable Long awardId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("AwardRecognitionController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = getUsernameFromAuthentication(authentication);
            awardRecognitionService.deleteAwardRecognition(awardId, username);
            logger.info("AwardRecognitionController: Award deleted successfully, ID: {}", awardId);
            return ResponseEntity.ok("Award deleted successfully.");
        } catch (Exception e) {
            logger.error("AwardRecognitionController: Failed to delete award: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }
    @Operation(summary = "Replace all awards for a portfolio", description = "Replaces all awards for the specified portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Awards replaced successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found")
    })
    @PutMapping
    public ResponseEntity<?> replaceAwardRecognitions(@PathVariable Long portfolioId, @RequestBody List<AwardRecognition> awards, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("AwardRecognitionController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = getUsernameFromAuthentication(authentication);
            // Validate awards
            for (AwardRecognition award : awards) {
                if (award.getTitle() == null || award.getTitle().trim().isEmpty()) {
                    logger.warn("AwardRecognitionController: Award title is required");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Award title is required.");
                }
            }
            List<AwardRecognition> updatedAwards = awardRecognitionService.replaceAwardRecognitions(portfolioId, awards, username);
            logger.info("AwardRecognitionController: Awards replaced for portfolio ID: {}", portfolioId);
            return ResponseEntity.ok(updatedAwards);
        } catch (IllegalArgumentException e) {
            logger.error("AwardRecognitionController: Validation error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            logger.error("AwardRecognitionController: Unexpected error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("⚠️ Unexpected error: " + e.getMessage());
        }
    }
}
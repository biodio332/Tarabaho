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
import tarabaho.tarabaho.entity.ContinuingEducation;
import tarabaho.tarabaho.service.ContinuingEducationService;
import java.util.List;

@RestController
@RequestMapping("/api/portfolio/{portfolioId}/educations")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "ContinuingEducation Controller", description = "Handles CRUD operations for continuing education in a portfolio")
public class ContinuingEducationController {

    private static final Logger logger = LoggerFactory.getLogger(ContinuingEducationController.class);

    @Autowired
    private ContinuingEducationService continuingEducationService;

    private String getUsernameFromAuthentication(Authentication authentication) {
        if (authentication.getPrincipal() instanceof OAuth2User) {
            OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
            String email = oauthUser.getAttribute("email");
            logger.debug("ContinuingEducationController: OAuth2 authentication detected, using email: {}", email);
            return email;
        } else {
            String username = authentication.getName();
            logger.debug("ContinuingEducationController: Default authentication detected, using username: {}", username);
            return username;
        }
    }

    @Operation(summary = "Add continuing education to a portfolio", description = "Adds a continuing education entry to the specified portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Education added successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PostMapping
    public ResponseEntity<?> addContinuingEducation(@PathVariable Long portfolioId, @RequestBody ContinuingEducation education, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("ContinuingEducationController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = getUsernameFromAuthentication(authentication);
            ContinuingEducation savedEducation = continuingEducationService.saveContinuingEducation(portfolioId, education, username);
            logger.info("ContinuingEducationController: Education added successfully for portfolio ID: {}", portfolioId);
            return ResponseEntity.ok(savedEducation);
        } catch (Exception e) {
            logger.error("ContinuingEducationController: Failed to add education: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Get continuing education for a portfolio", description = "Retrieves all continuing education entries for the specified portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Educations retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied to private portfolio"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found")
    })
    @GetMapping
    public ResponseEntity<?> getContinuingEducations(@PathVariable Long portfolioId, Authentication authentication) {
        try {
            String username = authentication != null ? getUsernameFromAuthentication(authentication) : null;
            List<ContinuingEducation> educations = continuingEducationService.getContinuingEducationsByPortfolioId(portfolioId, username);
            logger.info("ContinuingEducationController: Retrieved {} educations for portfolio ID: {}", educations.size(), portfolioId);
            return ResponseEntity.ok(educations);
        } catch (Exception e) {
            logger.error("ContinuingEducationController: Failed to fetch educations: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Update continuing education", description = "Updates a continuing education entry in the specified portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Education updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Education not found")
    })
    @PutMapping("/{educationId}")
    public ResponseEntity<?> updateContinuingEducation(@PathVariable Long portfolioId, @PathVariable Long educationId, @RequestBody ContinuingEducation education, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("ContinuingEducationController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = getUsernameFromAuthentication(authentication);
            ContinuingEducation updatedEducation = continuingEducationService.updateContinuingEducation(educationId, education, username);
            logger.info("ContinuingEducationController: Education updated successfully, ID: {}", educationId);
            return ResponseEntity.ok(updatedEducation);
        } catch (Exception e) {
            logger.error("ContinuingEducationController: Failed to update education: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Delete continuing education", description = "Deletes a continuing education entry from the specified portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Education deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Education not found")
    })
    @DeleteMapping("/{educationId}")
    public ResponseEntity<?> deleteContinuingEducation(@PathVariable Long portfolioId, @PathVariable Long educationId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("ContinuingEducationController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = getUsernameFromAuthentication(authentication);
            continuingEducationService.deleteContinuingEducation(educationId, username);
            logger.info("ContinuingEducationController: Education deleted successfully, ID: {}", educationId);
            return ResponseEntity.ok("Continuing education deleted successfully.");
        } catch (Exception e) {
            logger.error("ContinuingEducationController: Failed to delete education: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }
    @PutMapping
    public ResponseEntity<?> replaceContinuingEducations(@PathVariable Long portfolioId, @RequestBody List<ContinuingEducation> educations, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("ContinuingEducationController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = getUsernameFromAuthentication(authentication);
            // Validate continuing educations
            for (ContinuingEducation education : educations) {
                if (education.getCourseName() == null || education.getCourseName().trim().isEmpty()) {
                    logger.warn("ContinuingEducationController: Continuing education course name is required");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Continuing education course name is required.");
                }
            }
            List<ContinuingEducation> updatedEducations = continuingEducationService.replaceContinuingEducations(portfolioId, educations, username);
            logger.info("ContinuingEducationController: Continuing educations replaced for portfolio ID: {}", portfolioId);
            return ResponseEntity.ok(updatedEducations);
        } catch (IllegalArgumentException e) {
            logger.error("ContinuingEducationController: Validation error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            logger.error("ContinuingEducationController: Unexpected error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("⚠️ Unexpected error: " + e.getMessage());
        }
    }
}
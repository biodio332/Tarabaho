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
import tarabaho.tarabaho.entity.Reference;
import tarabaho.tarabaho.service.ReferenceService;
import java.util.List;

@RestController
@RequestMapping("/api/portfolio/{portfolioId}/references")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Reference Controller", description = "Handles CRUD operations for references in a portfolio")
public class ReferenceController {

    private static final Logger logger = LoggerFactory.getLogger(ReferenceController.class);
    @Autowired
    private ReferenceService referenceService;

    private String getUsernameFromAuthentication(Authentication authentication) {
        if (authentication.getPrincipal() instanceof OAuth2User) {
            OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
            String email = oauthUser.getAttribute("email");
            logger.debug("ReferenceController: OAuth2 authentication detected, using email: {}", email);
            return email;
        } else {
            String username = authentication.getName();
            logger.debug("ReferenceController: Default authentication detected, using username: {}", username);
            return username;
        }
    }
    
    

    @Operation(summary = "Add a reference to a portfolio", description = "Adds a reference to the specified portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Reference added successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PostMapping
    public ResponseEntity<?> addReference(@PathVariable Long portfolioId, @RequestBody Reference reference, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("ReferenceController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = getUsernameFromAuthentication(authentication);
            Reference savedReference = referenceService.saveReference(portfolioId, reference, username);
            logger.info("ReferenceController: Reference added successfully for portfolio ID: {}", portfolioId);
            return ResponseEntity.ok(savedReference);
        } catch (Exception e) {
            logger.error("ReferenceController: Failed to add reference: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Get references for a portfolio", description = "Retrieves all references for the specified portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "References retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied to private portfolio"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found")
    })
    @GetMapping
    public ResponseEntity<?> getReferences(@PathVariable Long portfolioId, Authentication authentication) {
        try {
            String username = authentication != null ? getUsernameFromAuthentication(authentication) : null;
            List<Reference> references = referenceService.getReferencesByPortfolioId(portfolioId, username);
            logger.info("ReferenceController: Retrieved {} references for portfolio ID: {}", references.size(), portfolioId);
            return ResponseEntity.ok(references);
        } catch (Exception e) {
            logger.error("ReferenceController: Failed to fetch references: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Update a reference", description = "Updates a reference in the specified portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Reference updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Reference not found")
    })
    @PutMapping("/{referenceId}")
    public ResponseEntity<?> updateReference(@PathVariable Long portfolioId, @PathVariable Long referenceId, @RequestBody Reference reference, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("ReferenceController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = getUsernameFromAuthentication(authentication);
            Reference updatedReference = referenceService.updateReference(referenceId, reference, username);
            logger.info("ReferenceController: Reference updated successfully, ID: {}", referenceId);
            return ResponseEntity.ok(updatedReference);
        } catch (Exception e) {
            logger.error("ReferenceController: Failed to update reference: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Delete a reference", description = "Deletes a reference from the specified portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Reference deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Reference not found")
    })
    @DeleteMapping("/{referenceId}")
    public ResponseEntity<?> deleteReference(@PathVariable Long portfolioId, @PathVariable Long referenceId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("ReferenceController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = getUsernameFromAuthentication(authentication);
            referenceService.deleteReference(referenceId, username);
            logger.info("ReferenceController: Reference deleted successfully, ID: {}", referenceId);
            return ResponseEntity.ok("Reference deleted successfully.");
        } catch (Exception e) {
            logger.error("ReferenceController: Failed to delete reference: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }
    @Operation(summary = "Replace all references for a portfolio", description = "Replaces all references for the specified portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "References replaced successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found")
    })
    @PutMapping
    public ResponseEntity<?> replaceReferences(@PathVariable Long portfolioId, @RequestBody List<Reference> references, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("ReferenceController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = getUsernameFromAuthentication(authentication);
            // Validate references
            for (Reference reference : references) {
                if (reference.getName() == null || reference.getName().trim().isEmpty()) {
                    logger.warn("ReferenceController: Reference name is required");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Reference name is required.");
                }
                if (reference.getEmail() != null && !reference.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                    logger.warn("ReferenceController: Invalid reference email format");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Invalid reference email format.");
                }
            }
            List<Reference> updatedReferences = referenceService.replaceReferences(portfolioId, references, username);
            logger.info("ReferenceController: References replaced for portfolio ID: {}", portfolioId);
            return ResponseEntity.ok(updatedReferences);
        } catch (IllegalArgumentException e) {
            logger.error("ReferenceController: Validation error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            logger.error("ReferenceController: Unexpected error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("⚠️ Unexpected error: " + e.getMessage());
        }
    }
}
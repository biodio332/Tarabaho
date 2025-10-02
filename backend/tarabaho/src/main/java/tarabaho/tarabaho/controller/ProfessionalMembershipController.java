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
import tarabaho.tarabaho.entity.ProfessionalMembership;
import tarabaho.tarabaho.service.ProfessionalMembershipService;
import java.util.List;

@RestController
@RequestMapping("/api/portfolio/{portfolioId}/memberships")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "ProfessionalMembership Controller", description = "Handles CRUD operations for professional memberships in a portfolio")
public class ProfessionalMembershipController {

    private static final Logger logger = LoggerFactory.getLogger(ProfessionalMembershipController.class);
    @Autowired
    private ProfessionalMembershipService professionalMembershipService;

    private String getUsernameFromAuthentication(Authentication authentication) {
        if (authentication.getPrincipal() instanceof OAuth2User) {
            OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
            String email = oauthUser.getAttribute("email");
            logger.debug("ProfessionalMembershipController: OAuth2 authentication detected, using email: {}", email);
            return email;
        } else {
            String username = authentication.getName();
            logger.debug("ProfessionalMembershipController: Default authentication detected, using username: {}", username);
            return username;
        }
    }

    @Operation(summary = "Add a professional membership to a portfolio", description = "Adds a professional membership to the specified portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Membership added successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PostMapping
    public ResponseEntity<?> addProfessionalMembership(@PathVariable Long portfolioId, @RequestBody ProfessionalMembership membership, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("ProfessionalMembershipController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = getUsernameFromAuthentication(authentication);
            ProfessionalMembership savedMembership = professionalMembershipService.saveProfessionalMembership(portfolioId, membership, username);
            logger.info("ProfessionalMembershipController: Membership added successfully for portfolio ID: {}", portfolioId);
            return ResponseEntity.ok(savedMembership);
        } catch (Exception e) {
            logger.error("ProfessionalMembershipController: Failed to add membership: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Get professional memberships for a portfolio", description = "Retrieves all professional memberships for the specified portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Memberships retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied to private portfolio"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found")
    })
    @GetMapping
    public ResponseEntity<?> getProfessionalMemberships(@PathVariable Long portfolioId, Authentication authentication) {
        try {
            String username = authentication != null ? getUsernameFromAuthentication(authentication) : null;
            List<ProfessionalMembership> memberships = professionalMembershipService.getProfessionalMembershipsByPortfolioId(portfolioId, username);
            logger.info("ProfessionalMembershipController: Retrieved {} memberships for portfolio ID: {}", memberships.size(), portfolioId);
            return ResponseEntity.ok(memberships);
        } catch (Exception e) {
            logger.error("ProfessionalMembershipController: Failed to fetch memberships: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Update a professional membership", description = "Updates a professional membership in the specified portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Membership updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Membership not found")
    })
    @PutMapping("/{membershipId}")
    public ResponseEntity<?> updateProfessionalMembership(@PathVariable Long portfolioId, @PathVariable Long membershipId, @RequestBody ProfessionalMembership membership, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("ProfessionalMembershipController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = getUsernameFromAuthentication(authentication);
            ProfessionalMembership updatedMembership = professionalMembershipService.updateProfessionalMembership(membershipId, membership, username);
            logger.info("ProfessionalMembershipController: Membership updated successfully, ID: {}", membershipId);
            return ResponseEntity.ok(updatedMembership);
        } catch (Exception e) {
            logger.error("ProfessionalMembershipController: Failed to update membership: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Delete a professional membership", description = "Deletes a professional membership from the specified portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Membership deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Membership not found")
    })
    @DeleteMapping("/{membershipId}")
    public ResponseEntity<?> deleteProfessionalMembership(@PathVariable Long portfolioId, @PathVariable Long membershipId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("ProfessionalMembershipController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = getUsernameFromAuthentication(authentication);
            professionalMembershipService.deleteProfessionalMembership(membershipId, username);
            logger.info("ProfessionalMembershipController: Membership deleted successfully, ID: {}", membershipId);
            return ResponseEntity.ok("Professional membership deleted successfully.");
        } catch (Exception e) {
            logger.error("ProfessionalMembershipController: Failed to delete membership: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }
    @Operation(summary = "Replace all professional memberships for a portfolio", description = "Replaces all professional memberships for the specified portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Memberships replaced successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found")
    })
    @PutMapping
    public ResponseEntity<?> replaceProfessionalMemberships(@PathVariable Long portfolioId, @RequestBody List<ProfessionalMembership> memberships, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("ProfessionalMembershipController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = getUsernameFromAuthentication(authentication);
            // Validate professional memberships
            for (ProfessionalMembership membership : memberships) {
                if (membership.getOrganization() == null || membership.getOrganization().trim().isEmpty()) {
                    logger.warn("ProfessionalMembershipController: Professional membership organization is required");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Professional membership organization is required.");
                }
            }
            List<ProfessionalMembership> updatedMemberships = professionalMembershipService.replaceProfessionalMemberships(portfolioId, memberships, username);
            logger.info("ProfessionalMembershipController: Professional memberships replaced for portfolio ID: {}", portfolioId);
            return ResponseEntity.ok(updatedMemberships);
        } catch (IllegalArgumentException e) {
            logger.error("ProfessionalMembershipController: Validation error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            logger.error("ProfessionalMembershipController: Unexpected error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("⚠️ Unexpected error: " + e.getMessage());
        }
    }
}
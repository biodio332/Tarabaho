package tarabaho.tarabaho.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tarabaho.tarabaho.entity.ProfessionalMembership;
import tarabaho.tarabaho.service.ProfessionalMembershipService;
import java.util.List;

@RestController
@RequestMapping("/api/portfolio/{portfolioId}/memberships")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "ProfessionalMembership Controller", description = "Handles CRUD operations for professional memberships in a portfolio")
public class ProfessionalMembershipController {

    @Autowired
    private ProfessionalMembershipService professionalMembershipService;

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
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            ProfessionalMembership savedMembership = professionalMembershipService.saveProfessionalMembership(portfolioId, membership, authentication.getName());
            return ResponseEntity.ok(savedMembership);
        } catch (Exception e) {
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
            String username = authentication != null ? authentication.getName() : null;
            List<ProfessionalMembership> memberships = professionalMembershipService.getProfessionalMembershipsByPortfolioId(portfolioId, username);
            return ResponseEntity.ok(memberships);
        } catch (Exception e) {
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
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            ProfessionalMembership updatedMembership = professionalMembershipService.updateProfessionalMembership(membershipId, membership, authentication.getName());
            return ResponseEntity.ok(updatedMembership);
        } catch (Exception e) {
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
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            professionalMembershipService.deleteProfessionalMembership(membershipId, authentication.getName());
            return ResponseEntity.ok("Professional membership deleted successfully.");
        } catch (Exception e) {
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
                System.out.println("ProfessionalMembershipController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            // Validate professional memberships
            for (ProfessionalMembership membership : memberships) {
                if (membership.getOrganization() == null || membership.getOrganization().trim().isEmpty()) {
                    System.out.println("ProfessionalMembershipController: Professional membership organization is required");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Professional membership organization is required.");
                }
            }
            List<ProfessionalMembership> updatedMemberships = professionalMembershipService.replaceProfessionalMemberships(portfolioId, memberships, authentication.getName());
            System.out.println("ProfessionalMembershipController: Professional memberships replaced for portfolio ID: " + portfolioId);
            return ResponseEntity.ok(updatedMemberships);
        } catch (IllegalArgumentException e) {
            System.out.println("ProfessionalMembershipController: Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            System.out.println("ProfessionalMembershipController: Unexpected error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("⚠️ Unexpected error: " + e.getMessage());
        }
    }
}
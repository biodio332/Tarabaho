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
import tarabaho.tarabaho.entity.Reference;
import tarabaho.tarabaho.service.ReferenceService;
import java.util.List;

@RestController
@RequestMapping("/api/portfolio/{portfolioId}/references")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Reference Controller", description = "Handles CRUD operations for references in a portfolio")
public class ReferenceController {

    @Autowired
    private ReferenceService referenceService;

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
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            Reference savedReference = referenceService.saveReference(portfolioId, reference, authentication.getName());
            return ResponseEntity.ok(savedReference);
        } catch (Exception e) {
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
            String username = authentication != null ? authentication.getName() : null;
            List<Reference> references = referenceService.getReferencesByPortfolioId(portfolioId, username);
            return ResponseEntity.ok(references);
        } catch (Exception e) {
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
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            Reference updatedReference = referenceService.updateReference(referenceId, reference, authentication.getName());
            return ResponseEntity.ok(updatedReference);
        } catch (Exception e) {
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
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            referenceService.deleteReference(referenceId, authentication.getName());
            return ResponseEntity.ok("Reference deleted successfully.");
        } catch (Exception e) {
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
                System.out.println("ReferenceController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            // Validate references
            for (Reference reference : references) {
                if (reference.getName() == null || reference.getName().trim().isEmpty()) {
                    System.out.println("ReferenceController: Reference name is required");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Reference name is required.");
                }
                if (reference.getEmail() != null && !reference.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                    System.out.println("ReferenceController: Invalid reference email format");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Invalid reference email format.");
                }
            }
            List<Reference> updatedReferences = referenceService.replaceReferences(portfolioId, references, authentication.getName());
            System.out.println("ReferenceController: References replaced for portfolio ID: " + portfolioId);
            return ResponseEntity.ok(updatedReferences);
        } catch (IllegalArgumentException e) {
            System.out.println("ReferenceController: Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            System.out.println("ReferenceController: Unexpected error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("⚠️ Unexpected error: " + e.getMessage());
        }
    }
}
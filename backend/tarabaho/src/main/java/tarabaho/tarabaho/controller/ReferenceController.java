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
}
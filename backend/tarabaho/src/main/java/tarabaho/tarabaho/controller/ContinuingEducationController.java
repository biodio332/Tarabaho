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
import tarabaho.tarabaho.entity.ContinuingEducation;
import tarabaho.tarabaho.service.ContinuingEducationService;
import java.util.List;

@RestController
@RequestMapping("/api/portfolio/{portfolioId}/educations")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "ContinuingEducation Controller", description = "Handles CRUD operations for continuing education in a portfolio")
public class ContinuingEducationController {

    @Autowired
    private ContinuingEducationService continuingEducationService;

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
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            ContinuingEducation savedEducation = continuingEducationService.saveContinuingEducation(portfolioId, education, authentication.getName());
            return ResponseEntity.ok(savedEducation);
        } catch (Exception e) {
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
            String username = authentication != null ? authentication.getName() : null;
            List<ContinuingEducation> educations = continuingEducationService.getContinuingEducationsByPortfolioId(portfolioId, username);
            return ResponseEntity.ok(educations);
        } catch (Exception e) {
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
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            ContinuingEducation updatedEducation = continuingEducationService.updateContinuingEducation(educationId, education, authentication.getName());
            return ResponseEntity.ok(updatedEducation);
        } catch (Exception e) {
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
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            continuingEducationService.deleteContinuingEducation(educationId, authentication.getName());
            return ResponseEntity.ok("Continuing education deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }
    @PutMapping
    public ResponseEntity<?> replaceContinuingEducations(@PathVariable Long portfolioId, @RequestBody List<ContinuingEducation> educations, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("ContinuingEducationController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            // Validate continuing educations
            for (ContinuingEducation education : educations) {
                if (education.getCourseName() == null || education.getCourseName().trim().isEmpty()) {
                    System.out.println("ContinuingEducationController: Continuing education course name is required");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Continuing education course name is required.");
                }
            }
            List<ContinuingEducation> updatedEducations = continuingEducationService.replaceContinuingEducations(portfolioId, educations, authentication.getName());
            System.out.println("ContinuingEducationController: Continuing educations replaced for portfolio ID: " + portfolioId);
            return ResponseEntity.ok(updatedEducations);
        } catch (IllegalArgumentException e) {
            System.out.println("ContinuingEducationController: Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            System.out.println("ContinuingEducationController: Unexpected error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("⚠️ Unexpected error: " + e.getMessage());
        }
    }
}
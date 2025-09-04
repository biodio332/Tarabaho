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
import tarabaho.tarabaho.entity.AwardRecognition;
import tarabaho.tarabaho.service.AwardRecognitionService;
import java.util.List;

@RestController
@RequestMapping("/api/portfolio/{portfolioId}/awards")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "AwardRecognition Controller", description = "Handles CRUD operations for awards in a portfolio")
public class AwardRecognitionController {

    @Autowired
    private AwardRecognitionService awardRecognitionService;

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
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            AwardRecognition savedAward = awardRecognitionService.saveAwardRecognition(portfolioId, award, authentication.getName());
            return ResponseEntity.ok(savedAward);
        } catch (Exception e) {
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
            String username = authentication != null ? authentication.getName() : null;
            List<AwardRecognition> awards = awardRecognitionService.getAwardRecognitionsByPortfolioId(portfolioId, username);
            return ResponseEntity.ok(awards);
        } catch (Exception e) {
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
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            AwardRecognition updatedAward = awardRecognitionService.updateAwardRecognition(awardId, award, authentication.getName());
            return ResponseEntity.ok(updatedAward);
        } catch (Exception e) {
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
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            awardRecognitionService.deleteAwardRecognition(awardId, authentication.getName());
            return ResponseEntity.ok("Award deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }
}
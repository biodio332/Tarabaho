package tarabaho.tarabaho.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import tarabaho.tarabaho.entity.Experience;
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.entity.Portfolio;
import tarabaho.tarabaho.repository.PortfolioRepository;
import tarabaho.tarabaho.service.ExperienceService;
import tarabaho.tarabaho.service.GraduateService;
import tarabaho.tarabaho.service.PortfolioService;

@RestController
@RequestMapping("/api/experience")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Experience Controller", description = "Handles experience creation, retrieval, and deletion")
public class ExperienceController {

    @Autowired
    private ExperienceService experienceService;

    @Autowired
    private GraduateService graduateService;

    @Autowired
    private PortfolioService portfolioService;

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Operation(summary = "Get experiences by portfolio ID", description = "Retrieves all experiences for a portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Experiences retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied to portfolio")
    })
    @GetMapping("/portfolio/{portfolioId}")
    public ResponseEntity<?> getExperiences(@PathVariable Long portfolioId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = authentication.getName();
            Graduate graduate = graduateService.findByUsername(username)
                .orElseThrow(() -> new Exception("Graduate not found."));
            portfolioService.getPortfolio(portfolioId, username); // Verify portfolio access
            List<Experience> experiences = experienceService.getExperiencesByPortfolioId(portfolioId);
            return ResponseEntity.ok(experiences);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Create a new experience", description = "Creates an experience for the authenticated graduate's portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Experience created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    @PostMapping
    public ResponseEntity<?> createExperience(@RequestBody Experience experience, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = authentication.getName();
            Graduate graduate = graduateService.findByUsername(username)
                .orElseThrow(() -> new Exception("Graduate not found."));
            portfolioService.getPortfolio(experience.getPortfolio().getId(), username); // Verify portfolio access
            Portfolio portfolio = portfolioRepository.findById(experience.getPortfolio().getId())
                .orElseThrow(() -> new Exception("Portfolio not found with id: " + experience.getPortfolio().getId()));
            if (!portfolio.getGraduate().getUsername().equals(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied to portfolio.");
            }
            experience.setPortfolio(portfolio); // Link to owned portfolio
            Experience savedExperience = experienceService.saveExperience(experience);
            return ResponseEntity.ok(savedExperience);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Delete an experience", description = "Deletes an experience by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Experience deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied to delete experience"),
        @ApiResponse(responseCode = "404", description = "Experience not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExperience(@PathVariable Long id, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = authentication.getName();
            Graduate graduate = graduateService.findByUsername(username)
                .orElseThrow(() -> new Exception("Graduate not found."));
            Experience experience = experienceService.getExperienceById(id); // Assume method exists
            portfolioService.getPortfolio(experience.getPortfolio().getId(), username); // Verify portfolio access
            if (!experience.getPortfolio().getGraduate().getUsername().equals(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied to delete experience.");
            }
            experienceService.deleteExperience(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("⚠️ " + e.getMessage());
        }
    }
}
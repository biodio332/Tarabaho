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
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.entity.Portfolio;
import tarabaho.tarabaho.entity.Testimonial;
import tarabaho.tarabaho.repository.PortfolioRepository;
import tarabaho.tarabaho.service.GraduateService;
import tarabaho.tarabaho.service.PortfolioService;
import tarabaho.tarabaho.service.TestimonialService;

@RestController
@RequestMapping("/api/testimonial")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Testimonial Controller", description = "Handles testimonial creation, retrieval, and deletion")
public class TestimonialController {

    @Autowired
    private TestimonialService testimonialService;

    @Autowired
    private GraduateService graduateService;

    @Autowired
    private PortfolioService portfolioService;

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Operation(summary = "Get testimonials by portfolio ID", description = "Retrieves all testimonials for a portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Testimonials retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied to portfolio")
    })
    @GetMapping("/portfolio/{portfolioId}")
    public ResponseEntity<?> getTestimonials(@PathVariable Long portfolioId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = authentication.getName();
            Graduate graduate = graduateService.findByUsername(username)
                .orElseThrow(() -> new Exception("Graduate not found."));
            portfolioService.getPortfolio(portfolioId, username); // Verify portfolio access
            List<Testimonial> testimonials = testimonialService.getTestimonialsByPortfolioId(portfolioId);
            return ResponseEntity.ok(testimonials);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Create a new testimonial", description = "Creates a testimonial for the authenticated graduate's portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Testimonial created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    @PostMapping
    public ResponseEntity<?> createTestimonial(@RequestBody Testimonial testimonial, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = authentication.getName();
            Graduate graduate = graduateService.findByUsername(username)
                .orElseThrow(() -> new Exception("Graduate not found."));
            portfolioService.getPortfolio(testimonial.getPortfolio().getId(), username); // Verify portfolio access
            Portfolio portfolio = portfolioRepository.findById(testimonial.getPortfolio().getId())
                .orElseThrow(() -> new Exception("Portfolio not found with id: " + testimonial.getPortfolio().getId()));
            if (!portfolio.getGraduate().getUsername().equals(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied to portfolio.");
            }
            testimonial.setPortfolio(portfolio); // Link to owned portfolio
            Testimonial savedTestimonial = testimonialService.saveTestimonial(testimonial);
            return ResponseEntity.ok(savedTestimonial);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Delete a testimonial", description = "Deletes a testimonial by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Testimonial deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied to delete testimonial"),
        @ApiResponse(responseCode = "404", description = "Testimonial not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTestimonial(@PathVariable Long id, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = authentication.getName();
            Graduate graduate = graduateService.findByUsername(username)
                .orElseThrow(() -> new Exception("Graduate not found."));
            Testimonial testimonial = testimonialService.getTestimonialById(id); // Assume method exists
            portfolioService.getPortfolio(testimonial.getPortfolio().getId(), username); // Verify portfolio access
            if (!testimonial.getPortfolio().getGraduate().getUsername().equals(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied to delete testimonial.");
            }
            testimonialService.deleteTestimonial(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("⚠️ " + e.getMessage());
        }
    }
}
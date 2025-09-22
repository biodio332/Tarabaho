package tarabaho.tarabaho.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import tarabaho.tarabaho.dto.ViewTrendResponse;
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.service.GraduateService;
import tarabaho.tarabaho.service.PortfolioService;
import tarabaho.tarabaho.service.PortfolioViewService;

@RestController
@RequestMapping("/api/portfolio-view")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Portfolio View Controller", description = "Handles view statistics for graduate dashboards")
public class PortfolioViewController {

    private static final Logger logger = LoggerFactory.getLogger(PortfolioViewController.class);
    
    @Autowired
    private PortfolioViewService portfolioViewService;

    @Autowired
    private GraduateService graduateService;

    @Autowired
    private PortfolioService portfolioService;

    @Operation(summary = "Get view statistics", description = "Retrieves weekly, monthly, and yearly view counts for a portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "View stats retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied to view stats")
    })
    @GetMapping("/stats/{portfolioId}")
    public ResponseEntity<?> getViewStats(@PathVariable Long portfolioId, Authentication authentication) {
        try {
            logger.info("Fetching view stats for portfolioId: {}", portfolioId);
            
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Unauthorized access attempt to view stats");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated."));
            }
            
            String username = authentication.getName();
            logger.debug("Authenticated user: {}", username);
            
            Graduate graduate = graduateService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Graduate not found."));
            
            // Verify portfolio access without throwing - just log
            try {
                portfolioService.getPortfolio(portfolioId, username);
            } catch (Exception e) {
                logger.warn("Portfolio access denied for user {} on portfolio {}", username, portfolioId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied to this portfolio."));
            }
            
            // Create response map
            Map<String, Long> stats = Map.of(
                "weeklyViews", portfolioViewService.getWeeklyViews(portfolioId),
                "monthlyViews", portfolioViewService.getMonthlyViews(portfolioId),
                "yearlyViews", portfolioViewService.getYearlyViews(portfolioId)
            );
            
            logger.info("Successfully retrieved view stats for portfolio {}: {}", 
                portfolioId, stats);
                
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error fetching view stats for portfolio {}: {}", portfolioId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch view statistics: " + e.getMessage()));
        }
    }

    @Operation(summary = "Get view trends", description = "Retrieves daily/weekly/monthly view trends for a portfolio chart")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "View trends retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied to view trends")
    })
    @GetMapping("/trends/{portfolioId}")
    public ResponseEntity<?> getViewTrends(
        @PathVariable Long portfolioId, 
        @RequestParam(value = "period", defaultValue = "month") String period,
        Authentication authentication
    ) {
        try {
            logger.info("Fetching view trends for portfolioId: {}, period: {}", portfolioId, period);
            
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Unauthorized access attempt to view trends");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated."));
            }
            
            String username = authentication.getName();
            logger.debug("Authenticated user: {}", username);
            
            Graduate graduate = graduateService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Graduate not found."));
            
            // Verify portfolio access without throwing - just log
            try {
                portfolioService.getPortfolio(portfolioId, username);
            } catch (Exception e) {
                logger.warn("Portfolio access denied for user {} on portfolio {}", username, portfolioId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied to this portfolio."));
            }
            
            List<ViewTrendResponse> trends = portfolioViewService.getViewTrends(portfolioId, period);
            logger.info("Successfully retrieved {} view trends for portfolio {}", trends.size(), portfolioId);
            
            return ResponseEntity.ok(trends);
        } catch (Exception e) {
            logger.error("Error fetching view trends for portfolio {} with period {}: {}", 
                portfolioId, period, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch view trends: " + e.getMessage()));
        }
    }
}
package tarabaho.tarabaho.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.service.GraduateService;
import tarabaho.tarabaho.service.PortfolioService;
import tarabaho.tarabaho.service.PortfolioViewService;

@RestController
@RequestMapping("/api/portfolio-view")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Portfolio View Controller", description = "Handles view statistics for graduate dashboards")
public class PortfolioViewController {

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
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = authentication.getName();
            Graduate graduate = graduateService.findByUsername(username)
                .orElseThrow(() -> new Exception("Graduate not found."));
            portfolioService.getPortfolio(portfolioId, username); // Verify portfolio access
            return ResponseEntity.ok(new ViewStatsResponse(
                portfolioViewService.getWeeklyViews(portfolioId),
                portfolioViewService.getMonthlyViews(portfolioId),
                portfolioViewService.getYearlyViews(portfolioId)
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("⚠️ " + e.getMessage());
        }
    }

    static class ViewStatsResponse {
        private long weeklyViews;
        private long monthlyViews;
        private long yearlyViews;

        public ViewStatsResponse(long weeklyViews, long monthlyViews, long yearlyViews) {
            this.weeklyViews = weeklyViews;
            this.monthlyViews = monthlyViews;
            this.yearlyViews = yearlyViews;
        }

        public long getWeeklyViews() { return weeklyViews; }
        public long getMonthlyViews() { return monthlyViews; }
        public long getYearlyViews() { return yearlyViews; }
    }
}
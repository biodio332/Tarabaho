package tarabaho.tarabaho.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import tarabaho.tarabaho.dto.ViewTrendResponse;
import tarabaho.tarabaho.entity.Portfolio;
import tarabaho.tarabaho.entity.PortfolioView;
import tarabaho.tarabaho.repository.PortfolioViewRepository;

@Service
public class PortfolioViewService {

    private static final Logger logger = LoggerFactory.getLogger(PortfolioViewService.class);
    
    @Autowired
    private PortfolioViewRepository portfolioViewRepository;

    /**
     * Records a new portfolio view if not already viewed recently (last 24 hours).
     * @param portfolio The portfolio being viewed
     * @return true if a new view was recorded, false if duplicate
     */
    public boolean recordView(Portfolio portfolio, String viewId) {
        if (viewId == null || viewId.isEmpty()) {
            logger.debug("PortfolioViewService: No session ID provided; falling back to portfolio-level check.");
            return recordViewFallback(portfolio);
        }

        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(24);
        boolean hasRecent = portfolioViewRepository.hasRecentViewByViewId(portfolio.getId(), viewId, cutoffTime);
        if (hasRecent) {
            logger.debug("Duplicate view detected for session: {}", viewId);
            return false; // Duplicate for this session.
        }

        // Record the new view.
        PortfolioView view = new PortfolioView(portfolio, viewId);
        portfolioViewRepository.save(view);
        logger.debug("New view recorded for portfolio: {}", portfolio.getId());
        return true;
    }
    
    private boolean recordViewFallback(Portfolio portfolio) {
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(24);
        boolean hasRecent = portfolioViewRepository.hasRecentView(portfolio.getId(), cutoffTime);
        if (hasRecent) {
            return false;
        }
        PortfolioView view = new PortfolioView(portfolio, "anonymous");
        portfolioViewRepository.save(view);
        logger.debug("Anonymous view recorded for portfolio: {}", portfolio.getId());
        return true;
    }

    /**
     * Counts weekly views for a portfolio.
     * @param portfolioId Portfolio ID
     * @return Number of views in the last 7 days (returns 0 if none)
     */
    @Transactional(readOnly = true)
    public long getWeeklyViews(Long portfolioId) {
        try {
            long views = portfolioViewRepository.getWeeklyViews(portfolioId);
            logger.debug("Weekly views for portfolio {}: {}", portfolioId, views);
            return views; // Return 0 instead of throwing exception
        } catch (Exception e) {
            logger.error("Error fetching weekly views for portfolio {}: {}", portfolioId, e.getMessage());
            return 0;
        }
    }

    /**
     * Counts monthly views for a portfolio.
     * @param portfolioId Portfolio ID
     * @return Number of views in the last 30 days (returns 0 if none)
     */
    @Transactional(readOnly = true)
    public long getMonthlyViews(Long portfolioId) {
        try {
            long views = portfolioViewRepository.getMonthlyViews(portfolioId);
            logger.debug("Monthly views for portfolio {}: {}", portfolioId, views);
            return views; // Return 0 instead of throwing exception
        } catch (Exception e) {
            logger.error("Error fetching monthly views for portfolio {}: {}", portfolioId, e.getMessage());
            return 0;
        }
    }

    /**
     * Counts yearly views for a portfolio.
     * @param portfolioId Portfolio ID
     * @return Number of views in the last 365 days (returns 0 if none)
     */
    @Transactional(readOnly = true)
    public long getYearlyViews(Long portfolioId) {
        try {
            long views = portfolioViewRepository.getYearlyViews(portfolioId);
            logger.debug("Yearly views for portfolio {}: {}", portfolioId, views);
            return views; // Return 0 instead of throwing exception
        } catch (Exception e) {
            logger.error("Error fetching yearly views for portfolio {}: {}", portfolioId, e.getMessage());
            return 0;
        }
    }

    /**
     * Get view trends for charts - daily/weekly/monthly breakdown
     * @param portfolioId Portfolio ID
     * @param period Time period: "week", "month", or "year"
     * @return List of ViewTrendResponse with date and view count
     */
    @Transactional(readOnly = true)
    public List<ViewTrendResponse> getViewTrends(Long portfolioId, String period) {
        logger.info("🔍 Starting getViewTrends for portfolio {} with period: {}", portfolioId, period);
        
        LocalDateTime startDate = null;
        List<ViewTrendResponse> trends = new ArrayList<>();
        
        try {
            switch (period.toLowerCase()) {
                case "week":
                    logger.info("📅 Processing WEEK period");
                    startDate = LocalDateTime.now().minusDays(7);
                    trends = getDailyTrends(portfolioId, startDate);
                    break;
                case "month":
                    logger.info("📅 Processing MONTH period");
                    startDate = LocalDateTime.now().minusDays(30);
                    trends = getDailyTrends(portfolioId, startDate);
                    break;
                case "year":
                    logger.info("📅 Processing YEAR period");
                    startDate = LocalDateTime.now().minusDays(365);
                    try {
                        trends = getYearlyTrends(portfolioId, startDate);
                        logger.info("✅ Yearly trends retrieved successfully: {} items", trends.size());
                    } catch (Exception yearEx) {
                        logger.error("❌ Yearly trends failed, falling back to daily: {}", yearEx.getMessage(), yearEx);
                        // Fallback to daily trends for year period
                        trends = getDailyTrends(portfolioId, startDate);
                    }
                    break;
                default:
                    logger.warn("⚠️ Unknown period '{}', defaulting to monthly", period);
                    startDate = LocalDateTime.now().minusDays(30);
                    trends = getDailyTrends(portfolioId, startDate);
            }
            
            logger.info("✅ Successfully retrieved {} view trends for portfolio {}", trends.size(), portfolioId);
            return trends;
            
        } catch (Exception e) {
            logger.error("💥 CRITICAL ERROR in getViewTrends for portfolio {} period {}: {}", 
                portfolioId, period, e.getMessage(), e);
            e.printStackTrace(); // Print full stack trace
            return new ArrayList<>(); // Return empty list instead of throwing
        }
    }

    /**
     * Get daily view trends for a specific date range
     */
    private List<ViewTrendResponse> getDailyTrends(Long portfolioId, LocalDateTime startDate) {
        logger.info("📊 Calling getDailyTrends for portfolio {} from {}", portfolioId, startDate);
        
        try {
            logger.debug("🔍 Executing getDailyViewTrends query...");
            List<Object[]> rawData = portfolioViewRepository.getDailyViewTrends(portfolioId, startDate);
            logger.info("✅ getDailyViewTrends returned {} rows", rawData.size());
            
            List<ViewTrendResponse> trends = new ArrayList<>();
            
            for (int i = 0; i < rawData.size(); i++) {
                Object[] row = rawData.get(i);
                try {
                    String dateStr = row[0].toString();  // "YYYY-MM-DD"
                    Long views = ((Number) row[1]).longValue();
                    
                    trends.add(new ViewTrendResponse(dateStr, views));
                    logger.debug("Daily trend [{}]: date={}, views={}", i, dateStr, views);
                } catch (Exception rowEx) {
                    logger.error("Error processing row [{}] for portfolio {}: {}", i, portfolioId, rowEx.getMessage());
                }
            }
            
            logger.info("✅ getDailyTrends completed: {} trends", trends.size());
            return trends;
        } catch (Exception e) {
            logger.error("💥 ERROR in getDailyTrends for portfolio {}: {}", portfolioId, e.getMessage(), e);
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    /**
     * Get monthly view trends for yearly data
     */
    private List<ViewTrendResponse> getYearlyTrends(Long portfolioId, LocalDateTime startDate) {
        logger.info("📊 Calling getYearlyTrends for portfolio {} from {}", portfolioId, startDate);
        
        try {
            logger.debug("🔍 Executing getMonthlyViewTrends query...");
            List<Object[]> rawData = portfolioViewRepository.getMonthlyViewTrends(portfolioId, startDate);
            logger.info("✅ getMonthlyViewTrends returned {} rows", rawData.size());
            
            List<ViewTrendResponse> trends = new ArrayList<>();
            
            for (int i = 0; i < rawData.size(); i++) {
                Object[] row = rawData.get(i);
                try {
                    // New format: year, month, views
                    Integer year = ((Number) row[0]).intValue();
                    Integer month = ((Number) row[1]).intValue();
                    Long views = ((Number) row[2]).longValue();
                    
                    // Format as YYYY-MM
                    String monthStr = String.format("%d-%02d", year, month);
                    
                    trends.add(new ViewTrendResponse(monthStr, views));
                    logger.debug("Monthly trend [{}]: {}={}, views={}", i, monthStr, views);
                } catch (Exception rowEx) {
                    logger.error("Error processing monthly row [{}] for portfolio {}: {}", i, portfolioId, rowEx.getMessage());
                }
            }
            
            logger.info("✅ getYearlyTrends completed: {} trends", trends.size());
            return trends;
        } catch (Exception e) {
            logger.error("💥 ERROR in getYearlyTrends for portfolio {}: {}", portfolioId, e.getMessage(), e);
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

   /**
 * Retrieves the total number of views for each professional title.
 * @return Map with professional titles as keys and their total view counts as values
 */
@Transactional(readOnly = true)
public Map<String, Long> getTotalViewsByProfessionalTitle() {
    try {
        List<Object[]> results = portfolioViewRepository.findTotalViewsByProfessionalTitle();
        return results.stream()
            .filter(result -> result[0] != null) // Filter out null professionalTitles
            .collect(Collectors.toMap(
                result -> (String) result[0],
                result -> (Long) result[1],
                (existing, replacement) -> existing,
                LinkedHashMap::new
            ));
    } catch (Exception e) {
        logger.error("Error fetching total views by professional title: {}", e.getMessage());
        return new LinkedHashMap<>();
    }
}
}
package tarabaho.tarabaho.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import tarabaho.tarabaho.entity.Portfolio;
import tarabaho.tarabaho.entity.PortfolioView;
import tarabaho.tarabaho.repository.PortfolioViewRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class PortfolioViewService {

    @Autowired
    private PortfolioViewRepository portfolioViewRepository;

    /**
     * Records a new portfolio view if not already viewed recently (last 24 hours).
     * @param portfolio The portfolio being viewed
     * @return true if a new view was recorded, false if duplicate
     */
    public boolean recordView(Portfolio portfolio, String viewId) {
        if (viewId == null || viewId.isEmpty()) {
            // Fallback: If no session ID, treat as anonymous and use non-session check (or throw error if strict).
            // For now, we'll allow it but log for debugging.
            System.out.println("PortfolioViewService: No session ID provided; falling back to portfolio-level check.");
            return recordViewFallback(portfolio);
        }

        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(24);
        boolean hasRecent = portfolioViewRepository.hasRecentViewByViewId(portfolio.getId(), viewId, cutoffTime);
        if (hasRecent) {
            return false; // Duplicate for this session.
        }

        // Record the new view.
        PortfolioView view = new PortfolioView(portfolio, viewId);
        portfolioViewRepository.save(view);
        return true;
    }
    private boolean recordViewFallback(Portfolio portfolio) {
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(24);
        boolean hasRecent = portfolioViewRepository.hasRecentView(portfolio.getId(), cutoffTime);
        if (hasRecent) {
            return false;
        }
        PortfolioView view = new PortfolioView(portfolio, "anonymous"); // Or null if preferred.
        portfolioViewRepository.save(view);
        return true;
    }

    /**
     * Counts weekly views for a portfolio.
     * @param portfolioId Portfolio ID
     * @return Number of views in the last 7 days
     * @throws IllegalArgumentException if no views recorded
     */
    @Transactional(readOnly = true)
    public long getWeeklyViews(Long portfolioId) {
        long views = portfolioViewRepository.getWeeklyViews(portfolioId);
        if (views == 0) {
            throw new IllegalArgumentException("No views recorded for portfolio id: " + portfolioId + " in the last 7 days.");
        }
        return views;
    }

    /**
     * Counts monthly views for a portfolio.
     * @param portfolioId Portfolio ID
     * @return Number of views in the last 30 days
     * @throws IllegalArgumentException if no views recorded
     */
    @Transactional(readOnly = true)
    public long getMonthlyViews(Long portfolioId) {
        long views = portfolioViewRepository.getMonthlyViews(portfolioId);
        if (views == 0) {
            throw new IllegalArgumentException("No views recorded for portfolio id: " + portfolioId + " in the last 30 days.");
        }
        return views;
    }

    /**
     * Counts yearly views for a portfolio.
     * @param portfolioId Portfolio ID
     * @return Number of views in the last 365 days
     * @throws IllegalArgumentException if no views recorded
     */
    @Transactional(readOnly = true)
    public long getYearlyViews(Long portfolioId) {
        long views = portfolioViewRepository.getYearlyViews(portfolioId);
        if (views == 0) {
            throw new IllegalArgumentException("No views recorded for portfolio id: " + portfolioId + " in the last 365 days.");
        }
        return views;
    }
}
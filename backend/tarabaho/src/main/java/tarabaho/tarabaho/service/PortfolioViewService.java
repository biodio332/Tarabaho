package tarabaho.tarabaho.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import tarabaho.tarabaho.entity.Portfolio;
import tarabaho.tarabaho.entity.PortfolioView;
import tarabaho.tarabaho.repository.PortfolioViewRepository;

@Service
public class PortfolioViewService {

    @Autowired
    private PortfolioViewRepository portfolioViewRepository;

    /**
     * Records a new portfolio view if not already viewed recently (last 24 hours).
     * @param portfolio The portfolio being viewed
     * @return true if a new view was recorded, false if duplicate
     */
    @Transactional
    public boolean recordView(Portfolio portfolio) {
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(24);
        
        // Check if already viewed in last 24 hours
        boolean hasRecentView = portfolioViewRepository.hasRecentView(portfolio.getId(), cutoffTime);
        if (hasRecentView) {
            System.out.println("PortfolioViewService: Duplicate view ignored for portfolio ID: " + portfolio.getId());
            return false; // Don't record duplicate
        }
        
        // Create new view
        PortfolioView newView = new PortfolioView();
        newView.setPortfolio(portfolio);
        // viewTimestamp is set automatically via @PrePersist
        
        portfolioViewRepository.save(newView);
        System.out.println("PortfolioViewService: New view recorded for portfolio ID: " + portfolio.getId() + 
                          " at " + LocalDateTime.now());
        
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
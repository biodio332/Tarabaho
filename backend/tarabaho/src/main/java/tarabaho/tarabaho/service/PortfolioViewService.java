package tarabaho.tarabaho.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import tarabaho.tarabaho.repository.PortfolioViewRepository;

@Service
public class PortfolioViewService {

    @Autowired
    private PortfolioViewRepository portfolioViewRepository;

    /**
     * Counts weekly views for a portfolio.
     * @param portfolioId Portfolio ID
     * @return Number of views in the last 7 days
     * @throws IllegalArgumentException if portfolio not found or no views recorded
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
     * @throws IllegalArgumentException if portfolio not found or no views recorded
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
     * @throws IllegalArgumentException if portfolio not found or no views recorded
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
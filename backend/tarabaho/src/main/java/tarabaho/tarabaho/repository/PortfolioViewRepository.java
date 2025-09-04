package tarabaho.tarabaho.repository;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import tarabaho.tarabaho.entity.PortfolioView;

@Repository
public interface PortfolioViewRepository extends JpaRepository<PortfolioView, Long> {

    @Query("SELECT COUNT(v) FROM PortfolioView v WHERE v.portfolio.id = :portfolioId AND v.viewTimestamp >= :startDate")
    long countViewsByPortfolioIdAndDate(Long portfolioId, LocalDateTime startDate);

    default long getWeeklyViews(Long portfolioId) {
        return countViewsByPortfolioIdAndDate(portfolioId, LocalDateTime.now().minusDays(7));
    }

    default long getMonthlyViews(Long portfolioId) {
        return countViewsByPortfolioIdAndDate(portfolioId, LocalDateTime.now().minusMonths(1));
    }

    default long getYearlyViews(Long portfolioId) {
        return countViewsByPortfolioIdAndDate(portfolioId, LocalDateTime.now().minusYears(1));
    }
}
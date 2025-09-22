package tarabaho.tarabaho.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tarabaho.tarabaho.entity.PortfolioView;

@Repository
public interface PortfolioViewRepository extends JpaRepository<PortfolioView, Long> {
    
    // ← NEW: Check for recent views (last 24 hours)
    @Query("SELECT COUNT(v) > 0 FROM PortfolioView v WHERE v.portfolio.id = :portfolioId AND v.viewDate > :cutoffTime")
    boolean hasRecentView(@Param("portfolioId") Long portfolioId, @Param("cutoffTime") LocalDateTime cutoffTime);
    
    @Query("SELECT COUNT(v) > 0 FROM PortfolioView v " +
           "WHERE v.portfolio.id = :portfolioId " +
           "AND v.sessionId = :viewId " +  
           "AND v.viewDate > :cutoffTime")
    boolean hasRecentViewByViewId(@Param("portfolioId") Long portfolioId, 
                                  @Param("viewId") String viewId, 
                                  @Param("cutoffTime") LocalDateTime cutoffTime);

    // ← YOUR EXISTING QUERY METHODS (keep them)
    @Query("SELECT COUNT(v) FROM PortfolioView v WHERE v.portfolio.id = :portfolioId AND v.viewDate >= :startDate")
    long getWeeklyViews(@Param("portfolioId") Long portfolioId, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT COUNT(v) FROM PortfolioView v WHERE v.portfolio.id = :portfolioId AND v.viewDate >= :startDate")
    long getMonthlyViews(@Param("portfolioId") Long portfolioId, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT COUNT(v) FROM PortfolioView v WHERE v.portfolio.id = :portfolioId AND v.viewDate >= :startDate")
    long getYearlyViews(@Param("portfolioId") Long portfolioId, @Param("startDate") LocalDateTime startDate);
    
    // ← SIMPLIFIED: Daily view trends using native query
    @Query(value = """
        SELECT DATE(view_date) as date, COUNT(*) as views 
        FROM portfolio_views 
        WHERE portfolio_id = :portfolioId 
        AND view_date >= :startDate 
        GROUP BY DATE(view_date) 
        ORDER BY DATE(view_date)
        """, nativeQuery = true)
    List<Object[]> getDailyViewTrends(@Param("portfolioId") Long portfolioId, @Param("startDate") LocalDateTime startDate);
    
    // ← SIMPLIFIED: Monthly view trends for yearly data using native query
        @Query(value = """
        SELECT 
            EXTRACT(YEAR FROM view_date) as year,
            EXTRACT(MONTH FROM view_date) as month,
            COUNT(*) as views 
        FROM portfolio_views 
        WHERE portfolio_id = :portfolioId 
        AND view_date >= :startDate 
        GROUP BY EXTRACT(YEAR FROM view_date), EXTRACT(MONTH FROM view_date) 
        ORDER BY EXTRACT(YEAR FROM view_date), EXTRACT(MONTH FROM view_date)
        """, nativeQuery = true)
    List<Object[]> getMonthlyViewTrends(@Param("portfolioId") Long portfolioId, @Param("startDate") LocalDateTime startDate);
    
    // ← HELPER: Get weekly views (last 7 days)
    default long getWeeklyViews(Long portfolioId) {
        return getWeeklyViews(portfolioId, LocalDateTime.now().minusDays(7));
    }
    
    // ← HELPER: Get monthly views (last 30 days)
    default long getMonthlyViews(Long portfolioId) {
        return getMonthlyViews(portfolioId, LocalDateTime.now().minusDays(30));
    }
    
    // ← HELPER: Get yearly views (last 365 days)
    default long getYearlyViews(Long portfolioId) {
        return getYearlyViews(portfolioId, LocalDateTime.now().minusDays(365));
    }
}
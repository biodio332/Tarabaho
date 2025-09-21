package tarabaho.tarabaho.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tarabaho.tarabaho.entity.Portfolio;
import tarabaho.tarabaho.entity.Visibility;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {

    Optional<Portfolio> findByIdAndVisibility(Long id, Visibility visibility);

    @Query("SELECT p, COUNT(v) FROM Portfolio p LEFT JOIN p.portfolioViews v GROUP BY p ORDER BY COUNT(v) DESC")
    List<Object[]> findTopPortfoliosByViews();

    @Query("SELECT p FROM Portfolio p WHERE p.graduate.id = :graduateId")
    Optional<Portfolio> findByGraduateId(@Param("graduateId") Long graduateId);
    
   @Query("SELECT p FROM Portfolio p WHERE p.graduate.id = :graduateId AND p.shareToken = :shareToken")
    Optional<Portfolio> findByGraduateIdAndShareToken(@Param("graduateId") Long graduateId, @Param("shareToken") String shareToken);

    @Query("SELECT COUNT(v) > 0 FROM PortfolioView v WHERE v.portfolio.id = :portfolioId AND v.viewDate > :cutoffTime")
    boolean hasRecentView(@Param("portfolioId") Long portfolioId, @Param("cutoffTime") LocalDateTime cutoffTime);
}
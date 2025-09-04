package tarabaho.tarabaho.repository;

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
}
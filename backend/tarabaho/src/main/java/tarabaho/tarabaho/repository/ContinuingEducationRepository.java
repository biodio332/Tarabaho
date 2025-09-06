package tarabaho.tarabaho.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import tarabaho.tarabaho.entity.ContinuingEducation;

public interface ContinuingEducationRepository extends JpaRepository<ContinuingEducation, Long> {
    List<ContinuingEducation> findByPortfolioId(Long portfolioId);

    @Modifying
    @Query("DELETE FROM ContinuingEducation e WHERE e.portfolio.id = :portfolioId")
    void deleteByPortfolioId(Long portfolioId
    );
}
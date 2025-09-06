package tarabaho.tarabaho.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import tarabaho.tarabaho.entity.AwardRecognition;

public interface AwardRecognitionRepository extends JpaRepository<AwardRecognition, Long> {
    List<AwardRecognition> findByPortfolioId(Long portfolioId);

    @Modifying
    @Query("DELETE FROM AwardRecognition a WHERE a.portfolio.id = :portfolioId")
    void deleteByPortfolioId(Long portfolioId);
}
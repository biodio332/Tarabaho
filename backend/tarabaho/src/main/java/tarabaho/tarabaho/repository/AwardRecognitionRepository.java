package tarabaho.tarabaho.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tarabaho.tarabaho.entity.AwardRecognition;
import java.util.List;

public interface AwardRecognitionRepository extends JpaRepository<AwardRecognition, Long> {
    List<AwardRecognition> findByPortfolioId(Long portfolioId);
}
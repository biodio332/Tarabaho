package tarabaho.tarabaho.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tarabaho.tarabaho.entity.ContinuingEducation;
import java.util.List;

public interface ContinuingEducationRepository extends JpaRepository<ContinuingEducation, Long> {
    List<ContinuingEducation> findByPortfolioId(Long portfolioId);
}
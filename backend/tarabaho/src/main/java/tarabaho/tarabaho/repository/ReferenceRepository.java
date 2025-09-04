package tarabaho.tarabaho.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tarabaho.tarabaho.entity.Reference;
import java.util.List;

public interface ReferenceRepository extends JpaRepository<Reference, Long> {
    List<Reference> findByPortfolioId(Long portfolioId);
}
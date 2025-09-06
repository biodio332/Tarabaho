package tarabaho.tarabaho.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import tarabaho.tarabaho.entity.Reference;

public interface ReferenceRepository extends JpaRepository<Reference, Long> {
    List<Reference> findByPortfolioId(Long portfolioId);

    @Modifying
    @Query("DELETE FROM Reference r WHERE r.portfolio.id = :portfolioId")
    void deleteByPortfolioId(Long portfolioId);
}
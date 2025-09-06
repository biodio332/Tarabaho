package tarabaho.tarabaho.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import tarabaho.tarabaho.entity.Experience;

@Repository
public interface ExperienceRepository extends JpaRepository<Experience, Long> {

    List<Experience> findByPortfolioId(Long portfolioId);

    @Modifying
    @Query("DELETE FROM Experience e WHERE e.portfolio.id = :portfolioId")
    void deleteByPortfolioId(Long portfolioId);
}
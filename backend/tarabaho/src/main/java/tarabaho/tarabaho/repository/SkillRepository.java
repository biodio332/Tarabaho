package tarabaho.tarabaho.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import tarabaho.tarabaho.entity.Skill;
import java.util.List;

public interface SkillRepository extends JpaRepository<Skill, Long> {
    List<Skill> findByPortfolioId(Long portfolioId);

    @Modifying
    @Query("DELETE FROM Skill s WHERE s.portfolio.id = :portfolioId")
    void deleteByPortfolioId(Long portfolioId);
}
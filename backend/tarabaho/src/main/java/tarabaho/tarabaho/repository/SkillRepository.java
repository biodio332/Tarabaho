package tarabaho.tarabaho.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tarabaho.tarabaho.entity.Skill;
import java.util.List;

public interface SkillRepository extends JpaRepository<Skill, Long> {
    List<Skill> findByPortfolioId(Long portfolioId);
}
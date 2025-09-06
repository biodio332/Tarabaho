package tarabaho.tarabaho.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import tarabaho.tarabaho.entity.ProfessionalMembership;
import java.util.List;

public interface ProfessionalMembershipRepository extends JpaRepository<ProfessionalMembership, Long> {
    List<ProfessionalMembership> findByPortfolioId(Long portfolioId);

    @Modifying
    @Query("DELETE FROM ProfessionalMembership m WHERE m.portfolio.id = :portfolioId")
    void deleteByPortfolioId(Long portfolioId);
}
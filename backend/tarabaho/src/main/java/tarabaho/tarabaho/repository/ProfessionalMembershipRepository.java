package tarabaho.tarabaho.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tarabaho.tarabaho.entity.ProfessionalMembership;
import java.util.List;

public interface ProfessionalMembershipRepository extends JpaRepository<ProfessionalMembership, Long> {
    List<ProfessionalMembership> findByPortfolioId(Long portfolioId);
}
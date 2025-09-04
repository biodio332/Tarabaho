package tarabaho.tarabaho.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.entity.Portfolio;
import tarabaho.tarabaho.entity.ProfessionalMembership;
import tarabaho.tarabaho.entity.Visibility;
import tarabaho.tarabaho.repository.GraduateRepository;
import tarabaho.tarabaho.repository.PortfolioRepository;
import tarabaho.tarabaho.repository.ProfessionalMembershipRepository;
import java.util.List;

@Service
public class ProfessionalMembershipService {

    @Autowired
    private ProfessionalMembershipRepository professionalMembershipRepository;

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private GraduateRepository graduateRepository;

    @Transactional
    public ProfessionalMembership saveProfessionalMembership(Long portfolioId, ProfessionalMembership membership, String username) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
            .orElseThrow(() -> new IllegalArgumentException("Portfolio not found with id: " + portfolioId));
        Graduate graduate = graduateRepository.findByUsername(username);
        if (graduate == null || !portfolio.getGraduate().getId().equals(graduate.getId())) {
            throw new IllegalArgumentException("Access denied: User does not own this portfolio.");
        }
        membership.setPortfolio(portfolio);
        return professionalMembershipRepository.save(membership);
    }

    public List<ProfessionalMembership> getProfessionalMembershipsByPortfolioId(Long portfolioId, String username) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
            .orElseThrow(() -> new IllegalArgumentException("Portfolio not found with id: " + portfolioId));
        Graduate graduate = graduateRepository.findByUsername(username);
        if (portfolio.getVisibility() == Visibility.PRIVATE && (graduate == null || !portfolio.getGraduate().getId().equals(graduate.getId()))) {
            throw new IllegalArgumentException("Access denied to private portfolio.");
        }
        return professionalMembershipRepository.findByPortfolioId(portfolioId);
    }

    @Transactional
    public ProfessionalMembership updateProfessionalMembership(Long membershipId, ProfessionalMembership updatedMembership, String username) {
        ProfessionalMembership existingMembership = professionalMembershipRepository.findById(membershipId)
            .orElseThrow(() -> new IllegalArgumentException("Professional membership not found with id: " + membershipId));
        Portfolio portfolio = existingMembership.getPortfolio();
        Graduate graduate = graduateRepository.findByUsername(username);
        if (graduate == null || !portfolio.getGraduate().getId().equals(graduate.getId())) {
            throw new IllegalArgumentException("Access denied: User does not own this portfolio.");
        }
        existingMembership.setOrganization(updatedMembership.getOrganization());
        existingMembership.setMembershipType(updatedMembership.getMembershipType());
        return professionalMembershipRepository.save(existingMembership);
    }

    @Transactional
    public void deleteProfessionalMembership(Long membershipId, String username) {
        ProfessionalMembership membership = professionalMembershipRepository.findById(membershipId)
            .orElseThrow(() -> new IllegalArgumentException("Professional membership not found with id: " + membershipId));
        Portfolio portfolio = membership.getPortfolio();
        Graduate graduate = graduateRepository.findByUsername(username);
        if (graduate == null || !portfolio.getGraduate().getId().equals(graduate.getId())) {
            throw new IllegalArgumentException("Access denied: User does not own this portfolio.");
        }
        professionalMembershipRepository.delete(membership);
    }
}
package tarabaho.tarabaho.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.entity.Portfolio;
import tarabaho.tarabaho.entity.Reference;
import tarabaho.tarabaho.entity.Visibility;
import tarabaho.tarabaho.repository.GraduateRepository;
import tarabaho.tarabaho.repository.PortfolioRepository;
import tarabaho.tarabaho.repository.ReferenceRepository;
import java.util.List;
import java.util.Optional;

@Service
public class ReferenceService {

    @Autowired
    private ReferenceRepository referenceRepository;

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private GraduateRepository graduateRepository;

    @Transactional
    public Reference saveReference(Long portfolioId, Reference reference, String username) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
            .orElseThrow(() -> new IllegalArgumentException("Portfolio not found with id: " + portfolioId));
        Graduate graduate = graduateRepository.findByUsername(username);
        if (graduate == null || !portfolio.getGraduate().getId().equals(graduate.getId())) {
            throw new IllegalArgumentException("Access denied: User does not own this portfolio.");
        }
        reference.setPortfolio(portfolio);
        return referenceRepository.save(reference);
    }

    public List<Reference> getReferencesByPortfolioId(Long portfolioId, String username) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
            .orElseThrow(() -> new IllegalArgumentException("Portfolio not found with id: " + portfolioId));
        Graduate graduate = graduateRepository.findByUsername(username);
        if (portfolio.getVisibility() == Visibility.PRIVATE && (graduate == null || !portfolio.getGraduate().getId().equals(graduate.getId()))) {
            throw new IllegalArgumentException("Access denied to private portfolio.");
        }
        return referenceRepository.findByPortfolioId(portfolioId);
    }

    @Transactional
    public Reference updateReference(Long referenceId, Reference updatedReference, String username) {
        Optional<Reference> optionalReference = referenceRepository.findById(referenceId);
        if (!optionalReference.isPresent()) {
            throw new IllegalArgumentException("Reference not found with id: " + referenceId);
        }
        Reference existingReference = optionalReference.get();
        Portfolio portfolio = existingReference.getPortfolio();
        Graduate graduate = graduateRepository.findByUsername(username);
        if (graduate == null || !portfolio.getGraduate().getId().equals(graduate.getId())) {
            throw new IllegalArgumentException("Access denied: User does not own this portfolio.");
        }
        existingReference.setName(updatedReference.getName());
        existingReference.setRelationship(updatedReference.getRelationship());
        existingReference.setEmail(updatedReference.getEmail());
        existingReference.setPhone(updatedReference.getPhone());
        return referenceRepository.save(existingReference);
    }

    @Transactional
    public void deleteReference(Long referenceId, String username) {
        Optional<Reference> optionalReference = referenceRepository.findById(referenceId);
        if (!optionalReference.isPresent()) {
            throw new IllegalArgumentException("Reference not found with id: " + referenceId);
        }
        Reference reference = optionalReference.get();
        Portfolio portfolio = reference.getPortfolio();
        Graduate graduate = graduateRepository.findByUsername(username);
        if (graduate == null || !portfolio.getGraduate().getId().equals(graduate.getId())) {
            throw new IllegalArgumentException("Access denied: User does not own this portfolio.");
        }
        referenceRepository.delete(reference);
    }
    @Transactional
    public List<Reference> replaceReferences(Long portfolioId, List<Reference> references, String username) {
        System.out.println("ReferenceService: Replacing references for portfolio ID: " + portfolioId);
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
            .orElseThrow(() -> new IllegalArgumentException("Portfolio not found with id: " + portfolioId));
        Graduate graduate = graduateRepository.findByUsername(username);
        if (graduate == null || !portfolio.getGraduate().getId().equals(graduate.getId())) {
            System.out.println("ReferenceService: Access denied: User does not own this portfolio");
            throw new IllegalArgumentException("Access denied: User does not own this portfolio.");
        }
        // Delete existing references
        referenceRepository.deleteByPortfolioId(portfolioId);
        // Save new references
        references.forEach(reference -> reference.setPortfolio(portfolio));
        return referenceRepository.saveAll(references);
    }
}
package tarabaho.tarabaho.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tarabaho.tarabaho.entity.ContinuingEducation;
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.entity.Portfolio;
import tarabaho.tarabaho.entity.Visibility;
import tarabaho.tarabaho.repository.ContinuingEducationRepository;
import tarabaho.tarabaho.repository.GraduateRepository;
import tarabaho.tarabaho.repository.PortfolioRepository;
import java.util.List;

@Service
public class ContinuingEducationService {

    @Autowired
    private ContinuingEducationRepository continuingEducationRepository;

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private GraduateRepository graduateRepository;

    @Transactional
    public ContinuingEducation saveContinuingEducation(Long portfolioId, ContinuingEducation education, String username) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
            .orElseThrow(() -> new IllegalArgumentException("Portfolio not found with id: " + portfolioId));
        Graduate graduate = graduateRepository.findByUsername(username);
        if (graduate == null || !portfolio.getGraduate().getId().equals(graduate.getId())) {
            throw new IllegalArgumentException("Access denied: User does not own this portfolio.");
        }
        education.setPortfolio(portfolio);
        return continuingEducationRepository.save(education);
    }

    public List<ContinuingEducation> getContinuingEducationsByPortfolioId(Long portfolioId, String username) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
            .orElseThrow(() -> new IllegalArgumentException("Portfolio not found with id: " + portfolioId));
        Graduate graduate = graduateRepository.findByUsername(username);
        if (portfolio.getVisibility() == Visibility.PRIVATE && (graduate == null || !portfolio.getGraduate().getId().equals(graduate.getId()))) {
            throw new IllegalArgumentException("Access denied to private portfolio.");
        }
        return continuingEducationRepository.findByPortfolioId(portfolioId);
    }

    @Transactional
    public ContinuingEducation updateContinuingEducation(Long educationId, ContinuingEducation updatedEducation, String username) {
        ContinuingEducation existingEducation = continuingEducationRepository.findById(educationId)
            .orElseThrow(() -> new IllegalArgumentException("Continuing education not found with id: " + educationId));
        Portfolio portfolio = existingEducation.getPortfolio();
        Graduate graduate = graduateRepository.findByUsername(username);
        if (graduate == null || !portfolio.getGraduate().getId().equals(graduate.getId())) {
            throw new IllegalArgumentException("Access denied: User does not own this portfolio.");
        }
        existingEducation.setCourseName(updatedEducation.getCourseName());
        existingEducation.setInstitution(updatedEducation.getInstitution());
        existingEducation.setCompletionDate(updatedEducation.getCompletionDate());
        return continuingEducationRepository.save(existingEducation);
    }

    @Transactional
    public void deleteContinuingEducation(Long educationId, String username) {
        ContinuingEducation education = continuingEducationRepository.findById(educationId)
            .orElseThrow(() -> new IllegalArgumentException("Continuing education not found with id: " + educationId));
        Portfolio portfolio = education.getPortfolio();
        Graduate graduate = graduateRepository.findByUsername(username);
        if (graduate == null || !portfolio.getGraduate().getId().equals(graduate.getId())) {
            throw new IllegalArgumentException("Access denied: User does not own this portfolio.");
        }
        continuingEducationRepository.delete(education);
    }
}
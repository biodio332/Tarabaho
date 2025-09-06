package tarabaho.tarabaho.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tarabaho.tarabaho.entity.AwardRecognition;
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.entity.Portfolio;
import tarabaho.tarabaho.entity.Visibility;
import tarabaho.tarabaho.repository.AwardRecognitionRepository;
import tarabaho.tarabaho.repository.GraduateRepository;
import tarabaho.tarabaho.repository.PortfolioRepository;
import java.util.List;

@Service
public class AwardRecognitionService {

    @Autowired
    private AwardRecognitionRepository awardRecognitionRepository;

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private GraduateRepository graduateRepository;

    @Transactional
    public AwardRecognition saveAwardRecognition(Long portfolioId, AwardRecognition award, String username) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
            .orElseThrow(() -> new IllegalArgumentException("Portfolio not found with id: " + portfolioId));
        Graduate graduate = graduateRepository.findByUsername(username);
        if (graduate == null || !portfolio.getGraduate().getId().equals(graduate.getId())) {
            throw new IllegalArgumentException("Access denied: User does not own this portfolio.");
        }
        award.setPortfolio(portfolio);
        return awardRecognitionRepository.save(award);
    }

    public List<AwardRecognition> getAwardRecognitionsByPortfolioId(Long portfolioId, String username) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
            .orElseThrow(() -> new IllegalArgumentException("Portfolio not found with id: " + portfolioId));
        Graduate graduate = graduateRepository.findByUsername(username);
        if (portfolio.getVisibility() == Visibility.PRIVATE && (graduate == null || !portfolio.getGraduate().getId().equals(graduate.getId()))) {
            throw new IllegalArgumentException("Access denied to private portfolio.");
        }
        return awardRecognitionRepository.findByPortfolioId(portfolioId);
    }

    @Transactional
    public AwardRecognition updateAwardRecognition(Long awardId, AwardRecognition updatedAward, String username) {
        AwardRecognition existingAward = awardRecognitionRepository.findById(awardId)
            .orElseThrow(() -> new IllegalArgumentException("Award not found with id: " + awardId));
        Portfolio portfolio = existingAward.getPortfolio();
        Graduate graduate = graduateRepository.findByUsername(username);
        if (graduate == null || !portfolio.getGraduate().getId().equals(graduate.getId())) {
            throw new IllegalArgumentException("Access denied: User does not own this portfolio.");
        }
        existingAward.setTitle(updatedAward.getTitle());
        existingAward.setIssuer(updatedAward.getIssuer());
        existingAward.setDateReceived(updatedAward.getDateReceived());
        return awardRecognitionRepository.save(existingAward);
    }

    @Transactional
    public void deleteAwardRecognition(Long awardId, String username) {
        AwardRecognition award = awardRecognitionRepository.findById(awardId)
            .orElseThrow(() -> new IllegalArgumentException("Award not found with id: " + awardId));
        Portfolio portfolio = award.getPortfolio();
        Graduate graduate = graduateRepository.findByUsername(username);
        if (graduate == null || !portfolio.getGraduate().getId().equals(graduate.getId())) {
            throw new IllegalArgumentException("Access denied: User does not own this portfolio.");
        }
        awardRecognitionRepository.delete(award);
    }
    @Transactional
    public List<AwardRecognition> replaceAwardRecognitions(Long portfolioId, List<AwardRecognition> awards, String username) {
        System.out.println("AwardRecognitionService: Replacing awards for portfolio ID: " + portfolioId);
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
            .orElseThrow(() -> new IllegalArgumentException("Portfolio not found with id: " + portfolioId));
        Graduate graduate = graduateRepository.findByUsername(username);
        if (graduate == null || !portfolio.getGraduate().getId().equals(graduate.getId())) {
            System.out.println("AwardRecognitionService: Access denied: User does not own this portfolio");
            throw new IllegalArgumentException("Access denied: User does not own this portfolio.");
        }
        // Delete existing awards
        awardRecognitionRepository.deleteByPortfolioId(portfolioId);
        // Save new awards
        awards.forEach(award -> award.setPortfolio(portfolio));
        return awardRecognitionRepository.saveAll(awards);
    }
}
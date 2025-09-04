package tarabaho.tarabaho.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import tarabaho.tarabaho.entity.Experience;
import tarabaho.tarabaho.repository.ExperienceRepository;

@Service
public class ExperienceService {

    @Autowired
    private ExperienceRepository experienceRepository;

    /**
     * Retrieves all experiences for a portfolio.
     * @param portfolioId Portfolio ID
     * @return List of experiences
     * @throws IllegalArgumentException if no experiences found
     */
    public List<Experience> getExperiencesByPortfolioId(Long portfolioId) {
        List<Experience> experiences = experienceRepository.findByPortfolioId(portfolioId);
        if (experiences.isEmpty()) {
            throw new IllegalArgumentException("No experiences found for portfolio id: " + portfolioId);
        }
        return experiences;
    }

    /**
     * Saves a new or updates an existing experience.
     * @param experience Experience entity
     * @return Saved Experience
     * @throws IllegalArgumentException if portfolio not found or invalid data
     */
    @Transactional
    public Experience saveExperience(Experience experience) {
        if (experience.getPortfolio() == null || experience.getPortfolio().getId() == null) {
            throw new IllegalArgumentException("Portfolio must be associated with the experience.");
        }
        if (experienceRepository.findByPortfolioId(experience.getPortfolio().getId()).isEmpty()) {
            throw new IllegalArgumentException("Portfolio not found for experience association.");
        }
        if (experience.getId() != null && !experienceRepository.existsById(experience.getId())) {
            throw new IllegalArgumentException("Experience not found for update.");
        }
        // Validate required fields (jobTitle, startDate)
        if (experience.getJobTitle() == null || experience.getJobTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Experience job title is required.");
        }
        if (experience.getStartDate() == null) {
            throw new IllegalArgumentException("Experience start date is required.");
        }
        // Optional: Validate endDate if provided (must be after startDate)
        if (experience.getEndDate() != null && experience.getEndDate().isBefore(experience.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date.");
        }
        // Optional: Validate employer and description lengths
        if (experience.getEmployer() != null && experience.getEmployer().length() > 200) {
            throw new IllegalArgumentException("Employer must not exceed 200 characters.");
        }
        if (experience.getDescription() != null && experience.getDescription().length() > 1000) {
            throw new IllegalArgumentException("Description must not exceed 1000 characters.");
        }
        return experienceRepository.save(experience);
    }

    /**
     * Retrieves an experience by ID.
     * @param id Experience ID
     * @return Experience entity
     * @throws IllegalArgumentException if experience not found
     */
    public Experience getExperienceById(Long id) {
        return experienceRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Experience not found with id: " + id));
    }

    /**
     * Deletes an experience, enforcing existence.
     * @param id Experience ID
     * @throws IllegalArgumentException if experience not found
     */
    @Transactional
    public void deleteExperience(Long id) {
        if (!experienceRepository.existsById(id)) {
            throw new IllegalArgumentException("Experience not found with id: " + id);
        }
        experienceRepository.deleteById(id);
    }
}
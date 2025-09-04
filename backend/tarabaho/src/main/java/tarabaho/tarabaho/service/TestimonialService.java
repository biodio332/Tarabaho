package tarabaho.tarabaho.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import tarabaho.tarabaho.entity.Testimonial;
import tarabaho.tarabaho.repository.TestimonialRepository;

@Service
public class TestimonialService {

    @Autowired
    private TestimonialRepository testimonialRepository;

    /**
     * Retrieves all testimonials for a portfolio.
     * @param portfolioId Portfolio ID
     * @return List of testimonials
     * @throws IllegalArgumentException if no testimonials found
     */
    public List<Testimonial> getTestimonialsByPortfolioId(Long portfolioId) {
        List<Testimonial> testimonials = testimonialRepository.findByPortfolioId(portfolioId);
        if (testimonials.isEmpty()) {
            throw new IllegalArgumentException("No testimonials found for portfolio id: " + portfolioId);
        }
        return testimonials;
    }

    /**
     * Saves a new or updates an existing testimonial.
     * @param testimonial Testimonial entity
     * @return Saved Testimonial
     * @throws IllegalArgumentException if portfolio not found or invalid data
     */
    @Transactional
    public Testimonial saveTestimonial(Testimonial testimonial) {
        if (testimonial.getPortfolio() == null || testimonial.getPortfolio().getId() == null) {
            throw new IllegalArgumentException("Portfolio must be associated with the testimonial.");
        }
        if (testimonialRepository.findByPortfolioId(testimonial.getPortfolio().getId()).isEmpty()) {
            throw new IllegalArgumentException("Portfolio not found for testimonial association.");
        }
        if (testimonial.getId() != null && !testimonialRepository.existsById(testimonial.getId())) {
            throw new IllegalArgumentException("Testimonial not found for update.");
        }
        // Validate required fields (quote, author)
        if (testimonial.getQuote() == null || testimonial.getQuote().trim().isEmpty()) {
            throw new IllegalArgumentException("Testimonial quote is required.");
        }
        if (testimonial.getAuthor() == null || testimonial.getAuthor().trim().isEmpty()) {
            throw new IllegalArgumentException("Testimonial author is required.");
        }
        // Optional: Validate contactInfo length if provided
        if (testimonial.getContactInfo() != null && testimonial.getContactInfo().length() > 200) {
            throw new IllegalArgumentException("Contact info must not exceed 200 characters.");
        }
        return testimonialRepository.save(testimonial);
    }

    /**
     * Retrieves a testimonial by ID.
     * @param id Testimonial ID
     * @return Testimonial entity
     * @throws IllegalArgumentException if testimonial not found
     */
    public Testimonial getTestimonialById(Long id) {
        return testimonialRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Testimonial not found with id: " + id));
    }

    /**
     * Deletes a testimonial, enforcing existence.
     * @param id Testimonial ID
     * @throws IllegalArgumentException if testimonial not found
     */
    @Transactional
    public void deleteTestimonial(Long id) {
        if (!testimonialRepository.existsById(id)) {
            throw new IllegalArgumentException("Testimonial not found with id: " + id);
        }
        testimonialRepository.deleteById(id);
    }
}
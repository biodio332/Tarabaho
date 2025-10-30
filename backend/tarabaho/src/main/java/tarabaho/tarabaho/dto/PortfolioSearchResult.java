package tarabaho.tarabaho.dto;

import tarabaho.tarabaho.entity.Portfolio;

public record PortfolioSearchResult(
    Long id,
    String fullName,
    String professionalTitle,
    String primaryCourseType,
    String professionalSummary,
    String portfolioCategory,
    String preferredWorkLocation,
    String workScheduleAvailability,
    String salaryExpectations,
    // Add other fields you show in search results...
    Double relevanceScore  // This is the ranking score
) {
    // Constructor from Portfolio (for backward compatibility or fallback)
    public PortfolioSearchResult(Portfolio portfolio) {
        this(
            portfolio.getId(),
            portfolio.getFullName(),
            portfolio.getProfessionalTitle(),
            portfolio.getPrimaryCourseType(),
            portfolio.getProfessionalSummary(),
            portfolio.getPortfolioCategory(),
            portfolio.getPreferredWorkLocation(),
            portfolio.getWorkScheduleAvailability(),
            portfolio.getSalaryExpectations(),
            null  // relevanceScore = null if no search
        );
    }
}

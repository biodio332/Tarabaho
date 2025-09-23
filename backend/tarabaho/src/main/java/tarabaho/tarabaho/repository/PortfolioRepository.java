package tarabaho.tarabaho.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tarabaho.tarabaho.entity.Portfolio;
import tarabaho.tarabaho.entity.Visibility;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {

    Optional<Portfolio> findByIdAndVisibility(Long id, Visibility visibility);

    @Query("SELECT p, COUNT(v) FROM Portfolio p LEFT JOIN p.portfolioViews v GROUP BY p ORDER BY COUNT(v) DESC")
    List<Object[]> findTopPortfoliosByViews();

    @Query("SELECT p FROM Portfolio p WHERE p.graduate.id = :graduateId")
    Optional<Portfolio> findByGraduateId(@Param("graduateId") Long graduateId);
    
   @Query("SELECT p FROM Portfolio p WHERE p.graduate.id = :graduateId AND p.shareToken = :shareToken")
    Optional<Portfolio> findByGraduateIdAndShareToken(@Param("graduateId") Long graduateId, @Param("shareToken") String shareToken);

    @Query("SELECT COUNT(v) > 0 FROM PortfolioView v WHERE v.portfolio.id = :portfolioId AND v.viewDate > :cutoffTime")
    boolean hasRecentView(@Param("portfolioId") Long portfolioId, @Param("cutoffTime") LocalDateTime cutoffTime);

    @Query("SELECT DISTINCT p FROM Portfolio p " +
       "LEFT JOIN p.skills s " +
       "LEFT JOIN p.experiences e " +
       "LEFT JOIN p.projects pr " +
       "LEFT JOIN p.awardsRecognitions a " +
       "LEFT JOIN p.continuingEducations ce " +
       "LEFT JOIN p.professionalMemberships pm " +
       "WHERE p.visibility = Visibility.PUBLIC " +
       "AND (LOWER(p.fullName) LIKE LOWER(CONCAT('%', :query, '%')) " +
       "OR LOWER(p.professionalSummary) LIKE LOWER(CONCAT('%', :query, '%')) " +
       "OR LOWER(p.professionalTitle) LIKE LOWER(CONCAT('%', :query, '%')) " +
       "OR LOWER(p.primaryCourseType) LIKE LOWER(CONCAT('%', :query, '%')) " +
       "OR LOWER(p.scholarScheme) LIKE LOWER(CONCAT('%', :query, '%')) " +
       "OR LOWER(p.ncLevel) LIKE LOWER(CONCAT('%', :query, '%')) " +
       "OR LOWER(p.trainingCenter) LIKE LOWER(CONCAT('%', :query, '%')) " +
       "OR LOWER(p.scholarshipType) LIKE LOWER(CONCAT('%', :query, '%')) " +
       "OR LOWER(p.portfolioCategory) LIKE LOWER(CONCAT('%', :query, '%')) " +
       "OR LOWER(p.preferredWorkLocation) LIKE LOWER(CONCAT('%', :query, '%')) " +
       "OR LOWER(p.workScheduleAvailability) LIKE LOWER(CONCAT('%', :query, '%')) " +
       "OR LOWER(p.salaryExpectations) LIKE LOWER(CONCAT('%', :query, '%')) " +
       "OR LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
       "OR LOWER(e.jobTitle) LIKE LOWER(CONCAT('%', :query, '%')) " +
       "OR LOWER(e.employer) LIKE LOWER(CONCAT('%', :query, '%')) " +
       "OR LOWER(e.description) LIKE LOWER(CONCAT('%', :query, '%')) " +
       "OR LOWER(pr.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
       "OR LOWER(pr.description) LIKE LOWER(CONCAT('%', :query, '%')) " +
       "OR LOWER(a.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
       "OR LOWER(a.issuer) LIKE LOWER(CONCAT('%', :query, '%')) " +
       "OR LOWER(ce.courseName) LIKE LOWER(CONCAT('%', :query, '%')) " +
       "OR LOWER(ce.institution) LIKE LOWER(CONCAT('%', :query, '%')) " +
       "OR LOWER(pm.organization) LIKE LOWER(CONCAT('%', :query, '%')) " +
       "OR LOWER(pm.membershipType) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Portfolio> searchPublicPortfolios(@Param("query") String query);
}
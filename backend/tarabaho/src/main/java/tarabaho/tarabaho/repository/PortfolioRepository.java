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

    @Query(value = """
    WITH q AS (SELECT websearch_to_tsquery('english', :query) AS tsq),
         search_data AS (
             SELECT 
                 p.id,
                 p.full_name,
                 p.avatar,
                 p.professional_title,
                 p.primary_course_type,
                 p.professional_summary,
                 p.share_token,
                 g.id AS graduate_id,
                 to_tsvector('english',
                     COALESCE(p.full_name,'') || ' ' ||
                     COALESCE(p.professional_summary,'') || ' ' ||
                     COALESCE(p.professional_title,'') || ' ' ||
                     COALESCE(p.primary_course_type,'') || ' ' ||
                     COALESCE(p.scholar_scheme,'') || ' ' ||
                     COALESCE(p.nc_level,'') || ' ' ||
                     COALESCE(p.training_center,'') || ' ' ||
                     COALESCE(p.scholarship_type,'') || ' ' ||
                     COALESCE(p.portfolio_category,'') || ' ' ||
                     COALESCE(p.preferred_work_location,'') || ' ' ||
                     COALESCE(p.work_schedule_availability,'') || ' ' ||
                     COALESCE(p.salary_expectations,'') || ' ' ||
                     COALESCE(' ' || string_agg(COALESCE(s.name, ''), ' '), '') || ' ' ||
                     COALESCE(' ' || string_agg(COALESCE(e.job_title, '') || ' ' || COALESCE(e.employer, '') || ' ' || COALESCE(e.description, ''), ' '), '') || ' ' ||
                     COALESCE(' ' || string_agg(COALESCE(pr.title, '') || ' ' || COALESCE(pr.description, ''), ' '), '') || ' ' ||
                     COALESCE(' ' || string_agg(COALESCE(a.title, '') || ' ' || COALESCE(a.issuer, ''), ' '), '') || ' ' ||
                     COALESCE(' ' || string_agg(COALESCE(ce.course_name, '') || ' ' || COALESCE(ce.institution, ''), ' '), '') || ' ' ||
                     COALESCE(' ' || string_agg(COALESCE(pm.organization, '') || ' ' || COALESCE(pm.membership_type, ''), ' '), '')
                 ) AS full_text
             FROM portfolios p
             JOIN graduates g ON p.graduate_id = g.id
             LEFT JOIN skills s                    ON s.portfolio_id = p.id
             LEFT JOIN experiences e               ON e.portfolio_id = p.id
             LEFT JOIN projects pr                 ON pr.portfolio_id = p.id
             LEFT JOIN awards_recognitions a       ON a.portfolio_id = p.id
             LEFT JOIN continuing_educations ce    ON ce.portfolio_id = p.id
             LEFT JOIN professional_memberships pm ON pm.portfolio_id = p.id
             WHERE p.visibility = 'PUBLIC'
             GROUP BY p.id, g.id
         )
    SELECT
        id,
        full_name,
        avatar,
        professional_title,
        primary_course_type,
        professional_summary,
        share_token,
        graduate_id,
        ts_rank(full_text, q.tsq) AS relevance_score
    FROM search_data, q
    WHERE full_text @@ q.tsq
    ORDER BY relevance_score DESC
    """, nativeQuery = true)
    List<Object[]> searchPublicPortfoliosRaw(@Param("query") String query);
}
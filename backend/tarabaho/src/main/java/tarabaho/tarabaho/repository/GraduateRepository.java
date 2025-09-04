package tarabaho.tarabaho.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tarabaho.tarabaho.entity.Graduate;

@Repository
public interface GraduateRepository extends JpaRepository<Graduate, Long> {
    Graduate findByUsername(String username);
    boolean existsByUsername(String username);
    Optional<Graduate> findByEmail(String email);
    Optional<Graduate> findByPhoneNumber(String phoneNumber);
    List<Graduate> findAllByEmail(String email);
    List<Graduate> findAllByPhoneNumber(String phoneNumber);

    @Query("SELECT w FROM Graduate w JOIN w.categories c WHERE c.name = :categoryName")
    List<Graduate> findByCategoryName(@Param("categoryName") String categoryName);

    @Query("SELECT w FROM Graduate w WHERE w.isAvailable = true")
    List<Graduate> findAllAvailable();

    @Query("SELECT w FROM Graduate w WHERE w.stars >= :minStars")
    List<Graduate> findByMinimumStars(@Param("minStars") Double minStars);

    @Query("SELECT w FROM Graduate w WHERE w.hourly <= :maxHourly")
    List<Graduate> findByMaxHourly(@Param("maxHourly") Double maxHourly);

    @Query("SELECT w FROM Graduate w JOIN w.categories c WHERE c.name = :categoryName AND w.isAvailable = true " +
           "AND NOT EXISTS (SELECT b FROM Booking b WHERE b.graduate = w AND b.status IN ('ACCEPTED', 'IN_PROGRESS'))")
    List<Graduate> findAvailableGraduatesByCategory(@Param("categoryName") String categoryName);

    @Query("SELECT w FROM Graduate w JOIN w.categories c WHERE c.name = :categoryName " +
           "AND w.isAvailable = true AND w.latitude IS NOT NULL AND w.longitude IS NOT NULL " +
           "AND (6371 * acos(cos(radians(:latitude)) * cos(radians(w.latitude)) * " +
           "cos(radians(w.longitude) - radians(:longitude)) + " +
           "sin(radians(:latitude)) * sin(radians(w.latitude)))) <= :radius " +
           "AND NOT EXISTS (SELECT b FROM Booking b WHERE b.graduate = w AND b.status IN ('ACCEPTED', 'IN_PROGRESS'))")
    List<Graduate> findNearbyAvailableGraduatesByCategory(
        @Param("categoryName") String categoryName,
        @Param("latitude") Double latitude,
        @Param("longitude") Double longitude,
        @Param("radius") Double radius
    );

    @Query("SELECT w FROM Graduate w JOIN w.categories c WHERE c.name = :categoryName " +
           "AND w.isAvailable = true AND w.latitude IS NOT NULL AND w.longitude IS NOT NULL " +
           "AND (6371 * acos(cos(radians(:latitude)) * cos(radians(w.latitude)) * " +
           "cos(radians(w.longitude) - radians(:longitude)) + " +
           "sin(radians(:latitude)) * sin(radians(w.latitude)))) <= :radius")
    List<Graduate> findNearbyGraduatesByCategory(
        @Param("categoryName") String categoryName,
        @Param("latitude") Double latitude,
        @Param("longitude") Double longitude,
        @Param("radius") Double radius
    );

    @Query("SELECT DISTINCT w FROM Graduate w JOIN w.categories c WHERE c.name IN :categoryNames AND w.id != :graduateId")
    List<Graduate> findByCategoryNames(@Param("categoryNames") List<String> categoryNames, @Param("graduateId") Long graduateId);

    
}
package tarabaho.tarabaho.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tarabaho.tarabaho.entity.Worker;

@Repository
public interface WorkerRepository extends JpaRepository<Worker, Long> {
    Worker findByUsername(String username);
    boolean existsByUsername(String username);
    Optional<Worker> findByEmail(String email);
    Optional<Worker> findByPhoneNumber(String phoneNumber);
    List<Worker> findAllByEmail(String email);
    List<Worker> findAllByPhoneNumber(String phoneNumber);

    @Query("SELECT w FROM Worker w JOIN w.categories c WHERE c.name = :categoryName")
    List<Worker> findByCategoryName(@Param("categoryName") String categoryName);

    @Query("SELECT w FROM Worker w WHERE w.isAvailable = true")
    List<Worker> findAllAvailable();

    @Query("SELECT w FROM Worker w WHERE w.stars >= :minStars")
    List<Worker> findByMinimumStars(@Param("minStars") Double minStars);

    @Query("SELECT w FROM Worker w WHERE w.hourly <= :maxHourly")
    List<Worker> findByMaxHourly(@Param("maxHourly") Double maxHourly);

    @Query("SELECT w FROM Worker w JOIN w.categories c WHERE c.name = :categoryName AND w.isAvailable = true " +
           "AND NOT EXISTS (SELECT b FROM Booking b WHERE b.worker = w AND b.status IN ('ACCEPTED', 'IN_PROGRESS'))")
    List<Worker> findAvailableWorkersByCategory(@Param("categoryName") String categoryName);

    @Query("SELECT w FROM Worker w JOIN w.categories c WHERE c.name = :categoryName " +
           "AND w.isAvailable = true AND w.latitude IS NOT NULL AND w.longitude IS NOT NULL " +
           "AND (6371 * acos(cos(radians(:latitude)) * cos(radians(w.latitude)) * " +
           "cos(radians(w.longitude) - radians(:longitude)) + " +
           "sin(radians(:latitude)) * sin(radians(w.latitude)))) <= :radius " +
           "AND NOT EXISTS (SELECT b FROM Booking b WHERE b.worker = w AND b.status IN ('ACCEPTED', 'IN_PROGRESS'))")
    List<Worker> findNearbyAvailableWorkersByCategory(
        @Param("categoryName") String categoryName,
        @Param("latitude") Double latitude,
        @Param("longitude") Double longitude,
        @Param("radius") Double radius
    );

    @Query("SELECT w FROM Worker w JOIN w.categories c WHERE c.name = :categoryName " +
           "AND w.isAvailable = true AND w.latitude IS NOT NULL AND w.longitude IS NOT NULL " +
           "AND (6371 * acos(cos(radians(:latitude)) * cos(radians(w.latitude)) * " +
           "cos(radians(w.longitude) - radians(:longitude)) + " +
           "sin(radians(:latitude)) * sin(radians(w.latitude)))) <= :radius")
    List<Worker> findNearbyWorkersByCategory(
        @Param("categoryName") String categoryName,
        @Param("latitude") Double latitude,
        @Param("longitude") Double longitude,
        @Param("radius") Double radius
    );

    @Query("SELECT DISTINCT w FROM Worker w JOIN w.categories c WHERE c.name IN :categoryNames AND w.id != :workerId")
    List<Worker> findByCategoryNames(@Param("categoryNames") List<String> categoryNames, @Param("workerId") Long workerId);

    
}
package tarabaho.tarabaho.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import tarabaho.tarabaho.entity.Rating;
import tarabaho.tarabaho.entity.Graduate;

public interface RatingRepository extends JpaRepository<Rating, Long> {
    List<Rating> findByGraduate(Graduate graduate);
    @Query("SELECT r FROM Rating r JOIN FETCH r.user WHERE r.graduate.id = :graduateId")
    List<Rating> findByGraduateId(@Param("graduateId") Long graduateId);
}
package tarabaho.tarabaho.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tarabaho.tarabaho.entity.Booking;
import tarabaho.tarabaho.entity.BookingStatus;
import tarabaho.tarabaho.entity.Category;
import tarabaho.tarabaho.entity.User;
import tarabaho.tarabaho.entity.Graduate;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUser(User user);

    List<Booking> findByGraduate(Graduate graduate);

    @Query("SELECT b FROM Booking b WHERE b.status IN (:statuses)")
    List<Booking> findByStatuses(@Param("statuses") List<BookingStatus> statuses);

    @Query("SELECT b FROM Booking b WHERE b.graduate = :graduate AND b.status IN ('ACCEPTED', 'IN_PROGRESS')")
    List<Booking> findActiveBookingsByGraduate(@Param("graduate") Graduate graduate);
    List<Booking> findByStatusIn(List<BookingStatus> statuses);
    List<Booking> findByUserAndCategoryAndStatusIn(User user, Category category, List<BookingStatus> statuses);
    List<Booking> findByUserAndStatusIn(User user, List<BookingStatus> statuses);
}
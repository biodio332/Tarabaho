package tarabaho.tarabaho.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import tarabaho.tarabaho.entity.Booking;
import tarabaho.tarabaho.entity.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByBookingOrderBySentAtAsc(Booking booking);
}
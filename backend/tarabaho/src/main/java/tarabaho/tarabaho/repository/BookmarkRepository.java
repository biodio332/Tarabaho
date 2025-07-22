package tarabaho.tarabaho.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import tarabaho.tarabaho.entity.Bookmark;
import tarabaho.tarabaho.entity.User;
import tarabaho.tarabaho.entity.Worker;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    Optional<Bookmark> findByUserAndWorker(User user, Worker worker);
    List<Bookmark> findByUser(User user);
}
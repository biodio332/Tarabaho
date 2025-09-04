package tarabaho.tarabaho.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import tarabaho.tarabaho.entity.Bookmark;
import tarabaho.tarabaho.entity.User;
import tarabaho.tarabaho.entity.Graduate;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    Optional<Bookmark> findByUserAndGraduate(User user, Graduate graduate);
    List<Bookmark> findByUser(User user);
}
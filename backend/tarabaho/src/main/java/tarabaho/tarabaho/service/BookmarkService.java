package tarabaho.tarabaho.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tarabaho.tarabaho.entity.Bookmark;
import tarabaho.tarabaho.entity.User;
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.repository.BookmarkRepository;
import tarabaho.tarabaho.repository.UserRepository;
import tarabaho.tarabaho.repository.GraduateRepository;

@Service
public class BookmarkService {

    @Autowired
    private BookmarkRepository bookmarkRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GraduateRepository graduateRepository;

    public boolean toggleBookmark(Long userId, Long graduateId) throws Exception {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new Exception("User not found"));
        Graduate graduate = graduateRepository.findById(graduateId)
            .orElseThrow(() -> new Exception("Graduate not found"));

        Optional<Bookmark> existingBookmark = bookmarkRepository.findByUserAndGraduate(user, graduate);
        if (existingBookmark.isPresent()) {
            bookmarkRepository.delete(existingBookmark.get());
            return false; // Bookmark removed
        } else {
            Bookmark bookmark = new Bookmark();
            bookmark.setUser(user);
            bookmark.setGraduate(graduate);
            bookmarkRepository.save(bookmark);
            return true; // Bookmark added
        }
    }

    public boolean isBookmarked(Long userId, Long graduateId) throws Exception {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new Exception("User not found"));
        Graduate graduate = graduateRepository.findById(graduateId)
            .orElseThrow(() -> new Exception("Graduate not found"));
        return bookmarkRepository.findByUserAndGraduate(user, graduate).isPresent();
    }

    public List<Graduate> getBookmarkedGraduates(Long userId) throws Exception {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new Exception("User not found"));
        List<Bookmark> bookmarks = bookmarkRepository.findByUser(user);
        return bookmarks.stream().map(Bookmark::getGraduate).toList();
    }
}
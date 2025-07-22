package tarabaho.tarabaho.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tarabaho.tarabaho.entity.Bookmark;
import tarabaho.tarabaho.entity.User;
import tarabaho.tarabaho.entity.Worker;
import tarabaho.tarabaho.repository.BookmarkRepository;
import tarabaho.tarabaho.repository.UserRepository;
import tarabaho.tarabaho.repository.WorkerRepository;

@Service
public class BookmarkService {

    @Autowired
    private BookmarkRepository bookmarkRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkerRepository workerRepository;

    public boolean toggleBookmark(Long userId, Long workerId) throws Exception {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new Exception("User not found"));
        Worker worker = workerRepository.findById(workerId)
            .orElseThrow(() -> new Exception("Worker not found"));

        Optional<Bookmark> existingBookmark = bookmarkRepository.findByUserAndWorker(user, worker);
        if (existingBookmark.isPresent()) {
            bookmarkRepository.delete(existingBookmark.get());
            return false; // Bookmark removed
        } else {
            Bookmark bookmark = new Bookmark();
            bookmark.setUser(user);
            bookmark.setWorker(worker);
            bookmarkRepository.save(bookmark);
            return true; // Bookmark added
        }
    }

    public boolean isBookmarked(Long userId, Long workerId) throws Exception {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new Exception("User not found"));
        Worker worker = workerRepository.findById(workerId)
            .orElseThrow(() -> new Exception("Worker not found"));
        return bookmarkRepository.findByUserAndWorker(user, worker).isPresent();
    }

    public List<Worker> getBookmarkedWorkers(Long userId) throws Exception {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new Exception("User not found"));
        List<Bookmark> bookmarks = bookmarkRepository.findByUser(user);
        return bookmarks.stream().map(Bookmark::getWorker).toList();
    }
}
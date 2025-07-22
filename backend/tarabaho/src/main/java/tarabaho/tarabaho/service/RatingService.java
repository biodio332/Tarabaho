package tarabaho.tarabaho.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tarabaho.tarabaho.entity.Booking;
import tarabaho.tarabaho.entity.BookingStatus;
import tarabaho.tarabaho.entity.Rating;
import tarabaho.tarabaho.entity.User;
import tarabaho.tarabaho.entity.Worker;
import tarabaho.tarabaho.repository.BookingRepository;
import tarabaho.tarabaho.repository.RatingRepository;
import tarabaho.tarabaho.repository.UserRepository;
import tarabaho.tarabaho.repository.WorkerRepository;

@Service
public class RatingService {

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkerRepository workerRepository;

    public List<Rating> getRatingsByWorkerId(Long workerId) {
        return ratingRepository.findByWorkerId(workerId);
    }

    public Rating submitRating(Long userId, Long bookingId, Integer rating, String comment) throws Exception {
        if (rating == null || rating < 1 || rating > 5) {
            throw new Exception("Rating must be between 1 and 5");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new Exception("User not found"));
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new Exception("Booking not found"));
        Worker worker = booking.getWorker();
        if (worker == null) {
            throw new Exception("No worker assigned to this booking");
        }
        if (!booking.getUser().equals(user)) {
            throw new Exception("User not authorized to rate this booking");
        }
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new Exception("Booking must be completed to submit a rating");
        }

        Rating ratingEntity = new Rating();
        ratingEntity.setUser(user);
        ratingEntity.setWorker(worker);
        ratingEntity.setBooking(booking);
        ratingEntity.setRating(rating);
        ratingEntity.setComment(comment);

        Rating savedRating = ratingRepository.save(ratingEntity);

        // Update worker's average rating
        updateWorkerRating(worker);

        return savedRating;
    }

    @SuppressWarnings("unchecked")
    private void updateWorkerRating(Worker worker) {
        // Temporarily cast to List<Rating> to suppress the IDE warning
        List<?> rawRatings = ratingRepository.findByWorker(worker);
        List<Rating> ratings = (List<Rating>) rawRatings;

        if (ratings != null && !ratings.isEmpty()) {
            double average = ratings.stream()
                .mapToInt(Rating::getRating)
                .average()
                .orElse(0.0);
            worker.setStars(average);
            worker.setRatingCount(ratings.size());
            workerRepository.save(worker);
        } else {
            // If no ratings exist, reset worker's stars and rating count
            worker.setStars(0.0);
            worker.setRatingCount(0);
            workerRepository.save(worker);
        }
    }
}
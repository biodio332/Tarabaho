package tarabaho.tarabaho.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tarabaho.tarabaho.entity.Booking;
import tarabaho.tarabaho.entity.BookingStatus;
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.entity.Rating;
import tarabaho.tarabaho.entity.User;
import tarabaho.tarabaho.repository.BookingRepository;
import tarabaho.tarabaho.repository.GraduateRepository;
import tarabaho.tarabaho.repository.RatingRepository;
import tarabaho.tarabaho.repository.UserRepository;

@Service
public class RatingService {

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GraduateRepository graduateRepository;

    public List<Rating> getRatingsByGraduateId(Long graduateId) {
        return ratingRepository.findByGraduateId(graduateId);
    }

    public Rating submitRating(Long userId, Long bookingId, Integer rating, String comment) throws Exception {
        if (rating == null || rating < 1 || rating > 5) {
            throw new Exception("Rating must be between 1 and 5");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new Exception("User not found"));
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new Exception("Booking not found"));
        Graduate graduate = booking.getGraduate();
        if (graduate == null) {
            throw new Exception("No graduate assigned to this booking");
        }
        if (!booking.getUser().equals(user)) {
            throw new Exception("User not authorized to rate this booking");
        }
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new Exception("Booking must be completed to submit a rating");
        }

        Rating ratingEntity = new Rating();
        ratingEntity.setUser(user);
        ratingEntity.setGraduate(graduate);
        ratingEntity.setBooking(booking);
        ratingEntity.setRating(rating);
        ratingEntity.setComment(comment);

        Rating savedRating = ratingRepository.save(ratingEntity);

        // Update graduate's average rating
        updateGraduateRating(graduate);

        return savedRating;
    }

    @SuppressWarnings("unchecked")
    private void updateGraduateRating(Graduate graduate) {
        // Temporarily cast to List<Rating> to suppress the IDE warning
        List<?> rawRatings = ratingRepository.findByGraduate(graduate);
        List<Rating> ratings = (List<Rating>) rawRatings;

        if (ratings != null && !ratings.isEmpty()) {
            double average = ratings.stream()
                .mapToInt(Rating::getRating)
                .average()
                .orElse(0.0);
            graduate.setStars(average);
            graduate.setRatingCount(ratings.size());
            graduateRepository.save(graduate);
        } else {
            // If no ratings exist, reset graduate's stars and rating count
            graduate.setStars(0.0);
            graduate.setRatingCount(0);
            graduateRepository.save(graduate);
        }
    }
}
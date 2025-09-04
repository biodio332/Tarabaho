package tarabaho.tarabaho.service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tarabaho.tarabaho.entity.Booking;
import tarabaho.tarabaho.entity.BookingStatus;
import tarabaho.tarabaho.entity.Category;
import tarabaho.tarabaho.entity.CategoryRequest;
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.repository.BookingRepository;
import tarabaho.tarabaho.repository.CategoryRepository;
import tarabaho.tarabaho.repository.CategoryRequestRepository;
import tarabaho.tarabaho.repository.GraduateRepository;

@Service
public class GraduateService {

    @Autowired
    private GraduateRepository graduateRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PasswordEncoderService passwordEncoderService;

    @Autowired
    private CategoryRequestRepository categoryRequestRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Graduate> getGraduatesByCategory(String categoryName) {
        return graduateRepository.findByCategoryName(categoryName);
    }

    public Graduate registerGraduate(Graduate graduate) {
        System.out.println("GraduateService: Registering graduate with username: " + graduate.getUsername());
        // Validate new fields
        if (graduate.getHourly() == null || graduate.getHourly() <= 0) {
            throw new IllegalArgumentException("Hourly rate must be provided and greater than 0.");
        }
        if (graduate.getStars() != null && (graduate.getStars() < 0 || graduate.getStars() > 5)) {
            throw new IllegalArgumentException("Initial stars must be between 0 and 5.");
        }
        // Ensure certificates are properly linked to the graduate
        if (graduate.getCertificates() != null) {
            graduate.getCertificates().forEach(certificate -> certificate.setGraduate(graduate));
        }
        return graduateRepository.save(graduate);
    }

    public Graduate loginGraduate(String username, String password) throws Exception {
        System.out.println("GraduateService: Attempting login for username: " + username);
        Graduate graduate = graduateRepository.findByUsername(username);
        if (graduate == null) {
            System.out.println("GraduateService: Graduate not found for username: " + username);
            throw new Exception("Invalid username or password");
        }
        System.out.println("GraduateService: Found graduate with ID: " + graduate.getId() + ", Stored password: " + graduate.getPassword());
        boolean passwordMatch = passwordEncoderService.matches(password, graduate.getPassword());
        System.out.println("GraduateService: Password match: " + passwordMatch);
        if (passwordMatch) {
            return graduate;
        }
        throw new Exception("Invalid username or password");
    }

    public List<Graduate> getAllGraduates() {
        return graduateRepository.findAll();
    }

    public void deleteGraduate(Long id) {
        if (!graduateRepository.existsById(id)) {
            throw new IllegalArgumentException("Graduate not found");
        }
        graduateRepository.deleteById(id);
    }

    public Graduate editGraduate(Long id, Graduate updatedGraduate) throws Exception {
        Graduate existingGraduate = graduateRepository.findById(id)
            .orElseThrow(() -> new Exception("Graduate not found"));
        existingGraduate.setFirstName(updatedGraduate.getFirstName());
        existingGraduate.setLastName(updatedGraduate.getLastName());
        existingGraduate.setUsername(updatedGraduate.getUsername());
        existingGraduate.setEmail(updatedGraduate.getEmail());
        existingGraduate.setPhoneNumber(updatedGraduate.getPhoneNumber());
        existingGraduate.setAddress(updatedGraduate.getAddress());
        existingGraduate.setBiography(updatedGraduate.getBiography());
        existingGraduate.setBirthday(updatedGraduate.getBirthday());
        existingGraduate.setProfilePicture(updatedGraduate.getProfilePicture());
        if (updatedGraduate.getHourly() != null) {
            if (updatedGraduate.getHourly() <= 0) {
                throw new IllegalArgumentException("Hourly rate must be greater than 0.");
            }
            existingGraduate.setHourly(updatedGraduate.getHourly());
        }
        if (updatedGraduate.getIsAvailable() != null) {
            existingGraduate.setIsAvailable(updatedGraduate.getIsAvailable());
        }
        if (updatedGraduate.getIsVerified() != null) {
            existingGraduate.setIsVerified(updatedGraduate.getIsVerified());
        }
        if (updatedGraduate.getLatitude() != null) {
            existingGraduate.setLatitude(updatedGraduate.getLatitude());
        }
        if (updatedGraduate.getLongitude() != null) {
            existingGraduate.setLongitude(updatedGraduate.getLongitude());
        }
        if (updatedGraduate.getAverageResponseTime() != null) {
            existingGraduate.setAverageResponseTime(updatedGraduate.getAverageResponseTime());
        }
        return graduateRepository.save(existingGraduate);
    }

    public Graduate updateRating(Long graduateId, Long bookingId, Double newRating, Long userId) throws Exception {
        if (newRating < 1.0 || newRating > 5.0) {
            throw new IllegalArgumentException("Rating must be between 1.0 and 5.0.");
        }
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new Exception("Booking not found"));
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new Exception("Booking must be completed to submit a rating");
        }
        if (!booking.getUser().getId().equals(userId)) {
            throw new Exception("Only the booking user can submit a rating");
        }
        if (!booking.getGraduate().getId().equals(graduateId)) {
            throw new Exception("Graduate does not match the booking");
        }
        Graduate graduate = graduateRepository.findById(graduateId)
            .orElseThrow(() -> new Exception("Graduate not found"));
        int currentCount = graduate.getRatingCount();
        double currentStars = graduate.getStars();
        double totalStars = currentStars * currentCount + newRating;
        int newCount = currentCount + 1;
        double newAverage = totalStars / newCount;
        graduate.setStars(Math.round(newAverage * 10.0) / 10.0);
        graduate.setRatingCount(newCount);
        return graduateRepository.save(graduate);
    }

    public Optional<Graduate> findByUsername(String username) {
        return Optional.ofNullable(graduateRepository.findByUsername(username));
    }

    public Optional<Graduate> findByEmail(String email) {
        List<Graduate> graduates = graduateRepository.findAllByEmail(email);
        if (graduates.size() > 1) {
            return Optional.empty();
        }
        return graduates.isEmpty() ? Optional.empty() : Optional.of(graduates.get(0));
    }

    public Optional<Graduate> findByPhoneNumber(String phoneNumber) {
        List<Graduate> graduates = graduateRepository.findAllByPhoneNumber(phoneNumber);
        if (graduates.size() > 1) {
            return Optional.empty();
        }
        return graduates.isEmpty() ? Optional.empty() : Optional.of(graduates.get(0));
    }

    public Graduate findById(Long graduateId) {
        System.out.println("GraduateService: Finding graduate by ID: " + graduateId);
        return graduateRepository.findById(graduateId)
                .orElseThrow(() -> new RuntimeException("Graduate not found with ID: " + graduateId));
    }

    public Graduate updateGraduate(Graduate graduate) {
        // Avoid re-hashing password unless explicitly provided
        return graduateRepository.save(graduate);
    }

    public List<Graduate> getAvailableGraduates() {
        return graduateRepository.findAllAvailable();
    }

    public List<Graduate> getGraduatesByMinimumStars(Double minStars) {
        return graduateRepository.findByMinimumStars(minStars);
    }

    public List<Graduate> getGraduatesByMaxHourly(Double maxHourly) {
        return graduateRepository.findByMaxHourly(maxHourly);
    }

    public List<Graduate> getAvailableGraduatesByCategory(String categoryName) {
        return graduateRepository.findAvailableGraduatesByCategory(categoryName);
    }

    public List<Graduate> getNearbyAvailableGraduatesByCategory(String categoryName, Double latitude, Double longitude, Double radius) {
        return graduateRepository.findNearbyAvailableGraduatesByCategory(categoryName, latitude, longitude, radius);
    }

    public List<Graduate> findNearbyGraduatesForUrgentJob(String categoryName, Double latitude, Double longitude, Double radius) {
        if (categoryName == null || categoryName.isEmpty()) {
            throw new IllegalArgumentException("Category name is required");
        }
        if (latitude == null || longitude == null || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            throw new IllegalArgumentException("Invalid latitude or longitude values");
        }
        if (radius == null || radius <= 0) {
            throw new IllegalArgumentException("Radius must be greater than 0");
        }
        return graduateRepository.findNearbyAvailableGraduatesByCategory(categoryName, latitude, longitude, radius);
    }

    public List<Graduate> getSimilarGraduates(Long graduateId) {
        System.out.println("GraduateService: Fetching similar graduates for graduate ID: " + graduateId);
        Graduate graduate = graduateRepository.findById(graduateId)
            .orElseThrow(() -> new IllegalArgumentException("Graduate not found with ID: " + graduateId));
        List<String> categoryNames = graduate.getCategories().stream()
            .map(category -> category.getName())
            .collect(Collectors.toList());
        if (categoryNames.isEmpty()) {
            System.out.println("GraduateService: No categories found for graduate ID: " + graduateId);
            return Collections.emptyList();
        }
        List<Graduate> similarGraduates = graduateRepository.findByCategoryNames(categoryNames, graduateId);
        similarGraduates.sort((w1, w2) -> Double.compare(w2.getStars(), w1.getStars()));
        int maxResults = 5;
        if (similarGraduates.size() > maxResults) {
            similarGraduates = similarGraduates.subList(0, maxResults);
        }
        System.out.println("GraduateService: Found " + similarGraduates.size() + " similar graduates for graduate ID: " + graduateId);
        return similarGraduates;
    }
    // NEW: Method to handle submitting a single category request
    public CategoryRequest requestCategory(Long graduateId, String categoryName) {
        Graduate graduate = graduateRepository.findById(graduateId)
            .orElseThrow(() -> new IllegalArgumentException("Graduate not found with ID: " + graduateId));
        Category category = categoryRepository.findByName(categoryName);
        if (category == null) {
            throw new IllegalArgumentException("Category not found: " + categoryName);
        }
        if (graduate.getCategories().contains(category)) {
            throw new IllegalArgumentException("Graduate is already associated with category: " + categoryName);
        }
        List<CategoryRequest> existingRequests = categoryRequestRepository.findByGraduateIdAndCategoryId(graduateId, category.getId());
        if (!existingRequests.isEmpty()) {
            throw new IllegalArgumentException("A request for this category is already pending or processed.");
        }
        CategoryRequest request = new CategoryRequest();
        request.setGraduate(graduate);
        request.setCategory(category);
        request.setStatus("PENDING");
        return categoryRequestRepository.save(request);
    }

    // NEW: Method to retrieve all category requests for a graduate
    public List<CategoryRequest> getCategoryRequestsByGraduateId(Long graduateId) {
        return categoryRequestRepository.findByGraduateId(graduateId);
    }   
}
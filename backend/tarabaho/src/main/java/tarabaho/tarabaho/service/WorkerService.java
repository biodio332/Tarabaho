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
import tarabaho.tarabaho.entity.Worker;
import tarabaho.tarabaho.repository.BookingRepository;
import tarabaho.tarabaho.repository.CategoryRepository;
import tarabaho.tarabaho.repository.CategoryRequestRepository;
import tarabaho.tarabaho.repository.WorkerRepository;

@Service
public class WorkerService {

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PasswordEncoderService passwordEncoderService;

    @Autowired
    private CategoryRequestRepository categoryRequestRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Worker> getWorkersByCategory(String categoryName) {
        return workerRepository.findByCategoryName(categoryName);
    }

    public Worker registerWorker(Worker worker) {
        System.out.println("WorkerService: Registering worker with username: " + worker.getUsername());
        // Validate new fields
        if (worker.getHourly() == null || worker.getHourly() <= 0) {
            throw new IllegalArgumentException("Hourly rate must be provided and greater than 0.");
        }
        if (worker.getStars() != null && (worker.getStars() < 0 || worker.getStars() > 5)) {
            throw new IllegalArgumentException("Initial stars must be between 0 and 5.");
        }
        // Ensure certificates are properly linked to the worker
        if (worker.getCertificates() != null) {
            worker.getCertificates().forEach(certificate -> certificate.setWorker(worker));
        }
        return workerRepository.save(worker);
    }

    public Worker loginWorker(String username, String password) throws Exception {
        System.out.println("WorkerService: Attempting login for username: " + username);
        Worker worker = workerRepository.findByUsername(username);
        if (worker == null) {
            System.out.println("WorkerService: Worker not found for username: " + username);
            throw new Exception("Invalid username or password");
        }
        System.out.println("WorkerService: Found worker with ID: " + worker.getId() + ", Stored password: " + worker.getPassword());
        boolean passwordMatch = passwordEncoderService.matches(password, worker.getPassword());
        System.out.println("WorkerService: Password match: " + passwordMatch);
        if (passwordMatch) {
            return worker;
        }
        throw new Exception("Invalid username or password");
    }

    public List<Worker> getAllWorkers() {
        return workerRepository.findAll();
    }

    public void deleteWorker(Long id) {
        if (!workerRepository.existsById(id)) {
            throw new IllegalArgumentException("Worker not found");
        }
        workerRepository.deleteById(id);
    }

    public Worker editWorker(Long id, Worker updatedWorker) throws Exception {
        Worker existingWorker = workerRepository.findById(id)
            .orElseThrow(() -> new Exception("Worker not found"));
        existingWorker.setFirstName(updatedWorker.getFirstName());
        existingWorker.setLastName(updatedWorker.getLastName());
        existingWorker.setUsername(updatedWorker.getUsername());
        existingWorker.setEmail(updatedWorker.getEmail());
        existingWorker.setPhoneNumber(updatedWorker.getPhoneNumber());
        existingWorker.setAddress(updatedWorker.getAddress());
        existingWorker.setBiography(updatedWorker.getBiography());
        existingWorker.setBirthday(updatedWorker.getBirthday());
        existingWorker.setProfilePicture(updatedWorker.getProfilePicture());
        if (updatedWorker.getHourly() != null) {
            if (updatedWorker.getHourly() <= 0) {
                throw new IllegalArgumentException("Hourly rate must be greater than 0.");
            }
            existingWorker.setHourly(updatedWorker.getHourly());
        }
        if (updatedWorker.getIsAvailable() != null) {
            existingWorker.setIsAvailable(updatedWorker.getIsAvailable());
        }
        if (updatedWorker.getIsVerified() != null) {
            existingWorker.setIsVerified(updatedWorker.getIsVerified());
        }
        if (updatedWorker.getLatitude() != null) {
            existingWorker.setLatitude(updatedWorker.getLatitude());
        }
        if (updatedWorker.getLongitude() != null) {
            existingWorker.setLongitude(updatedWorker.getLongitude());
        }
        if (updatedWorker.getAverageResponseTime() != null) {
            existingWorker.setAverageResponseTime(updatedWorker.getAverageResponseTime());
        }
        return workerRepository.save(existingWorker);
    }

    public Worker updateRating(Long workerId, Long bookingId, Double newRating, Long userId) throws Exception {
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
        if (!booking.getWorker().getId().equals(workerId)) {
            throw new Exception("Worker does not match the booking");
        }
        Worker worker = workerRepository.findById(workerId)
            .orElseThrow(() -> new Exception("Worker not found"));
        int currentCount = worker.getRatingCount();
        double currentStars = worker.getStars();
        double totalStars = currentStars * currentCount + newRating;
        int newCount = currentCount + 1;
        double newAverage = totalStars / newCount;
        worker.setStars(Math.round(newAverage * 10.0) / 10.0);
        worker.setRatingCount(newCount);
        return workerRepository.save(worker);
    }

    public Optional<Worker> findByUsername(String username) {
        return Optional.ofNullable(workerRepository.findByUsername(username));
    }

    public Optional<Worker> findByEmail(String email) {
        List<Worker> workers = workerRepository.findAllByEmail(email);
        if (workers.size() > 1) {
            return Optional.empty();
        }
        return workers.isEmpty() ? Optional.empty() : Optional.of(workers.get(0));
    }

    public Optional<Worker> findByPhoneNumber(String phoneNumber) {
        List<Worker> workers = workerRepository.findAllByPhoneNumber(phoneNumber);
        if (workers.size() > 1) {
            return Optional.empty();
        }
        return workers.isEmpty() ? Optional.empty() : Optional.of(workers.get(0));
    }

    public Worker findById(Long workerId) {
        System.out.println("WorkerService: Finding worker by ID: " + workerId);
        return workerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found with ID: " + workerId));
    }

    public Worker updateWorker(Worker worker) {
        // Avoid re-hashing password unless explicitly provided
        return workerRepository.save(worker);
    }

    public List<Worker> getAvailableWorkers() {
        return workerRepository.findAllAvailable();
    }

    public List<Worker> getWorkersByMinimumStars(Double minStars) {
        return workerRepository.findByMinimumStars(minStars);
    }

    public List<Worker> getWorkersByMaxHourly(Double maxHourly) {
        return workerRepository.findByMaxHourly(maxHourly);
    }

    public List<Worker> getAvailableWorkersByCategory(String categoryName) {
        return workerRepository.findAvailableWorkersByCategory(categoryName);
    }

    public List<Worker> getNearbyAvailableWorkersByCategory(String categoryName, Double latitude, Double longitude, Double radius) {
        return workerRepository.findNearbyAvailableWorkersByCategory(categoryName, latitude, longitude, radius);
    }

    public List<Worker> findNearbyWorkersForUrgentJob(String categoryName, Double latitude, Double longitude, Double radius) {
        if (categoryName == null || categoryName.isEmpty()) {
            throw new IllegalArgumentException("Category name is required");
        }
        if (latitude == null || longitude == null || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            throw new IllegalArgumentException("Invalid latitude or longitude values");
        }
        if (radius == null || radius <= 0) {
            throw new IllegalArgumentException("Radius must be greater than 0");
        }
        return workerRepository.findNearbyAvailableWorkersByCategory(categoryName, latitude, longitude, radius);
    }

    public List<Worker> getSimilarWorkers(Long workerId) {
        System.out.println("WorkerService: Fetching similar workers for worker ID: " + workerId);
        Worker worker = workerRepository.findById(workerId)
            .orElseThrow(() -> new IllegalArgumentException("Worker not found with ID: " + workerId));
        List<String> categoryNames = worker.getCategories().stream()
            .map(category -> category.getName())
            .collect(Collectors.toList());
        if (categoryNames.isEmpty()) {
            System.out.println("WorkerService: No categories found for worker ID: " + workerId);
            return Collections.emptyList();
        }
        List<Worker> similarWorkers = workerRepository.findByCategoryNames(categoryNames, workerId);
        similarWorkers.sort((w1, w2) -> Double.compare(w2.getStars(), w1.getStars()));
        int maxResults = 5;
        if (similarWorkers.size() > maxResults) {
            similarWorkers = similarWorkers.subList(0, maxResults);
        }
        System.out.println("WorkerService: Found " + similarWorkers.size() + " similar workers for worker ID: " + workerId);
        return similarWorkers;
    }
    // NEW: Method to handle submitting a single category request
    public CategoryRequest requestCategory(Long workerId, String categoryName) {
        Worker worker = workerRepository.findById(workerId)
            .orElseThrow(() -> new IllegalArgumentException("Worker not found with ID: " + workerId));
        Category category = categoryRepository.findByName(categoryName);
        if (category == null) {
            throw new IllegalArgumentException("Category not found: " + categoryName);
        }
        if (worker.getCategories().contains(category)) {
            throw new IllegalArgumentException("Worker is already associated with category: " + categoryName);
        }
        List<CategoryRequest> existingRequests = categoryRequestRepository.findByWorkerIdAndCategoryId(workerId, category.getId());
        if (!existingRequests.isEmpty()) {
            throw new IllegalArgumentException("A request for this category is already pending or processed.");
        }
        CategoryRequest request = new CategoryRequest();
        request.setWorker(worker);
        request.setCategory(category);
        request.setStatus("PENDING");
        return categoryRequestRepository.save(request);
    }

    // NEW: Method to retrieve all category requests for a worker
    public List<CategoryRequest> getCategoryRequestsByWorkerId(Long workerId) {
        return categoryRequestRepository.findByWorkerId(workerId);
    }   
}
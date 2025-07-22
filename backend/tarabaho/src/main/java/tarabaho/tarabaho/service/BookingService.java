package tarabaho.tarabaho.service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tarabaho.tarabaho.entity.Booking;
import tarabaho.tarabaho.entity.BookingStatus;
import tarabaho.tarabaho.entity.BookingType;
import tarabaho.tarabaho.entity.Category;
import tarabaho.tarabaho.entity.PaymentConfirmationStatus;
import tarabaho.tarabaho.entity.PaymentMethod;
import tarabaho.tarabaho.entity.User;
import tarabaho.tarabaho.entity.Worker;
import tarabaho.tarabaho.repository.BookingRepository;
import tarabaho.tarabaho.repository.CategoryRepository;
import tarabaho.tarabaho.repository.UserRepository;
import tarabaho.tarabaho.repository.WorkerRepository;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public Booking createUrgentBooking(Long userId, String categoryName, Double latitude, Double longitude, Double radius, String paymentMethod, String jobDetails) throws Exception {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new Exception("User not found"));
        if (!user.getIsVerified()) {
            throw new Exception("User not verified");
        }

        List<Booking> existingBookings = bookingRepository.findByUserAndStatusIn(user, Arrays.asList(BookingStatus.PENDING, BookingStatus.ACCEPTED, BookingStatus.IN_PROGRESS, BookingStatus.WORKER_COMPLETED));
        if (!existingBookings.isEmpty()) {
            throw new Exception("User already has an active or pending booking");
        }

        Category category = categoryRepository.findByName(categoryName);
        if (category == null) {
            throw new Exception("Category not found");
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setCategory(category);
        booking.setType(BookingType.URGENT);
        booking.setStatus(BookingStatus.PENDING);
        booking.setPaymentMethod(PaymentMethod.valueOf(paymentMethod));
        booking.setPaymentConfirmationStatus(PaymentConfirmationStatus.PENDING);
        booking.setLatitude(latitude);
        booking.setLongitude(longitude);
        booking.setRadius(radius);
        booking.setJobDetails(jobDetails);
        booking.setCreatedAt(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    public Booking createCategoryBooking(Long userId, Long workerId, String categoryName, String paymentMethod, String jobDetails) throws Exception {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new Exception("User not found"));
        if (!user.getIsVerified()) {
            throw new Exception("User not verified");
        }

        List<Booking> existingBookings = bookingRepository.findByUserAndStatusIn(user, Arrays.asList(BookingStatus.PENDING, BookingStatus.ACCEPTED, BookingStatus.IN_PROGRESS, BookingStatus.WORKER_COMPLETED));
        if (!existingBookings.isEmpty()) {
            throw new Exception("User already has an active or pending booking");
        }

        Worker worker = workerRepository.findById(workerId)
            .orElseThrow(() -> new Exception("Worker not found"));
        if (!worker.getIsAvailable() || !isWorkerAvailable(worker)) {
            throw new Exception("Worker is not available");
        }

        Category category = categoryRepository.findByName(categoryName);
        if (category == null) {
            throw new Exception("Category not found");
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setWorker(worker);
        booking.setCategory(category);
        booking.setType(BookingType.CATEGORY);
        booking.setStatus(BookingStatus.PENDING);
        booking.setPaymentMethod(PaymentMethod.valueOf(paymentMethod));
        booking.setPaymentConfirmationStatus(PaymentConfirmationStatus.PENDING);
        booking.setJobDetails(jobDetails);
        booking.setCreatedAt(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    public Booking acceptBooking(Long bookingId, Long workerId) throws Exception {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new Exception("Booking not found"));
        Worker worker = workerRepository.findById(workerId)
            .orElseThrow(() -> new Exception("Worker not found"));

        if (booking.getType() == BookingType.URGENT && booking.getWorker() != null) {
            throw new Exception("Urgent booking already assigned");
        }
        if (booking.getType() == BookingType.CATEGORY && !worker.equals(booking.getWorker())) {
            throw new Exception("Worker not assigned to this booking");
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new Exception("Booking is not pending");
        }
        if (!worker.getIsAvailable() || !isWorkerAvailable(worker)) {
            throw new Exception("Worker is not available");
        }

        booking.setWorker(worker);
        booking.setStatus(BookingStatus.ACCEPTED);
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    public Booking rejectBooking(Long bookingId, Long workerId) throws Exception {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new Exception("Booking not found"));
        Worker worker = workerRepository.findById(workerId)
            .orElseThrow(() -> new Exception("Worker not found"));

        if (booking.getType() == BookingType.CATEGORY && !worker.equals(booking.getWorker())) {
            throw new Exception("Worker not assigned to this booking");
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new Exception("Booking is not pending");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    public Booking cancelBooking(Long bookingId, Long userId) throws Exception {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new Exception("Booking not found"));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new Exception("User not found"));

        if (!booking.getUser().equals(user)) {
            throw new Exception("User not authorized to cancel this booking");
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new Exception("Only pending bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    public Booking startBooking(Long bookingId, Long userId) throws Exception {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new Exception("Booking not found"));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new Exception("User not found"));

        if (!booking.getUser().equals(user)) {
            throw new Exception("User not authorized to start this booking");
        }
        if (booking.getStatus() != BookingStatus.ACCEPTED) {
            throw new Exception("Booking must be accepted to start");
        }

        booking.setStatus(BookingStatus.IN_PROGRESS);
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    public Booking completeBooking(Long bookingId, Long workerId, Double amount) throws Exception {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new Exception("Booking not found"));
        Worker worker = workerRepository.findById(workerId)
            .orElseThrow(() -> new Exception("Worker not found"));

        if (!booking.getWorker().equals(worker)) {
            throw new Exception("Worker not assigned to this booking");
        }
        if (booking.getStatus() != BookingStatus.IN_PROGRESS) {
            throw new Exception("Booking must be in progress to mark as completed");
        }

        // Remove the amount validation; allow amount to be 0.0 or null
        booking.setStatus(BookingStatus.WORKER_COMPLETED);
        booking.setPaymentConfirmationStatus(PaymentConfirmationStatus.PENDING);
        // Optionally set the amount if provided (not required at this stage)
        if (amount != null && amount > 0) {
            booking.setAmount(amount);
        }
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    public Booking confirmPayment(Long bookingId, Long workerId, Double amount) throws Exception {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new Exception("Booking not found"));
        Worker worker = workerRepository.findById(workerId)
            .orElseThrow(() -> new Exception("Worker not found"));

        if (!booking.getWorker().equals(worker)) {
            throw new Exception("Worker not assigned to this booking");
        }
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new Exception("Booking must be marked as completed by client");
        }
        if (booking.getPaymentConfirmationStatus() != PaymentConfirmationStatus.PENDING) {
            throw new Exception("Payment confirmation is not pending");
        }
        if (amount == null || amount <= 0) {
            throw new Exception("Invalid amount provided");
        }

        booking.setAmount(amount);
        booking.setPaymentConfirmationStatus(PaymentConfirmationStatus.CONFIRMED);
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    public Booking acceptCompletion(Long bookingId, Long userId) throws Exception {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new Exception("Booking not found"));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new Exception("User not found"));

        if (!booking.getUser().equals(user)) {
            throw new Exception("User not authorized to accept completion");
        }
        if (booking.getStatus() != BookingStatus.WORKER_COMPLETED) {
            throw new Exception("Booking must be marked as completed by worker");
        }
        // Removed the payment confirmation check
        // if (booking.getPaymentConfirmationStatus() != PaymentConfirmationStatus.CONFIRMED) {
        //     throw new Exception("Payment must be confirmed by worker before accepting completion");
        // }

        booking.setStatus(BookingStatus.COMPLETED);
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    public List<Booking> getUserBookings(Long userId) throws Exception {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new Exception("User not found"));
        return bookingRepository.findByUser(user);
    }

    public List<Booking> getWorkerBookings(Long workerId) throws Exception {
        Worker worker = workerRepository.findById(workerId)
            .orElseThrow(() -> new Exception("Worker not found"));
        return bookingRepository.findByWorker(worker);
    }

    public List<Booking> getPendingUrgentBookings() {
        return bookingRepository.findByStatuses(Arrays.asList(BookingStatus.PENDING));
    }

    private boolean isWorkerAvailable(Worker worker) {
        List<Booking> activeBookings = bookingRepository.findActiveBookingsByWorker(worker);
        return activeBookings.isEmpty();
    }

    public Booking getBookingById(Long bookingId) throws Exception {
        return bookingRepository.findById(bookingId)
            .orElseThrow(() -> new Exception("Booking not found"));
    }

    public Booking markBookingInProgress(Long bookingId, Long userId) throws Exception {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new Exception("Booking not found"));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new Exception("User not found"));

        if (!booking.getUser().equals(user)) {
            throw new Exception("User not authorized to update this booking");
        }
        if (booking.getStatus() != BookingStatus.WORKER_COMPLETED) {
            throw new Exception("Only bookings marked as WORKER_COMPLETED can be reverted to IN_PROGRESS");
        }

        booking.setStatus(BookingStatus.IN_PROGRESS);
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }
}
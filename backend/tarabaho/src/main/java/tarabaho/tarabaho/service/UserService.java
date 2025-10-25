package tarabaho.tarabaho.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import tarabaho.tarabaho.dto.OtpInfo;
import tarabaho.tarabaho.entity.User;
import tarabaho.tarabaho.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoderService passwordEncoderService;

    @Autowired
    private JavaMailSender mailSender;
    
    private final ConcurrentHashMap<String, OtpInfo> otpMap = new ConcurrentHashMap<>();
    private static final String USER_TYPE = "user";

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public User registerUser(User user) {
        // Validate new fields
        if (user.getPreferredRadius() != null && user.getPreferredRadius() <= 0) {
            throw new IllegalArgumentException("Preferred radius must be greater than 0.");
        }
        // Hash password
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoderService.encodePassword(user.getPassword()));
        }
        return userRepository.save(user);
    }

    public Optional<User> findByUsername(String username) {
        return Optional.ofNullable(userRepository.findByUsername(username));
    }

    public User loginUser(String username, String password) throws Exception {
        User user = userRepository.findByUsername(username);
        if (user != null && passwordEncoderService.matches(password, user.getPassword())) {
            return user;
        } else {
            throw new Exception("Invalid username or password");
        }
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User not found");
        }
        userRepository.deleteById(id);
    }

    public Optional<User> findByPhoneNumber(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public User updateUserPhone(String email, String phoneNumber) throws Exception {
        User user = findByEmail(email)
            .orElseThrow(() -> new Exception("User not found with email: " + email));
        if (phoneNumber != null && !phoneNumber.isEmpty() &&
            userRepository.findByPhoneNumber(phoneNumber).isPresent() &&
            !phoneNumber.equals(user.getPhoneNumber())) {
            throw new IllegalArgumentException("Phone number already exists.");
        }
        user.setPhoneNumber(phoneNumber);
        return userRepository.save(user);
    }

    public User editUser(Long id, User updatedUser) throws Exception {
        User existingUser = userRepository.findById(id)
            .orElseThrow(() -> new Exception("User not found"));

        // Update existing fields
        existingUser.setFirstname(updatedUser.getFirstname());
        existingUser.setLastname(updatedUser.getLastname());
        existingUser.setUsername(updatedUser.getUsername());
        // Hash password if provided
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoderService.encodePassword(updatedUser.getPassword()));
        }
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setPhoneNumber(updatedUser.getPhoneNumber());
        existingUser.setLocation(updatedUser.getLocation());
        existingUser.setBirthday(updatedUser.getBirthday());
        existingUser.setProfilePicture(updatedUser.getProfilePicture());

        // Update new fields
        if (updatedUser.getLatitude() != null) {
            existingUser.setLatitude(updatedUser.getLatitude());
        }
        if (updatedUser.getLongitude() != null) {
            existingUser.setLongitude(updatedUser.getLongitude());
        }
        if (updatedUser.getPreferredRadius() != null) {
            if (updatedUser.getPreferredRadius() <= 0) {
                throw new IllegalArgumentException("Preferred radius must be greater than 0.");
            }
            existingUser.setPreferredRadius(updatedUser.getPreferredRadius());
        }
        if (updatedUser.getIsVerified() != null) {
            existingUser.setIsVerified(updatedUser.getIsVerified());
        }

        return userRepository.save(existingUser);
    }

    public void sendResetOtp(String email) throws Exception {
        Optional<User> userOpt = findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found with email: " + email);
        }

        String otpKey = USER_TYPE + ":" + email; // "user:john@example.com"
        String otp = String.format("%06d", new Random().nextInt(999999));
        Instant expiry = Instant.now().plusSeconds(600); // 10 minutes

        otpMap.put(otpKey, new OtpInfo(otp, expiry));

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Password Reset OTP");
        message.setText("Your OTP for password reset is: " + otp + ". It expires in 10 minutes.");
        try {
            mailSender.send(message);
            System.out.println("UserService: OTP email sent to " + email + " (key: " + otpKey + ")");
        } catch (Exception e) {
            otpMap.remove(otpKey); // Clean up OTP on failure
            throw new IllegalArgumentException("Failed to send OTP email: " + e.getMessage(), e);
        }
    }

    public void verifyAndReset(String email, String otp, String newPassword) throws Exception {
        String otpKey = USER_TYPE + ":" + email; // "user:john@example.com"
        OtpInfo info = otpMap.get(otpKey);
        if (info == null) {
            throw new IllegalArgumentException("No OTP found for this user email: " + email);
        }
        if (Instant.now().isAfter(info.getExpiry())) {
            otpMap.remove(otpKey);
            throw new IllegalArgumentException("OTP has expired for user: " + email);
        }
        if (!otp.equals(info.getOtp())) {
            throw new IllegalArgumentException("Invalid OTP for user: " + email);
        }

        User user = findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters long.");
        }
        user.setPassword(passwordEncoderService.encodePassword(newPassword));
        userRepository.save(user);

        otpMap.remove(otpKey); // Clean up OTP after successful reset
        System.out.println("UserService: Password reset successfully for user: " + email);
    }
    
}
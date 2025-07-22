package tarabaho.tarabaho.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tarabaho.tarabaho.entity.User;
import tarabaho.tarabaho.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoderService passwordEncoderService;

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
}
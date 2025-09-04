package tarabaho.tarabaho.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import tarabaho.tarabaho.dto.GraduateUpdateDTO;
import tarabaho.tarabaho.dto.UserUpdateDTO;
import tarabaho.tarabaho.entity.Admin;
import tarabaho.tarabaho.entity.Category;
import tarabaho.tarabaho.entity.CategoryRequest;
import tarabaho.tarabaho.entity.Certificate;
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.entity.User;
import tarabaho.tarabaho.repository.AdminRepository;
import tarabaho.tarabaho.repository.CategoryRepository;
import tarabaho.tarabaho.repository.CategoryRequestRepository;
import tarabaho.tarabaho.repository.GraduateRepository;
import tarabaho.tarabaho.repository.UserRepository;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private GraduateRepository graduateRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CategoryRequestRepository categoryRequestRepository;

    @Autowired
    private CertificateService certificateService;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoderService passwordEncoderService;

    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    public Admin findByUsername(String username) {
        return adminRepository.findByUsername(username);
    }

    public Optional<User> findUserById(Long id) {
        return userService.findById(id);
    }

    public Admin registerAdmin(Admin admin) throws Exception {
        if (adminRepository.findByUsername(admin.getUsername()) != null) {
            throw new Exception("Username already exists");
        }
        if (adminRepository.findByEmail(admin.getEmail()) != null) {
            throw new Exception("Email already exists");
        }
        // Hash password
        if (admin.getPassword() != null && !admin.getPassword().isEmpty()) {
            admin.setPassword(passwordEncoderService.encodePassword(admin.getPassword()));
        }
        return adminRepository.save(admin);
    }

    public Admin loginAdmin(String username, String password) throws Exception {
        Admin admin = adminRepository.findByUsername(username);
        if (admin != null && passwordEncoderService.matches(password, admin.getPassword())) {
            return admin;
        } else {
            throw new Exception("Invalid username or password");
        }
    }

    public void deleteAdmin(Long id) {
        if (!adminRepository.existsById(id)) {
            throw new IllegalArgumentException("Admin not found");
        }
        adminRepository.deleteById(id);
    }

    public Admin editAdmin(Long id, Admin updatedAdmin) throws Exception {
        Admin existingAdmin = adminRepository.findById(id)
            .orElseThrow(() -> new Exception("Admin not found"));

        // Update fields (avoid updating ID)
        existingAdmin.setFirstname(updatedAdmin.getFirstname());
        existingAdmin.setLastname(updatedAdmin.getLastname());
        existingAdmin.setUsername(updatedAdmin.getUsername());
        // Hash password if provided
        if (updatedAdmin.getPassword() != null && !updatedAdmin.getPassword().isEmpty()) {
            existingAdmin.setPassword(passwordEncoderService.encodePassword(updatedAdmin.getPassword()));
        }
        existingAdmin.setEmail(updatedAdmin.getEmail());
        existingAdmin.setAddress(updatedAdmin.getAddress());
        existingAdmin.setProfilePicture(updatedAdmin.getProfilePicture());

        // Check for duplicates (excluding this admin)
        Admin byUsername = adminRepository.findByUsername(updatedAdmin.getUsername());
        if (byUsername != null && !byUsername.getId().equals(id)) {
            throw new Exception("Username already exists");
        }
        Admin byEmail = adminRepository.findByEmail(updatedAdmin.getEmail());
        if (byEmail != null && !byEmail.getId().equals(id)) {
            throw new Exception("Email already exists");
        }

        return adminRepository.save(existingAdmin);
    }

    public Admin updateProfilePicture(Long id, String publicUrl) throws Exception {
        Admin admin = adminRepository.findById(id)
            .orElseThrow(() -> new Exception("Admin not found"));
        admin.setProfilePicture(publicUrl);
        return adminRepository.save(admin);
    }

    public Graduate editGraduate(Long id, GraduateUpdateDTO graduateDTO) throws Exception {
        Graduate existingGraduate = graduateRepository.findById(id)
            .orElseThrow(() -> new Exception("Graduate not found with id: " + id));

        System.out.println("AdminService: Editing graduate ID: " + id);

        // Update only the fields provided in the DTO
        if (graduateDTO.getEmail() != null && !graduateDTO.getEmail().equals(existingGraduate.getEmail())) {
            if (graduateRepository.findAllByEmail(graduateDTO.getEmail()).size() > 0) {
                throw new IllegalArgumentException("Email already exists.");
            }
            existingGraduate.setEmail(graduateDTO.getEmail());
            System.out.println("AdminService: Updated email to: " + graduateDTO.getEmail());
        }

        if (graduateDTO.getPhoneNumber() != null && !graduateDTO.getPhoneNumber().equals(existingGraduate.getPhoneNumber())) {
            if (!graduateDTO.getPhoneNumber().isEmpty() && graduateRepository.findAllByPhoneNumber(graduateDTO.getPhoneNumber()).size() > 0) {
                throw new IllegalArgumentException("Phone number already exists.");
            }
            existingGraduate.setPhoneNumber(graduateDTO.getPhoneNumber());
            System.out.println("AdminService: Updated phone number to: " + graduateDTO.getPhoneNumber());
        }

        if (graduateDTO.getAddress() != null) {
            existingGraduate.setAddress(graduateDTO.getAddress());
            System.out.println("AdminService: Updated address to: " + graduateDTO.getAddress());
        }

        if (graduateDTO.getBiography() != null) {
            existingGraduate.setBiography(graduateDTO.getBiography());
            System.out.println("AdminService: Updated biography to: " + graduateDTO.getBiography());
        }

        if (graduateDTO.getFirstName() != null) {
            existingGraduate.setFirstName(graduateDTO.getFirstName());
            System.out.println("AdminService: Updated first name to: " + graduateDTO.getFirstName());
        }

        if (graduateDTO.getLastName() != null) {
            existingGraduate.setLastName(graduateDTO.getLastName());
            System.out.println("AdminService: Updated last name to: " + graduateDTO.getLastName());
        }

        if (graduateDTO.getHourly() != null) {
            if (graduateDTO.getHourly() <= 0) {
                throw new IllegalArgumentException("Hourly rate must be greater than 0.");
            }
            existingGraduate.setHourly(graduateDTO.getHourly());
            System.out.println("AdminService: Updated hourly rate to: " + graduateDTO.getHourly());
        }

        if (graduateDTO.getBirthday() != null && !graduateDTO.getBirthday().isEmpty()) {
            try {
                existingGraduate.setBirthday(LocalDate.parse(graduateDTO.getBirthday()));
                System.out.println("AdminService: Updated birthday to: " + graduateDTO.getBirthday());
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid birthday format. Use YYYY-MM-DD.");
            }
        }

        // Only update password if explicitly provided and non-empty
        if (graduateDTO.getPassword() != null && !graduateDTO.getPassword().trim().isEmpty()) {
            String newHashedPassword = passwordEncoderService.encodePassword(graduateDTO.getPassword());
            existingGraduate.setPassword(newHashedPassword);
            System.out.println("AdminService: Updated password for graduate ID: " + id + " to new hash: " + newHashedPassword);
        } else {
            System.out.println("AdminService: Password not updated for graduate ID: " + id);
        }

        if (graduateDTO.getIsAvailable() != null) {
            existingGraduate.setIsAvailable(graduateDTO.getIsAvailable());
            System.out.println("AdminService: Updated isAvailable to: " + graduateDTO.getIsAvailable());
        }

        if (graduateDTO.getIsVerified() != null) {
            existingGraduate.setIsVerified(graduateDTO.getIsVerified());
            System.out.println("AdminService: Updated isVerified to: " + graduateDTO.getIsVerified());
        }

        if (graduateDTO.getLatitude() != null) {
            existingGraduate.setLatitude(graduateDTO.getLatitude());
            System.out.println("AdminService: Updated latitude to: " + graduateDTO.getLatitude());
        }

        if (graduateDTO.getLongitude() != null) {
            existingGraduate.setLongitude(graduateDTO.getLongitude());
            System.out.println("AdminService: Updated longitude to: " + graduateDTO.getLongitude());
        }

        if (graduateDTO.getAverageResponseTime() != null) {
            existingGraduate.setAverageResponseTime(graduateDTO.getAverageResponseTime());
            System.out.println("AdminService: Updated averageResponseTime to: " + graduateDTO.getAverageResponseTime());
        }

        Graduate updatedGraduate = graduateRepository.save(existingGraduate);
        System.out.println("AdminService: Graduate ID: " + id + " saved successfully");
        return updatedGraduate;
    }

    public Graduate addCategoriesToGraduate(Long graduateId, List<Long> categoryIds) throws Exception {
        Graduate graduate = graduateRepository.findById(graduateId)
            .orElseThrow(() -> new Exception("Graduate not found with id: " + graduateId));

        List<Category> categories = categoryRepository.findAllById(categoryIds);
        if (categories.size() != categoryIds.size()) {
            throw new IllegalArgumentException("One or more category IDs are invalid.");
        }

        // Add new categories, avoiding duplicates
        List<Category> currentCategories = graduate.getCategories();
        for (Category category : categories) {
            if (!currentCategories.contains(category)) {
                currentCategories.add(category);
            }
        }
        graduate.setCategories(currentCategories);

        return graduateRepository.save(graduate);
    }

    public List<Certificate> getCertificatesByGraduateId(Long graduateId) {
        return certificateService.getCertificatesByGraduateId(graduateId);
    }

    public void deleteGraduate(Long id) throws Exception {
        if (!graduateRepository.existsById(id)) {
            throw new Exception("Graduate not found with id: " + id);
        }
        graduateRepository.deleteById(id);
    }
    // NEW: Method to retrieve all pending category requests
    public List<CategoryRequest> getPendingCategoryRequests() {
        return categoryRequestRepository.findByStatus("PENDING");
    }

    // NEW: Method to approve a category request, adding the category to the graduate's profile
    @Transactional
    public void approveCategoryRequest(Long requestId) {
        CategoryRequest request = categoryRequestRepository.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Category request not found with ID: " + requestId));
        if (!request.getStatus().equals("PENDING")) {
            throw new IllegalArgumentException("Request is not in PENDING status.");
        }
        Graduate graduate = request.getGraduate();
        Category category = request.getCategory();
        if (graduate.getCategories() == null) {
            graduate.setCategories(new ArrayList<>());
        }
        graduate.getCategories().add(category);
        graduateRepository.save(graduate);
        request.setStatus("APPROVED");
        categoryRequestRepository.save(request);
    }

    // NEW: Method to deny a category request
    @Transactional
    public void denyCategoryRequest(Long requestId) {
        CategoryRequest request = categoryRequestRepository.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Category request not found with ID: " + requestId));
        if (!request.getStatus().equals("PENDING")) {
            throw new IllegalArgumentException("Request is not in PENDING status.");
        }
        request.setStatus("DENIED");
        categoryRequestRepository.save(request);
    }
    public User editUser(Long id, UserUpdateDTO userDTO) throws Exception {
        User existingUser = userRepository.findById(id)
            .orElseThrow(() -> new Exception("User not found with id: " + id));

        System.out.println("AdminService: Editing user ID: " + id);

        if (userDTO.getFirstname() != null) {
            existingUser.setFirstname(userDTO.getFirstname());
            System.out.println("AdminService: Updated firstname to: " + userDTO.getFirstname());
        }

        if (userDTO.getLastname() != null) {
            existingUser.setLastname(userDTO.getLastname());
            System.out.println("AdminService: Updated lastname to: " + userDTO.getLastname());
        }

        if (userDTO.getUsername() != null && !userDTO.getUsername().equals(existingUser.getUsername())) {
            if (userRepository.findByUsername(userDTO.getUsername()) != null) {
                throw new IllegalArgumentException("Username already exists.");
            }
            existingUser.setUsername(userDTO.getUsername());
            System.out.println("AdminService: Updated username to: " + userDTO.getUsername());
        }

        if (userDTO.getPassword() != null && !userDTO.getPassword().trim().isEmpty()) {
            String newHashedPassword = passwordEncoderService.encodePassword(userDTO.getPassword());
            existingUser.setPassword(newHashedPassword);
            System.out.println("AdminService: Updated password for user ID: " + id + " to new hash: " + newHashedPassword);
        } else {
            System.out.println("AdminService: Password not updated for user ID: " + id);
        }

        if (userDTO.getEmail() != null && !userDTO.getEmail().equals(existingUser.getEmail())) {
            if (userRepository.findAllByEmail(userDTO.getEmail()).size() > 0) {
                throw new IllegalArgumentException("Email already exists.");
            }
            existingUser.setEmail(userDTO.getEmail());
            System.out.println("AdminService: Updated email to: " + userDTO.getEmail());
        }

        if (userDTO.getPhoneNumber() != null && !userDTO.getPhoneNumber().equals(existingUser.getPhoneNumber())) {
            if (!userDTO.getPhoneNumber().isEmpty() && userRepository.findAllByPhoneNumber(userDTO.getPhoneNumber()).size() > 0) {
                throw new IllegalArgumentException("Phone number already exists.");
            }
            existingUser.setPhoneNumber(userDTO.getPhoneNumber());
            System.out.println("AdminService: Updated phone number to: " + userDTO.getPhoneNumber());
        }

        if (userDTO.getLocation() != null) {
            existingUser.setLocation(userDTO.getLocation());
            System.out.println("AdminService: Updated location to: " + userDTO.getLocation());
        }

        if (userDTO.getBirthday() != null && !userDTO.getBirthday().isEmpty()) {
            try {
                existingUser.setBirthday(LocalDate.parse(userDTO.getBirthday()));
                System.out.println("AdminService: Updated birthday to: " + userDTO.getBirthday());
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid birthday format. Use YYYY-MM-DD.");
            }
        }

        if (userDTO.getProfilePicture() != null) {
            existingUser.setProfilePicture(userDTO.getProfilePicture());
            System.out.println("AdminService: Updated profile picture to: " + userDTO.getProfilePicture());
        }

        if (userDTO.getLatitude() != null) {
            existingUser.setLatitude(userDTO.getLatitude());
            System.out.println("AdminService: Updated latitude to: " + userDTO.getLatitude());
        }

        if (userDTO.getLongitude() != null) {
            existingUser.setLongitude(userDTO.getLongitude());
            System.out.println("AdminService: Updated longitude to: " + userDTO.getLongitude());
        }

        if (userDTO.getPreferredRadius() != null) {
            if (userDTO.getPreferredRadius() <= 0) {
                throw new IllegalArgumentException("Preferred radius must be greater than 0.");
            }
            existingUser.setPreferredRadius(userDTO.getPreferredRadius());
            System.out.println("AdminService: Updated preferred radius to: " + userDTO.getPreferredRadius());
        }

        if (userDTO.getIsVerified() != null) {
            existingUser.setIsVerified(userDTO.getIsVerified());
            System.out.println("AdminService: Updated isVerified to: " + userDTO.getIsVerified());
        }

        User updatedUser = userRepository.save(existingUser);
        System.out.println("AdminService: User ID: " + id + " saved successfully");
        return updatedUser;
    }

}
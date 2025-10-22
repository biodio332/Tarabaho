package tarabaho.tarabaho.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.repository.GraduateRepository;

@Service
public class GraduateService {

    @Autowired
    private GraduateRepository graduateRepository;


    @Autowired
    private PasswordEncoderService passwordEncoderService;



 

    public Graduate registerOAuth2Graduate(Graduate graduate) {
        System.out.println("GraduateService: Registering OAuth2 graduate with username: " + graduate.getUsername());
        if (graduate.getCertificates() != null) {
            graduate.getCertificates().forEach(certificate -> certificate.setGraduate(graduate));
        }
        return graduateRepository.save(graduate); // Rely on @PrePersist for defaults
    }

    public Graduate registerGraduate(Graduate graduate) {
        System.out.println("GraduateService: Registering graduate with username: " + graduate.getUsername());
        // Validate new fields
      
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

   

  

    

    



   
}
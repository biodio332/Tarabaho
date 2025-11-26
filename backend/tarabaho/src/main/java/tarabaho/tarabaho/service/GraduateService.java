package tarabaho.tarabaho.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import tarabaho.tarabaho.dto.OtpInfo;
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.repository.GraduateRepository;

@Service
public class GraduateService {

    @Autowired
    private GraduateRepository graduateRepository;

    @Value("${app.frontend.url:https://tarabaho.vercel.app}")
    private String frontendUrl;

    @Autowired
    private PasswordEncoderService passwordEncoderService;

    @Autowired
    private JavaMailSender mailSender;

    private final ConcurrentHashMap<String, OtpInfo> otpMap = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, VerificationToken> verificationMap = new ConcurrentHashMap<>();

    private static final String GRADUATE_TYPE = "graduate";

 

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

    @Async
    public void sendResetOtp(String email) throws Exception {
        Optional<Graduate> graduateOpt = findByEmail(email);
        if (graduateOpt.isEmpty()) {
            throw new IllegalArgumentException("Graduate not found with email: " + email);
        }

        String otpKey = GRADUATE_TYPE + ":" + email; // "graduate:john@example.com"
        String otp = String.format("%06d", new Random().nextInt(999999));
        Instant expiry = Instant.now().plusSeconds(600); // 10 minutes

        otpMap.put(otpKey, new OtpInfo(otp, expiry));

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Password Reset OTP");
        message.setText("Your OTP for password reset is: " + otp + ". It expires in 10 minutes.");
        try {
            mailSender.send(message);
            System.out.println("GraduateService: OTP email sent to " + email + " (key: " + otpKey + ")");
        } catch (MailException e) {
            otpMap.remove(otpKey); // Clean up OTP on failure
            throw new IllegalArgumentException("Failed to send OTP email: " + e.getMessage(), e);
        }
    }

    public void verifyAndReset(String email, String otp, String newPassword) throws Exception {
        String otpKey = GRADUATE_TYPE + ":" + email; // "graduate:john@example.com"
        OtpInfo info = otpMap.get(otpKey);
        if (info == null) {
            throw new IllegalArgumentException("No OTP found for this graduate email: " + email);
        }
        if (Instant.now().isAfter(info.getExpiry())) {
            otpMap.remove(otpKey);
            throw new IllegalArgumentException("OTP has expired for graduate: " + email);
        }
        if (!otp.equals(info.getOtp())) {
            throw new IllegalArgumentException("Invalid OTP for graduate: " + email);
        }

        Graduate graduate = findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("Graduate not found with email: " + email));
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long.");
        }
        graduate.setPassword(passwordEncoderService.encodePassword(newPassword));
        graduateRepository.save(graduate);

        otpMap.remove(otpKey); // Clean up OTP after successful reset
        System.out.println("GraduateService: Password reset successfully for graduate: " + email);
    }

    @Async
    public void sendVerificationEmail(String email) throws Exception {
        Optional<Graduate> gradOpt = findByEmail(email);
        if (gradOpt.isEmpty()) {
            throw new IllegalArgumentException("Graduate not found with email: " + email);
        }
        Graduate graduate = gradOpt.get();

        String token = String.format("%06d", new Random().nextInt(999999));
        Instant expiry = Instant.now().plusSeconds(600);
        verificationMap.put(email, new VerificationToken(token, expiry));

    
       String verificationLink = frontendUrl + "/verify-email?token=" + token +
                "&email=" + URLEncoder.encode(email, StandardCharsets.UTF_8);
        

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(email);
        msg.setSubject("Verify your Tarabaho Graduate account");
        msg.setText(
            "Hi " + graduate.getFirstName() + ",\n\n" +
            "Your verification code is: " + token + "\n\n" +
            "Or click the link below to verify instantly (expires in 10 minutes):\n" +
            verificationLink + "\n\n" +
            "Thank you!\nTarabaho Team"
        );
        mailSender.send(msg);
    }
    @Async
    public void sendVerificationEmailAsync(String email) {
        try {
            sendVerificationEmail(email);
        } catch (Exception e) {
            // Log but don’t crash
            System.err.println("Async verification email failed: " + e.getMessage());
        }
    }

 
    public void verifyEmailToken(String token, String email) throws Exception {
        VerificationToken vt = verificationMap.get(email);
        if (vt == null) {
            throw new IllegalArgumentException("No verification request found for this email.");
        }
        if (Instant.now().isAfter(vt.getExpiry())) {
            verificationMap.remove(email);
            throw new IllegalArgumentException("Verification link has expired.");
        }
        if (!vt.getToken().equals(token)) {
            throw new IllegalArgumentException("Invalid verification token.");
        }

        Graduate graduate = findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Graduate not found."));
        graduate.setEmailVerified(true);
        graduateRepository.save(graduate);
        verificationMap.remove(email);
    }

    public void verifyOtp(String otp, String email) throws Exception {
        VerificationToken vt = verificationMap.get(email);
        if (vt == null) throw new IllegalArgumentException("No verification in progress.");
        if (Instant.now().isAfter(vt.getExpiry())) {
            verificationMap.remove(email);
            throw new IllegalArgumentException("OTP expired.");
        }
        if (!vt.getToken().equals(otp)) {
            throw new IllegalArgumentException("Invalid OTP.");
        }

        Graduate g = findByEmail(email).orElseThrow(() -> new IllegalArgumentException("Graduate not found."));
        g.setEmailVerified(true);
        graduateRepository.save(g);
        verificationMap.remove(email);
    }

    

    private static class VerificationToken {
        private final String token;
        private final Instant expiry;

        VerificationToken(String token, Instant expiry) {
            this.token = token;
            this.expiry = expiry;
        }
        public String getToken() { return token; }
        public Instant getExpiry() { return expiry; }
    }
}   
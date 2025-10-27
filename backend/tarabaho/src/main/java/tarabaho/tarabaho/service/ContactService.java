package tarabaho.tarabaho.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import tarabaho.tarabaho.entity.ContactInquiry;
import tarabaho.tarabaho.repository.ContactInquiryRepository;

@Service
public class ContactService {

    @Autowired
    private ContactInquiryRepository contactInquiryRepository;

    @Autowired
    private JavaMailSender mailSender;

    public ContactInquiry submitInquiry(ContactInquiry inquiry) throws MessagingException {
        // Save the inquiry
        ContactInquiry savedInquiry = contactInquiryRepository.save(inquiry);

        // Send confirmation email
        sendConfirmationEmail(savedInquiry);

        return savedInquiry;
    }

    public List<ContactInquiry> findAllInquiries() {
        return contactInquiryRepository.findAll();
    }

    public Optional<ContactInquiry> findInquiryById(Long id) {
        return contactInquiryRepository.findById(id);
    }

    public void deleteInquiry(Long id) {
        if (!contactInquiryRepository.existsById(id)) {
            throw new IllegalArgumentException("Inquiry not found with id: " + id);
        }
        contactInquiryRepository.deleteById(id);
    }

    private void sendConfirmationEmail(ContactInquiry inquiry) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, false); // Plain text, not HTML

        helper.setTo(inquiry.getEmail());
        helper.setSubject("Thank You for Your Contact Inquiry");
        helper.setText(
            String.format(
                "Dear %s,\n\n" +
                "Thank you for reaching out to us! We have received your inquiry with the following details:\n\n" +
                "Name: %s\n" +
                "Email: %s\n" +
                "Phone: %s\n" +
                "Address: %s\n" +
                "Message: %s\n\n" +
                "Our team will review your message and get back to you soon.\n\n" +
                "Best regards,\n" +
                "Tarabaho Team",
                inquiry.getFullName(),
                inquiry.getFullName(),
                inquiry.getEmail(),
                inquiry.getPhone() != null ? inquiry.getPhone() : "Not provided",
                inquiry.getAddress() != null ? inquiry.getAddress() : "Not provided",
                inquiry.getMessage()
            )
        );

        mailSender.send(message);
    }
}
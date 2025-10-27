package tarabaho.tarabaho.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import tarabaho.tarabaho.entity.ContactInquiry;
import tarabaho.tarabaho.service.ContactService;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Contact Controller", description = "Handles contact form submissions and feedback inquiries")
public class ContactController {

    private static final Logger log = LoggerFactory.getLogger(ContactController.class);

    @Autowired
    private ContactService contactService;

    @Operation(summary = "Submit contact form", description = "Submits a contact inquiry or feedback (publicly accessible)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Inquiry submitted successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input or submission failed")
    })
    @PostMapping("/submit")
    public ResponseEntity<?> submitContactForm(@RequestBody ContactInquiry inquiry) {
        try {
            log.debug("Processing contact form submission: email={}", inquiry.getEmail());
            ContactInquiry savedInquiry = contactService.submitInquiry(inquiry);
            log.debug("Saved inquiry: id={}, email={}", savedInquiry.getId(), savedInquiry.getEmail());
            return ResponseEntity.ok(savedInquiry);
        } catch (Exception e) {
            log.error("Failed to submit inquiry: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Failed to submit inquiry: " + e.getMessage());
        }
    }

    @Operation(summary = "Get all contact inquiries", description = "Retrieve all contact inquiries (admin only)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Inquiries retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Admin not authenticated"),
        @ApiResponse(responseCode = "403", description = "Not an admin"),
        @ApiResponse(responseCode = "400", description = "Failed to retrieve inquiries")
    })
    @GetMapping("/inquiries")
    public ResponseEntity<?> getInquiries(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("Unauthorized access to /inquiries: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin not authenticated");
            }
            String userType = getUserTypeFromAuthentication(authentication);
            if (!"ADMIN".equals(userType)) {
                log.warn("Forbidden access to /inquiries: userType={}", userType);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can access inquiries");
            }
            List<ContactInquiry> inquiries = contactService.findAllInquiries();
            log.debug("Retrieved {} inquiries", inquiries.size());
            return ResponseEntity.ok(inquiries);
        } catch (Exception e) {
            log.error("Failed to retrieve inquiries: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Failed to retrieve inquiries: " + e.getMessage());
        }
    }

    @Operation(summary = "Delete a contact inquiry", description = "Delete a contact inquiry by ID (admin only)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Inquiry deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Admin not authenticated"),
        @ApiResponse(responseCode = "403", description = "Not an admin"),
        @ApiResponse(responseCode = "404", description = "Inquiry not found"),
        @ApiResponse(responseCode = "400", description = "Failed to delete inquiry")
    })
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteInquiry(@PathVariable Long id, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("Unauthorized access to /delete/{}: Not authenticated", id);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin not authenticated");
            }
            String userType = getUserTypeFromAuthentication(authentication);
            if (!"ADMIN".equals(userType)) {
                log.warn("Forbidden access to /delete/{}: userType={}", id, userType);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can delete inquiries");
            }
            contactService.deleteInquiry(id);
            log.debug("Deleted inquiry: id={}", id);
            return ResponseEntity.ok("Inquiry deleted successfully");
        } catch (IllegalArgumentException e) {
            log.error("Failed to delete inquiry id={}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Inquiry not found");
        } catch (Exception e) {
            log.error("Failed to delete inquiry id={}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body("Failed to delete inquiry: " + e.getMessage());
        }
    }

    private String getUserTypeFromAuthentication(Authentication authentication) {
        if (authentication.getPrincipal() instanceof org.springframework.security.oauth2.core.user.OAuth2User) {
            org.springframework.security.oauth2.core.user.OAuth2User oauthUser = 
                (org.springframework.security.oauth2.core.user.OAuth2User) authentication.getPrincipal();
            String userType = oauthUser.getAttribute("userType");
            log.debug("OAuth2 user, extracted userType: {}", userType);
            return userType;
        } else if (authentication.getDetails() instanceof org.springframework.security.oauth2.jwt.Jwt) {
            org.springframework.security.oauth2.jwt.Jwt jwt = 
                (org.springframework.security.oauth2.jwt.Jwt) authentication.getDetails();
            String userType = jwt.getClaimAsString("userType");
            log.debug("JWT user, extracted userType: {}", userType);
            return userType;
        }
        log.debug("No userType found in authentication");
        return null;
    }
}
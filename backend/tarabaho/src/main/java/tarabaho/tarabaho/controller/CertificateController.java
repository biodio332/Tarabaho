package tarabaho.tarabaho.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import tarabaho.tarabaho.entity.Certificate;
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.service.CertificateService;
import tarabaho.tarabaho.service.GraduateService;

@RestController
@RequestMapping("/api/certificate")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Certificate Controller", description = "Handles management of TESDA certificates for graduates")
public class CertificateController {

    @Autowired
    private CertificateService certificateService;

    @Autowired
    private GraduateService graduateService;

    @Operation(summary = "Add a certificate for a graduate", description = "Associates a new TESDA certificate with a graduate, including an optional file upload. Requires JWT authentication.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Certificate added successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Unauthorized: Invalid or missing token"),
        @ApiResponse(responseCode = "404", description = "Graduate not found")
    })
    @PostMapping("/graduate/{graduateId}")
    public ResponseEntity<?> addCertificate(
            @PathVariable Long graduateId,
            @RequestPart("courseName") String courseName,
            @RequestPart("certificateNumber") String certificateNumber,
            @RequestPart("issueDate") String issueDate,
            @RequestPart(value = "portfolioId", required = false) Long portfolioId, // Make optional
            @RequestPart(value = "certificateFile", required = false) MultipartFile certificateFile,
            Authentication authentication
    ) {
        try {
            System.out.println("CertificateController: Adding certificate for graduate ID: " + graduateId + ", portfolioId: " + portfolioId);
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("CertificateController: Invalid or missing authentication");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: Invalid or missing token.");
            }

            String username = authentication.getName();
            Graduate graduate = graduateService.findById(graduateId);
            if (graduate == null) {
                System.out.println("CertificateController: Graduate not found for ID: " + graduateId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Graduate not found.");
            }
            if (!graduate.getUsername().equals(username)) {
                System.out.println("CertificateController: Unauthorized - username mismatch: " + username);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: User does not match graduate.");
            }

            Certificate certificate = certificateService.addCertificate(
                graduateId, courseName, certificateNumber, issueDate, certificateFile, portfolioId
            );
            System.out.println("CertificateController: Certificate added, ID: " + certificate.getId());
            return ResponseEntity.ok(certificate);
        } catch (Exception e) {
            System.out.println("CertificateController: Failed to add certificate: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to add certificate: " + e.getMessage());
        }
    }

    @Operation(summary = "Update a certificate", description = "Updates an existing TESDA certificate for the authenticated graduate, including an optional file upload")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Certificate updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input or unauthorized"),
        @ApiResponse(responseCode = "401", description = "Graduate not authenticated"),
        @ApiResponse(responseCode = "404", description = "Certificate or graduate not found")
    })
    @PutMapping("/{certificateId}")
    public ResponseEntity<?> updateCertificate(
            @PathVariable Long certificateId,
            @RequestPart("courseName") String courseName,
            @RequestPart("certificateNumber") String certificateNumber,
            @RequestPart("issueDate") String issueDate,
            @RequestPart("graduateId") String graduateIdStr,
            @RequestPart(value = "portfolioId", required = false) Long portfolioId, // Make optional
            @RequestPart(value = "certificateFile", required = false) MultipartFile certificateFile,
            Authentication authentication
    ) {
        try {
            System.out.println("CertificateController: Updating certificate ID: " + certificateId);
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("CertificateController: Graduate not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Graduate not authenticated.");
            }

            String username = authentication.getName();
            Long graduateId = Long.parseLong(graduateIdStr);
            Graduate graduate = graduateService.findById(graduateId);
            if (graduate == null) {
                System.out.println("CertificateController: Graduate not found for ID: " + graduateId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Graduate not found.");
            }
            if (!graduate.getUsername().equals(username)) {
                System.out.println("CertificateController: Unauthorized attempt to update certificate for another graduate");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Unauthorized: Cannot update certificate for another graduate.");
            }

            Certificate updatedCertificate = certificateService.updateCertificate(
                certificateId, graduateId, courseName, certificateNumber, issueDate, certificateFile, portfolioId
            );
            System.out.println("CertificateController: Certificate updated, ID: " + updatedCertificate.getId());
            return ResponseEntity.ok(updatedCertificate);
        } catch (Exception e) {
            System.out.println("CertificateController: Failed to update certificate: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to update certificate: " + e.getMessage());
        }
    }

    @Operation(summary = "Delete a certificate", description = "Deletes a TESDA certificate for the authenticated graduate")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Certificate deleted successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input or unauthorized"),
        @ApiResponse(responseCode = "401", description = "Graduate not authenticated"),
        @ApiResponse(responseCode = "404", description = "Certificate or graduate not found")
    })
    @DeleteMapping("/{certificateId}")
    public ResponseEntity<?> deleteCertificate(
            @PathVariable Long certificateId,
            Authentication authentication
    ) {
        try {
            System.out.println("CertificateController: Deleting certificate ID: " + certificateId);
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("CertificateController: Graduate not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Graduate not authenticated.");
            }

            String username = authentication.getName();
            Graduate graduate = graduateService.findByUsername(username)
                    .orElseThrow(() -> new Exception("Graduate not found for username: " + username));

            Certificate certificate = certificateService.getCertificateById(certificateId)
                    .orElseThrow(() -> new Exception("Certificate not found with ID: " + certificateId));

            if (!certificate.getGraduate().getId().equals(graduate.getId())) {
                System.out.println("CertificateController: Unauthorized attempt to delete certificate for another graduate");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Unauthorized: Cannot delete certificate for another graduate.");
            }

            certificateService.deleteCertificate(certificateId);
            System.out.println("CertificateController: Certificate deleted, ID: " + certificateId);
            return ResponseEntity.ok("Certificate deleted successfully");
        } catch (Exception e) {
            System.out.println("CertificateController: Failed to delete certificate: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to delete certificate: " + e.getMessage());
        }
    }

    @Operation(summary = "Get certificates for a graduate", description = "Retrieves all certificates associated with a graduate")
    @ApiResponse(responseCode = "200", description = "List of certificates returned successfully")
    @GetMapping("/graduate/{graduateId}")
    public ResponseEntity<List<Certificate>> getCertificatesByGraduateId(
            @PathVariable Long graduateId,
            Authentication authentication
    ) {
        try {
            System.out.println("CertificateController: Fetching certificates for graduate ID: " + graduateId);
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("CertificateController: Graduate not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
            }

            String username = authentication.getName();
            Graduate graduate = graduateService.findByUsername(username)
                    .orElseThrow(() -> new Exception("Graduate not found for username: " + username));

            if (!graduate.getId().equals(graduateId)) {
                System.out.println("CertificateController: Unauthorized attempt to fetch certificates for another graduate");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(null);
            }

            List<Certificate> certificates = certificateService.getCertificatesByGraduateId(graduateId);
            System.out.println("CertificateController: Retrieved " + certificates.size() + " certificates for graduate ID: " + graduateId);
            return ResponseEntity.ok(certificates);
        } catch (Exception e) {
            System.out.println("CertificateController: Failed to fetch certificates: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @Operation(summary = "Get a certificate by ID", description = "Retrieves a specific certificate by its ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Certificate returned successfully"),
        @ApiResponse(responseCode = "401", description = "Graduate not authenticated"),
        @ApiResponse(responseCode = "404", description = "Certificate not found")
    })
    @GetMapping("/{certificateId}")
    public ResponseEntity<?> getCertificateById(
            @PathVariable Long certificateId,
            Authentication authentication
    ) {
        try {
            System.out.println("CertificateController: Fetching certificate ID: " + certificateId);
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("CertificateController: Graduate not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Graduate not authenticated.");
            }

            Certificate certificate = certificateService.getCertificateById(certificateId)
                    .orElseThrow(() -> new Exception("Certificate not found with ID: " + certificateId));
            return ResponseEntity.ok(certificate);
        } catch (Exception e) {
            System.out.println("CertificateController: Failed to fetch certificate: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Certificate not found: " + e.getMessage());
        }
    }
}
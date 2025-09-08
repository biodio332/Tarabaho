package tarabaho.tarabaho.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
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

    private static final Logger logger = LoggerFactory.getLogger(CertificateController.class);

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
    @PostMapping(value = "/graduate/{graduateId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addCertificate(
            @PathVariable Long graduateId,
            @RequestPart("courseName") String courseName,
            @RequestPart("certificateNumber") String certificateNumber,
            @RequestPart("issueDate") String issueDate,
            @RequestPart(value = "portfolioId", required = false) String portfolioIdStr,
            @RequestPart(value = "certificateFile", required = false) MultipartFile certificateFile,
            Authentication authentication
    ) {
        try {
            logger.debug("Adding certificate for graduate ID: {}, portfolioId: {}, courseName: {}, certificateNumber: {}, issueDate: {}",
                    graduateId, portfolioIdStr, courseName, certificateNumber, issueDate);
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Invalid or missing authentication");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: Invalid or missing token.");
            }

            String username = authentication.getName();
            Graduate graduate = graduateService.findById(graduateId);
            if (graduate == null) {
                logger.warn("Graduate not found for ID: {}", graduateId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Graduate not found.");
            }
            if (!graduate.getUsername().equals(username)) {
                logger.warn("Unauthorized - username mismatch: {}", username);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: User does not match graduate.");
            }

            Long portfolioId = null;
            if (portfolioIdStr != null && !portfolioIdStr.trim().isEmpty()) {
                try {
                    portfolioId = Long.parseLong(portfolioIdStr);
                } catch (NumberFormatException e) {
                    logger.warn("Invalid portfolioId format: {}", portfolioIdStr);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid portfolioId format.");
                }
            }

            Certificate certificate = certificateService.addCertificate(
                graduateId, courseName, certificateNumber, issueDate, certificateFile, portfolioId
            );
            logger.info("Certificate added, ID: {}", certificate.getId());
            return ResponseEntity.ok(certificate);
        } catch (Exception e) {
            logger.error("Failed to add certificate: {}", e.getMessage(), e);
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
    @PutMapping(value = "/{certificateId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateCertificate(
            @PathVariable Long certificateId,
            @RequestPart("courseName") String courseName,
            @RequestPart("certificateNumber") String certificateNumber,
            @RequestPart("issueDate") String issueDate,
            @RequestPart("graduateId") String graduateIdStr,
            @RequestPart(value = "portfolioId", required = false) String portfolioIdStr,
            @RequestPart(value = "certificateFile", required = false) MultipartFile certificateFile,
            Authentication authentication
    ) {
        try {
            logger.debug("Updating certificate ID: {}, courseName: {}, certificateNumber: {}, issueDate: {}, graduateId: {}, portfolioId: {}",
                    certificateId, courseName, certificateNumber, issueDate, graduateIdStr, portfolioIdStr);
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Graduate not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Graduate not authenticated.");
            }

            String username = authentication.getName();
            Long graduateId;
            try {
                graduateId = Long.parseLong(graduateIdStr);
            } catch (NumberFormatException e) {
                logger.warn("Invalid graduateId format: {}", graduateIdStr);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid graduateId format.");
            }

            Graduate graduate = graduateService.findById(graduateId);
            if (graduate == null) {
                logger.warn("Graduate not found for ID: {}", graduateId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Graduate not found.");
            }
            if (!graduate.getUsername().equals(username)) {
                logger.warn("Unauthorized attempt to update certificate for another graduate: {}", username);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Unauthorized: Cannot update certificate for another graduate.");
            }

            Long portfolioId = null;
            if (portfolioIdStr != null && !portfolioIdStr.trim().isEmpty()) {
                try {
                    portfolioId = Long.parseLong(portfolioIdStr);
                } catch (NumberFormatException e) {
                    logger.warn("Invalid portfolioId format: {}", portfolioIdStr);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid portfolioId format.");
                }
            }

            Certificate updatedCertificate = certificateService.updateCertificate(
                certificateId, graduateId, courseName, certificateNumber, issueDate, certificateFile, portfolioId
            );
            logger.info("Certificate updated, ID: {}", updatedCertificate.getId());
            return ResponseEntity.ok(updatedCertificate);
        } catch (Exception e) {
            logger.error("Failed to update certificate: {}", e.getMessage(), e);
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
            logger.debug("Deleting certificate ID: {}", certificateId);
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Graduate not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Graduate not authenticated.");
            }

            String username = authentication.getName();
            Graduate graduate = graduateService.findByUsername(username)
                    .orElseThrow(() -> new Exception("Graduate not found for username: " + username));

            Certificate certificate = certificateService.getCertificateById(certificateId)
                    .orElseThrow(() -> new Exception("Certificate not found with ID: " + certificateId));

            if (!certificate.getGraduate().getId().equals(graduate.getId())) {
                logger.warn("Unauthorized attempt to delete certificate for another graduate: {}", username);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Unauthorized: Cannot delete certificate for another graduate.");
            }

            certificateService.deleteCertificate(certificateId);
            logger.info("Certificate deleted, ID: {}", certificateId);
            return ResponseEntity.ok("Certificate deleted successfully");
        } catch (Exception e) {
            logger.error("Failed to delete certificate: {}", e.getMessage(), e);
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
            logger.debug("Fetching certificates for graduate ID: {}", graduateId);
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Graduate not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
            }

            String username = authentication.getName();
            Graduate graduate = graduateService.findByUsername(username)
                    .orElseThrow(() -> new Exception("Graduate not found for username: " + username));

            if (!graduate.getId().equals(graduateId)) {
                logger.warn("Unauthorized attempt to fetch certificates for another graduate: {}", username);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(null);
            }

            List<Certificate> certificates = certificateService.getCertificatesByGraduateId(graduateId);
            logger.info("Retrieved {} certificates for graduate ID: {}", certificates.size(), graduateId);
            return ResponseEntity.ok(certificates);
        } catch (Exception e) {
            logger.error("Failed to fetch certificates: {}", e.getMessage(), e);
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
            logger.debug("Fetching certificate ID: {}", certificateId);
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Graduate not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Graduate not authenticated.");
            }

            Certificate certificate = certificateService.getCertificateById(certificateId)
                    .orElseThrow(() -> new Exception("Certificate not found with ID: " + certificateId));
            return ResponseEntity.ok(certificate);
        } catch (Exception e) {
            logger.error("Failed to fetch certificate: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Certificate not found: " + e.getMessage());
        }
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<String> handleMediaTypeNotSupported(HttpMediaTypeNotSupportedException ex) {
        logger.warn("Media type not supported: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                .body("Unsupported media type: " + ex.getContentType());
    }
}
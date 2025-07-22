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
import tarabaho.tarabaho.entity.Worker;
import tarabaho.tarabaho.service.CertificateService;
import tarabaho.tarabaho.service.WorkerService;

@RestController
@RequestMapping("/api/certificate")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Certificate Controller", description = "Handles management of TESDA certificates for workers")
public class CertificateController {

    @Autowired
    private CertificateService certificateService;

    @Autowired
    private WorkerService workerService;

    @Operation(summary = "Add a certificate for a worker", description = "Associates a new TESDA certificate with a worker, including an optional file upload. Requires authentication for logged-in users.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Certificate added successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input or unauthorized"),
        @ApiResponse(responseCode = "401", description = "Worker not authenticated"),
        @ApiResponse(responseCode = "404", description = "Worker not found")
    })
    @PostMapping("/worker/{workerId}")
    public ResponseEntity<?> addCertificate(
            @PathVariable Long workerId,
            @RequestPart("courseName") String courseName,
            @RequestPart("certificateNumber") String certificateNumber,
            @RequestPart("issueDate") String issueDate,
            @RequestPart(value = "certificateFile", required = false) MultipartFile certificateFile,
            Authentication authentication
    ) {
        try {
            System.out.println("CertificateController: Adding certificate for worker ID: " + workerId);

            // Validate worker existence
            Worker worker = workerService.findById(workerId);
            if (worker == null) {
                System.out.println("CertificateController: Worker not found for ID: " + workerId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Worker not found.");
            }

            // Enforce authentication for logged-in users
            if (authentication != null && authentication.isAuthenticated()) {
                String username = authentication.getName();
                Worker authenticatedWorker = workerService.findByUsername(username)
                        .orElseThrow(() -> new Exception("Worker not found for username: " + username));
                if (!authenticatedWorker.getId().equals(workerId)) {
                    System.out.println("CertificateController: Unauthorized attempt to add certificate for another worker");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body("Unauthorized: Cannot add certificate for another worker.");
                }
            }

            Certificate certificate = certificateService.addCertificate(
                workerId, courseName, certificateNumber, issueDate, certificateFile
            );
            System.out.println("CertificateController: Certificate added, ID: " + certificate.getId());
            return ResponseEntity.ok(certificate);
        } catch (Exception e) {
            System.out.println("CertificateController: Failed to add certificate: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to add certificate: " + e.getMessage());
        }
    }

    @Operation(summary = "Update a certificate", description = "Updates an existing TESDA certificate for the authenticated worker, including an optional file upload")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Certificate updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input or unauthorized"),
        @ApiResponse(responseCode = "401", description = "Worker not authenticated"),
        @ApiResponse(responseCode = "404", description = "Certificate or worker not found")
    })
    @PutMapping("/{certificateId}")
    public ResponseEntity<?> updateCertificate(
            @PathVariable Long certificateId,
            @RequestPart("courseName") String courseName,
            @RequestPart("certificateNumber") String certificateNumber,
            @RequestPart("issueDate") String issueDate,
            @RequestPart("workerId") String workerIdStr,
            @RequestPart(value = "certificateFile", required = false) MultipartFile certificateFile,
            Authentication authentication
    ) {
        try {
            System.out.println("CertificateController: Updating certificate ID: " + certificateId);
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("CertificateController: Worker not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Worker not authenticated.");
            }

            String username = authentication.getName();
            Long workerId = Long.parseLong(workerIdStr);
            Worker worker = workerService.findById(workerId);
            if (worker == null) {
                System.out.println("CertificateController: Worker not found for ID: " + workerId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Worker not found.");
            }
            if (!worker.getUsername().equals(username)) {
                System.out.println("CertificateController: Unauthorized attempt to update certificate for another worker");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Unauthorized: Cannot update certificate for another worker.");
            }

            Certificate updatedCertificate = certificateService.updateCertificate(
                certificateId, workerId, courseName, certificateNumber, issueDate, certificateFile
            );
            System.out.println("CertificateController: Certificate updated, ID: " + updatedCertificate.getId());
            return ResponseEntity.ok(updatedCertificate);
        } catch (Exception e) {
            System.out.println("CertificateController: Failed to update certificate: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to update certificate: " + e.getMessage());
        }
    }

    @Operation(summary = "Delete a certificate", description = "Deletes a TESDA certificate for the authenticated worker")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Certificate deleted successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input or unauthorized"),
        @ApiResponse(responseCode = "401", description = "Worker not authenticated"),
        @ApiResponse(responseCode = "404", description = "Certificate or worker not found")
    })
    @DeleteMapping("/{certificateId}")
    public ResponseEntity<?> deleteCertificate(
            @PathVariable Long certificateId,
            Authentication authentication
    ) {
        try {
            System.out.println("CertificateController: Deleting certificate ID: " + certificateId);
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("CertificateController: Worker not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Worker not authenticated.");
            }

            String username = authentication.getName();
            Worker worker = workerService.findByUsername(username)
                    .orElseThrow(() -> new Exception("Worker not found for username: " + username));

            Certificate certificate = certificateService.getCertificateById(certificateId)
                    .orElseThrow(() -> new Exception("Certificate not found with ID: " + certificateId));

            if (!certificate.getWorker().getId().equals(worker.getId())) {
                System.out.println("CertificateController: Unauthorized attempt to delete certificate for another worker");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Unauthorized: Cannot delete certificate for another worker.");
            }

            certificateService.deleteCertificate(certificateId);
            System.out.println("CertificateController: Certificate deleted, ID: " + certificateId);
            return ResponseEntity.ok("Certificate deleted successfully");
        } catch (Exception e) {
            System.out.println("CertificateController: Failed to delete certificate: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to delete certificate: " + e.getMessage());
        }
    }

    @Operation(summary = "Get certificates for a worker", description = "Retrieves all certificates associated with a worker")
    @ApiResponse(responseCode = "200", description = "List of certificates returned successfully")
    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<Certificate>> getCertificatesByWorkerId(
            @PathVariable Long workerId,
            Authentication authentication
    ) {
        try {
            System.out.println("CertificateController: Fetching certificates for worker ID: " + workerId);
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("CertificateController: Worker not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
            }

            String username = authentication.getName();
            Worker worker = workerService.findByUsername(username)
                    .orElseThrow(() -> new Exception("Worker not found for username: " + username));

            if (!worker.getId().equals(workerId)) {
                System.out.println("CertificateController: Unauthorized attempt to fetch certificates for another worker");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(null);
            }

            List<Certificate> certificates = certificateService.getCertificatesByWorkerId(workerId);
            System.out.println("CertificateController: Retrieved " + certificates.size() + " certificates for worker ID: " + workerId);
            return ResponseEntity.ok(certificates);
        } catch (Exception e) {
            System.out.println("CertificateController: Failed to fetch certificates: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @Operation(summary = "Get a certificate by ID", description = "Retrieves a specific certificate by its ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Certificate returned successfully"),
        @ApiResponse(responseCode = "401", description = "Worker not authenticated"),
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
                System.out.println("CertificateController: Worker not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Worker not authenticated.");
            }

            String username = authentication.getName();
            Worker worker = workerService.findByUsername(username)
                    .orElseThrow(() -> new Exception("Worker not found for username: " + username));

            Certificate certificate = certificateService.getCertificateById(certificateId)
                    .orElseThrow(() -> new Exception("Certificate not found with ID: " + certificateId));

            if (!certificate.getWorker().getId().equals(worker.getId())) {
                System.out.println("CertificateController: Unauthorized attempt to fetch certificate for another worker");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Unauthorized: Cannot fetch certificate for another worker.");
            }

            System.out.println("CertificateController: Certificate retrieved, ID: " + certificateId);
            return ResponseEntity.ok(certificate);
        } catch (Exception e) {
            System.out.println("CertificateController: Failed to fetch certificate: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to fetch certificate: " + e.getMessage());
        }
    }
}
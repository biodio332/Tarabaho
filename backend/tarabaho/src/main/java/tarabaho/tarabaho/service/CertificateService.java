package tarabaho.tarabaho.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.multipart.MultipartFile;

import jakarta.transaction.Transactional;
import tarabaho.tarabaho.entity.Certificate;
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.entity.Portfolio;
import tarabaho.tarabaho.repository.CertificateRepository;
import tarabaho.tarabaho.repository.GraduateRepository;
import tarabaho.tarabaho.repository.PortfolioRepository;

@Service
public class CertificateService {

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private GraduateRepository graduateRepository;

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private SupabaseRestStorageService storageService;

    public Certificate addCertificate(
            Long graduateId,
            String courseName,
            String certificateNumber,
            String issueDate,
            MultipartFile certificateFile,
            Long portfolioId // Nullable
    ) throws Exception {
        System.out.println("CertificateService: Adding certificate for graduate ID: " + graduateId + ", portfolioId: " + portfolioId);
        Graduate graduate = graduateRepository.findById(graduateId)
                .orElseThrow(() -> new Exception("Graduate not found with id: " + graduateId));

        // Validate portfolioId if provided
        if (portfolioId != null) {
            Optional<Portfolio> portfolioOpt = portfolioRepository.findById(portfolioId);
            if (!portfolioOpt.isPresent() || !portfolioOpt.get().getGraduate().getId().equals(graduateId)) {
                throw new Exception("Invalid portfolio ID: " + portfolioId + " does not belong to graduate ID: " + graduateId);
            }
        }

        Certificate certificate = new Certificate();
        certificate.setCourseName(courseName);
        certificate.setCertificateNumber(certificateNumber);
        certificate.setIssueDate(issueDate);
        certificate.setGraduate(graduate);
        certificate.setPortfolioId(portfolioId); // Can be null

        if (certificateFile != null && !certificateFile.isEmpty()) {
            String publicUrl = storageService.uploadFile(certificateFile, "certificates");
            certificate.setCertificateFilePath(publicUrl);
        }

        Certificate savedCertificate = certificateRepository.save(certificate);
        System.out.println("CertificateService: Certificate saved, ID: " + savedCertificate.getId());
        return savedCertificate;
    }

    public Certificate updateCertificate(
            Long certificateId,
            Long graduateId,
            String courseName,
            String certificateNumber,
            String issueDate,
            MultipartFile certificateFile,
            Long portfolioId // Nullable
    ) throws Exception {
        System.out.println("CertificateService: Updating certificate ID: " + certificateId);
        Certificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new Exception("Certificate not found with id: " + certificateId));

        Graduate graduate = graduateRepository.findById(graduateId)
                .orElseThrow(() -> new Exception("Graduate not found with id: " + graduateId));

        if (!certificate.getGraduate().getId().equals(graduateId)) {
            throw new Exception("Certificate ID: " + certificateId + " does not belong to graduate ID: " + graduateId);
        }

        // Validate portfolioId if provided
        if (portfolioId != null) {
            Optional<Portfolio> portfolioOpt = portfolioRepository.findById(portfolioId);
            if (!portfolioOpt.isPresent() || !portfolioOpt.get().getGraduate().getId().equals(graduateId)) {
                throw new Exception("Invalid portfolio ID: " + portfolioId + " does not belong to graduate ID: " + graduateId);
            }
        }

        certificate.setCourseName(courseName);
        certificate.setCertificateNumber(certificateNumber);
        certificate.setIssueDate(issueDate);
        certificate.setGraduate(graduate);
        certificate.setPortfolioId(portfolioId); // Allow null to preserve unlinked state

        if (certificateFile != null && !certificateFile.isEmpty()) {
            // Delete old file from Supabase if exists
            if (certificate.getCertificateFilePath() != null) {
                String oldFileName = certificate.getCertificateFilePath()
                        .substring(certificate.getCertificateFilePath().lastIndexOf("/") + 1);
                try {
                    storageService.deleteFile("certificates", oldFileName);
                    System.out.println("CertificateService: Deleted old file from Supabase: " + oldFileName);
                } catch (HttpClientErrorException e) {
                    if (e.getStatusCode().value() == 404) {
                        System.out.println("CertificateService: Old file not found in Supabase (already deleted?): " + oldFileName);
                    } else {
                        System.err.println("CertificateService: Failed to delete old file from Supabase: " + e.getMessage());
                    }
                } catch (Exception e) {
                    System.err.println("CertificateService: Unexpected error deleting old file from Supabase: " + e.getMessage());
                }
            }
            String publicUrl = storageService.uploadFile(certificateFile, "certificates");
            certificate.setCertificateFilePath(publicUrl);
        }

        Certificate updatedCertificate = certificateRepository.save(certificate);
        System.out.println("CertificateService: Certificate updated, ID: " + updatedCertificate.getId());
        return updatedCertificate;
    }

    public void deleteCertificate(Long certificateId) throws Exception {
        System.out.println("CertificateService: Deleting certificate ID: " + certificateId);
        Certificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new Exception("Certificate not found with id: " + certificateId));

        // Delete file from Supabase
        if (certificate.getCertificateFilePath() != null) {
            String fileName = certificate.getCertificateFilePath()
                    .substring(certificate.getCertificateFilePath().lastIndexOf("/") + 1);
            try {
                storageService.deleteFile("certificates", fileName);
                System.out.println("CertificateService: Deleted file from Supabase: " + fileName);
            } catch (HttpClientErrorException e) {
                if (e.getStatusCode().value() == 404) {
                    System.out.println("CertificateService: File not found in Supabase (already deleted?): " + fileName);
                } else {
                    throw new Exception("Failed to delete file from Supabase: " + e.getMessage());
                }
            } catch (Exception e) {
                throw new Exception("Unexpected error deleting file from Supabase: " + e.getMessage());
            }
        }

        certificateRepository.deleteById(certificateId);
        System.out.println("CertificateService: Certificate deleted, ID: " + certificateId);
    }

    @Transactional
    public void deleteCertificatesByPortfolioId(Long portfolioId) {
        System.out.println("CertificateService: Deleting certificates for portfolio ID: " + portfolioId);
        List<Certificate> certificates = certificateRepository.findByPortfolioId(portfolioId);
        if (certificates.isEmpty()) {
            System.out.println("CertificateService: No certificates found for portfolio ID: " + portfolioId);
            return;
        }

        for (Certificate certificate : certificates) {
            if (certificate.getPortfolioId() != null && certificate.getPortfolioId().equals(portfolioId)) {
                // Delete only certificates explicitly associated with this portfolio
                try {
                    certificateRepository.deleteById(certificate.getId());
                    System.out.println("CertificateService: Deleted certificate ID: " + certificate.getId());
                } catch (Exception e) {
                    System.err.println("CertificateService: Failed to delete certificate ID: " + certificate.getId() + ", error: " + e.getMessage());
                    throw new RuntimeException("Failed to delete certificate ID: " + certificate.getId(), e);
                }
            } else {
                System.out.println("CertificateService: Skipped certificate ID: " + certificate.getId() + " with null or non-matching portfolio ID");
            }
        }
    }

    public Optional<Certificate> getCertificateById(Long certificateId) {
        System.out.println("CertificateService: Fetching certificate ID: " + certificateId);
        Optional<Certificate> certificate = certificateRepository.findById(certificateId);
        if (certificate.isPresent()) {
            System.out.println("CertificateService: Certificate found, ID: " + certificateId);
        } else {
            System.out.println("CertificateService: Certificate not found, ID: " + certificateId);
        }
        return certificate;
    }

    public List<Certificate> getCertificatesByGraduateId(Long graduateId) {
        System.out.println("CertificateService: Fetching certificates for graduate ID: " + graduateId);
        List<Certificate> certificates = certificateRepository.findByGraduateId(graduateId);
        System.out.println("CertificateService: Retrieved " + certificates.size() + " certificates");
        return certificates;
    }
}
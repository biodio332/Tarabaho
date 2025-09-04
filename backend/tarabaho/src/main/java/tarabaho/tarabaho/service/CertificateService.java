package tarabaho.tarabaho.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import tarabaho.tarabaho.entity.Certificate;
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.repository.CertificateRepository;
import tarabaho.tarabaho.repository.GraduateRepository;

@Service
public class CertificateService {

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private GraduateRepository graduateRepository;

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

        certificate.setCourseName(courseName);
        certificate.setCertificateNumber(certificateNumber);
        certificate.setIssueDate(issueDate);
        certificate.setGraduate(graduate);
        certificate.setPortfolioId(portfolioId); // Can be null

        if (certificateFile != null && !certificateFile.isEmpty()) {
            // Delete old file from Supabase if exists
            if (certificate.getCertificateFilePath() != null) {
                String oldFileName = certificate.getCertificateFilePath()
                        .substring(certificate.getCertificateFilePath().lastIndexOf("/") + 1);
                storageService.deleteFile("certificates", oldFileName);
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
            storageService.deleteFile("certificates", fileName);
        }

        certificateRepository.deleteById(certificateId);
        System.out.println("CertificateService: Certificate deleted, ID: " + certificateId);
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

    public void deleteCertificatesByPortfolioId(Long portfolioId) throws Exception {
        System.out.println("CertificateService: Deleting certificates for portfolio ID: " + portfolioId);
        List<Certificate> certificates = certificateRepository.findByPortfolioId(portfolioId);
        for (Certificate certificate : certificates) {
            if (certificate.getCertificateFilePath() != null) {
                String fileName = certificate.getCertificateFilePath()
                        .substring(certificate.getCertificateFilePath().lastIndexOf("/") + 1);
                storageService.deleteFile("certificates", fileName);
            }
            certificateRepository.deleteById(certificate.getId());
            System.out.println("CertificateService: Deleted certificate ID: " + certificate.getId());
        }
    }

    public List<Certificate> getCertificatesByGraduateId(Long graduateId) {
        System.out.println("CertificateService: Fetching certificates for graduate ID: " + graduateId);
        List<Certificate> certificates = certificateRepository.findByGraduateId(graduateId);
        System.out.println("CertificateService: Retrieved " + certificates.size() + " certificates");
        return certificates;
    }
}
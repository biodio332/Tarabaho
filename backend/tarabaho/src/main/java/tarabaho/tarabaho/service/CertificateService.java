package tarabaho.tarabaho.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import tarabaho.tarabaho.entity.Certificate;
import tarabaho.tarabaho.entity.Worker;
import tarabaho.tarabaho.repository.CertificateRepository;
import tarabaho.tarabaho.repository.WorkerRepository;

@Service
public class CertificateService {

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private SupabaseRestStorageService storageService;

    public Certificate addCertificate(
            Long workerId,
            String courseName,
            String certificateNumber,
            String issueDate,
            MultipartFile certificateFile
    ) throws Exception {
        System.out.println("CertificateService: Adding certificate for worker ID: " + workerId);
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new Exception("Worker not found with id: " + workerId));

        Certificate certificate = new Certificate();
        certificate.setCourseName(courseName);
        certificate.setCertificateNumber(certificateNumber);
        certificate.setIssueDate(issueDate);
        certificate.setWorker(worker);

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
            Long workerId,
            String courseName,
            String certificateNumber,
            String issueDate,
            MultipartFile certificateFile
    ) throws Exception {
        System.out.println("CertificateService: Updating certificate ID: " + certificateId);
        Certificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new Exception("Certificate not found with id: " + certificateId));

        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new Exception("Worker not found with id: " + workerId));

        certificate.setCourseName(courseName);
        certificate.setCertificateNumber(certificateNumber);
        certificate.setIssueDate(issueDate);
        certificate.setWorker(worker);

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

    public List<Certificate> getCertificatesByWorkerId(Long workerId) {
        System.out.println("CertificateService: Fetching certificates for worker ID: " + workerId);
        List<Certificate> certificates = certificateRepository.findByWorkerId(workerId);
        System.out.println("CertificateService: Retrieved " + certificates.size() + " certificates");
        return certificates;
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
}
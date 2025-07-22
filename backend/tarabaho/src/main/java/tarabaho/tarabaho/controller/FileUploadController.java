package tarabaho.tarabaho.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import tarabaho.tarabaho.service.SupabaseRestStorageService;

@RestController
public class FileUploadController {

    @Autowired
    private SupabaseRestStorageService storageService;

    @PostMapping("/upload/profile-picture")
    public ResponseEntity<String> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        try {
            String publicUrl = storageService.uploadFile(file, "profile-picture");
            return ResponseEntity.ok(publicUrl);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Failed to upload file: " + e.getMessage());
        }
    }

    @PostMapping("/upload/certificate")
    public ResponseEntity<String> uploadCertificate(@RequestParam("file") MultipartFile file) {
        try {
            String publicUrl = storageService.uploadFile(file, "certificates");
            return ResponseEntity.ok(publicUrl);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Failed to upload file: " + e.getMessage());
        }
    }
}
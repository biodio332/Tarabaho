package tarabaho.tarabaho.service;

import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
public class SupabaseRestStorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service_role_key}")
    private String serviceRoleKey;

    private final RestTemplate restTemplate;

    public SupabaseRestStorageService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String uploadFile(MultipartFile file, String bucketName) throws IOException {
        // Validate file type
        String contentType = file.getContentType();
        if (bucketName.equals("profile-picture") && !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed for profile pictures");
        }
        if (bucketName.equals("certificates") && !contentType.matches("application/pdf|image/.*")) {
            throw new IllegalArgumentException("Only PDF or image files are allowed for certificates");
        }

        // Generate unique file name
        String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();

        // Set headers
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceRoleKey);
        headers.set("Content-Type", file.getContentType());

        // Create request entity
        HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

        // REST API endpoint
        String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + fileName;

        try {
            // Send POST request
            ResponseEntity<String> response = restTemplate.exchange(
                uploadUrl,
                HttpMethod.POST,
                requestEntity,
                String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                return supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + fileName;
            } else {
                throw new IOException("Failed to upload file: " + response.getBody());
            }
        } catch (HttpClientErrorException e) {
            throw new IOException("Supabase error: " + e.getResponseBodyAsString(), e);
        }
    }

    public void deleteFile(String bucketName, String fileName) throws IOException {
        // Set headers
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceRoleKey);

        // Create request entity
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        // REST API endpoint
        String deleteUrl = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + fileName;

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                deleteUrl,
                HttpMethod.DELETE,
                requestEntity,
                String.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new IOException("Failed to delete file: " + response.getBody());
            }
        } catch (HttpClientErrorException e) {
            throw new IOException("Supabase error: " + e.getResponseBodyAsString(), e);
        }
    }
}
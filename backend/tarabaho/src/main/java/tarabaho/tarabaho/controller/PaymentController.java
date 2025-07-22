package tarabaho.tarabaho.controller;



import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Value("${paymongo.secret.key}")
    private String paymongoSecretKey;

    private final RestTemplate restTemplate = new RestTemplate();

    // Create a Payment Intent
    @PostMapping("/intent")
    public ResponseEntity<Map<String, Object>> createPaymentIntent(@RequestBody Map<String, Object> request) {
        System.out.println("Creating Payment Intent with request: " + request);
        try {
            String url = "https://api.paymongo.com/v1/payment_intents";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Basic " + java.util.Base64.getEncoder().encodeToString((paymongoSecretKey + ":").getBytes()));
            headers.set("Content-Type", "application/json");

            Map<String, Object> payload = new HashMap<>();
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("amount", request.get("amount"));
            attributes.put("currency", "PHP");
            attributes.put("description", request.get("description"));
            attributes.put("payment_method_allowed", new String[]{"gcash"});
            attributes.put("payment_method_options", new HashMap<>());
            payload.put("data", new HashMap<String, Object>() {{
                put("attributes", attributes);
            }});

            System.out.println("Payment Intent Payload: " + payload);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            System.out.println("Payment Intent Response: " + response.getBody());
            return ResponseEntity.ok(response.getBody());
        } catch (HttpClientErrorException e) {
            System.err.println("PayMongo error creating Payment Intent: Status " + e.getStatusCode() + ", Response: " + e.getResponseBodyAsString());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create payment intent: " + e.getMessage());
            return ResponseEntity.status(e.getStatusCode()).body(errorResponse);
        } catch (Exception e) {
            System.err.println("Unexpected error creating Payment Intent: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create payment intent: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Create a Payment Method
    @PostMapping("/method")
    public ResponseEntity<Map<String, Object>> createPaymentMethod(@RequestBody Map<String, Object> request) {
        System.out.println("Creating Payment Method with request: " + request);
        try {
            String url = "https://api.paymongo.com/v1/payment_methods";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Basic " + java.util.Base64.getEncoder().encodeToString((paymongoSecretKey + ":").getBytes()));
            headers.set("Content-Type", "application/json");

            Map<String, Object> payload = new HashMap<>();
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("type", request.get("type"));
            Map<String, Object> billing = new HashMap<>();
            billing.put("name", request.get("name"));
            billing.put("email", request.get("email"));
            billing.put("phone", request.get("phone"));
            attributes.put("billing", billing);
            payload.put("data", new HashMap<String, Object>() {{
                put("attributes", attributes);
            }});

            System.out.println("Payment Method Payload: " + payload);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            System.out.println("Payment Method Response: " + response.getBody());
            return ResponseEntity.ok(response.getBody());
        } catch (HttpClientErrorException e) {
            System.err.println("PayMongo error creating Payment Method: Status " + e.getStatusCode() + ", Response: " + e.getResponseBodyAsString());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create payment method: " + e.getMessage());
            return ResponseEntity.status(e.getStatusCode()).body(errorResponse);
        } catch (Exception e) {
            System.err.println("Unexpected error creating Payment Method: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create payment method: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Attach Payment Method to Payment Intent
    @PostMapping("/intent/attach/{intentId}")
    public ResponseEntity<Map<String, Object>> attachPaymentMethod(@PathVariable String intentId, @RequestBody Map<String, Object> request) {
        System.out.println("Attaching Payment Method to Intent ID: " + intentId + ", Request: " + request);
        if (intentId == null || intentId.isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Payment Intent ID is required");
            return ResponseEntity.status(400).body(errorResponse);
        }
        if (request.get("payment_method") == null || request.get("client_key") == null || request.get("return_url") == null) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Missing required fields: payment_method, client_key, or return_url");
            return ResponseEntity.status(400).body(errorResponse);
        }
        try {
            String url = "https://api.paymongo.com/v1/payment_intents/" + intentId + "/attach";
            HttpHeaders headers = new	HttpHeaders();
            headers.set("Authorization", "Basic " + java.util.Base64.getEncoder().encodeToString((paymongoSecretKey + ":").getBytes()));
            headers.set("Content-Type", "application/json");

            Map<String, Object> payload = new HashMap<>();
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("payment_method", request.get("payment_method"));
            attributes.put("client_key", request.get("client_key"));
            attributes.put("return_url", request.get("return_url"));
            payload.put("data", new HashMap<String, Object>() {{
                put("attributes", attributes);
            }});

            System.out.println("Attach Intent Payload: " + payload);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            System.out.println("Attach Intent Response: " + response.getBody());
            return ResponseEntity.ok(response.getBody());
        } catch (HttpClientErrorException e) {
            System.err.println("PayMongo error attaching Payment Method: Status " + e.getStatusCode() + ", Response: " + e.getResponseBodyAsString());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to attach payment method: " + e.getMessage());
            return ResponseEntity.status(e.getStatusCode()).body(errorResponse);
        } catch (Exception e) {
            System.err.println("Unexpected error attaching Payment Method: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to attach payment method: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Get Payment Intent Status
    @GetMapping("/intent/{intentId}/status")
    public ResponseEntity<Map<String, Object>> getPaymentIntentStatus(@PathVariable String intentId) {
        System.out.println("Fetching Payment Intent Status for Intent ID: " + intentId);
        if (intentId == null || intentId.isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Payment Intent ID is required");
            return ResponseEntity.status(400).body(errorResponse);
        }
        try {
            String url = "https://api.paymongo.com/v1/payment_intents/" + intentId;
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Basic " + java.util.Base64.getEncoder().encodeToString((paymongoSecretKey + ":").getBytes()));
            headers.set("Content-Type", "application/json");

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            System.out.println("Payment Intent Status Response: " + response.getBody());
            return ResponseEntity.ok(response.getBody());
        } catch (HttpClientErrorException e) {
            System.err.println("PayMongo error fetching Payment Intent Status: Status " + e.getStatusCode() + ", Response: " + e.getResponseBodyAsString());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch payment intent status: " + e.getMessage());
            return ResponseEntity.status(e.getStatusCode()).body(errorResponse);
        } catch (Exception e) {
            System.err.println("Unexpected error fetching Payment Intent Status: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch payment intent status: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
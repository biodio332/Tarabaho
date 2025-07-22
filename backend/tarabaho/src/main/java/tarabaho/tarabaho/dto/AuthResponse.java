package tarabaho.tarabaho.dto;

public class AuthResponse {
    private String token;
    private Long workerId; // <-- Already added: Holds the worker ID for worker logins

    public AuthResponse() {}

    // ✅ ADDED: Overloaded constructor for user login (no workerId needed)
    public AuthResponse(String token) {
        this.token = token;
        this.workerId = null; // default to null for regular users
    }

    public AuthResponse(String token, Long workerId) {
        this.token = token;
        this.workerId = workerId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getWorkerId() {
        return workerId;
    }

    public void setWorkerId(Long workerId) {
        this.workerId = workerId;
    }
}
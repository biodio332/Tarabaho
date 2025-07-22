package tarabaho.tarabaho.dto;

import java.time.LocalDateTime;

public class MessageDTO {
    private Long id;
    private Long bookingId;
    private Long senderUserId;
    private Long senderWorkerId;
    private String senderName;
    private String content;
    private LocalDateTime sentAt;

    public MessageDTO(Long id, Long bookingId, Long senderUserId, Long senderWorkerId, String senderName, String content, LocalDateTime sentAt) {
        this.id = id;
        this.bookingId = bookingId;
        this.senderUserId = senderUserId;
        this.senderWorkerId = senderWorkerId;
        this.senderName = senderName;
        this.content = content;
        this.sentAt = sentAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public Long getSenderUserId() { return senderUserId; }
    public void setSenderUserId(Long senderUserId) { this.senderUserId = senderUserId; }
    public Long getSenderWorkerId() { return senderWorkerId; }
    public void setSenderWorkerId(Long senderWorkerId) { this.senderWorkerId = senderWorkerId; }
    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
}
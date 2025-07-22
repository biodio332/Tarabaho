package tarabaho.tarabaho.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import tarabaho.tarabaho.dto.MessageDTO;
import tarabaho.tarabaho.entity.Message;
import tarabaho.tarabaho.service.MessageService;
import tarabaho.tarabaho.service.UserService;
import tarabaho.tarabaho.service.WorkerService;

@RestController
@RequestMapping("/api/message")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Message Controller", description = "Handles chat messages for bookings")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private UserService userService;

    @Autowired
    private WorkerService workerService;

    @Operation(summary = "Send message", description = "Sends a message in a booking chat")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Message sent successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "User or worker not authenticated"),
        @ApiResponse(responseCode = "404", description = "Booking or sender not found")
    })
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(
            @RequestBody MessageRequest request,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("MessageController: REST sendMessage failed: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = authentication.getName();
            System.out.println("MessageController: REST sendMessage: Username: " + username);

            boolean isUser = userService.findByUsername(username).isPresent();
            Long senderId;
            String senderName;

            if (isUser) {
                senderId = userService.findByUsername(username)
                    .orElseThrow(() -> new Exception("User not found for username: " + username))
                    .getId();
                senderName = username;
            } else {
                senderId = workerService.findByUsername(username)
                    .orElseThrow(() -> new Exception("Worker not found for username: " + username))
                    .getId();
                senderName = username;
            }
            System.out.println("MessageController: REST sendMessage: SenderId: " + senderId + ", IsUser: " + isUser);

            Message message = messageService.sendMessage(
                request.getBookingId(),
                senderId,
                isUser,
                request.getContent()
            );
            MessageDTO messageDTO = new MessageDTO(
                message.getId(),
                message.getBooking().getId(),
                message.getSenderUser() != null ? message.getSenderUser().getId() : null,
                message.getSenderWorker() != null ? message.getSenderWorker().getId() : null,
                senderName,
                message.getContent(),
                message.getSentAt()
            );
            return ResponseEntity.ok(messageDTO);
        } catch (Exception e) {
            System.err.println("MessageController: REST sendMessage failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Get booking messages", description = "Retrieves all messages for a booking")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "List of messages"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "User or worker not authenticated"),
        @ApiResponse(responseCode = "404", description = "Booking not found")
    })
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getBookingMessages(
            @PathVariable Long bookingId,
            Authentication authentication
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("MessageController: getBookingMessages failed: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = authentication.getName();
            boolean isUser = userService.findByUsername(username).isPresent();
            Long requesterId = isUser ? userService.findByUsername(username)
                    .orElseThrow(() -> new Exception("User not found for username: " + username))
                    .getId() :
                workerService.findByUsername(username)
                    .orElseThrow(() -> new Exception("Worker not found for username: " + username))
                    .getId();

            List<MessageDTO> messages = messageService.getBookingMessages(bookingId, requesterId, isUser);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            System.err.println("MessageController: getBookingMessages failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

   @Autowired
private SimpMessagingTemplate messagingTemplate;

@MessageMapping("/chat/{bookingId}")
public void sendWebSocketMessage(
        @DestinationVariable Long bookingId,
        MessageRequest request,
        Authentication authentication
) throws Exception {
    System.out.println("MessageController: WebSocket sendMessage: BookingId: " + bookingId);
    if (authentication == null || !authentication.isAuthenticated()) {
        throw new Exception("Not authenticated.");
    }

    String username = authentication.getName();
    boolean isUser = userService.findByUsername(username).isPresent();
    Long senderId = isUser
        ? userService.findByUsername(username).orElseThrow(() -> new Exception("User not found")).getId()
        : workerService.findByUsername(username).orElseThrow(() -> new Exception("Worker not found")).getId();

    Message message = messageService.sendMessage(bookingId, senderId, isUser, request.getContent());

    MessageDTO messageDTO = new MessageDTO(
        message.getId(),
        message.getBooking().getId(),
        message.getSenderUser() != null ? message.getSenderUser().getId() : null,
        message.getSenderWorker() != null ? message.getSenderWorker().getId() : null,
        username,
        message.getContent(),
        message.getSentAt()
    );

    // ✅ Dynamically send to the correct topic
    String destination = "/topic/booking/" + bookingId;
    messagingTemplate.convertAndSend(destination, messageDTO);
    System.out.println("WebSocket message sent to " + destination);
}


    static class MessageRequest {
        private Long bookingId;
        private String content;

        public Long getBookingId() { return bookingId; }
        public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}
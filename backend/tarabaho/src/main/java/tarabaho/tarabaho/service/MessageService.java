package tarabaho.tarabaho.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tarabaho.tarabaho.dto.MessageDTO;
import tarabaho.tarabaho.entity.Booking;
import tarabaho.tarabaho.entity.BookingStatus;
import tarabaho.tarabaho.entity.Message;
import tarabaho.tarabaho.entity.User;
import tarabaho.tarabaho.entity.Worker;
import tarabaho.tarabaho.repository.BookingRepository;
import tarabaho.tarabaho.repository.MessageRepository;
import tarabaho.tarabaho.repository.UserRepository;
import tarabaho.tarabaho.repository.WorkerRepository;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkerRepository workerRepository;

    public Message sendMessage(Long bookingId, Long senderId, boolean isUser, String content) throws Exception {
        System.out.println("MessageService.sendMessage: bookingId=" + bookingId + ", senderId=" + senderId + ", isUser=" + isUser + ", content=" + content);
        
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> {
                System.err.println("MessageService.sendMessage: Booking not found: " + bookingId);
                return new Exception("Booking not found: " + bookingId);
            });
        System.out.println("MessageService.sendMessage: Booking found, status=" + booking.getStatus() + 
            ", user_id=" + (booking.getUser() != null ? booking.getUser().getId() : "null") + 
            ", worker_id=" + (booking.getWorker() != null ? booking.getWorker().getId() : "null"));

        if (booking.getStatus() != BookingStatus.ACCEPTED && booking.getStatus() != BookingStatus.IN_PROGRESS) {
            System.err.println("MessageService.sendMessage: Invalid booking status: " + booking.getStatus());
            throw new Exception("Chat is only available for accepted or in-progress bookings");
        }

        Message message = new Message();
        message.setBooking(booking);
        message.setContent(content);
        message.setSentAt(LocalDateTime.now());

        if (isUser) {
            User sender = userRepository.findById(senderId)
                .orElseThrow(() -> {
                    System.err.println("MessageService.sendMessage: User not found: " + senderId);
                    return new Exception("User not found");
                });
            if (!sender.equals(booking.getUser())) {
                System.err.println("MessageService.sendMessage: User " + senderId + " not authorized for booking " + bookingId + 
                    ", booking user_id=" + (booking.getUser() != null ? booking.getUser().getId() : "null"));
                throw new Exception("User not authorized for this booking");
            }
            message.setSenderUser(sender);
            System.out.println("MessageService.sendMessage: Set sender user: " + senderId);
        } else {
            Worker sender = workerRepository.findById(senderId)
                .orElseThrow(() -> {
                    System.err.println("MessageService.sendMessage: Worker not found: " + senderId);
                    return new Exception("Worker not found");
                });
            if (!sender.equals(booking.getWorker())) {
                System.err.println("MessageService.sendMessage: Worker " + senderId + " not authorized for booking " + bookingId + 
                    ", booking worker_id=" + (booking.getWorker() != null ? booking.getWorker().getId() : "null"));
                throw new Exception("Worker not authorized for this booking");
            }
            message.setSenderWorker(sender);
            System.out.println("MessageService.sendMessage: Set sender worker: " + senderId);
        }

        Message savedMessage = messageRepository.save(message);
        System.out.println("MessageService.sendMessage: Saved message: id=" + savedMessage.getId());
        return savedMessage;
    }

    public List<MessageDTO> getBookingMessages(Long bookingId, Long requesterId, boolean isUser) throws Exception {
        System.out.println("MessageService.getBookingMessages: bookingId=" + bookingId + ", requesterId=" + requesterId + ", isUser=" + isUser);
        
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> {
                System.err.println("MessageService.getBookingMessages: Booking not found: " + bookingId);
                return new Exception("Booking not found");
            });

        if (isUser && !booking.getUser().getId().equals(requesterId)) {
            System.err.println("MessageService.getBookingMessages: User " + requesterId + " not authorized for booking " + bookingId);
            throw new Exception("User not authorized for this booking");
        }
        if (!isUser && (booking.getWorker() == null || !booking.getWorker().getId().equals(requesterId))) {
            System.err.println("MessageService.getBookingMessages: Worker " + requesterId + " not authorized for booking " + bookingId);
            throw new Exception("Worker not authorized for this booking");
        }

        List<Message> messages = messageRepository.findByBookingOrderBySentAtAsc(booking);
        List<MessageDTO> messageDTOs = messages.stream()
            .map(message -> {
                String senderName = message.getSenderUser() != null ? 
                    message.getSenderUser().getUsername() : 
                    (message.getSenderWorker() != null ? message.getSenderWorker().getUsername() : "Unknown");
                return new MessageDTO(
                    message.getId(),
                    message.getBooking().getId(),
                    message.getSenderUser() != null ? message.getSenderUser().getId() : null,
                    message.getSenderWorker() != null ? message.getSenderWorker().getId() : null,
                    senderName,
                    message.getContent(),
                    message.getSentAt()
                );
            })
            .collect(Collectors.toList());
        System.out.println("MessageService.getBookingMessages: Retrieved " + messageDTOs.size() + " messages for booking " + bookingId);
        return messageDTOs;
    }
}
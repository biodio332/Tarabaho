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
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.repository.BookingRepository;
import tarabaho.tarabaho.repository.MessageRepository;
import tarabaho.tarabaho.repository.UserRepository;
import tarabaho.tarabaho.repository.GraduateRepository;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GraduateRepository graduateRepository;

    public Message sendMessage(Long bookingId, Long senderId, boolean isUser, String content) throws Exception {
        System.out.println("MessageService.sendMessage: bookingId=" + bookingId + ", senderId=" + senderId + ", isUser=" + isUser + ", content=" + content);
        
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> {
                System.err.println("MessageService.sendMessage: Booking not found: " + bookingId);
                return new Exception("Booking not found: " + bookingId);
            });
        System.out.println("MessageService.sendMessage: Booking found, status=" + booking.getStatus() + 
            ", user_id=" + (booking.getUser() != null ? booking.getUser().getId() : "null") + 
            ", graduate_id=" + (booking.getGraduate() != null ? booking.getGraduate().getId() : "null"));

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
            Graduate sender = graduateRepository.findById(senderId)
                .orElseThrow(() -> {
                    System.err.println("MessageService.sendMessage: Graduate not found: " + senderId);
                    return new Exception("Graduate not found");
                });
            if (!sender.equals(booking.getGraduate())) {
                System.err.println("MessageService.sendMessage: Graduate " + senderId + " not authorized for booking " + bookingId + 
                    ", booking graduate_id=" + (booking.getGraduate() != null ? booking.getGraduate().getId() : "null"));
                throw new Exception("Graduate not authorized for this booking");
            }
            message.setSenderGraduate(sender);
            System.out.println("MessageService.sendMessage: Set sender graduate: " + senderId);
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
        if (!isUser && (booking.getGraduate() == null || !booking.getGraduate().getId().equals(requesterId))) {
            System.err.println("MessageService.getBookingMessages: Graduate " + requesterId + " not authorized for booking " + bookingId);
            throw new Exception("Graduate not authorized for this booking");
        }

        List<Message> messages = messageRepository.findByBookingOrderBySentAtAsc(booking);
        List<MessageDTO> messageDTOs = messages.stream()
            .map(message -> {
                String senderName = message.getSenderUser() != null ? 
                    message.getSenderUser().getUsername() : 
                    (message.getSenderGraduate() != null ? message.getSenderGraduate().getUsername() : "Unknown");
                return new MessageDTO(
                    message.getId(),
                    message.getBooking().getId(),
                    message.getSenderUser() != null ? message.getSenderUser().getId() : null,
                    message.getSenderGraduate() != null ? message.getSenderGraduate().getId() : null,
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
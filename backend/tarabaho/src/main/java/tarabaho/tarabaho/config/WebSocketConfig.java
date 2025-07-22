package tarabaho.tarabaho.config;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import tarabaho.tarabaho.jwt.JwtUtil;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
    // Raw WebSocket endpoint for Android client
    registry.addEndpoint("/chat")
            .setAllowedOrigins("*");  // or specify your Android app origin if needed

    // SockJS endpoint for browser clients
    registry.addEndpoint("/chat")
            .setAllowedOrigins("http://localhost:5173", 
                               "https://it-342-tarabaho-8q1h-89v462nt1-jilus-projects.vercel.app",
                               "https://it-342-tarabaho-8q1h-1sjnj79pj-jilus-projects.vercel.app",
                               "https://it-342-tarabaho-8q1h.vercel.app")
            .withSockJS();
    }


    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor != null && "CONNECT".equals(accessor.getCommand().name())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    System.out.println("WebSocket CONNECT: Authorization header: " + authHeader);
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        try {
                            String username = jwtUtil.getUsernameFromToken(token);
                            if (username != null && jwtUtil.validateToken(token)) {
                                System.out.println("WebSocket CONNECT: Valid token, username: " + username);
                                UserDetails userDetails = new User(username, "", Collections.emptyList());
                                Authentication authentication = new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                                SecurityContextHolder.getContext().setAuthentication(authentication);
                                accessor.setUser(authentication);
                            } else {
                                System.out.println("WebSocket CONNECT: Invalid token");
                                return null; // Reject connection
                            }
                        } catch (Exception e) {
                            System.out.println("WebSocket CONNECT: Token validation failed: " + e.getMessage());
                            return null; // Reject connection
                        }
                    } else {
                        System.out.println("WebSocket CONNECT: No Authorization header");
                        return null; // Reject connection
                    }
                }
                return message;
            }
        });
    }
}
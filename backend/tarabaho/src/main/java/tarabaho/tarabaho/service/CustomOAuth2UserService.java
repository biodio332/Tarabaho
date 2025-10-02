package tarabaho.tarabaho.service;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpSession;

@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    public CustomOAuth2UserService() {
        System.out.println("CustomOAuth2UserService: Initialized at " + new java.util.Date());
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        System.out.println("CustomOAuth2UserService: Loading user for client: " + 
            userRequest.getClientRegistration().getRegistrationId() + " at " + new java.util.Date());
        System.out.println("CustomOAuth2UserService: Thread ID: " + Thread.currentThread().getId());

        try {
            DefaultOAuth2UserService defaultService = new DefaultOAuth2UserService();
            OAuth2User oauthUser = defaultService.loadUser(userRequest);
            if (oauthUser == null) {
                System.err.println("CustomOAuth2UserService: oauthUser is null at " + new java.util.Date());
                throw new OAuth2AuthenticationException("OAuth2 user is null");
            }
            Map<String, Object> userAttributes = oauthUser.getAttributes();
            System.out.println("CustomOAuth2UserService: OAuth2User attributes before modification: " + 
                (userAttributes != null ? userAttributes : "null"));

            // Validate email presence
            String email = oauthUser.getAttribute("email");
            if (email == null || email.isEmpty()) {
                System.err.println("CustomOAuth2UserService: Email is null or empty at " + new java.util.Date());
                throw new OAuth2AuthenticationException("Email not provided by OAuth2 provider");
            }
            System.out.println("CustomOAuth2UserService: Email: " + email);

            // Get type from session using RequestContextHolder
            HttpSession session = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest().getSession();
            System.out.println("CustomOAuth2UserService: Session attributes: " + session.getAttributeNames().toString());
            String type = (String) session.getAttribute("oauth2_login_type");
            System.out.println("CustomOAuth2UserService: Extracted type from session: " + type + " at " + new java.util.Date());

            // Fallback to default if type is not found
            if (type == null || type.isEmpty() || !("user".equals(type) || "graduate".equals(type))) {
                type = "user";
                System.out.println("CustomOAuth2UserService: Type is null, empty, or invalid, defaulting to: " + type + " at " + new java.util.Date());
            }

            // Create a new HashMap to include type
            Map<String, Object> attributes = new HashMap<>();
            if (userAttributes != null) {
                attributes.putAll(userAttributes);
            }
            attributes.put("type", type);
            System.out.println("CustomOAuth2UserService: OAuth2User attributes after modification: " + attributes);

            // Set principal name to email
            System.out.println("CustomOAuth2UserService: Setting principal name to email: " + email);
            return new org.springframework.security.oauth2.core.user.DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + type.toUpperCase())),
                attributes,
                "email" // Changed from "sub" to "email"
            );
        } catch (Exception e) {
            System.err.println("CustomOAuth2UserService: Error loading user at " + new java.util.Date() + ": " + e.getMessage());
            System.err.println("CustomOAuth2UserService: Exception class: " + e.getClass().getName());
            System.err.println("CustomOAuth2UserService: Root cause: " + 
                (e.getCause() != null ? e.getCause().getMessage() : "No cause"));
            e.printStackTrace();
            throw new OAuth2AuthenticationException(null, "Failed to load OAuth2 user at " + new java.util.Date() + ": " + e.getMessage(), e);
        }
    }
}
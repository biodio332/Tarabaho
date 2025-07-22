package tarabaho.tarabaho.controller;

import java.io.IOException;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import tarabaho.tarabaho.entity.User;
import tarabaho.tarabaho.jwt.JwtUtil;
import tarabaho.tarabaho.repository.UserRepository;

@RestController
public class OAuth2Controller {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @SuppressWarnings("null")
    @GetMapping("/oauth2-success")
    @Transactional
    public void oauth2Success(
        @AuthenticationPrincipal OAuth2User oauthUser,
        HttpServletResponse response
    ) throws IOException {
        System.out.println("Reached /oauth2-success");
        if (oauthUser == null) {
            System.out.println("⚠️ OAuth2User is null");
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication failed");
            return;
        }

        System.out.println("OAuth2User attributes: " + oauthUser.getAttributes());
        String email = oauthUser.getAttribute("email");
        String firstname = oauthUser.getAttribute("given_name"); // First name
        String lastname = oauthUser.getAttribute("family_name"); // Last name

        System.out.println("🔍 Logged-in email from Google: " + email);

        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;
        if (existingUser.isEmpty()) {
            System.out.println("🆕 Registering new user with email: " + email);
            user = new User();
            user.setEmail(email);
            user.setFirstname(firstname);
            user.setLastname(lastname);
            user.setUsername(email); // Still using email as username
            user.setPassword("");    // Empty for OAuth2 users
            user.setPhoneNumber("");
            user.setBirthday(null);
            user.setLocation("");    // Default empty location
            System.out.println("Before save - User object: " + user);
            user = userRepository.saveAndFlush(user);
            System.out.println("After save - User saved: ID=" + user.getId() + ", Username=" + user.getUsername() + ", Email=" + user.getEmail());
            User savedUser = userRepository.findById(user.getId()).orElse(null);
            System.out.println("Retrieved from DB after save - User: " + (savedUser != null ? savedUser.toString() : "NULL"));
        } else {
            System.out.println("✅ Existing user found: " + email);
            user = existingUser.get();
            if (user.getUsername() == null || user.getUsername().isEmpty()) {
                user.setUsername(email);
                System.out.println("Updating username for existing user: " + email);
                user = userRepository.saveAndFlush(user);
                System.out.println("Updated user - Username: " + user.getUsername());
            }
            // Optionally update firstname/lastname if they differ
            if (!firstname.equals(user.getFirstname()) || !lastname.equals(user.getLastname())) {
                user.setFirstname(firstname);
                user.setLastname(lastname);
                user = userRepository.saveAndFlush(user);
                System.out.println("Updated user - Firstname: " + user.getFirstname() + ", Lastname: " + user.getLastname());
            }
        }

        if (user.getUsername() == null) {
            System.out.println("⚠️ CRITICAL: Username is null before generating token");
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "User data incomplete");
            return;
        }

        String jwtToken = jwtUtil.generateToken(user.getUsername());
        System.out.println("Generated JWT: " + jwtToken);

        // Set cookie and log it
        Cookie tokenCookie = new Cookie("jwtToken", jwtToken);
        tokenCookie.setHttpOnly(true);
        tokenCookie.setSecure(true); 
        tokenCookie.setPath("/");
        tokenCookie.setMaxAge(24 * 60 * 60);
        tokenCookie.setAttribute("SameSite", "None");
        response.addCookie(tokenCookie);
        System.out.println("Cookie set: jwtToken=" + jwtToken + "; HttpOnly=true; Path=/; MaxAge=86400");

        response.sendRedirect("https://it-342-tarabaho-8q1h.vercel.app/user-browse");
    }
}
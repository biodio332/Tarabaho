package tarabaho.tarabaho.controller;

import java.io.IOException;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Enumeration;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.entity.User;
import tarabaho.tarabaho.jwt.JwtUtil;
import tarabaho.tarabaho.repository.GraduateRepository;
import tarabaho.tarabaho.repository.UserRepository;
import tarabaho.tarabaho.service.GraduateService;
import tarabaho.tarabaho.service.SupabaseRestStorageService;

@RestController
public class OAuth2Controller {

    // This will be https://tarabaho.vercel.app in production
    // Override in application.yml or env for local dev: http://localhost:5173
    @Value("${app.frontend.url:https://tarabaho.vercel.app}")
    private String frontendUrl;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GraduateRepository graduateRepository;

    @Autowired
    private GraduateService graduateService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private SupabaseRestStorageService storageService;

    @SuppressWarnings({ "unused", "deprecation" })
    @GetMapping("/oauth2-success")
    @Transactional
    public void oauth2Success(
            @AuthenticationPrincipal OAuth2User oauthUser,
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {

        System.out.println("OAuth2Controller: Reached /oauth2-success");
        System.out.println("OAuth2Controller: Principal name: " + oauthUser.getName());

        Map<String, Object> attributes = oauthUser.getAttributes();
        if (attributes == null) {
            System.out.println("OAuth2Controller: OAuth2User attributes are null");
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "No user attributes provided by OAuth2 provider");
            return;
        }

        HttpSession session = request.getSession(false);
        if (session != null) {
            System.out.println("OAuth2Controller: Session ID: " + session.getId());
            Enumeration<String> attributeNames = session.getAttributeNames();
            System.out.println("OAuth2Controller: Session attributes: ");
            while (attributeNames.hasMoreElements()) {
                String attr = attributeNames.nextElement();
                System.out.println("  - " + attr + ": " + session.getAttribute(attr));
            }
        } else {
            System.out.println("OAuth2Controller: No session available");
        }

        String type = (String) (session != null ? session.getAttribute("oauth2_login_type") : null);
        System.out.println("OAuth2Controller: Retrieved type from session: " + type);

        if (type == null || type.isEmpty()) {
            type = (String) attributes.get("type");
            System.out.println("OAuth2Controller: Retrieved type from OAuth2User attributes: " + type);
        }

        if (type == null || type.isEmpty() || !("user".equalsIgnoreCase(type) || "graduate".equalsIgnoreCase(type))) {
            type = "user";
            System.out.println("OAuth2Controller: Invalid or missing type, defaulting to: " + type);
        }

        System.out.println("OAuth2Controller: Final type to use: " + type);

        try {
            String email = oauthUser.getAttribute("email");
            String firstName = oauthUser.getAttribute("given_name");
            String lastName = oauthUser.getAttribute("family_name");
            String picture = oauthUser.getAttribute("picture");

            firstName = firstName != null ? firstName : "";
            lastName = lastName != null ? lastName : "";
            String profilePicture = "";

            if (email == null || email.isEmpty()) {
                System.out.println("OAuth2Controller: Email is null or empty");
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Email not provided by OAuth2 provider");
                return;
            }

            if (picture != null && !picture.isEmpty()) {
                try {
                    URL imageUrl = new URL(picture);
                    Path tempFile = Files.createTempFile("profile_", ".jpg");
                    Files.copy(imageUrl.openStream(), tempFile, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                    String filename = "avatars/" + email.replaceAll("[^a-zA-Z0-9._-]", "_") + ".jpg";
                    MultipartFile multipartFile = new MockMultipartFile(
                            "file", filename, "image/jpeg", Files.readAllBytes(tempFile));
                    profilePicture = storageService.uploadFile(multipartFile, "profile-picture");
                    System.out.println("OAuth2Controller: Uploaded profile picture: " + profilePicture);
                    Files.delete(tempFile);
                } catch (IOException e) {
                    System.out.println("OAuth2Controller: Failed to upload profile picture: " + e.getMessage());
                    profilePicture = picture;
                }
            }

            String username = email;
            String redirectUrl;

            if ("graduate".equalsIgnoreCase(type)) {
                Optional<Graduate> existingGraduate = graduateRepository.findByEmail(email);
                Graduate graduate;

                if (existingGraduate.isEmpty()) {
                    System.out.println("OAuth2Controller: Creating new graduate: " + email);
                    graduate = new Graduate();
                    graduate.setEmail(email);
                    graduate.setUsername(username);
                    graduate.setFirstName(firstName);
                    graduate.setLastName(lastName);
                    graduate.setPassword("");
                    graduate.setPhoneNumber(null);
                    graduate.setAddress("");
                    graduate.setBiography("");
                    graduate.setBirthday(null);
                    graduate.setProfilePicture(profilePicture);
                    graduate.setEmailVerified(true);

                    graduate = graduateService.registerOAuth2Graduate(graduate);
                    System.out.println("OAuth2Controller: Graduate saved: ID=" + graduate.getId());
                } else {
                    System.out.println("OAuth2Controller: Updating existing graduate: " + email);
                    graduate = existingGraduate.get();

                    if (!Objects.equals(graduate.getUsername(), username) ||
                            !Objects.equals(graduate.getFirstName(), firstName) ||
                            !Objects.equals(graduate.getLastName(), lastName) ||
                            !Objects.equals(graduate.getProfilePicture(), profilePicture)) {

                        if (graduate.getProfilePicture() != null && !graduate.getProfilePicture().isEmpty()) {
                            String oldFile = graduate.getProfilePicture().substring(graduate.getProfilePicture().lastIndexOf("/") + 1);
                            try {
                                storageService.deleteFile("profile-picture", oldFile);
                            } catch (Exception e) {
                                if (!e.getMessage().contains("404")) {
                                    System.out.println("Failed to delete old pic: " + e.getMessage());
                                }
                            }
                        }

                        graduate.setUsername(username);
                        graduate.setFirstName(firstName);
                        graduate.setLastName(lastName);
                        graduate.setProfilePicture(profilePicture);
                        graduate = graduateService.editGraduate(graduate.getId(), graduate);
                    }
                }

                redirectUrl = frontendUrl + "/signin?username=" + 
                    URLEncoder.encode(username, StandardCharsets.UTF_8) + "&type=graduate";

            } else {
                Optional<User> existingUser = userRepository.findByEmail(email);
                User user;

                if (existingUser.isEmpty()) {
                    System.out.println("OAuth2Controller: Creating new user: " + email);
                    user = new User();
                    user.setEmail(email);
                    user.setUsername(username);
                    user.setFirstname(firstName);
                    user.setLastname(lastName);
                    user.setPassword("");
                    user.setPhoneNumber(null);
                    user.setBirthday(null);
                    user.setLocation("");
                    user.setProfilePicture(profilePicture);
                    user.setEmailVerified(true);

                    user = userRepository.saveAndFlush(user);
                } else {
                    System.out.println("OAuth2Controller: Updating existing user: " + email);
                    user = existingUser.get();

                    if (!Objects.equals(user.getUsername(), username) ||
                            !Objects.equals(user.getFirstname(), firstName) ||
                            !Objects.equals(user.getLastname(), lastName) ||
                            !Objects.equals(user.getProfilePicture(), profilePicture)) {

                        if (user.getProfilePicture() != null && !user.getProfilePicture().isEmpty()) {
                            String oldFile = user.getProfilePicture().substring(user.getProfilePicture().lastIndexOf("/") + 1);
                            try {
                                storageService.deleteFile("profile-picture", oldFile);
                            } catch (Exception e) {
                                if (!e.getMessage().contains("404")) {
                                    System.out.println("Failed to delete old pic: " + e.getMessage());
                                }
                            }
                        }

                        user.setUsername(username);
                        user.setFirstname(firstName);
                        user.setLastname(lastName);
                        user.setProfilePicture(profilePicture);
                        user = userRepository.saveAndFlush(user);
                    }
                }

                redirectUrl = frontendUrl + "/signin?username=" + 
                    URLEncoder.encode(username, StandardCharsets.UTF_8) + "&type=user";
            }

            // Set secure JWT cookie (production-ready)
            String jwtToken = jwtUtil.generateToken(username, type.toUpperCase());
            Cookie tokenCookie = new Cookie("jwtToken", jwtToken);
            tokenCookie.setHttpOnly(true);
            tokenCookie.setSecure(true);                    // Must be true on Vercel (HTTPS)
            tokenCookie.setPath("/");
            tokenCookie.setMaxAge(7 * 24 * 60 * 60);        // 7 days
            tokenCookie.setAttribute("SameSite", "Lax");    // Allows OAuth redirect to work
            response.addCookie(tokenCookie);

            System.out.println("OAuth2Controller: Redirecting to: " + redirectUrl);
            response.sendRedirect(redirectUrl);

        } catch (DataIntegrityViolationException e) {
            System.out.println("OAuth2Controller: DataIntegrityViolation: " + e.getMessage());
            if (e.getMessage() != null && e.getMessage().contains("uk8v7vpb3qskfshl5eq9akwf7pk")) {
                response.sendRedirect(frontendUrl + "/sign-in?error=phone_number_already_exists");
            } else {
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Registration failed");
            }
        } catch (IllegalArgumentException e) {
            System.out.println("OAuth2Controller: Invalid hourly rate");
            response.sendRedirect(frontendUrl + "/sign-in?error=invalid_hourly_rate");
        } catch (Exception e) {
            System.out.println("OAuth2Controller: Unexpected error: " + e.getMessage());
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "OAuth2 login failed");
        }
    }
}
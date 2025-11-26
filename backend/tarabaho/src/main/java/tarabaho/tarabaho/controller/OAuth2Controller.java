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
        
        String frontendUrl = System.getenv("FRONTEND_URL");
        if (frontendUrl == null || frontendUrl.isEmpty()) {
            frontendUrl = "https://tarabaho.vercel.app";
        }

        Map<String, Object> attributes = oauthUser.getAttributes();
        if (attributes == null) {
            System.out.println("OAuth2Controller: ⚠️ OAuth2User attributes are null");
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "No user attributes provided by OAuth2 provider");
            return;
        }

        // Log session attributes
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

        // Retrieve type from session as primary source
        String type = (String) (session != null ? session.getAttribute("oauth2_login_type") : null);
        System.out.println("OAuth2Controller: Retrieved type from session: " + type);

        // Fallback to OAuth2User attributes if session type is null
        if (type == null || type.isEmpty()) {
            type = (String) attributes.get("type");
            System.out.println("OAuth2Controller: Retrieved type from OAuth2User attributes: " + type);
        }

        // Default to "user" if type is still null or invalid
        if (type == null || type.isEmpty() || !("user".equalsIgnoreCase(type) || "graduate".equalsIgnoreCase(type))) {
            type = "user";
            System.out.println("OAuth2Controller: Invalid or missing type attribute, defaulting to: " + type);
        }

        System.out.println("OAuth2Controller: OAuth2User attributes: " + attributes);
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
                System.out.println("OAuth2Controller: ⚠️ Email is null or empty");
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
                    System.out.println("OAuth2Controller: ⚠️ Failed to upload profile picture: " + e.getMessage());
                    profilePicture = picture; // Fallback to original picture URL
                }
            }

            String username = email;
            String redirectUrl;

            if ("graduate".equalsIgnoreCase(type)) {
                Optional<Graduate> existingGraduate = graduateRepository.findByEmail(email);
                Graduate graduate;

                if (existingGraduate.isEmpty()) {
                    System.out.println("OAuth2Controller: 🆕 Creating new graduate: " + email);
                    graduate = new Graduate();
                    graduate.setEmail(email);
                    graduate.setUsername(username);
                    graduate.setFirstName(firstName);
                    graduate.setLastName(lastName);
                    graduate.setPassword("");
                    graduate.setPhoneNumber(null); // Avoid unique constraint violation
                    graduate.setAddress("");
                    graduate.setBiography("");
                    graduate.setBirthday(null);
                    graduate.setProfilePicture(profilePicture);
                    graduate.setEmailVerified(true);
            
                    try {
                        graduate = graduateService.registerOAuth2Graduate(graduate);
                        System.out.println("OAuth2Controller: Graduate saved: ID=" + graduate.getId() + ", Username=" + graduate.getUsername());
                    } catch (DataIntegrityViolationException e) {
                        System.out.println("OAuth2Controller: ⚠️ DataIntegrityViolationException while saving graduate: " + e.getMessage());
                        throw e;
                    }
                } else {
                    System.out.println("OAuth2Controller: ✅ Updating existing graduate: " + email);
                    graduate = existingGraduate.get();

                    // Only update fields that have changed, preserve existing hourly rate
                    if (!Objects.equals(graduate.getUsername(), username) ||
                            !Objects.equals(graduate.getFirstName(), firstName) ||
                            !Objects.equals(graduate.getLastName(), lastName) ||
                            !Objects.equals(graduate.getProfilePicture(), profilePicture)) {
                        if (graduate.getProfilePicture() != null && !graduate.getProfilePicture().isEmpty()) {
                            String existingFileName = graduate.getProfilePicture().substring(graduate.getProfilePicture().lastIndexOf("/") + 1);
                            try {
                                storageService.deleteFile("profile-picture", existingFileName);
                                System.out.println("OAuth2Controller: Deleted old profile picture: " + existingFileName);
                            } catch (IOException e) {
                                if (e.getMessage().contains("404") || e.getMessage().contains("not_found")) {
                                    System.out.println("OAuth2Controller: ⚠️ Old profile picture not found, skipping deletion: " + existingFileName);
                                } else {
                                    System.out.println("OAuth2Controller: ⚠️ Failed to delete old profile picture: " + e.getMessage());
                                }
                            }
                        }
                        graduate.setUsername(username);
                        graduate.setFirstName(firstName);
                        graduate.setLastName(lastName);
                        graduate.setProfilePicture(profilePicture);
                        // Do not overwrite hourly rate to preserve existing value
                        try {
                            graduate = graduateService.editGraduate(graduate.getId(), graduate);
                            System.out.println("OAuth2Controller: Graduate updated: ID=" + graduate.getId() + ", Username=" + graduate.getUsername());
                        } catch (IllegalArgumentException e) {
                            System.out.println("OAuth2Controller: ⚠️ IllegalArgumentException while updating graduate: " + e.getMessage());
                            // Continue with redirect to avoid breaking the flow
                        }
                    }
                }

                
                redirectUrl = frontendUrl+ "/signin?username=" + URLEncoder.encode(username, StandardCharsets.UTF_8) + "&type=graduate";
            } else {
                Optional<User> existingUser = userRepository.findByEmail(email);
                User user;

                if (existingUser.isEmpty()) {
                    System.out.println("OAuth2Controller: 🆕 Creating new user: " + email);
                    user = new User();
                    user.setEmail(email);
                    user.setUsername(username);
                    user.setFirstname(firstName);
                    user.setLastname(lastName);
                    user.setPassword("");
                    user.setPhoneNumber(null); // Avoid potential constraint violation
                    user.setBirthday(null);
                    user.setLocation("");
                    user.setProfilePicture(profilePicture);
                    user.setEmailVerified(true);
                    try {
                        user = userRepository.saveAndFlush(user);
                        System.out.println("OAuth2Controller: User saved: ID=" + user.getId() + ", Username=" + user.getUsername());
                    } catch (DataIntegrityViolationException e) {
                        System.out.println("OAuth2Controller: ⚠️ DataIntegrityViolationException while saving user: " + e.getMessage());
                        throw e;
                    }
                } else {
                    System.out.println("OAuth2Controller: ✅ Updating existing user: " + email);
                    user = existingUser.get();

                    if (!Objects.equals(user.getUsername(), username) ||
                            !Objects.equals(user.getFirstname(), firstName) ||
                            !Objects.equals(user.getLastname(), lastName) ||
                            !Objects.equals(user.getProfilePicture(), profilePicture)) {
                        if (user.getProfilePicture() != null && !user.getProfilePicture().isEmpty()) {
                            String existingFileName = user.getProfilePicture().substring(user.getProfilePicture().lastIndexOf("/") + 1);
                            try {
                                storageService.deleteFile("profile-picture", existingFileName);
                                System.out.println("OAuth2Controller: Deleted old profile picture: " + existingFileName);
                            } catch (IOException e) {
                                if (e.getMessage().contains("404") || e.getMessage().contains("not_found")) {
                                    System.out.println("OAuth2Controller: ⚠️ Old profile picture not found, skipping deletion: " + existingFileName);
                                } else {
                                    System.out.println("OAuth2Controller: ⚠️ Failed to delete old profile picture: " + e.getMessage());
                                }
                            }
                        }
                        user.setUsername(username);
                        user.setFirstname(firstName);
                        user.setLastname(lastName);
                        user.setProfilePicture(profilePicture);
                        try {
                            user = userRepository.saveAndFlush(user);
                            System.out.println("OAuth2Controller: User updated: ID=" + user.getId() + ", Username=" + user.getUsername());
                        } catch (DataIntegrityViolationException e) {
                            System.out.println("OAuth2Controller: ⚠️ DataIntegrityViolationException while updating user: " + e.getMessage());
                            throw e;
                        }
                    }
                }

                

                redirectUrl = frontendUrl+ "/signin?username=" + URLEncoder.encode(username, StandardCharsets.UTF_8) + "&type=user";
            }

            // Set JWT token cookie
            String jwtToken = jwtUtil.generateToken(username,type.toUpperCase());
            Cookie tokenCookie = new Cookie("jwtToken", jwtToken);
            tokenCookie.setHttpOnly(true);
            tokenCookie.setSecure(true);        
            tokenCookie.setPath("/");
            tokenCookie.setMaxAge(24 * 60 * 60);
            tokenCookie.setAttribute("SameSite", "None");  
            response.addCookie(tokenCookie);
            response.setHeader("Set-Cookie", 
            "jwtToken=" + jwtToken + 
            "; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=None");
            System.out.println("OAuth2Controller: Cookie set: jwtToken=***; HttpOnly=true; Path=/; MaxAge=86400; SameSite=Strict");

            // Redirect to sign-in with username and type
            System.out.println("OAuth2Controller: Redirecting to: " + redirectUrl);
            response.sendRedirect(redirectUrl);
        } catch (DataIntegrityViolationException e) {
            System.out.println("OAuth2Controller: ⚠️ DataIntegrityViolationException: " + e.getMessage());
            if (e.getCause() instanceof org.hibernate.exception.ConstraintViolationException &&
                e.getMessage().contains("uk8v7vpb3qskfshl5eq9akwf7pk")) {
                response.sendRedirect(frontendUrl + "/signin?error=phone_number_already_exists");
                return;
            }
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "OAuth2 processing failed: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.out.println("OAuth2Controller: ⚠️ IllegalArgumentException: " + e.getMessage());
            response.sendRedirect(frontendUrl + "/signin?error=invalid_hourly_rate");
        } catch (Exception e) {
            System.out.println("OAuth2Controller: ⚠️ Error in oauth2Success: " + e.getMessage());
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "OAuth2 processing failed: " + e.getMessage());
        }
    }
}

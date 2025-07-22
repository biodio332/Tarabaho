package tarabaho.tarabaho.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import tarabaho.tarabaho.entity.User;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;

@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    @Autowired
    private UserService userService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oauthUser = new DefaultOAuth2UserService().loadUser(userRequest);

        String email = oauthUser.getAttribute("email");
        String firstname = oauthUser.getAttribute("given_name"); // First name from Google
        String lastname = oauthUser.getAttribute("family_name"); // Last name from Google

        // Check if user exists
        Optional<User> existingUserOpt = userService.findByEmail(email);

        User user = existingUserOpt.orElseGet(() -> {
            // Create user if not found
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFirstname(firstname);
            newUser.setLastname(lastname);
            newUser.setUsername(email); // Using email as username for consistency
            newUser.setPassword("");    // Empty for OAuth2 users
            newUser.setPhoneNumber("");
            newUser.setBirthday(null);
            newUser.setLocation("");    // Default empty location
            return userService.registerUser(newUser);
        });

        // You can add custom attributes if needed
        Map<String, Object> attributes = new HashMap<>(oauthUser.getAttributes());
        attributes.put("id", user.getId());

        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                attributes,
                "email" // Attribute used as the principal identifier
        );
    }
}
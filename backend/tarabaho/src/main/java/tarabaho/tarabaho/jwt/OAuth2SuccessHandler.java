package tarabaho.tarabaho.jwt;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import tarabaho.tarabaho.jwt.JwtService;

import java.io.IOException;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;

    public OAuth2SuccessHandler(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // Get email from OAuth2 attributes (or another unique identifier you use)
        String email = oAuth2User.getAttribute("email");
        if (email == null) {
            throw new IllegalStateException("Email not found in OAuth2 user attributes.");
        }

        String token = jwtService.generateToken(email);

        // Redirect with token
        String redirectUrl = "http://localhost:5173/oauth2-success?token=" + token;
        response.sendRedirect(redirectUrl);
    }
}

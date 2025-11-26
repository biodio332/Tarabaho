/*package tarabaho.tarabaho.jwt;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;  // ← NEW
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;

    // This makes it work in both local dev and production
    @Value("${app.frontend.url:https://tarabaho.vercel.app}")
    private String frontendUrl;

    public OAuth2SuccessHandler(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        if (email == null) {
            response.sendRedirect(frontendUrl + "/signin?error=oauth_no_email");
            return;
        }

        String token = jwtService.generateToken(email);

        // Clean, professional redirect
        String redirectUrl = frontendUrl + "/oauth2-success?token=" + token;

        response.sendRedirect(redirectUrl);
    }
}*/
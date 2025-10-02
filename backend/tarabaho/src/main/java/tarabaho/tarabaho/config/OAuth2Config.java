package tarabaho.tarabaho.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Configuration
public class OAuth2Config {

    @Bean
    public AuthorizationRequestRepository<OAuth2AuthorizationRequest> authorizationRequestRepository() {
        System.out.println("Creating HttpSessionOAuth2AuthorizationRequestRepository bean...");
        return new HttpSessionOAuth2AuthorizationRequestRepository();
    }
}

class HttpSessionOAuth2AuthorizationRequestRepository implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {
    private static final String AUTHORIZATION_REQUEST_ATTR = "org.springframework.security.oauth2.client.web.AuthorizationRequestRepository.AUTHORIZATION_REQUEST";

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        String sessionId = session != null ? session.getId() : "null";
        System.out.println("Loading OAuth2AuthorizationRequest from session, JSESSIONID: " + sessionId);
        OAuth2AuthorizationRequest requestObj = session != null ? (OAuth2AuthorizationRequest) session.getAttribute(AUTHORIZATION_REQUEST_ATTR) : null;
        System.out.println("Loaded OAuth2AuthorizationRequest: " + (requestObj != null ? requestObj.getState() : "null"));
        return requestObj;
    }

    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest, HttpServletRequest request, HttpServletResponse response) {
        String sessionId = request.getSession().getId();
        System.out.println("Saving OAuth2AuthorizationRequest to session, JSESSIONID: " + sessionId);
        if (authorizationRequest == null) {
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.removeAttribute(AUTHORIZATION_REQUEST_ATTR);
                System.out.println("Removed OAuth2AuthorizationRequest from session");
            }
            return;
        }
        request.getSession().setAttribute(AUTHORIZATION_REQUEST_ATTR, authorizationRequest);
        System.out.println("Saved OAuth2AuthorizationRequest with state: " + authorizationRequest.getState());
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request, HttpServletResponse response) {
        HttpSession session = request.getSession(false);
        String sessionId = session != null ? session.getId() : "null";
        System.out.println("Removing OAuth2AuthorizationRequest from session, JSESSIONID: " + sessionId);
        OAuth2AuthorizationRequest authorizationRequest = session != null ? (OAuth2AuthorizationRequest) session.getAttribute(AUTHORIZATION_REQUEST_ATTR) : null;
        if (session != null) {
            session.removeAttribute(AUTHORIZATION_REQUEST_ATTR);
            System.out.println("Removed OAuth2AuthorizationRequest, state: " + (authorizationRequest != null ? authorizationRequest.getState() : "null"));
        }
        return authorizationRequest;
    }
}
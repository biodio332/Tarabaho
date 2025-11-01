package tarabaho.tarabaho.config;

import java.io.IOException;
import java.util.Base64;

import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class StateCaptureFilter extends OncePerRequestFilter {
    private static final String SESSION_TYPE_KEY = "oauth2_login_type"; // Match controller

    @Override
    protected void doFilterInternal(@SuppressWarnings("null") HttpServletRequest request, @SuppressWarnings("null") HttpServletResponse response, @SuppressWarnings("null") FilterChain filterChain)
            throws IOException, jakarta.servlet.ServletException {
        System.out.println("StateCaptureFilter: Processing request for URI: " + request.getRequestURI());
        if (isCallbackRequest(request)) {
            String state = request.getParameter("state");
            System.out.println("StateCaptureFilter: Captured state from callback: " + state);
            if (state != null && state.contains(":")) {
                String[] stateParts = state.split(":");
                if (stateParts.length == 2) {
                    String typeBase64 = stateParts[1];
                    try {
                        String type = new String(Base64.getDecoder().decode(typeBase64));
                        System.out.println("StateCaptureFilter: Extracted type from state: " + type);
                        request.getSession().setAttribute(SESSION_TYPE_KEY, type);
                    } catch (IllegalArgumentException e) {
                        System.err.println("StateCaptureFilter: Invalid Base64 encoding in state: " + e.getMessage());
                        request.getSession().setAttribute(SESSION_TYPE_KEY, "user");
                    }
                }
            } else {
                request.getSession().setAttribute(SESSION_TYPE_KEY, "user");
                System.out.println("StateCaptureFilter: No valid type found in state, defaulting to user");
            }
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            // No ThreadLocal cleanup needed
        }
    }

    private boolean isCallbackRequest(HttpServletRequest request) {
        AntPathRequestMatcher matcher = new AntPathRequestMatcher("/login/oauth2/code/*");
        return matcher.matches(request);
    }
}
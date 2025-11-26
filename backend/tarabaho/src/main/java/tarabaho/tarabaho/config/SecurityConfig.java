package tarabaho.tarabaho.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import tarabaho.tarabaho.jwt.JwtAuthFilter;
import tarabaho.tarabaho.jwt.OAuth2SuccessHandler;
import tarabaho.tarabaho.service.CustomOAuth2UserService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final String frontendUrl;
    private final JwtAuthFilter jwtAuthenticationFilter;
    private final ClientRegistrationRepository clientRegistrationRepository;
    private final AuthorizationRequestRepository<OAuth2AuthorizationRequest> customAuthorizationRequestRepository;
    private final OAuth2SuccessHandler oauth2SuccessHandler;

    // CONSTRUCTOR INJECTION — THIS FIXES THE CIRCULAR DEPENDENCY
    public SecurityConfig(
            @Value("${app.frontend.url:https://tarabaho.vercel.app}") String frontendUrl,
            JwtAuthFilter jwtAuthenticationFilter,
            ClientRegistrationRepository clientRegistrationRepository,
            AuthorizationRequestRepository<OAuth2AuthorizationRequest> customAuthorizationRequestRepository,
            OAuth2SuccessHandler oauth2SuccessHandler) {
        this.frontendUrl = frontendUrl;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.clientRegistrationRepository = clientRegistrationRepository;
        this.customAuthorizationRequestRepository = customAuthorizationRequestRepository;
        this.oauth2SuccessHandler = oauth2SuccessHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .sessionFixation().changeSessionId()
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/admin/register", "/api/admin/login", "/api/admin/logout").permitAll()
                .requestMatchers("/api/user/login", "/api/user/register", "/api/user/token",
                                 "/api/user/forgot-password", "/api/user/reset-password").permitAll()
                .requestMatchers("/api/graduate/register", "/api/graduate/check-duplicates",
                                 "/api/graduate/token", "/api/graduate/get-token", "/api/graduate/login",
                                 "/api/contact/submit", "/api/graduate/forgot-password", "/api/graduate/reset-password",
                                 "/api/graduate/{graduateId}/upload-initial-picture",
                                 "/swagger-ui/**", "/v3/api-docs/**", "/api/graduate/test-graduate",
                                 "/api/portfolio/public/graduate/*/portfolio", "/api/portfolio/graduate/*/portfolio/share-token").permitAll()
                .requestMatchers("/oauth2/**", "/login/**", "/oauth2-success").permitAll()
                .requestMatchers("/profiles/**", "/chat").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth -> oauth
                .authorizationEndpoint(a -> a
                    .authorizationRequestResolver(customAuthorizationRequestResolver())
                    .authorizationRequestRepository(customAuthorizationRequestRepository)
                )
                .userInfoEndpoint(u -> u.userService(customOAuth2UserService()))
                .successHandler(oauth2SuccessHandler)
                .failureHandler((req, res, ex) -> {
                    String error = java.net.URLEncoder.encode(
                        ex.getMessage() != null ? ex.getMessage() : "OAuth2 login failed", "UTF-8");
                    res.sendRedirect(frontendUrl + "/login-failed?error=" + error);
                })
            )
            .logout(l -> l
                .logoutUrl("/api/user/logout").logoutUrl("/api/graduate/logout")
                .logoutSuccessHandler((req, res, auth) -> {
                    var cookie = new jakarta.servlet.http.Cookie("jwtToken", null);
                    cookie.setMaxAge(0);
                    cookie.setPath("/");
                    cookie.setHttpOnly(true);
                    cookie.setSecure(true);
                    cookie.setAttribute("SameSite", "None");
                    res.addCookie(cookie);
                    res.getWriter().write("Logged out");
                })
                .permitAll()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(new StateCaptureFilter(), org.springframework.security.oauth2.client.web.OAuth2LoginAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CustomOAuth2AuthorizationRequestResolver customAuthorizationRequestResolver() {
        return new CustomOAuth2AuthorizationRequestResolver(clientRegistrationRepository);
    }

    @Bean
    public CustomOAuth2UserService customOAuth2UserService() {
        return new CustomOAuth2UserService();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        var config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173", "https://tarabaho.vercel.app"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowCredentials(true);
        config.setAllowedHeaders(List.of("*"));
        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

// Keep this exactly as you have it — it's perfect
class CustomOAuth2AuthorizationRequestResolver implements org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver {
    private final org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver delegate;

    public CustomOAuth2AuthorizationRequestResolver(ClientRegistrationRepository repo) {
        this.delegate = new org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver(repo, "/oauth2/authorization");
    }

    @Override
    public OAuth2AuthorizationRequest resolve(jakarta.servlet.http.HttpServletRequest request) {
        return customize(delegate.resolve(request), request);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(jakarta.servlet.http.HttpServletRequest request, String clientRegistrationId) {
        return customize(delegate.resolve(request, clientRegistrationId), request);
    }

    private OAuth2AuthorizationRequest customize(OAuth2AuthorizationRequest req, jakarta.servlet.http.HttpServletRequest request) {
        if (req == null) return null;
        String type = request.getParameter("type");
        if (type == null || (!"user".equals(type) && !"graduate".equals(type))) type = "user";
        String encoded = java.util.Base64.getEncoder().encodeToString(type.getBytes());
        String newState = req.getState() + ":" + encoded;
        return OAuth2AuthorizationRequest.from(req).state(newState).build();
    }
}
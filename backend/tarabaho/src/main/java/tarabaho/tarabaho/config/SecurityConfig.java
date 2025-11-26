package tarabaho.tarabaho.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
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

import jakarta.servlet.http.HttpServletResponse;
import tarabaho.tarabaho.jwt.JwtAuthFilter;
import tarabaho.tarabaho.jwt.OAuth2SuccessHandler;
import tarabaho.tarabaho.service.CustomOAuth2UserService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${app.frontend.url:https://tarabaho.vercel.app}")
    private String frontendUrl;

    @Autowired
    private JwtAuthFilter jwtAuthenticationFilter;

    @Autowired
    private ClientRegistrationRepository clientRegistrationRepository;

    @Autowired
    private AuthorizationRequestRepository<OAuth2AuthorizationRequest> customAuthorizationRequestRepository;

    @Autowired
    private CustomOAuth2UserService customOAuth2UserService;

    @Autowired
    private OAuth2SuccessHandler oauth2SuccessHandler;  // THIS IS NOW USED!

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .sessionFixation().changeSessionId()
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/admin/register", "/api/admin/login", "/api/admin/logout").permitAll()
                .requestMatchers("/api/user/login", "/api/user/register", "/api/user/token", "/api/user/forgot-password", "/api/user/reset-password").permitAll()
                .requestMatchers(
                    "/api/graduate/register",
                    "/api/graduate/check-duplicates",
                    "/api/graduate/token",
                    "/api/graduate/get-token",
                    "/api/graduate/login",
                    "/api/contact/submit",
                    "/api/graduate/forgot-password",
                    "/api/graduate/reset-password",
                    "/api/graduate/{graduateId}/upload-initial-picture",
                    "/swagger-ui/**", "/v3/api-docs/**",
                    "/api/graduate/test-graduate",
                    "/api/portfolio/public/graduate/*/portfolio",
                    "/api/portfolio/graduate/*/portfolio/share-token"
                ).permitAll()
                .requestMatchers("/api/certificate/graduate/**").authenticated()
                .requestMatchers("/oauth2/**", "/login/**", "/oauth2-success").permitAll()
                .requestMatchers("/profiles/**").permitAll()
                .requestMatchers("/chat").permitAll()
                .requestMatchers("/api/admin/**", "/api/contact/inquiries", "/api/contact/delete/{id}").authenticated()
                .requestMatchers("/api/user/me", "/api/user/update-phone").authenticated()
                .requestMatchers("/api/user/**").authenticated()
                .requestMatchers("/api/graduate/**").authenticated()
                .requestMatchers("/api/certificate/**").authenticated()
                .requestMatchers("/api/portfolio").authenticated()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth -> oauth
                .authorizationEndpoint(authz -> authz
                    .authorizationRequestResolver(customAuthorizationRequestResolver())
                    .authorizationRequestRepository(customAuthorizationRequestRepository)
                )
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)
                )
                // THIS IS THE ONLY CHANGE THAT MATTERS
                .successHandler(oauth2SuccessHandler)  // Now your real handler runs!
                .failureHandler((request, response, exception) -> {
                    String error = java.net.URLEncoder.encode(
                        exception.getMessage() != null ? exception.getMessage() : "OAuth2 login failed",
                        "UTF-8"
                    );
                    response.sendRedirect(frontendUrl + "/login-failed?error=" + error);
                })
            )
            .logout(logout -> logout
                .logoutUrl("/api/user/logout")
                .logoutUrl("/api/graduate/logout")
                .logoutSuccessHandler((request, response, authentication) -> {
                    var cookie = new jakarta.servlet.http.Cookie("jwtToken", null);
                    cookie.setMaxAge(0);
                    cookie.setPath("/");
                    cookie.setHttpOnly(true);
                    cookie.setSecure(true);
                    cookie.setAttribute("SameSite", "None");
                    response.addCookie(cookie);
                    response.setStatus(HttpServletResponse.SC_OK);
                    response.getWriter().write("Logged out");
                })
                .invalidateHttpSession(true)
                .permitAll()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(new StateCaptureFilter(), org.springframework.security.oauth2.client.web.OAuth2LoginAuthenticationFilter.class)
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, res, authEx) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized"))
            );

        return http.build();
    }

    @Bean
    public CustomOAuth2AuthorizationRequestResolver customAuthorizationRequestResolver() {
        return new CustomOAuth2AuthorizationRequestResolver(clientRegistrationRepository);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173", "https://tarabaho.vercel.app"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowCredentials(true);
        config.setAllowedHeaders(List.of("*"));
        config.addExposedHeader("Set-Cookie");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public CustomOAuth2UserService customOAuth2UserService() {
        return new CustomOAuth2UserService();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public TaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(Integer.parseInt(System.getenv().getOrDefault("ASYNC_CORE_POOL_SIZE", "5")));
        executor.setMaxPoolSize(Integer.parseInt(System.getenv().getOrDefault("ASYNC_MAX_POOL_SIZE", "10")));
        executor.setQueueCapacity(Integer.parseInt(System.getenv().getOrDefault("ASYNC_QUEUE_CAPACITY", "100")));
        executor.setThreadNamePrefix("EmailAsync-");
        executor.initialize();
        return executor;
    }
}

// Keep your CustomOAuth2AuthorizationRequestResolver class exactly as before
class CustomOAuth2AuthorizationRequestResolver implements org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver {
    private final org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver delegate;

    public CustomOAuth2AuthorizationRequestResolver(ClientRegistrationRepository repo) {
        this.delegate = new org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver(
            repo, "/oauth2/authorization"
        );
    }

    @Override
    public OAuth2AuthorizationRequest resolve(jakarta.servlet.http.HttpServletRequest request) {
        OAuth2AuthorizationRequest req = delegate.resolve(request);
        return customize(req, request);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(jakarta.servlet.http.HttpServletRequest request, String clientRegistrationId) {
        OAuth2AuthorizationRequest req = delegate.resolve(request, clientRegistrationId);
        return customize(req, request);
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

package tarabaho.tarabaho.config;

import java.util.Arrays;
import java.util.Base64;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import tarabaho.tarabaho.jwt.JwtAuthFilter;
import tarabaho.tarabaho.service.CustomOAuth2UserService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {


    @Autowired
    private JwtAuthFilter jwtAuthenticationFilter;

    @Autowired
    private ClientRegistrationRepository clientRegistrationRepository;

    @Autowired
    private AuthorizationRequestRepository<OAuth2AuthorizationRequest> customAuthorizationRequestRepository;

    @Bean
    @SuppressWarnings("CallToPrintStackTrace")
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        System.out.println("Applying SecurityFilterChain configuration...");

        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> {
                System.out.println("Disabling CSRF protection");
                csrf.disable();
            })
            .sessionManagement(session -> {
                System.out.println("Configuring session management...");
                session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED);
                session.sessionFixation().changeSessionId();
            })
            .authorizeHttpRequests(auth -> {
                System.out.println("Configuring authorization rules...");
                auth
                    .requestMatchers("/api/admin/register", "/api/admin/login", "/api/admin/logout").permitAll()
                    .requestMatchers("/api/user/login", "/api/user/register", "/api/user/token","/api/user/forgot-password",
                        "/api/user/reset-password").permitAll()
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
                        "/swagger-ui/**", 
                        "/v3/api-docs/**",
                        "/api/graduate/test-graduate",
                        "/api/portfolio/public/graduate/*/portfolio",
                        "/api/portfolio/graduate/*/portfolio/share-token"
                    ).permitAll()
                    .requestMatchers("/api/certificate/graduate/**").authenticated()
                    .requestMatchers("/oauth2/**", "/login/**", "/oauth2-success").permitAll()
                    .requestMatchers("/profiles/**").permitAll()
                    .requestMatchers("/chat").permitAll() 
                    .requestMatchers("/api/admin/**","/api/contact/inquiries","/api/contact/delete/{id}").authenticated()
                    .requestMatchers("/api/user/me", "/api/user/update-phone").authenticated()
                    .requestMatchers("/api/user/**").authenticated()
                    .requestMatchers("/api/graduate/**").authenticated()
                    .requestMatchers("/api/certificate/**").authenticated()
                    .requestMatchers("/api/portfolio").authenticated()
                    .anyRequest().authenticated();
                System.out.println("Authorization rules configured.");
            })
            .oauth2Login(oauth -> {
                System.out.println("Configuring OAuth2 login...");
                oauth
                    .authorizationEndpoint(authzEndpoint -> authzEndpoint
                        .authorizationRequestResolver(customAuthorizationRequestResolver())
                        .authorizationRequestRepository(customAuthorizationRequestRepository)
                    )
                    .userInfoEndpoint(userInfo -> userInfo
                        .userService(customOAuth2UserService())
                    )
                    .successHandler((request, response, authentication) -> {
                        System.out.println("OAuth2 login successful, redirecting to /oauth2-success");
                        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
                        System.out.println("OAuth2User attributes: " + oauth2User.getAttributes());
                        response.sendRedirect("/oauth2-success");
                    })
                    .failureHandler((request, response, exception) -> {
                        System.err.println("OAuth2 login failed: " + exception.getMessage());
                        exception.printStackTrace();
                        String errorMessage = java.net.URLEncoder.encode(
                            exception.getMessage() != null ? exception.getMessage() : "Unknown OAuth2 error",
                            "UTF-8"
                        );
                        System.out.println("Redirecting to: http://localhost:5173/login-failed?error=" + errorMessage);
                        response.sendRedirect("http://localhost:5173/login-failed?error=" + errorMessage);
                    });
            })
            .logout(logout -> {
                    System.out.println("Configuring logout...");
                    logout
                        .logoutUrl("/api/user/logout")
                        .logoutUrl("/api/graduate/logout") // Add graduate logout URL
                        .logoutSuccessHandler((request, response, authentication) -> {
                            Cookie tokenCookie = new Cookie("jwtToken", null);
                            tokenCookie.setMaxAge(0);
                            tokenCookie.setPath("/");
                            tokenCookie.setHttpOnly(true);
                            tokenCookie.setSecure(true); // Match login's Secure=true for https
                            tokenCookie.setAttribute("SameSite", "None");
                            response.addCookie(tokenCookie);
                            System.out.println("Logout: Sent Set-Cookie - jwtToken=; Path=/; Max-Age=0; HttpOnly; Secure=true; SameSite=None");
                            response.setStatus(HttpServletResponse.SC_OK);
                            response.getWriter().write("User logged out successfully.");
                        })
                        .invalidateHttpSession(true)
                        .permitAll();
                })
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(new StateCaptureFilter(), org.springframework.security.oauth2.client.web.OAuth2LoginAuthenticationFilter.class) // Add StateCaptureFilter here
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    System.out.println("Unauthorized request to: " + request.getRequestURI() + ", Error: " + authException.getMessage());
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized: " + authException.getMessage());
                })
            )
            .httpBasic(Customizer.withDefaults());

        System.out.println("SecurityFilterChain configuration applied.");
        return http.build();
    }

    @Bean
    public OAuth2AuthorizationRequestResolver customAuthorizationRequestResolver() {
        System.out.println("Creating CustomOAuth2AuthorizationRequestResolver bean...");
        return new CustomOAuth2AuthorizationRequestResolver(clientRegistrationRepository);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        System.out.println("Configuring CORS...");
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList("http://localhost:5173", "https://tarabaho.vercel.app"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowCredentials(true);
        config.setAllowedHeaders(List.of("*"));
        config.addExposedHeader("Set-Cookie");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        System.out.println("CORS configuration applied.");
        return source;
    }

    @Bean
    public CustomOAuth2UserService customOAuth2UserService() {
        System.out.println("Creating CustomOAuth2UserService bean...");
        return new CustomOAuth2UserService();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        System.out.println("Creating BCryptPasswordEncoder bean...");
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthorizationRequestRepository<OAuth2AuthorizationRequest> customAuthorizationRequestRepository() {
        return customAuthorizationRequestRepository;
    }
}

class CustomOAuth2AuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {
    private final OAuth2AuthorizationRequestResolver delegate;

    public CustomOAuth2AuthorizationRequestResolver(ClientRegistrationRepository clientRegistrationRepository) {
        this.delegate = new DefaultOAuth2AuthorizationRequestResolver(
            clientRegistrationRepository, OAuth2AuthorizationRequestRedirectFilter.DEFAULT_AUTHORIZATION_REQUEST_BASE_URI
        );
        System.out.println("CustomOAuth2AuthorizationRequestResolver: Initialized");
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        System.out.println("CustomOAuth2AuthorizationRequestResolver: Resolving OAuth2 authorization request for URI: " + request.getRequestURI());
        System.out.println("CustomOAuth2AuthorizationRequestResolver: Query string: " + request.getQueryString());
        OAuth2AuthorizationRequest authorizationRequest = delegate.resolve(request);
        return customizeAuthorizationRequest(request, authorizationRequest);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
        System.out.println("CustomOAuth2AuthorizationRequestResolver: Resolving OAuth2 authorization request for client: " + clientRegistrationId);
        System.out.println("CustomOAuth2AuthorizationRequestResolver: Query string: " + request.getQueryString());
        OAuth2AuthorizationRequest authorizationRequest = delegate.resolve(request, clientRegistrationId);
        return customizeAuthorizationRequest(request, authorizationRequest);
    }

    private OAuth2AuthorizationRequest customizeAuthorizationRequest(HttpServletRequest request, OAuth2AuthorizationRequest authorizationRequest) {
        if (authorizationRequest == null) {
            System.out.println("CustomOAuth2AuthorizationRequestResolver: No OAuth2AuthorizationRequest created");
            return null;
        }
        String type = request.getParameter("type");
        System.out.println("CustomOAuth2AuthorizationRequestResolver: Received type parameter: " + type);
        if (type == null || type.isEmpty() || !("user".equals(type) || "graduate".equals(type))) {
            type = "user";
            System.out.println("CustomOAuth2AuthorizationRequestResolver: Invalid or missing type parameter, defaulting to: " + type);
        }

        // Encode type and include it in the state
        String encodedType = Base64.getEncoder().encodeToString(type.getBytes());
        String originalState = authorizationRequest.getState();
        String newState = originalState + ":" + encodedType;
        System.out.println("CustomOAuth2AuthorizationRequestResolver: Updated state with type: " + newState);

        return OAuth2AuthorizationRequest.from(authorizationRequest)
            .state(newState)
            .build();
    }
}
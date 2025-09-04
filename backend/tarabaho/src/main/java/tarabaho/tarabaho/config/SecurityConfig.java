package tarabaho.tarabaho.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import tarabaho.tarabaho.jwt.JwtAuthFilter;
import tarabaho.tarabaho.jwt.JwtUtil;
import tarabaho.tarabaho.service.CustomOAuth2UserService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
	
	@Autowired
	private JwtUtil jwtUtil;
	
	@Autowired
	private JwtAuthFilter jwtAuthenticationFilter;
	
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		System.out.println("Applying SecurityFilterChain configuration...");
		
		http
			.cors(Customizer.withDefaults())
			.csrf(csrf -> {
				System.out.println("Disabling CSRF protection");
				csrf.disable();
			})
			.authorizeHttpRequests(auth -> {
				System.out.println("Configuring authorization rules...");
				auth
					// Public endpoints
					.requestMatchers("/api/admin/register", "/api/admin/login", "/api/admin/logout").permitAll()
					.requestMatchers("/api/user/login", "/api/user/register", "/api/user/token").permitAll()
					.requestMatchers(
						"/api/graduate/register",
						"/api/graduate/check-duplicates",
						"/api/graduate/token",
						"/api/graduate/login",
						"/api/graduate/{graduateId}/upload-initial-picture",
						"/swagger-ui/**", 
						"/v3/api-docs/**",
						"/api/graduate/test-graduate"
					).permitAll()
					.requestMatchers("/api/certificate/graduate/**").authenticated()
					.requestMatchers("/oauth2/**", "/login/**", "/oauth2-success").permitAll()
					.requestMatchers("/profiles/**").permitAll()
					.requestMatchers("/chat").permitAll() 
					// Authenticated endpoints
					.requestMatchers("/api/admin/**").authenticated()
					.requestMatchers("/api/user/me", "/api/user/update-phone").authenticated()
					.requestMatchers("/api/user/**").authenticated()
					.requestMatchers("/api/graduate/**").authenticated()
					.requestMatchers("/api/certificate/**").authenticated()
					.requestMatchers("/api/portfolio").authenticated()
					// All other requests require authentication
					.anyRequest().authenticated();
				System.out.println("Authorization rules configured.");
			})
			.oauth2Login(oauth -> {
				System.out.println("Configuring OAuth2 login...");
				oauth	
					.defaultSuccessUrl("/oauth2-success", true)
					.failureUrl("http://localhost:5173/login-failed")
					.userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService()));
			})
			.logout(logout -> {
				System.out.println("Configuring logout...");
				logout
					.logoutUrl("/api/user/logout")
					.logoutSuccessHandler((request, response, authentication) -> {
						Cookie tokenCookie = new Cookie("jwtToken", null);
						tokenCookie.setMaxAge(0);
						tokenCookie.setPath("/");
						tokenCookie.setHttpOnly(true);
						tokenCookie.setSecure(true); // Use false for local dev, true for production
						tokenCookie.setAttribute("SameSite", "None");
						response.addCookie(tokenCookie);
						System.out.println("Logout: Sent Set-Cookie - jwtToken=; Path=/; Max-Age=0; HttpOnly; SameSite=None");
						response.setStatus(HttpServletResponse.SC_OK);
						response.getWriter().write("User logged out successfully.");
					})
					.invalidateHttpSession(true) // Invalidate session
					.permitAll();
			})
			.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
			.exceptionHandling(exceptions -> exceptions
				.authenticationEntryPoint((request, response, authException) -> {
					System.out.println("Unauthorized request to: " + request.getRequestURI());
					response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
				})
			)
			.httpBasic(Customizer.withDefaults());

		System.out.println("SecurityFilterChain configuration applied.");
		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		System.out.println("Configuring CORS...");
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowedOrigins(Arrays.asList("http://localhost:5173", "https://it-342-tarabaho-8q1h-89v462nt1-jilus-projects.vercel.app","https://it-342-tarabaho-8q1h-1mdxu5490-jilus-projects.vercel.app","https://it-342-tarabaho-8q1h.vercel.app")); // Update for production
		config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		config.setAllowCredentials(true);
		config.setAllowedHeaders(List.of("*"));
	
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
}
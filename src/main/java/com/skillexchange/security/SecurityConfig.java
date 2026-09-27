package com.skillexchange.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security Configuration
 * Configures role-based access control, BCrypt password hashing,
 * and endpoint protection for students and administrators.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))
            .authorizeHttpRequests(auth -> auth
                // Static web pages and assets
                .requestMatchers(
                    "/", "/index.html", "/login.html", "/register.html",
                    "/dashboard.html", "/profile.html", "/skills.html",
                    "/matches.html", "/requests.html", "/chat.html",
                    "/notifications.html", "/verification.html",
                    "/exchange-history.html", "/admin-dashboard.html",
                    "/css/**", "/js/**", "/images/**", "/uploads/**",
                    "/h2-console/**"
                ).permitAll()

                // Public Authentication and Skill Catalogue Endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/skills/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/students/public/**").permitAll()

                // Admin-only Endpoints
                .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/verifications/pending", "/api/verifications/*/approve", "/api/verifications/*/reject", "/api/verifications/*/request-resubmission").hasAuthority("ROLE_ADMIN")

                // Student and General Authenticated API Endpoints
                .requestMatchers("/api/students/**").authenticated()
                .requestMatchers("/api/matches/**").authenticated()
                .requestMatchers("/api/exchange-requests/**").authenticated()
                .requestMatchers("/api/messages/**").authenticated()
                .requestMatchers("/api/verifications/**").authenticated()
                .requestMatchers("/api/reviews/**").authenticated()
                .requestMatchers("/api/notifications/**").authenticated()
                .requestMatchers("/api/reports/**").authenticated()

                // Any other request
                .anyRequest().permitAll()
            )
            .httpBasic(Customizer.withDefaults())
            .formLogin(form -> form
                .loginPage("/login.html")
                .loginProcessingUrl("/perform_login")
                .defaultSuccessUrl("/dashboard.html", true)
                .failureUrl("/login.html?error=true")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessUrl("/login.html?logout=true")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .permitAll()
            );

        return http.build();
    }
}

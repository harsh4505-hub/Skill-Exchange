package com.skillexchange.service;

import com.skillexchange.dto.AuthRequestDto;
import com.skillexchange.dto.AuthResponseDto;
import com.skillexchange.dto.RegisterRequestDto;
import com.skillexchange.entity.StudentProfile;
import com.skillexchange.entity.User;
import com.skillexchange.exception.BadRequestException;
import com.skillexchange.exception.DuplicateResourceException;
import com.skillexchange.exception.UnauthorizedException;
import com.skillexchange.repository.StudentProfileRepository;
import com.skillexchange.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * AuthService manages student registration, credential verification,
 * and security session lifecycle.
 */
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository profileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private HttpServletRequest request;

    /**
     * Registers a new student account and creates their demographic profile.
     */
    @Transactional
    public AuthResponseDto registerStudent(RegisterRequestDto dto) {
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new BadRequestException("Password and Confirm Password do not match");
        }

        if (userRepository.existsByEmail(dto.getEmail().trim().toLowerCase())) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        // Create User entity with encrypted password
        User user = new User();
        user.setEmail(dto.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole("ROLE_STUDENT");
        user.setActive(true);
        User savedUser = userRepository.save(user);

        // Create initial Student Profile
        StudentProfile profile = new StudentProfile();
        profile.setUser(savedUser);
        profile.setFullName(dto.getFullName().trim());
        profile.setCollege(dto.getCollege().trim());
        profile.setDepartment(dto.getDepartment().trim());
        profile.setYearOfStudy(dto.getYearOfStudy().trim());
        profile.setPhone(dto.getPhone() != null ? dto.getPhone().trim() : null);
        profile.setBio("Hello! I am a student at " + dto.getCollege() + " looking to exchange skills.");
        profile.setAvatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=" + savedUser.getId());
        profileRepository.save(profile);

        // Auto authenticate session
        authenticateSession(dto.getEmail().trim().toLowerCase(), dto.getPassword());

        return new AuthResponseDto(
                true,
                "Student registration successful!",
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getRole(),
                profile.getFullName()
        );
    }

    /**
     * Authenticates user credentials via Spring Security and stores session.
     */
    public AuthResponseDto login(AuthRequestDto dto) {
        authenticateSession(dto.getEmail().trim().toLowerCase(), dto.getPassword());

        User user = userRepository.findByEmail(dto.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        String fullName = user.getEmail();
        if (user.getStudentProfile() != null) {
            fullName = user.getStudentProfile().getFullName();
        } else if ("ROLE_ADMIN".equals(user.getRole())) {
            fullName = "System Administrator";
        }

        return new AuthResponseDto(
                true,
                "Login successful!",
                user.getId(),
                user.getEmail(),
                user.getRole(),
                fullName
        );
    }

    private void authenticateSession(String email, String rawPassword) {
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(email, rawPassword);
        Authentication authentication = authenticationManager.authenticate(authToken);

        SecurityContext securityContext = SecurityContextHolder.getContext();
        securityContext.setAuthentication(authentication);

        HttpSession session = request.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, securityContext);
    }

    /**
     * Resolves currently authenticated user from SecurityContext.
     */
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new UnauthorizedException("No authenticated user found. Please login.");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UnauthorizedException("Authenticated user record not found"));
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}

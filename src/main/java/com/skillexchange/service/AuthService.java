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

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AuthService.class);

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

    private static final java.util.regex.Pattern COLLEGE_EMAIL_PATTERN =
            java.util.regex.Pattern.compile("^[a-zA-Z0-9._%+-]+@mgmmumbai\\.ac\\.in$", java.util.regex.Pattern.CASE_INSENSITIVE);

    public static boolean isValidCollegeEmail(String email) {
        if (email == null) return false;
        return COLLEGE_EMAIL_PATTERN.matcher(email.trim()).matches();
    }

    @Autowired
    private com.skillexchange.repository.EmailVerificationRepository verificationRepository;

    @Autowired(required = false)
    private EmailService emailService;

    private static final java.security.SecureRandom SECURE_RANDOM = new java.security.SecureRandom();

    public static String generateOtp() {
        int code = 100000 + SECURE_RANDOM.nextInt(900000);
        return String.valueOf(code);
    }

    /**
     * Registers a new student account as unverified and dispatches OTP email.
     */
    @Transactional
    public AuthResponseDto registerStudent(RegisterRequestDto dto) {
        String normalizedEmail = dto.getEmail() != null ? dto.getEmail().trim().toLowerCase() : "";
        if (!isValidCollegeEmail(normalizedEmail)) {
            throw new BadRequestException("Please use your official college email address ending with @mgmmumbai.ac.in.");
        }

        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new BadRequestException("Password and Confirm Password do not match");
        }

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        // Generate cryptographically secure 6-digit OTP
        String rawOtp = generateOtp();

        // Dispatch verification email to college address
        if (emailService != null) {
            try {
                emailService.sendVerificationEmail(normalizedEmail, dto.getFullName(), rawOtp);
            } catch (Exception ex) {
                log.error("Verification email failed for [{}]: {}", normalizedEmail, ex.getMessage());
                throw new BadRequestException("We couldn't send the verification email. Please try again.");
            }
        }

        // Create User entity as unverified and inactive until OTP validation
        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole("ROLE_STUDENT");
        user.setActive(false);
        user.setEmailVerified(false);
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

        // Save hashed OTP with 10-minute expiry
        com.skillexchange.entity.EmailVerification verification = new com.skillexchange.entity.EmailVerification(
                normalizedEmail,
                savedUser.getId(),
                passwordEncoder.encode(rawOtp),
                java.time.LocalDateTime.now().plusMinutes(10)
        );
        verificationRepository.save(verification);

        return new AuthResponseDto(
                true,
                "Registration initiated! A verification code has been dispatched to your @mgmmumbai.ac.in college email.",
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getRole(),
                profile.getFullName()
        );
    }

    /**
     * Validates 6-digit OTP and activates the student account.
     */
    @Transactional
    public void verifyEmail(String email, String otp) {
        String normalizedEmail = (email != null) ? email.trim().toLowerCase() : "";
        if (!isValidCollegeEmail(normalizedEmail)) {
            throw new BadRequestException("Invalid college email address.");
        }

        if (otp == null || !otp.matches("^\\d{6}$")) {
            throw new BadRequestException("Please enter a valid 6-digit confirmation code.");
        }

        com.skillexchange.entity.EmailVerification verification = verificationRepository
                .findTopByEmailOrderByCreatedAtDesc(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("No active verification code found for this email. Please request a new code."));

        if (verification.isUsed()) {
            throw new BadRequestException("This verification code has already been used. Please log in.");
        }

        if (verification.isExpired()) {
            throw new BadRequestException("This verification code has expired. Please request a new code.");
        }

        if (verification.getAttemptCount() >= 5) {
            throw new BadRequestException("Too many incorrect attempts. Please request a new verification code.");
        }

        if (!passwordEncoder.matches(otp, verification.getOtpHash())) {
            verification.setAttemptCount(verification.getAttemptCount() + 1);
            verificationRepository.save(verification);
            int remaining = 5 - verification.getAttemptCount();
            if (remaining <= 0) {
                throw new BadRequestException("Too many incorrect attempts. Please request a new verification code.");
            }
            throw new BadRequestException("Incorrect verification code. " + remaining + " attempts remaining.");
        }

        // Verification successful
        verification.setUsed(true);
        verificationRepository.save(verification);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("Student account not found."));
        user.setEmailVerified(true);
        user.setActive(true);
        userRepository.save(user);
    }

    /**
     * Resends fresh 6-digit OTP code to student's college mailbox with rate limiting.
     */
    @Transactional
    public void resendOtp(String email) {
        String normalizedEmail = (email != null) ? email.trim().toLowerCase() : "";
        if (!isValidCollegeEmail(normalizedEmail)) {
            throw new BadRequestException("Invalid college email address.");
        }

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("No student account found with this email."));

        if (user.isEmailVerified()) {
            throw new BadRequestException("This email address is already verified.");
        }

        var existing = verificationRepository.findTopByEmailOrderByCreatedAtDesc(normalizedEmail);
        if (existing.isPresent()) {
            java.time.Duration diff = java.time.Duration.between(existing.get().getLastSentAt(), java.time.LocalDateTime.now());
            if (diff.getSeconds() < 60) {
                throw new BadRequestException("Please wait " + (60 - diff.getSeconds()) + "s before requesting a new code.");
            }
        }

        String rawOtp = generateOtp();
        String name = user.getStudentProfile() != null ? user.getStudentProfile().getFullName() : "Student";

        if (emailService != null) {
            try {
                emailService.sendVerificationEmail(normalizedEmail, name, rawOtp);
            } catch (Exception ex) {
                log.error("Verification email failed during resend for [{}]: {}", normalizedEmail, ex.getMessage());
                throw new BadRequestException("We couldn't send the verification email. Please try again.");
            }
        }

        com.skillexchange.entity.EmailVerification verification = new com.skillexchange.entity.EmailVerification(
                normalizedEmail,
                user.getId(),
                passwordEncoder.encode(rawOtp),
                java.time.LocalDateTime.now().plusMinutes(10)
        );
        verificationRepository.save(verification);
    }

    /**
     * Authenticates user credentials via Spring Security and stores session.
     */
    public AuthResponseDto login(AuthRequestDto dto) {
        String normalizedEmail = dto.getEmail() != null ? dto.getEmail().trim().toLowerCase() : "";
        if (!isValidCollegeEmail(normalizedEmail)) {
            throw new BadRequestException("Please use your official college email address ending with @mgmmumbai.ac.in.");
        }

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!user.isEmailVerified()) {
            throw new UnauthorizedException("Please verify your college email before accessing your account.");
        }

        if (!user.isActive()) {
            throw new UnauthorizedException("This account has been deactivated or suspended by administrator.");
        }

        authenticateSession(normalizedEmail, dto.getPassword());

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

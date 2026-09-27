package com.skillexchange.service;

import com.skillexchange.exception.BadRequestException;
import jakarta.mail.AuthenticationFailedException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

/**
 * Real Gmail SMTP delivery service for student email verification.
 */
@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailSenderUsername;

    @Value("${spring.mail.password:}")
    private String mailSenderPassword;

    /**
     * Sends the secure 6-digit verification code to the student's official college email.
     * Technical causes are logged on the server while presenting safe user messages.
     */
    public void sendVerificationEmail(String recipientEmail, String studentName, String otpCode) {
        String cleanUser = mailSenderUsername != null ? mailSenderUsername.trim() : "";
        String cleanPass = mailSenderPassword != null ? mailSenderPassword.trim() : "";

        boolean isUserConfigured = !cleanUser.isEmpty();
        boolean isPassConfigured = !cleanPass.isEmpty();
        boolean isRecipientValid = AuthService.isValidCollegeEmail(recipientEmail);

        logger.info("\n==================== [EMAIL DEBUG] ====================");
        logger.info("SMTP host configured: YES (smtp.gmail.com)");
        logger.info("SMTP port: 587");
        logger.info("MAIL_USERNAME configured: {}", isUserConfigured ? "YES" : "NO");
        logger.info("MAIL_PASSWORD configured: {}", isPassConfigured ? "YES" : "NO");
        logger.info("JavaMailSender available: {}", mailSender != null ? "YES" : "NO");
        logger.info("Recipient domain valid (@mgmmumbai.ac.in): {}", isRecipientValid ? "YES" : "NO");

        if (mailSender == null || !isUserConfigured || !isPassConfigured) {
            String reason = (!isUserConfigured && !isPassConfigured)
                    ? "Both MAIL_USERNAME and MAIL_PASSWORD are missing from the environment"
                    : (!isUserConfigured ? "MAIL_USERNAME is not configured" : "MAIL_PASSWORD is not configured");
            logger.info("SMTP connection: NOT ATTEMPTED");
            logger.info("Reason: {}", reason);
            logger.info("Remedy: Set MAIL_USERNAME and MAIL_PASSWORD in application.properties or environment variables.");
            logger.info("========================================================\n");
            throw new BadRequestException("We couldn't send the verification email. Please try again.");
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

            String displayName = (studentName != null && !studentName.isBlank()) ? studentName.trim() : "Student";

            helper.setFrom(cleanUser, "Student Skill Exchange");
            helper.setTo(recipientEmail);
            helper.setSubject("Verify Your Student Skill Exchange Account");

            String textBody = "Student Skill Exchange\n\n"
                    + "Hello " + displayName + ",\n\n"
                    + "Thank you for registering with Student Skill Exchange.\n\n"
                    + "Your 6-digit verification code is:\n\n"
                    + otpCode + "\n\n"
                    + "This code will expire in 10 minutes.\n\n"
                    + "If you did not create this account, you can safely ignore this email.\n\n"
                    + "Student Skill Exchange";

            String htmlBody = "<div style=\"font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff; color: #1e293b;\">"
                    + "<div style=\"text-align: center; margin-bottom: 24px;\">"
                    + "<h2 style=\"margin: 0; color: #0f172a; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;\">Student Skill Exchange</h2>"
                    + "<p style=\"margin: 4px 0 0; color: #64748b; font-size: 13px; font-weight: 500;\">Official MGM Student Peer Learning Network</p>"
                    + "</div>"
                    + "<div style=\"border-top: 1px solid #f1f5f9; padding-top: 20px;\">"
                    + "<p style=\"font-size: 15px; line-height: 1.5; margin: 0 0 16px;\">Hello <strong>" + displayName + "</strong>,</p>"
                    + "<p style=\"font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px;\">"
                    + "Thank you for registering with Student Skill Exchange. Use the 6-digit confirmation code below to verify your official college email address:"
                    + "</p>"
                    + "<div style=\"background: #f8fafc; border: 2px dashed #0f172a; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;\">"
                    + "<span style=\"font-size: 34px; font-weight: 800; font-family: 'Courier New', Courier, monospace; letter-spacing: 8px; color: #0f172a;\">" + otpCode + "</span>"
                    + "</div>"
                    + "<p style=\"font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 12px;\">"
                    + "⏳ <strong>This code will expire in 10 minutes.</strong>"
                    + "</p>"
                    + "<p style=\"font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 12px;\">"
                    + "If you did not create this account, you can safely ignore this email."
                    + "</p>"
                    + "<p style=\"font-size: 12px; color: #94a3b8; margin: 24px 0 0; border-top: 1px solid #f1f5f9; padding-top: 16px;\">"
                    + "Student Skill Exchange &bull; MGM Mumbai"
                    + "</p>"
                    + "</div>"
                    + "</div>";

            helper.setText(textBody, htmlBody);
            mailSender.send(message);

            logger.info("SMTP connection: SUCCESS");
            logger.info("Email delivery: DELIVERED to {}", recipientEmail);
            logger.info("========================================================\n");
        } catch (Exception ex) {
            logger.info("SMTP connection: FAILED");
            String failureReason = ex.getMessage();
            Throwable cause = ex;
            while (cause != null) {
                if (cause instanceof AuthenticationFailedException) {
                    failureReason = "SMTP 535: Authentication failed (Invalid Gmail username or Google App Password).";
                    break;
                }
                if (cause.getMessage() != null && cause.getMessage().contains("Connection timed out")) {
                    failureReason = "Connection timeout connecting to smtp.gmail.com:587.";
                    break;
                }
                cause = cause.getCause();
            }

            logger.error("Reason: {}", failureReason);
            logger.info("========================================================\n");
            throw new BadRequestException("We couldn't send the verification email. Please try again.");
        }
    }
}

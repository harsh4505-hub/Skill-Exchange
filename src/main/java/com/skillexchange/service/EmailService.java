package com.skillexchange.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

/**
 * Service to deliver secure OTP emails to student college inboxes via SMTP.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@mgmmumbai.ac.in}")
    private String mailFrom;

    /**
     * Dispatches 6-digit OTP verification code to registered college email.
     */
    public void sendVerificationEmail(String recipientEmail, String studentName, String otpCode) throws MessagingException {
        if (mailSender == null) {
            log.error("JavaMailSender is not initialized. Please configure MAIL_HOST, MAIL_USERNAME, and MAIL_PASSWORD.");
            throw new IllegalStateException("Email delivery service not configured on server.");
        }

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

        helper.setFrom(mailFrom);
        helper.setTo(recipientEmail);
        helper.setSubject("Verify Your Student Skill Exchange Account");

        String name = (studentName != null && !studentName.isBlank()) ? studentName : "Student";

        String textContent = "Student Skill Exchange\n\n"
                + "Hello " + name + ",\n\n"
                + "Thank you for registering for Student Skill Exchange.\n\n"
                + "Your college email verification code is:\n\n"
                + otpCode + "\n\n"
                + "This code expires in 10 minutes.\n\n"
                + "If you did not create this account, you can ignore this email.\n\n"
                + "Student Skill Exchange\n"
                + "MGM College Academic Network";

        String htmlContent = "<!DOCTYPE html><html><head><meta charset='utf-8'>"
                + "<style>"
                + "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }"
                + ".card { max-width: 520px; margin: 0 auto; background: #ffffff; border: 2px solid #0f172a; border-radius: 8px; box-shadow: 4px 4px 0 #0f172a; padding: 32px; }"
                + ".logo { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 20px; }"
                + ".logo span { color: #4f46e5; }"
                + ".badge { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; padding: 4px 10px; border-radius: 4px; margin-bottom: 16px; }"
                + ".otp-box { text-align: center; margin: 26px 0; padding: 20px; background: #f8fafc; border: 2px dashed #0f172a; border-radius: 6px; font-family: monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; }"
                + ".expiry { font-size: 12px; color: #dc2626; font-weight: 600; text-align: center; }"
                + ".footer { font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; text-align: center; }"
                + "</style></head><body>"
                + "<div class='card'>"
                + "<div class='logo'>Skill<span>Exchange</span></div>"
                + "<div class='badge'>Official College Account Verification</div>"
                + "<h2>Hello " + name + ",</h2>"
                + "<p>Thank you for registering for the <strong>Student Skill Exchange Platform</strong> with your official MGM college email.</p>"
                + "<p>Please enter the 6-digit confirmation code below to verify your student mailbox and activate your account:</p>"
                + "<div class='otp-box'>" + otpCode + "</div>"
                + "<div class='expiry'>Expires in 10 minutes</div>"
                + "<p>If you did not request this verification, please safely disregard this email. Never share your verification code with anyone.</p>"
                + "<div class='footer'>Student Skill Exchange Platform &bull; MGM College of Engineering & Technology</div>"
                + "</div></body></html>";

        helper.setText(textContent, htmlContent);

        mailSender.send(message);
        log.info("Verification email successfully dispatched to college mailbox: {}", recipientEmail);
    }
}

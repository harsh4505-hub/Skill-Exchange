package com.skillexchange.config;

import com.skillexchange.entity.*;
import com.skillexchange.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * DataInitializer seeds sample demonstration data upon initial startup.
 * Provides pre-configured accounts for Harsh, Sejal, Raza, Udipti, and Admin.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository profileRepository;

    @Autowired
    private SkillCategoryRepository categoryRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private UserTeachingSkillRepository teachingSkillRepository;

    @Autowired
    private UserLearningSkillRepository learningSkillRepository;

    @Autowired
    private ExchangeRequestRepository requestRepository;

    @Autowired
    private ExchangeRepository exchangeRepository;

    @Autowired
    private RatingReviewRepository reviewRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SkillVerificationRepository verificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            System.out.println(">>> Database already initialized with users. Skipping seed.");
            return;
        }

        System.out.println(">>> Seeding database with college mini project sample data...");

        // 1. Create Skill Categories
        SkillCategory catProg = categoryRepository.save(new SkillCategory("Programming", "Software engineering & algorithms", "bi-code-slash"));
        SkillCategory catWeb = categoryRepository.save(new SkillCategory("Web Development", "Frontend, backend, and full-stack web technologies", "bi-globe"));
        SkillCategory catDesign = categoryRepository.save(new SkillCategory("Design", "Graphic design, UI/UX, and branding", "bi-palette"));
        SkillCategory catPhoto = categoryRepository.save(new SkillCategory("Photography & Video", "Digital photography and video post-production", "bi-camera-video"));
        SkillCategory catComm = categoryRepository.save(new SkillCategory("Communication", "Public speaking, presentation, and language skills", "bi-chat-dots"));
        SkillCategory catAcad = categoryRepository.save(new SkillCategory("Academic & Productivity", "Mathematics, data analysis, and office tools", "bi-journal-bookmark"));
        SkillCategory catMusic = categoryRepository.save(new SkillCategory("Music & Arts", "Musical instruments, vocal, and visual arts", "bi-music-note-beamed"));

        // 2. Create Skills
        Skill skillJava = skillRepository.save(new Skill("Java", catProg, "Object-oriented programming, core Java, and Spring Boot framework"));
        Skill skillPython = skillRepository.save(new Skill("Python", catProg, "Python scripting, data structures, and automation"));
        Skill skillWeb = skillRepository.save(new Skill("HTML/CSS/JS", catWeb, "Modern responsive web development with JavaScript and Bootstrap"));
        Skill skillPhotoshop = skillRepository.save(new Skill("Photoshop", catDesign, "Image manipulation, digital art, poster design, and photo editing"));
        Skill skillGraphic = skillRepository.save(new Skill("Graphic Design", catDesign, "Typography, Figma UI design, and visual brand identity"));
        Skill skillVideo = skillRepository.save(new Skill("Video Editing", catPhoto, "Premiere Pro / DaVinci Resolve video cutting and color grading"));
        Skill skillPhoto = skillRepository.save(new Skill("Photography", catPhoto, "DSLR photography, manual exposure, composition, and lighting"));
        Skill skillSpeaking = skillRepository.save(new Skill("Public Speaking", catComm, "Overcoming stage fear, debate, and confident speech presentation"));
        Skill skillExcel = skillRepository.save(new Skill("Excel & Data Analysis", catAcad, "Formulas, pivot tables, lookup functions, and data charts"));

        String encodedPwd = passwordEncoder.encode("password123");

        // 3. Admin Account
        User adminUser = new User("admin@mgmmumbai.ac.in", encodedPwd, "ROLE_ADMIN");
        userRepository.save(adminUser);

        // 4. Student 1: Harsh (Teaches: Java, Web; Wants: Photoshop, Video Editing)
        User userHarsh = userRepository.save(new User("harsh@mgmmumbai.ac.in", encodedPwd, "ROLE_STUDENT"));
        StudentProfile profileHarsh = new StudentProfile(userHarsh, "Harsh Vardhan", "College of Engineering & Technology", "Information Technology", "2nd Year", "9876543210");
        profileHarsh.setBio("2nd-year IT student passionate about Java backend architectures and algorithms. Wanting to learn design and video editing!");
        profileHarsh.setAvatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=Harsh");
        profileHarsh.setVerified(true);
        profileHarsh.setAverageRating(4.8);
        profileHarsh.setCompletedExchangesCount(2);
        profileRepository.save(profileHarsh);

        UserTeachingSkill harshTeachJava = teachingSkillRepository.save(new UserTeachingSkill(userHarsh, skillJava, "Advanced"));
        harshTeachJava.setVerified(true);
        harshTeachJava.setProofDocumentUrl("uploads/certificates/harsh_java_cert.pdf");
        teachingSkillRepository.save(harshTeachJava);
        teachingSkillRepository.save(new UserTeachingSkill(userHarsh, skillWeb, "Intermediate"));

        learningSkillRepository.save(new UserLearningSkill(userHarsh, skillPhotoshop, "High"));
        learningSkillRepository.save(new UserLearningSkill(userHarsh, skillVideo, "Medium"));

        // 5. Student 2: Sejal (Teaches: Photoshop, Graphic Design; Wants: Java, Web) -> Perfect mutual match with Harsh!
        User userSejal = userRepository.save(new User("sejal@mgmmumbai.ac.in", encodedPwd, "ROLE_STUDENT"));
        StudentProfile profileSejal = new StudentProfile(userSejal, "Sejal Sharma", "College of Engineering & Technology", "Information Technology", "2nd Year", "9876543211");
        profileSejal.setBio("Creative designer and IT student. Certified in Adobe Photoshop. Looking to conquer core Java and web development!");
        profileSejal.setAvatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=Sejal");
        profileSejal.setVerified(true);
        profileSejal.setAverageRating(4.9);
        profileSejal.setCompletedExchangesCount(3);
        profileRepository.save(profileSejal);

        UserTeachingSkill sejalTeachPs = teachingSkillRepository.save(new UserTeachingSkill(userSejal, skillPhotoshop, "Expert"));
        sejalTeachPs.setVerified(true);
        sejalTeachPs.setProofDocumentUrl("uploads/certificates/sejal_photoshop_cert.pdf");
        teachingSkillRepository.save(sejalTeachPs);
        teachingSkillRepository.save(new UserTeachingSkill(userSejal, skillGraphic, "Advanced"));

        learningSkillRepository.save(new UserLearningSkill(userSejal, skillJava, "High"));
        learningSkillRepository.save(new UserLearningSkill(userSejal, skillWeb, "Medium"));

        // 6. Student 3: Raza (Teaches: Python, Excel; Wants: Public Speaking)
        User userRaza = userRepository.save(new User("raza@mgmmumbai.ac.in", encodedPwd, "ROLE_STUDENT"));
        StudentProfile profileRaza = new StudentProfile(userRaza, "Raza Khan", "College of Engineering & Technology", "Computer Science", "3rd Year", "9876543212");
        profileRaza.setBio("Python enthusiast and data geek. Wanting to improve communication and speech delivery for campus placements.");
        profileRaza.setAvatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=Raza");
        profileRaza.setVerified(false);
        profileRaza.setAverageRating(4.5);
        profileRaza.setCompletedExchangesCount(1);
        profileRepository.save(profileRaza);

        teachingSkillRepository.save(new UserTeachingSkill(userRaza, skillPython, "Advanced"));
        teachingSkillRepository.save(new UserTeachingSkill(userRaza, skillExcel, "Intermediate"));
        learningSkillRepository.save(new UserLearningSkill(userRaza, skillSpeaking, "High"));

        // 7. Student 4: Udipti (Teaches: Public Speaking; Wants: Python, Excel) -> Perfect match with Raza!
        User userUdipti = userRepository.save(new User("udipti@mgmmumbai.ac.in", encodedPwd, "ROLE_STUDENT"));
        StudentProfile profileUdipti = new StudentProfile(userUdipti, "Udipti Sen", "College of Engineering & Technology", "Information Technology", "2nd Year", "9876543213");
        profileUdipti.setBio("College debate society president. Eager to help peers with confident public speaking in return for Python tutoring!");
        profileUdipti.setAvatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=Udipti");
        profileUdipti.setVerified(true);
        profileUdipti.setAverageRating(5.0);
        profileUdipti.setCompletedExchangesCount(4);
        profileRepository.save(profileUdipti);

        UserTeachingSkill udiptiTeachSp = teachingSkillRepository.save(new UserTeachingSkill(userUdipti, skillSpeaking, "Expert"));
        udiptiTeachSp.setVerified(true);
        udiptiTeachSp.setProofDocumentUrl("uploads/certificates/udipti_debate_champion.pdf");
        teachingSkillRepository.save(udiptiTeachSp);

        learningSkillRepository.save(new UserLearningSkill(userUdipti, skillPython, "High"));
        learningSkillRepository.save(new UserLearningSkill(userUdipti, skillExcel, "Medium"));

        // 8. Create a sample Completed Exchange between Harsh & Sejal with Review
        ExchangeRequest sampleReq1 = new ExchangeRequest(userHarsh, userSejal, skillJava, skillPhotoshop, "Hey Sejal, let's exchange Java OOP lessons for Photoshop UI poster design!", "ONLINE");
        sampleReq1.setStatus("COMPLETED");
        sampleReq1.setUpdatedAt(LocalDateTime.now().minusDays(3));
        ExchangeRequest savedReq1 = requestRepository.save(sampleReq1);

        Exchange sampleExchange1 = new Exchange(savedReq1, userHarsh, userSejal, skillJava, skillPhotoshop, "ONLINE");
        sampleExchange1.setStatus("COMPLETED");
        sampleExchange1.setCompletionDate(LocalDateTime.now().minusDays(2));
        exchangeRepository.save(sampleExchange1);

        reviewRepository.save(new RatingReview(sampleExchange1, userSejal, userHarsh, 5, "Harsh was phenomenal at explaining Java object-oriented principles! Very patient and articulate."));
        reviewRepository.save(new RatingReview(sampleExchange1, userHarsh, userSejal, 5, "Sejal is a Photoshop wizard! She guided me step-by-step through layers and photo retouching."));

        // 9. Create an Active Exchange between Raza and Udipti
        ExchangeRequest sampleReq2 = new ExchangeRequest(userRaza, userUdipti, skillPython, skillSpeaking, "Hi Udipti! I can teach you Python basics in exchange for speech coaching.", "CHAT");
        sampleReq2.setStatus("ACCEPTED");
        ExchangeRequest savedReq2 = requestRepository.save(sampleReq2);

        Exchange sampleExchange2 = new Exchange(savedReq2, userRaza, userUdipti, skillPython, skillSpeaking, "CHAT");
        sampleExchange2.setStatus("ACTIVE");
        exchangeRepository.save(sampleExchange2);

        // 10. Sample Pending Verification for Raza
        SkillVerification verification = new SkillVerification(userRaza, skillPython, "HackerRank Python 5-Star Certificate", "uploads/verifications/raza_python.pdf", "Achieved 5 stars on HackerRank Python problem solving.");
        verification.setStatus("PENDING");
        verificationRepository.save(verification);

        // 11. Initial Notifications
        notificationRepository.save(new Notification(userHarsh, "Welcome to Skill Exchange!", "Start by exploring student matches or adding skills you teach and want to learn.", "INFO", null));
        notificationRepository.save(new Notification(userHarsh, "Review Received (5★)", "Sejal left you a 5-star review for your Java exchange!", "NEW_REVIEW", 1L));

        System.out.println(">>> Sample data seeding complete!");
    }
}

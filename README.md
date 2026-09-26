# Student Skill Exchange Platform
> **A 2nd-Year Information Technology College Mini Project**  
> Built with **Java 17, Spring Boot 3, Spring Data JPA, Spring Security, MySQL & Bootstrap 5**

---

## 🌟 Overview
The **Student Skill Exchange Platform** is a peer-to-peer web platform where college students can exchange skills with each other on a mutual barter basis without money. A student who knows Java can teach it to a peer in exchange for learning Photoshop, Python, or Public Speaking!

The system incorporates an **explainable 5-factor matching algorithm**, integrated peer chat, customizable learning modes (Online, Offline campus meet, In-built chat), skill verification with administrative proof auditing, and closed-loop peer reviews with 5-star ratings.

---

## 💻 Technology Stack

| Component | Technology |
| :--- | :--- |
| **Backend Framework** | Java 17, Spring Boot 3.2.5 (Spring MVC, Spring Data JPA, Hibernate) |
| **Security** | Spring Security 6 with BCrypt password encryption & Role-based Authorization |
| **Database** | MySQL 8.0+ (with optional H2 in-memory profile for instant evaluation) |
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla ES6), Bootstrap 5, Bootstrap Icons |
| **Design Aesthetic**| Soft lavender, light purple, crisp white, subtle pink accents |
| **Build & Tooling** | Apache Maven 3.8+ |

---

## 🔑 Pre-Seeded Demonstration Accounts

All demo accounts come pre-configured with active skill relationships and pre-hashed passwords.

| Role | Name | Email | Password | Skills Taught / Desired |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Harsh Vardhan | `harsh@college.edu` | `password123` | **Teaches:** Java, Web Dev<br>**Wants:** Photoshop, Video Editing |
| **Student** | Sejal Sharma | `sejal@college.edu` | `password123` | **Teaches:** Photoshop, Graphic Design<br>**Wants:** Java, Web Dev *(Perfect Match with Harsh!)* |
| **Student** | Raza Khan | `raza@college.edu` | `password123` | **Teaches:** Python, Excel<br>**Wants:** Public Speaking |
| **Student** | Udipti Sen | `udipti@college.edu` | `password123` | **Teaches:** Public Speaking<br>**Wants:** Python, Excel *(Perfect Match with Raza!)* |
| **Admin** | Administrator | `admin@college.edu` | `password123` | Full administrative control, verification audits, abuse reports |

> **Tip:** The login page (`login.html`) has **1-Click Quick Demo Login** buttons so you don't even need to type the credentials during your presentation!

---

## 🚀 How to Run the Project

### Prerequisites
1. **Java JDK 17 or higher** installed. Verify with:
   ```bash
   java -version
   ```
2. **Apache Maven 3.8+** (or use IntelliJ / VS Code Maven extension). Verify with:
   ```bash
   mvn -version
   ```
3. **MySQL Server** (e.g. MySQL 8.0, XAMPP, or WAMP).

---

### Step 1: Set Up MySQL Database
1. Open MySQL Workbench or your terminal:
   ```bash
   mysql -u root -p
   ```
2. Run the database setup script located in the project root:
   ```sql
   SOURCE DATABASE_SETUP.sql;
   ```
   *(Or simply run `CREATE DATABASE skill_exchange_db;` — Hibernate will auto-create all tables!)*

---

### Step 2: Configure Database Credentials
Open `src/main/resources/application.properties` and verify your MySQL username and password:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/skill_exchange_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=root
```
*(If your MySQL password is empty or different, adjust the `spring.datasource.password` line).*

> **💡 Offline / Instant Testing without MySQL?**  
> If MySQL is not running on your machine, simply uncomment the H2 database lines in `application.properties`! The app will run entirely in-memory with zero external dependencies!

---

### Step 3: Run the Application

#### Option A: Running from Command Line (Maven)
Navigate to the project root directory and run:
```bash
mvn spring-boot:run
```

#### Option B: Running in VS Code
1. Open the folder `student-skill-exchange` in VS Code.
2. Ensure the **Extension Pack for Java** is installed.
3. Open `SkillExchangeApplication.java` and click **Run**.

#### Option C: Running in IntelliJ IDEA
1. Open IntelliJ IDEA -> **File** -> **Open...** -> Select `student-skill-exchange/pom.xml`.
2. Select **Open as Project**.
3. Allow Maven to import dependencies.
4. Right-click `SkillExchangeApplication.java` and select **Run 'SkillExchangeApplication'**.

---

### Step 4: Open in Web Browser
Open your browser and navigate to:
```
http://localhost:8080
```

1. **Sign in as Harsh:** Click the "Harsh (Student)" demo button on the login screen.
2. **Explore Skill Matches:** Navigate to **Find Matches** to see Sejal ranked #1 with a 95% mutual compatibility score!
3. **Send Proposal:** Click "Propose Exchange" to send a barter request.
4. **Sign in as Sejal:** In an incognito window or after logging out, sign in as Sejal to accept the proposal and start chatting!
5. **Sign in as Admin:** Login as `admin@college.edu` to review pending skill proof documents and award the **✓ VERIFIED SKILL** badge!

---

## 📁 Project Structure

```
student-skill-exchange/
├── pom.xml                               # Maven project dependencies & build config
├── DATABASE_SETUP.sql                    # Complete MySQL schema DDL & seed queries
├── PROJECT_DOCUMENTATION.md              # Complete academic report with Mermaid diagrams
├── README.md                             # Setup & execution instructions
└── src/
    └── main/
        ├── java/com/skillexchange/
        │   ├── SkillExchangeApplication.java # Spring Boot main entry point
        │   ├── config/
        │   │   └── DataInitializer.java   # Auto-seeds sample users & skills on startup
        │   ├── controller/
        │   │   ├── AuthController.java    # /api/auth endpoints (login, register, user)
        │   │   ├── StudentController.java # /api/students profile & skills endpoints
        │   │   ├── SkillController.java   # /api/skills catalog & category endpoints
        │   │   ├── MatchingController.java# /api/matches algorithm recommendations
        │   │   ├── ExchangeRequestController.java # /api/exchange-requests proposals
        │   │   ├── ChatController.java    # /api/messages peer messaging & polling
        │   │   ├── VerificationController.java # /api/verifications proof audits
        │   │   ├── ReviewController.java  # /api/reviews peer rating endpoints
        │   │   ├── NotificationController.java # /api/notifications alerts
        │   │   ├── ReportBlockController.java # /api/reports & blocking
        │   │   ├── AdminController.java   # /api/admin statistics & oversight
        │   │   └── WebPageController.java # Browser page route forwarding
        │   ├── dto/                       # Data Transfer Objects
        │   ├── entity/                    # JPA Entities (User, StudentProfile, etc.)
        │   ├── exception/                 # Global @RestControllerAdvice exception handler
        │   ├── repository/                # Spring Data JPA repositories
        │   ├── security/                  # SecurityConfig & CustomUserDetailsService
        │   └── service/                   # Business logic services & Matching Algorithm
        └── resources/
            ├── application.properties    # MySQL database & server configuration
            ├── static/                    # Frontend assets & HTML views
            │   ├── css/style.css          # Lavender & purple modern theme
            │   ├── js/app.js              # Fetch client & session state manager
            │   ├── index.html             # Landing page with Hero & Live demo card
            │   ├── login.html             # Sign In with 1-click evaluation accounts
            │   ├── register.html          # Student academic registration
            │   ├── dashboard.html         # Student Dashboard with 4 metric cards
            │   ├── profile.html           # Full Student Profile with badges & stars
            │   ├── skills.html            # Manage teaching & learning skills
            │   ├── matches.html           # 5-factor algorithmic match recommendations
            │   ├── requests.html          # Incoming & outgoing exchange proposals
            │   ├── chat.html              # In-built student messaging & modes
            │   ├── verification.html      # Proof document upload & badge tracking
            │   ├── exchange-history.html  # Trade records & peer reviews
            │   ├── notifications.html     # In-app event alerts
            │   └── admin-dashboard.html   # Admin Command Center
            └── templates/                 # Synchronized server-side templates
```

---

## 🎓 Academic Viva Tips

* **Why did you use an explainable matching algorithm instead of Machine Learning?**  
  *In a peer skill exchange platform, transparency is critical so students understand why a peer is recommended (e.g. mutual barter, ratings, verified badge). Machine learning requires thousands of training labels, whereas our 5-factor deterministic formula delivers immediate, explainable, and accurate results without latency or black-box opacity.*

* **How are passwords secured?**  
  *Passwords are hashed using `BCryptPasswordEncoder` with salted key expansion before storing in MySQL. Plaintext passwords are never stored or logged.*

* **How is duplicate review submission prevented?**  
  *The `ratings_reviews` table enforces a composite unique constraint on `(exchange_id, reviewer_id)`. The `RatingReviewService` also checks `existsByExchangeIdAndReviewerId` before allowing a submission.*

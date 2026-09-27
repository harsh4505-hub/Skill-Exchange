package com.skillexchange.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * WebPageController maps clean URL routes to HTML page views.
 */
@Controller
public class WebPageController {

    @GetMapping("/")
    public String home() {
        return "forward:/index.html";
    }

    @GetMapping("/landing")
    public String landing() {
        return "forward:/landing.html";
    }

    @GetMapping("/login")
    public String login() {
        return "forward:/login.html";
    }

    @GetMapping("/register")
    public String register() {
        return "forward:/register.html";
    }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "forward:/dashboard.html";
    }

    @GetMapping("/profile")
    public String profile() {
        return "forward:/profile.html";
    }

    @GetMapping("/skills")
    public String skills() {
        return "forward:/skills.html";
    }

    @GetMapping("/matches")
    public String matches() {
        return "forward:/matches.html";
    }

    @GetMapping("/requests")
    public String requests() {
        return "forward:/requests.html";
    }

    @GetMapping("/chat")
    public String chat() {
        return "forward:/chat.html";
    }

    @GetMapping("/notifications")
    public String notifications() {
        return "forward:/notifications.html";
    }

    @GetMapping("/verification")
    public String verification() {
        return "forward:/verification.html";
    }

    @GetMapping("/exchange-history")
    public String exchangeHistory() {
        return "forward:/exchange-history.html";
    }

    @GetMapping("/admin-dashboard")
    public String adminDashboard() {
        return "forward:/admin-dashboard.html";
    }
}

#!/usr/bin/env node
/**
 * STUDENT SKILL EXCHANGE PLATFORM
 * SMTP Connection & Email Delivery Diagnostic Tool
 *
 * Usage:
 *   node test-email.js [student_email@mgmmumbai.ac.in]
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
const crypto = require('crypto');

console.log('====================================================');
console.log('STUDENT SKILL EXCHANGE - SMTP DIAGNOSTIC SUITE');
console.log('====================================================\n');

const host = process.env.MAIL_HOST;
const port = parseInt(process.env.MAIL_PORT || '587', 10);
const secure = process.env.MAIL_SECURE === 'true' || port === 465;
const user = process.env.MAIL_USERNAME;
const rawPass = process.env.MAIL_PASSWORD || '';
// Google App Passwords are 16 characters often formatted with spaces like 'abcd efgh ijkl mnop'
const pass = rawPass.replace(/\s+/g, '');

console.log('Current SMTP Configuration (from .env):');
console.log('----------------------------------------------------');
console.log(`MAIL_HOST:     ${host ? host : '[NOT SET]'}`);
console.log(`MAIL_PORT:     ${port}`);
console.log(`MAIL_SECURE:   ${secure}`);
console.log(`MAIL_USERNAME: ${user ? user : '[NOT SET]'}`);
console.log(`MAIL_PASSWORD: ${pass ? '●●●●●●●● (configured - ' + pass.length + ' chars)' : '[NOT SET]'}`);
console.log(`MAIL_FROM:     ${from}`);
console.log('----------------------------------------------------\n');

if (!host || !user || !pass) {
    console.error('❌ ERROR: Missing SMTP configuration in .env!');
    console.log('\nTo configure real email sending:');
    console.log('1. Open or create the .env file in the project root:');
    console.log('   MAIL_HOST=smtp.gmail.com');
    console.log('   MAIL_PORT=587');
    console.log('   MAIL_SECURE=false');
    console.log('   MAIL_USERNAME=your-email@gmail.com');
    console.log('   MAIL_PASSWORD=your-16-char-google-app-password');
    console.log('   MAIL_FROM="Student Skill Exchange <noreply@mgmmumbai.ac.in>"');
    console.log('\n(For Gmail, create an App Password at: https://myaccount.google.com/apppasswords)\n');
    process.exit(1);
}

// Auto-configure optimal transport for Gmail
const transportConfig = (host === 'smtp.gmail.com' || (user && user.endsWith('@gmail.com')))
    ? {
        service: 'gmail',
        auth: {
            user: user,
            pass: pass
        }
    }
    : {
        host: host,
        port: port,
        secure: secure,
        auth: {
            user: user,
            pass: pass
        },
        tls: {
            rejectUnauthorized: false
        }
    };

const transporter = nodemailer.createTransport(transportConfig);

async function runDiagnostics() {
    console.log('1. Testing SMTP Server Handshake & Authentication...');
    try {
        await transporter.verify();
        console.log('   ✅ SUCCESS: SMTP server connected and credentials authenticated successfully!\n');
    } catch (err) {
        console.error('   ❌ SMTP AUTHENTICATION / CONNECTION FAILED:');
        console.error('   Reason    :', err.message);
        if (err.code) console.error('   Error Code:', err.code);
        if (err.response) console.error('   Provider  :', err.response);

        if (err.message.includes('Username and Password not accepted') || err.message.includes('535')) {
            console.error('\n   👉 CAUSE: Google / Provider rejected your credentials.');
            console.error('      1. If using Gmail, you CANNOT use your regular Google account password.');
            console.error('      2. You MUST generate a 16-character Google App Password:');
            console.error('         a. Go to: https://myaccount.google.com/security');
            console.error('         b. Ensure "2-Step Verification" is turned ON.');
            console.error('         c. Search "App Passwords" or open: https://myaccount.google.com/apppasswords');
            console.error('         d. Create an app password named "SkillExchange".');
            console.error('         e. Copy the 16-character code into MAIL_PASSWORD in your .env file.');
        } else if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKET') {
            console.error('\n   👉 CAUSE: Network connection timed out.');
            console.error('      Try changing MAIL_PORT=465 and MAIL_SECURE=true in your .env file.');
        }

        console.log('\nPlease check your MAIL_HOST, MAIL_USERNAME, and MAIL_PASSWORD in .env.');
        process.exit(1);
    }

    const targetEmail = process.argv[2];
    if (!targetEmail) {
        console.log('ℹ️  No test recipient specified.');
        console.log('   To test actual delivery to an inbox, run:');
        console.log('   node test-email.js your-email@mgmmumbai.ac.in\n');
        process.exit(0);
    }

    console.log(`2. Sending Test OTP Verification Email to: ${targetEmail}...`);
    const testOtp = crypto.randomInt(100000, 1000000).toString();

    try {
        const info = await transporter.sendMail({
            from: from,
            to: targetEmail,
            subject: "Verify Your Student Skill Exchange Account",
            text: `Student Skill Exchange\n\nHello Student,\n\nThank you for registering for Student Skill Exchange.\n\nYour college email verification code is:\n\n${testOtp}\n\nThis code expires in 10 minutes.\n\nIf you did not create this account, you can ignore this email.\n\nStudent Skill Exchange\nMGM College of Engineering & Technology`,
            html: `
            <div style="font-family: sans-serif; max-width: 500px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #0f172a; margin-top: 0;">Student Skill Exchange</h2>
              <p>Hello <strong>Student</strong>,</p>
              <p>Thank you for registering for Student Skill Exchange.</p>
              <p>Your college email verification code is:</p>
              <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 6px; font-family: monospace; border-radius: 6px;">
                ${testOtp}
              </div>
              <p style="font-size: 13px; color: #64748b; margin-top: 12px;">This code expires in 10 minutes.</p>
              <p style="font-size: 13px; color: #94a3b8;">MGM College of Engineering & Technology</p>
            </div>
            `
        });

        console.log('   ✅ EMAIL DELIVERED SUCCESSFULLY!');
        console.log('   Message ID:', info.messageId);
        console.log(`   📬 Please check the inbox (or spam folder) of ${targetEmail} for the email.`);
    } catch (sendErr) {
        console.error('   ❌ FAILED TO DELIVER EMAIL:');
        console.error('   Reason:', sendErr.message);
        process.exit(1);
    }
}

runDiagnostics();

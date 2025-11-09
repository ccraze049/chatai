import nodemailer from "nodemailer";
import { Resend } from "resend";

// Email configuration detection
const useResend = !!process.env.RESEND_API_KEY;
const useSmtp = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);

if (!useResend && !useSmtp) {
  console.error("⚠️  No email service configured!");
  console.error("Please configure one of the following:");
  console.error("  Option 1 (Recommended for production): RESEND_API_KEY");
  console.error("  Option 2 (For development): GMAIL_USER + GMAIL_APP_PASSWORD");
}

// Initialize email service based on available credentials
let resend: Resend | null = null;
let transporter: any = null;

if (useResend) {
  console.log("📧 Using Resend for email service");
  resend = new Resend(process.env.RESEND_API_KEY);
} else if (useSmtp) {
  console.log("📧 Using Gmail SMTP for email service");
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

const emailTemplate = (otp: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #333;">Email Verification</h2>
    <p>Thank you for signing up! Please use the following OTP to verify your email address:</p>
    <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
      <h1 style="color: #4CAF50; letter-spacing: 5px; margin: 0;">${otp}</h1>
    </div>
    <p>This OTP will expire in 10 minutes.</p>
    <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
  </div>
`;

export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  if (!useResend && !useSmtp) {
    const error = "Email service not configured. Please set RESEND_API_KEY or (GMAIL_USER + GMAIL_APP_PASSWORD).";
    console.error("❌", error);
    throw new Error(error);
  }

  console.log(`📧 Attempting to send OTP email to ${email}...`);

  try {
    if (useResend && resend) {
      // Use Resend API (recommended for production)
      const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
      
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: "Verify your email - Chat App",
        html: emailTemplate(otp),
      });

      if (error) {
        throw new Error(`Resend API error: ${error.message}`);
      }

      console.log(`✅ OTP email sent successfully via Resend to ${email}`);
      console.log(`   Email ID: ${data?.id}`);
    } else if (useSmtp && transporter) {
      // Use Gmail SMTP (for development)
      const info = await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Verify your email - Chat App",
        html: emailTemplate(otp),
      });

      console.log(`✅ OTP email sent successfully via Gmail SMTP to ${email}`);
      console.log(`   Message ID: ${info.messageId}`);
    }
  } catch (error: any) {
    console.error("❌ Error sending OTP email:");
    console.error("   To:", email);
    console.error("   Service:", useResend ? "Resend" : "Gmail SMTP");
    console.error("   Error Code:", error.code);
    console.error("   Error Message:", error.message);
    console.error("   Full Error:", error);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
}

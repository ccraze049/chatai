import nodemailer from "nodemailer";

// Validate that email credentials are configured
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  console.error("⚠️  Email configuration missing!");
  console.error("Required environment variables:");
  console.error("  - GMAIL_USER:", process.env.GMAIL_USER ? "✓ Set" : "✗ Missing");
  console.error("  - GMAIL_APP_PASSWORD:", process.env.GMAIL_APP_PASSWORD ? "✓ Set" : "✗ Missing");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  // Check if email is configured
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    const error = "Email service not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.";
    console.error("❌", error);
    throw new Error(error);
  }

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Verify your email - Chat App",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Thank you for signing up! Please use the following OTP to verify your email address:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #4CAF50; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    console.log(`📧 Attempting to send OTP email to ${email}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
    console.log(`   Message ID: ${info.messageId}`);
  } catch (error: any) {
    console.error("❌ Error sending OTP email:");
    console.error("   To:", email);
    console.error("   From:", process.env.GMAIL_USER);
    console.error("   Error Code:", error.code);
    console.error("   Error Message:", error.message);
    console.error("   Full Error:", error);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
}

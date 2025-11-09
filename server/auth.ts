import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { signupSchema, loginSchema, verifyOtpSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import { sendOtpEmail } from "./email";

const SALT_ROUNDS = 10;
const OTP_EXPIRY_MINUTES = 10;

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { email, password } = signupSchema.parse(req.body);

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await storage.createUser({ email, passwordHash });

      const otp = generateOtp();
      const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      await storage.createEmailVerification({
        userId: user.id,
        otpHash,
        expiresAt,
      });

      try {
        await sendOtpEmail(email, otp);
        console.log(`✅ Signup successful for ${email}, OTP sent`);
      } catch (emailError: any) {
        console.error("❌ Failed to send OTP email:", emailError.message);
        // Delete the user since they can't verify
        await storage.deleteUser(user.id);
        return res.status(500).json({ 
          error: "Failed to send verification email. Please check your email configuration or try again later.",
          details: emailError.message 
        });
      }

      res.json({
        message: "OTP sent to your email",
        userId: user.id,
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/auth/verify-otp", async (req: Request, res: Response) => {
    try {
      const { email, otp } = verifyOtpSchema.parse(req.body);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.isVerified) {
        return res.status(400).json({ error: "Email already verified" });
      }

      const verification = await storage.findEmailVerification(user.id);
      if (!verification) {
        return res.status(400).json({ error: "No valid OTP found. Please request a new one" });
      }

      if (verification.expiresAt < new Date()) {
        return res.status(400).json({ error: "OTP has expired" });
      }

      const isValidOtp = await bcrypt.compare(otp, verification.otpHash);
      if (!isValidOtp) {
        return res.status(400).json({ error: "Invalid OTP" });
      }

      await storage.markVerificationUsed(verification.id);
      await storage.markUserVerified(user.id);

      if (req.session) {
        req.session.userId = user.id;
        req.session.userEmail = user.email;
      }

      res.json({
        message: "Email verified successfully",
        user: {
          id: user.id,
          email: user.email,
          isVerified: true,
        },
      });
    } catch (error: any) {
      console.error("OTP verification error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      res.status(500).json({ error: "Failed to verify OTP" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      if (!user.isVerified) {
        return res.status(403).json({ error: "Please verify your email first" });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      if (req.session) {
        req.session.userId = user.id;
        req.session.userEmail = user.email;
      }

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          isVerified: user.isVerified,
        },
      });
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session?.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

declare module "express-session" {
  interface SessionData {
    userId: string;
    userEmail: string;
  }
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatSessionSchema, insertMessageSchema } from "@shared/schema";
import { requireAuth, requireAuthOrApiKey } from "./auth";
import Groq from "groq-sdk";
import { randomBytes } from "crypto";
import bcrypt from "bcrypt";

const groq = process.env.GROQ_API_KEY ? new Groq({
  apiKey: process.env.GROQ_API_KEY,
}) : null;

// Mode-based model selection for Groq API
// Chat mode: General conversation with llama-3.3-70b-versatile
// Code mode: Programming tasks with llama-4-maverick (17B params, 128 experts, optimized for coding)
const MODEL_MAP = {
  chat: "llama-3.3-70b-versatile",
  code: "meta-llama/llama-4-maverick-17b-128e-instruct",
};

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/chat/completions", requireAuthOrApiKey, async (req, res) => {
    try {
      if (!groq) {
        return res.status(503).json({ 
          error: "AI service not configured. Please add GROQ_API_KEY to enable chat functionality." 
        });
      }

      const { messages, mode } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      const model = MODEL_MAP[mode as keyof typeof MODEL_MAP] || MODEL_MAP.chat;

      const chatCompletion = await groq.chat.completions.create({
        messages: messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
        model,
        temperature: 0.7,
        max_tokens: 2048,
      });

      const assistantMessage = chatCompletion.choices[0]?.message?.content || "";

      res.json({ content: assistantMessage });
    } catch (error: any) {
      console.error("Groq API error:", error);
      res.status(500).json({ 
        error: "Failed to get AI response", 
        details: error.message 
      });
    }
  });

  app.get("/api/sessions", async (req, res) => {
    try {
      const userId = req.session?.userId;
      const anonymousSessionId = req.query.anonymousSessionId as string | undefined;
      const sessions = await storage.getAllChatSessions(userId, anonymousSessionId);
      res.json(sessions);
    } catch (error: any) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getChatSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error: any) {
      console.error("Error fetching session:", error);
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  app.post("/api/sessions", async (req, res) => {
    try {
      const userId = req.session?.userId;
      const validatedData = insertChatSessionSchema.parse({
        ...req.body,
        userId: userId || null,
      });
      const session = await storage.createChatSession(validatedData);
      res.json(session);
    } catch (error: any) {
      console.error("Error creating session:", error);
      res.status(400).json({ error: "Invalid session data", details: error.message });
    }
  });

  app.get("/api/sessions/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.id);
      res.json(messages);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.json(message);
    } catch (error: any) {
      console.error("Error creating message:", error);
      res.status(400).json({ error: "Invalid message data", details: error.message });
    }
  });

  app.get("/api/keys", requireAuth, async (req, res) => {
    try {
      const userId = req.session!.userId!;
      const keys = await storage.getApiKeysByUserId(userId);
      const safeKeys = keys.map(({ keyHash, ...rest }) => rest);
      res.json(safeKeys);
    } catch (error: any) {
      console.error("Error fetching API keys:", error);
      res.status(500).json({ error: "Failed to fetch API keys" });
    }
  });

  app.post("/api/keys", requireAuth, async (req, res) => {
    try {
      const userId = req.session!.userId!;
      const { name } = req.body;
      
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ error: "Key name is required" });
      }

      const key = `sk-${randomBytes(32).toString("hex")}`;
      const keyHash = await bcrypt.hash(key, 10);
      const keyPrefix = key.substring(0, 12);
      
      const apiKey = await storage.createApiKey({
        userId,
        name: name.trim(),
        keyHash,
        keyPrefix,
      });

      res.json({ ...apiKey, key });
    } catch (error: any) {
      console.error("Error creating API key:", error);
      res.status(500).json({ error: "Failed to create API key" });
    }
  });

  app.delete("/api/keys/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session!.userId!;
      const keyId = req.params.id;
      
      const keys = await storage.getApiKeysByUserId(userId);
      const keyToDelete = keys.find(k => k.id === keyId);
      
      if (!keyToDelete) {
        return res.status(404).json({ error: "API key not found" });
      }

      await storage.deleteApiKey(keyId);
      res.json({ message: "API key deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting API key:", error);
      res.status(500).json({ error: "Failed to delete API key" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

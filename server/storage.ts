import { 
  type ChatSession, 
  type InsertChatSession, 
  type Message, 
  type InsertMessage,
  type User,
  type InsertUser,
  type EmailVerification,
  type InsertEmailVerification
} from "@shared/schema";
import { randomUUID } from "crypto";
import { getDb } from "./db";

export interface IStorage {
  getChatSession(id: string): Promise<ChatSession | undefined>;
  getAllChatSessions(userId?: string): Promise<ChatSession[]>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getMessages(sessionId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  markUserVerified(userId: string): Promise<void>;
  
  createEmailVerification(verification: InsertEmailVerification): Promise<EmailVerification>;
  findEmailVerification(userId: string): Promise<EmailVerification | undefined>;
  markVerificationUsed(verificationId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private chatSessions: Map<string, ChatSession>;
  private messages: Map<string, Message>;
  private users: Map<string, User>;
  private emailVerifications: Map<string, EmailVerification>;

  constructor() {
    this.chatSessions = new Map();
    this.messages = new Map();
    this.users = new Map();
    this.emailVerifications = new Map();
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async getAllChatSessions(userId?: string): Promise<ChatSession[]> {
    const sessions = Array.from(this.chatSessions.values());
    const filtered = userId ? sessions.filter(s => s.userId === userId) : sessions;
    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = randomUUID();
    const session: ChatSession = {
      ...insertSession,
      userId: insertSession.userId ?? null,
      id,
      createdAt: new Date(),
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((msg) => msg.sessionId === sessionId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      isVerified: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async markUserVerified(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      this.users.set(userId, { ...user, isVerified: true });
    }
  }

  async createEmailVerification(insertVerification: InsertEmailVerification): Promise<EmailVerification> {
    const id = randomUUID();
    const verification: EmailVerification = {
      ...insertVerification,
      id,
      isUsed: false,
      createdAt: new Date(),
    };
    this.emailVerifications.set(id, verification);
    return verification;
  }

  async findEmailVerification(userId: string): Promise<EmailVerification | undefined> {
    return Array.from(this.emailVerifications.values())
      .filter(v => v.userId === userId && !v.isUsed)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }

  async markVerificationUsed(verificationId: string): Promise<void> {
    const verification = this.emailVerifications.get(verificationId);
    if (verification) {
      this.emailVerifications.set(verificationId, { ...verification, isUsed: true });
    }
  }
}

export class PostgresStorage implements IStorage {
  private db: ReturnType<typeof getDb>;

  constructor() {
    this.db = getDb();
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const { chatSessions } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const result = await this.db.select().from(chatSessions).where(eq(chatSessions.id, id)).limit(1);
    return result[0];
  }

  async getAllChatSessions(userId?: string): Promise<ChatSession[]> {
    const { chatSessions } = await import("@shared/schema");
    const { eq, desc } = await import("drizzle-orm");
    
    if (userId) {
      return this.db.select().from(chatSessions)
        .where(eq(chatSessions.userId, userId))
        .orderBy(desc(chatSessions.createdAt));
    }
    
    return this.db.select().from(chatSessions)
      .orderBy(desc(chatSessions.createdAt));
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const { chatSessions } = await import("@shared/schema");
    const normalized = {
      ...insertSession,
      userId: insertSession.userId ?? null,
    };
    const result = await this.db.insert(chatSessions).values(normalized).returning();
    return result[0]!;
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    const { messages } = await import("@shared/schema");
    const { eq, asc } = await import("drizzle-orm");
    return this.db.select().from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(asc(messages.createdAt));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const { messages } = await import("@shared/schema");
    const result = await this.db.insert(messages).values(insertMessage).returning();
    return result[0]!;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { users } = await import("@shared/schema");
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0]!;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { users } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserById(id: string): Promise<User | undefined> {
    const { users } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async markUserVerified(userId: string): Promise<void> {
    const { users } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    await this.db.update(users).set({ isVerified: true }).where(eq(users.id, userId));
  }

  async createEmailVerification(insertVerification: InsertEmailVerification): Promise<EmailVerification> {
    const { emailVerifications } = await import("@shared/schema");
    const result = await this.db.insert(emailVerifications).values(insertVerification).returning();
    return result[0]!;
  }

  async findEmailVerification(userId: string): Promise<EmailVerification | undefined> {
    const { emailVerifications } = await import("@shared/schema");
    const { eq, and, desc } = await import("drizzle-orm");
    const result = await this.db.select().from(emailVerifications)
      .where(and(
        eq(emailVerifications.userId, userId),
        eq(emailVerifications.isUsed, false)
      ))
      .orderBy(desc(emailVerifications.createdAt))
      .limit(1);
    return result[0];
  }

  async markVerificationUsed(verificationId: string): Promise<void> {
    const { emailVerifications } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    await this.db.update(emailVerifications).set({ isUsed: true }).where(eq(emailVerifications.id, verificationId));
  }
}

function createStorage(): IStorage {
  if (process.env.DATABASE_URL) {
    return new PostgresStorage();
  }
  return new MemStorage();
}

export const storage = createStorage();

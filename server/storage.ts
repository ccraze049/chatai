import { 
  type ChatSession, 
  type InsertChatSession, 
  type Message, 
  type InsertMessage,
  type User,
  type InsertUser,
  type EmailVerification,
  type InsertEmailVerification,
  type ApiKey,
  type InsertApiKey
} from "@shared/schema";
import { randomUUID } from "crypto";
import { getDb } from "./db";

export interface IStorage {
  getChatSession(id: string): Promise<ChatSession | undefined>;
  getAllChatSessions(userId?: string, anonymousSessionId?: string): Promise<ChatSession[]>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getMessages(sessionId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  markUserVerified(userId: string): Promise<void>;
  deleteUser(userId: string): Promise<void>;
  
  createEmailVerification(verification: InsertEmailVerification): Promise<EmailVerification>;
  findEmailVerification(userId: string): Promise<EmailVerification | undefined>;
  markVerificationUsed(verificationId: string): Promise<void>;
  
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  getApiKeysByUserId(userId: string): Promise<ApiKey[]>;
  getAllApiKeys(): Promise<ApiKey[]>;
  getApiKeyByKeyHash(keyHash: string): Promise<ApiKey | undefined>;
  deleteApiKey(id: string): Promise<void>;
  updateApiKeyLastUsed(keyHash: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private chatSessions: Map<string, ChatSession>;
  private messages: Map<string, Message>;
  private users: Map<string, User>;
  private emailVerifications: Map<string, EmailVerification>;
  private apiKeys: Map<string, ApiKey>;

  constructor() {
    this.chatSessions = new Map();
    this.messages = new Map();
    this.users = new Map();
    this.emailVerifications = new Map();
    this.apiKeys = new Map();
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async getAllChatSessions(userId?: string, anonymousSessionId?: string): Promise<ChatSession[]> {
    const sessions = Array.from(this.chatSessions.values());
    const filtered = userId 
      ? sessions.filter(s => s.userId === userId)
      : sessions.filter(s => s.userId === null && s.anonymousSessionId === anonymousSessionId);
    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = randomUUID();
    const session: ChatSession = {
      ...insertSession,
      userId: insertSession.userId ?? null,
      anonymousSessionId: insertSession.anonymousSessionId ?? null,
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

  async deleteUser(userId: string): Promise<void> {
    this.users.delete(userId);
    // Also delete any email verifications for this user
    const verifications = Array.from(this.emailVerifications.values())
      .filter(v => v.userId === userId);
    for (const v of verifications) {
      this.emailVerifications.delete(v.id);
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

  async createApiKey(insertApiKey: InsertApiKey): Promise<ApiKey> {
    const id = randomUUID();
    const apiKey: ApiKey = {
      ...insertApiKey,
      id,
      lastUsedAt: null,
      createdAt: new Date(),
    };
    this.apiKeys.set(id, apiKey);
    return apiKey;
  }

  async getApiKeysByUserId(userId: string): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values())
      .filter(k => k.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllApiKeys(): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values());
  }

  async getApiKeyByKeyHash(keyHash: string): Promise<ApiKey | undefined> {
    return Array.from(this.apiKeys.values()).find(k => k.keyHash === keyHash);
  }

  async deleteApiKey(id: string): Promise<void> {
    this.apiKeys.delete(id);
  }

  async updateApiKeyLastUsed(keyHash: string): Promise<void> {
    const apiKey = Array.from(this.apiKeys.values()).find(k => k.keyHash === keyHash);
    if (apiKey) {
      this.apiKeys.set(apiKey.id, { ...apiKey, lastUsedAt: new Date() });
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

  async getAllChatSessions(userId?: string, anonymousSessionId?: string): Promise<ChatSession[]> {
    const { chatSessions } = await import("@shared/schema");
    const { eq, desc, isNull, and } = await import("drizzle-orm");
    
    if (userId) {
      return this.db.select().from(chatSessions)
        .where(eq(chatSessions.userId, userId))
        .orderBy(desc(chatSessions.createdAt));
    }
    
    return this.db.select().from(chatSessions)
      .where(and(
        isNull(chatSessions.userId),
        anonymousSessionId ? eq(chatSessions.anonymousSessionId, anonymousSessionId) : isNull(chatSessions.anonymousSessionId)
      ))
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

  async deleteUser(userId: string): Promise<void> {
    const { users, emailVerifications } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    // Delete email verifications first (foreign key constraint)
    await this.db.delete(emailVerifications).where(eq(emailVerifications.userId, userId));
    // Then delete the user
    await this.db.delete(users).where(eq(users.id, userId));
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

  async createApiKey(insertApiKey: InsertApiKey): Promise<ApiKey> {
    const { apiKeys } = await import("@shared/schema");
    const result = await this.db.insert(apiKeys).values(insertApiKey).returning();
    return result[0]!;
  }

  async getApiKeysByUserId(userId: string): Promise<ApiKey[]> {
    const { apiKeys } = await import("@shared/schema");
    const { eq, desc } = await import("drizzle-orm");
    return this.db.select().from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(desc(apiKeys.createdAt));
  }

  async getAllApiKeys(): Promise<ApiKey[]> {
    const { apiKeys } = await import("@shared/schema");
    const { desc } = await import("drizzle-orm");
    return this.db.select().from(apiKeys).orderBy(desc(apiKeys.createdAt));
  }

  async getApiKeyByKeyHash(keyHash: string): Promise<ApiKey | undefined> {
    const { apiKeys } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const result = await this.db.select().from(apiKeys).where(eq(apiKeys.keyHash, keyHash)).limit(1);
    return result[0];
  }

  async deleteApiKey(id: string): Promise<void> {
    const { apiKeys } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    await this.db.delete(apiKeys).where(eq(apiKeys.id, id));
  }

  async updateApiKeyLastUsed(keyHash: string): Promise<void> {
    const { apiKeys } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    await this.db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.keyHash, keyHash));
  }
}

export class MongoDBStorage implements IStorage {
  private async getDb() {
    const { getMongoDb } = await import("./mongodb");
    return getMongoDb();
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const db = await this.getDb();
    const { ObjectId } = await import("mongodb");
    const { mongoChatSessionToChatSession } = await import("./mongodb");
    
    try {
      const session = await db.collection("chatSessions").findOne({ _id: new ObjectId(id) });
      return session ? mongoChatSessionToChatSession(session as any) : undefined;
    } catch (error) {
      return undefined;
    }
  }

  async getAllChatSessions(userId?: string, anonymousSessionId?: string): Promise<ChatSession[]> {
    const db = await this.getDb();
    const { ObjectId } = await import("mongodb");
    const { mongoChatSessionToChatSession } = await import("./mongodb");
    
    const filter = userId 
      ? { userId: new ObjectId(userId) }
      : { userId: null, anonymousSessionId: anonymousSessionId || null };
    const sessions = await db.collection("chatSessions")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    
    return sessions.map(s => mongoChatSessionToChatSession(s as any));
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const db = await this.getDb();
    const { ObjectId } = await import("mongodb");
    const { mongoChatSessionToChatSession } = await import("./mongodb");
    
    const session = {
      userId: insertSession.userId ? new ObjectId(insertSession.userId) : null,
      anonymousSessionId: insertSession.anonymousSessionId || null,
      title: insertSession.title,
      mode: insertSession.mode,
      createdAt: new Date(),
    };
    
    const result = await db.collection("chatSessions").insertOne(session);
    return mongoChatSessionToChatSession({ ...session, _id: result.insertedId } as any);
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    const db = await this.getDb();
    const { mongoMessageToMessage } = await import("./mongodb");
    
    const messages = await db.collection("messages")
      .find({ sessionId })
      .sort({ createdAt: 1 })
      .toArray();
    
    return messages.map(m => mongoMessageToMessage(m as any));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const db = await this.getDb();
    const { mongoMessageToMessage } = await import("./mongodb");
    
    const message = {
      sessionId: insertMessage.sessionId,
      role: insertMessage.role,
      content: insertMessage.content,
      createdAt: new Date(),
    };
    
    const result = await db.collection("messages").insertOne(message);
    return mongoMessageToMessage({ ...message, _id: result.insertedId } as any);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = await this.getDb();
    const { mongoUserToUser } = await import("./mongodb");
    
    const user = {
      email: insertUser.email,
      passwordHash: insertUser.passwordHash,
      isVerified: false,
      createdAt: new Date(),
    };
    
    const result = await db.collection("users").insertOne(user);
    return mongoUserToUser({ ...user, _id: result.insertedId } as any);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = await this.getDb();
    const { mongoUserToUser } = await import("./mongodb");
    
    const user = await db.collection("users").findOne({ email });
    return user ? mongoUserToUser(user as any) : undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const db = await this.getDb();
    const { ObjectId } = await import("mongodb");
    const { mongoUserToUser } = await import("./mongodb");
    
    try {
      const user = await db.collection("users").findOne({ _id: new ObjectId(id) });
      return user ? mongoUserToUser(user as any) : undefined;
    } catch (error) {
      return undefined;
    }
  }

  async markUserVerified(userId: string): Promise<void> {
    const db = await this.getDb();
    const { ObjectId } = await import("mongodb");
    
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { isVerified: true } }
    );
  }

  async deleteUser(userId: string): Promise<void> {
    const db = await this.getDb();
    const { ObjectId } = await import("mongodb");
    
    // Delete email verifications first
    await db.collection("emailVerifications").deleteMany({ userId: new ObjectId(userId) });
    // Then delete the user
    await db.collection("users").deleteOne({ _id: new ObjectId(userId) });
  }

  async createEmailVerification(insertVerification: InsertEmailVerification): Promise<EmailVerification> {
    const db = await this.getDb();
    const { ObjectId } = await import("mongodb");
    const { mongoEmailVerificationToEmailVerification } = await import("./mongodb");
    
    const verification = {
      userId: new ObjectId(insertVerification.userId),
      otpHash: insertVerification.otpHash,
      expiresAt: insertVerification.expiresAt,
      isUsed: false,
      createdAt: new Date(),
    };
    
    const result = await db.collection("emailVerifications").insertOne(verification);
    return mongoEmailVerificationToEmailVerification({ ...verification, _id: result.insertedId } as any);
  }

  async findEmailVerification(userId: string): Promise<EmailVerification | undefined> {
    const db = await this.getDb();
    const { ObjectId } = await import("mongodb");
    const { mongoEmailVerificationToEmailVerification } = await import("./mongodb");
    
    try {
      const verification = await db.collection("emailVerifications")
        .findOne({
          userId: new ObjectId(userId),
          isUsed: false,
          expiresAt: { $gt: new Date() }
        });
      
      return verification ? mongoEmailVerificationToEmailVerification(verification as any) : undefined;
    } catch (error) {
      return undefined;
    }
  }

  async markVerificationUsed(verificationId: string): Promise<void> {
    const db = await this.getDb();
    const { ObjectId } = await import("mongodb");
    
    await db.collection("emailVerifications").updateOne(
      { _id: new ObjectId(verificationId) },
      { $set: { isUsed: true } }
    );
  }

  async createApiKey(insertApiKey: InsertApiKey): Promise<ApiKey> {
    const db = await this.getDb();
    const { ObjectId } = await import("mongodb");
    
    const apiKeyDoc = {
      userId: new ObjectId(insertApiKey.userId),
      name: insertApiKey.name,
      keyHash: insertApiKey.keyHash,
      keyPrefix: insertApiKey.keyPrefix,
      lastUsedAt: null,
      createdAt: new Date(),
    };
    
    const result = await db.collection("apiKeys").insertOne(apiKeyDoc);
    return {
      id: result.insertedId.toString(),
      userId: insertApiKey.userId,
      name: insertApiKey.name,
      keyHash: insertApiKey.keyHash,
      keyPrefix: insertApiKey.keyPrefix,
      lastUsedAt: null,
      createdAt: apiKeyDoc.createdAt,
    };
  }

  async getApiKeysByUserId(userId: string): Promise<ApiKey[]> {
    const db = await this.getDb();
    const { ObjectId } = await import("mongodb");
    
    const keys = await db.collection("apiKeys")
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();
    
    return keys.map((k: any) => ({
      id: k._id.toString(),
      userId: k.userId.toString(),
      name: k.name,
      keyHash: k.keyHash,
      keyPrefix: k.keyPrefix,
      lastUsedAt: k.lastUsedAt,
      createdAt: k.createdAt,
    }));
  }

  async getAllApiKeys(): Promise<ApiKey[]> {
    const db = await this.getDb();
    
    const keys = await db.collection("apiKeys")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return keys.map((k: any) => ({
      id: k._id.toString(),
      userId: k.userId.toString(),
      name: k.name,
      keyHash: k.keyHash,
      keyPrefix: k.keyPrefix,
      lastUsedAt: k.lastUsedAt,
      createdAt: k.createdAt,
    }));
  }

  async getApiKeyByKeyHash(keyHash: string): Promise<ApiKey | undefined> {
    const db = await this.getDb();
    
    const apiKey = await db.collection("apiKeys").findOne({ keyHash });
    if (!apiKey) return undefined;
    
    return {
      id: apiKey._id.toString(),
      userId: apiKey.userId.toString(),
      name: apiKey.name,
      keyHash: apiKey.keyHash,
      keyPrefix: apiKey.keyPrefix,
      lastUsedAt: apiKey.lastUsedAt,
      createdAt: apiKey.createdAt,
    };
  }

  async deleteApiKey(id: string): Promise<void> {
    const db = await this.getDb();
    const { ObjectId } = await import("mongodb");
    
    await db.collection("apiKeys").deleteOne({ _id: new ObjectId(id) });
  }

  async updateApiKeyLastUsed(keyHash: string): Promise<void> {
    const db = await this.getDb();
    
    await db.collection("apiKeys").updateOne(
      { keyHash },
      { $set: { lastUsedAt: new Date() } }
    );
  }
}

function createStorage(): IStorage {
  if (process.env.MONGODB_URI) {
    return new MongoDBStorage();
  }
  if (process.env.DATABASE_URL) {
    return new PostgresStorage();
  }
  return new MemStorage();
}

export const storage = createStorage();

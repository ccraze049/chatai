import { MongoClient, Db, ObjectId } from "mongodb";
import type {
  User,
  InsertUser,
  ChatSession,
  InsertChatSession,
  Message,
  InsertMessage,
  EmailVerification,
  InsertEmailVerification,
} from "@shared/schema";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getMongoDb(): Promise<Db> {
  if (!db) {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db("chatapp");

    console.log("Connected to MongoDB successfully");

    await createIndexes(db);
  }

  return db;
}

async function createIndexes(db: Db) {
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("emailVerifications").createIndex({ userId: 1 });
  await db.collection("emailVerifications").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection("chatSessions").createIndex({ userId: 1 });
  await db.collection("chatSessions").createIndex({ anonymousSessionId: 1 });
  await db.collection("chatSessions").createIndex({ createdAt: -1 });
  await db.collection("messages").createIndex({ sessionId: 1 });
  await db.collection("messages").createIndex({ createdAt: 1 });
}

export interface MongoUser extends Omit<User, 'id' | 'createdAt'> {
  _id: ObjectId;
  createdAt: Date;
}

export interface MongoChatSession extends Omit<ChatSession, 'id' | 'createdAt' | 'userId' | 'anonymousSessionId'> {
  _id: ObjectId;
  userId: ObjectId | null;
  anonymousSessionId: string | null;
  createdAt: Date;
}

export interface MongoMessage extends Omit<Message, 'id' | 'createdAt' | 'sessionId'> {
  _id: ObjectId;
  sessionId: string;
  createdAt: Date;
}

export interface MongoEmailVerification extends Omit<EmailVerification, 'id' | 'createdAt' | 'userId' | 'expiresAt'> {
  _id: ObjectId;
  userId: ObjectId;
  expiresAt: Date;
  createdAt: Date;
}

export function mongoUserToUser(mongoUser: MongoUser): User {
  return {
    id: mongoUser._id.toString(),
    email: mongoUser.email,
    passwordHash: mongoUser.passwordHash,
    isVerified: mongoUser.isVerified,
    createdAt: mongoUser.createdAt,
  };
}

export function mongoChatSessionToChatSession(mongoSession: MongoChatSession): ChatSession {
  return {
    id: mongoSession._id.toString(),
    userId: mongoSession.userId?.toString() || null,
    anonymousSessionId: mongoSession.anonymousSessionId || null,
    title: mongoSession.title,
    mode: mongoSession.mode,
    createdAt: mongoSession.createdAt,
  };
}

export function mongoMessageToMessage(mongoMessage: MongoMessage): Message {
  return {
    id: mongoMessage._id.toString(),
    sessionId: mongoMessage.sessionId,
    role: mongoMessage.role,
    content: mongoMessage.content,
    createdAt: mongoMessage.createdAt,
  };
}

export function mongoEmailVerificationToEmailVerification(mongoVerification: MongoEmailVerification): EmailVerification {
  return {
    id: mongoVerification._id.toString(),
    userId: mongoVerification.userId.toString(),
    otpHash: mongoVerification.otpHash,
    expiresAt: mongoVerification.expiresAt,
    isUsed: mongoVerification.isUsed,
    createdAt: mongoVerification.createdAt,
  };
}

export async function closeMongoConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("MongoDB connection closed");
  }
}

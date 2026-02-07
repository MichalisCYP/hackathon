// Types for the Unifying Services Employee Recognition Platform

export type UserRole = "employee" | "manager" | "admin";

export type BadgeCategory = "innovation" | "teamwork" | "customer" | "speed";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  department: string;
  level: number;
  xp: number;
  joinedAt: string;
}

export interface Badge {
  id: BadgeCategory;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface Nomination {
  id: string;
  senderId: string;
  receiverId: string;
  sender: User;
  receiver: User;
  badge: Badge;
  message: string;
  status: "pending" | "approved" | "rejected";
  reactions: Reaction[];
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface Reaction {
  id: string;
  nominationId: string;
  userId: string;
  type: "heart" | "clap" | "fire" | "rocket";
  createdAt: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  badge?: Badge;
  expiresAt: string;
}

export interface NotificationSettings {
  discord: boolean;
  whatsapp: boolean;
  email: boolean;
  digestFrequency: "daily" | "weekly" | "monthly" | "never";
}

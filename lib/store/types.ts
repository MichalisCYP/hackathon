// Types for the Unifying Services Employee Recognition Platform
// These types match the Supabase database schema

export type UserRole = "employee" | "manager" | "admin";

export interface Profile {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  job_title: string;  // "employee", "admin", "Team Member", etc.
  department: string;
  kudos_balance: number;
  birthday?: string;  // ISO date string e.g. "1990-05-15"
  work_anniversary?: string;  // ISO date string e.g. "2022-03-01"
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface Nomination {
  id: string;
  sender_id: string;
  receiver_id: string;
  badge_id: string;
  message: string;
  status?: "pending" | "approved" | "rejected";  // Optional - column may not exist
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  // Joined data from related tables
  sender?: Profile;
  receiver?: Profile;
  badge?: Badge;
}

export interface Reaction {
  id: string;
  nomination_id: string;
  user_id: string;
  type: "heart" | "clap" | "fire" | "rocket";
  created_at: string;
}

export interface NotificationSettings {
  discord: boolean;
  whatsapp: boolean;
  email: boolean;
  digestFrequency: "daily" | "weekly" | "monthly" | "never";
}

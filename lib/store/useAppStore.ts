import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  User,
  Nomination,
  Badge,
  BadgeCategory,
  DailyChallenge,
  Reaction,
} from "./types";

// Badge definitions
export const badges: Record<BadgeCategory, Badge> = {
  innovation: {
    id: "innovation",
    name: "Innovation",
    icon: "🚀",
    color: "text-purple-400",
    description: "For creative problem solving and new ideas",
  },
  teamwork: {
    id: "teamwork",
    name: "Teamwork",
    icon: "🤝",
    color: "text-cyan-400",
    description: "For outstanding collaboration and support",
  },
  customer: {
    id: "customer",
    name: "Customer Focus",
    icon: "❤️",
    color: "text-pink-400",
    description: "For exceptional customer service",
  },
  speed: {
    id: "speed",
    name: "Speed",
    icon: "🔥",
    color: "text-orange-400",
    description: "For fast delivery and quick turnaround",
  },
};

// Mock users data
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex@unifyingservices.co.uk",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    role: "employee",
    department: "Engineering",
    level: 5,
    xp: 850,
    joinedAt: "2023-03-15",
  },
  {
    id: "2",
    name: "Sarah Chen",
    email: "sarah@unifyingservices.co.uk",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    role: "manager",
    department: "Product",
    level: 7,
    xp: 1420,
    joinedAt: "2022-01-10",
  },
  {
    id: "3",
    name: "Marcus Williams",
    email: "marcus@unifyingservices.co.uk",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    role: "employee",
    department: "Design",
    level: 4,
    xp: 620,
    joinedAt: "2023-06-20",
  },
  {
    id: "4",
    name: "Emily Rodriguez",
    email: "emily@unifyingservices.co.uk",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    role: "employee",
    department: "Marketing",
    level: 6,
    xp: 1100,
    joinedAt: "2022-09-05",
  },
  {
    id: "5",
    name: "James Thompson",
    email: "james@unifyingservices.co.uk",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    role: "admin",
    department: "HR",
    level: 8,
    xp: 2100,
    joinedAt: "2021-02-14",
  },
];

// Mock nominations data
const mockNominations: Nomination[] = [
  {
    id: "1",
    senderId: "2",
    receiverId: "1",
    sender: mockUsers[1],
    receiver: mockUsers[0],
    badge: badges.innovation,
    message:
      "Alex completely redesigned our API architecture and reduced response times by 60%. This was a game-changer for our customers! 🎯",
    status: "approved",
    reactions: [
      {
        id: "1",
        nominationId: "1",
        userId: "3",
        type: "fire",
        createdAt: "2026-02-06T10:30:00Z",
      },
      {
        id: "2",
        nominationId: "1",
        userId: "4",
        type: "clap",
        createdAt: "2026-02-06T11:00:00Z",
      },
      {
        id: "3",
        nominationId: "1",
        userId: "5",
        type: "heart",
        createdAt: "2026-02-06T12:00:00Z",
      },
    ],
    createdAt: "2026-02-06T09:00:00Z",
    approvedAt: "2026-02-06T09:30:00Z",
    approvedBy: "5",
  },
  {
    id: "2",
    senderId: "1",
    receiverId: "3",
    sender: mockUsers[0],
    receiver: mockUsers[2],
    badge: badges.teamwork,
    message:
      "Marcus stayed late three nights in a row to help the team meet our deadline. His positive attitude kept everyone motivated! 💪",
    status: "approved",
    reactions: [
      {
        id: "4",
        nominationId: "2",
        userId: "2",
        type: "heart",
        createdAt: "2026-02-05T14:00:00Z",
      },
      {
        id: "5",
        nominationId: "2",
        userId: "4",
        type: "clap",
        createdAt: "2026-02-05T15:30:00Z",
      },
    ],
    createdAt: "2026-02-05T12:00:00Z",
    approvedAt: "2026-02-05T13:00:00Z",
    approvedBy: "5",
  },
  {
    id: "3",
    senderId: "4",
    receiverId: "2",
    sender: mockUsers[3],
    receiver: mockUsers[1],
    badge: badges.customer,
    message:
      "Sarah went above and beyond to resolve a critical client issue over the weekend. The client sent us a thank you note praising her dedication! 🌟",
    status: "approved",
    reactions: [
      {
        id: "6",
        nominationId: "3",
        userId: "1",
        type: "rocket",
        createdAt: "2026-02-04T09:00:00Z",
      },
    ],
    createdAt: "2026-02-04T08:00:00Z",
    approvedAt: "2026-02-04T08:30:00Z",
    approvedBy: "5",
  },
  {
    id: "4",
    senderId: "3",
    receiverId: "4",
    sender: mockUsers[2],
    receiver: mockUsers[3],
    badge: badges.speed,
    message:
      "Emily turned around the product launch campaign in just 2 days - it usually takes a week! Incredible work under pressure! ⚡",
    status: "pending",
    reactions: [],
    createdAt: "2026-02-07T08:00:00Z",
  },
];

// Daily challenge mock
const mockChallenge: DailyChallenge = {
  id: "1",
  title: "Spread the Love",
  description: "Nominate a colleague for their great work today!",
  xpReward: 50,
  expiresAt: "2026-02-08T00:00:00Z",
};

interface AppState {
  // Current user
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Users
  users: User[];
  getUserById: (id: string) => User | undefined;

  // Nominations
  nominations: Nomination[];
  pendingNominations: () => Nomination[];
  approvedNominations: () => Nomination[];

  // Actions
  sendNomination: (
    receiverId: string,
    badgeId: BadgeCategory,
    message: string,
  ) => void;
  approveNomination: (nominationId: string) => void;
  rejectNomination: (nominationId: string) => void;
  addReaction: (nominationId: string, type: Reaction["type"]) => void;
  removeReaction: (nominationId: string, reactionId: string) => void;

  // Daily Challenge
  dailyChallenge: DailyChallenge | null;

  // UI State
  isNominationModalOpen: boolean;
  setNominationModalOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Current user - default to first user for demo
      currentUser: mockUsers[0],
      setCurrentUser: (user) => set({ currentUser: user }),

      // Users
      users: mockUsers,
      getUserById: (id) => get().users.find((u) => u.id === id),

      // Nominations
      nominations: mockNominations,
      pendingNominations: () =>
        get().nominations.filter((n) => n.status === "pending"),
      approvedNominations: () =>
        get().nominations.filter((n) => n.status === "approved"),

      // Actions
      sendNomination: (receiverId, badgeId, message) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const receiver = users.find((u) => u.id === receiverId);
        if (!receiver) return;

        const newNomination: Nomination = {
          id: Date.now().toString(),
          senderId: currentUser.id,
          receiverId,
          sender: currentUser,
          receiver,
          badge: badges[badgeId],
          message,
          status: "pending",
          reactions: [],
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          nominations: [newNomination, ...state.nominations],
        }));

        // Simulate Discord/WhatsApp notification
        console.log("🎉 Notification sent to Discord/WhatsApp:", {
          type: "new_nomination",
          sender: currentUser.name,
          receiver: receiver.name,
          badge: badges[badgeId].name,
          message,
        });
      },

      approveNomination: (nominationId) => {
        const { currentUser } = get();
        if (!currentUser) return;

        set((state) => ({
          nominations: state.nominations.map((n) =>
            n.id === nominationId
              ? {
                  ...n,
                  status: "approved" as const,
                  approvedAt: new Date().toISOString(),
                  approvedBy: currentUser.id,
                }
              : n,
          ),
        }));

        // Simulate celebration notification
        const nomination = get().nominations.find((n) => n.id === nominationId);
        if (nomination) {
          console.log("🎉 Celebration notification sent:", {
            type: "nomination_approved",
            message: `🎉 ${nomination.sender.name} nominated ${nomination.receiver.name} for ${nomination.badge.name}!`,
          });
        }
      },

      rejectNomination: (nominationId) => {
        set((state) => ({
          nominations: state.nominations.map((n) =>
            n.id === nominationId ? { ...n, status: "rejected" as const } : n,
          ),
        }));
      },

      addReaction: (nominationId, type) => {
        const { currentUser } = get();
        if (!currentUser) return;

        const newReaction: Reaction = {
          id: Date.now().toString(),
          nominationId,
          userId: currentUser.id,
          type,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          nominations: state.nominations.map((n) =>
            n.id === nominationId
              ? { ...n, reactions: [...n.reactions, newReaction] }
              : n,
          ),
        }));
      },

      removeReaction: (nominationId, reactionId) => {
        set((state) => ({
          nominations: state.nominations.map((n) =>
            n.id === nominationId
              ? {
                  ...n,
                  reactions: n.reactions.filter((r) => r.id !== reactionId),
                }
              : n,
          ),
        }));
      },

      // Daily Challenge
      dailyChallenge: mockChallenge,

      // UI State
      isNominationModalOpen: false,
      setNominationModalOpen: (open) => set({ isNominationModalOpen: open }),
    }),
    {
      name: "unify-app-storage",
      partialize: (state) => ({
        nominations: state.nominations,
        currentUser: state.currentUser,
      }),
    },
  ),
);

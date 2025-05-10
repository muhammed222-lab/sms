/* eslint-disable @typescript-eslint/no-unused-vars */
// components/support/types.ts
import { User } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

export interface Message {
  read: boolean;
  conversationId?: string;
  id: string;
  sender: "user" | "ai" | "support";
  content: string;
  attachments?: string[];
}

export interface Conversation {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  title?: string;
  unreadCount?: number;
}

export type SupportChatProps = {
  user: User | null;
  onClose?: () => void;
  defaultActiveTab?: "quick" | "deep";
};

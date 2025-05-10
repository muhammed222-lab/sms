/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  doc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  setDoc,
  limit,
} from "firebase/firestore";
import ChatWidget from "./ChatWidget";

interface Message {
  id: string;
  conversationId: string;
  sender: string;
  content: string;
  createdAt: Date;
  read: boolean;
  type: "user" | "ai";
  aiResponse?: boolean;
}

interface Conversation {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const Support = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await syncUserData(user);
        checkActiveConversation(user.uid);
      } else {
        setActiveConversation(null);
        setMessages([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const syncUserData = async (user: User) => {
    const userRef = doc(db, "users", user.uid);
    try {
      await setDoc(
        userRef,
        {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split("@")[0],
          lastLogin: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error syncing user data:", error);
    }
  };

  const checkActiveConversation = async (userId: string) => {
    const q = query(
      collection(db, "support_conversations"),
      where("userId", "==", userId),
      where("status", "==", "active"),
      orderBy("updatedAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const conversationData = {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        } as Conversation;
        setActiveConversation(conversationData);
        loadMessages(doc.id);
      } else {
        setActiveConversation(null);
        setMessages([]);
      }
    });
    return unsubscribe;
  };

  const loadMessages = (conversationId: string) => {
    const q = query(
      collection(db, "support_messages"),
      where("conversationId", "==", conversationId),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedMessages.push({
          id: doc.id,
          ...data,
          // Normalize sender values
          sender: data.sender === "AI Assistant" ? "ai" : data.sender,
          createdAt: data.createdAt?.toDate() || new Date(),
          // Ensure type field exists
          type: data.sender === "ai" ? "ai" : "user",
        });
      });
      setMessages(loadedMessages);
    });
    return unsubscribe;
  };
  const startNewConversation = async (initialMessage: string) => {
    if (!user || !user.email) return null;

    try {
      const docRef = await addDoc(collection(db, "support_conversations"), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email.split("@")[0],
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, "support_messages"), {
        conversationId: docRef.id,
        sender: user.email,
        content: initialMessage,
        createdAt: serverTimestamp(),
        read: true,
        type: "user",
      });

      return docRef.id;
    } catch (error) {
      console.error("Error starting conversation:", error);
      return null;
    }
  };

  const getAIResponse = async (message: string) => {
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message,
          system_message: `You are the official AI assistant for SMS Globe (smsglobe.net), a premium bulk SMS service provider.

CORE SERVICES:
- Bulk SMS Marketing: High-volume campaign messaging
- SMS Gateway: Reliable global message delivery
- Virtual Numbers: For OTPs and verifications
- SMS Scheduling: Automated timed messages

KEY FEATURES:
- 99% delivery rate with real-time tracking
- Coverage in 200+ countries
- Competitive pricing from $0.01/SMS (volume discounts available)
- Web-based platform (no API/coding required)
- 24/7 customer support

IMPORTANT LINKS:
- Sign In: https://www.smsglobe.net/signin
- How It Works: https://www.smsglobe.net/HowItWorksGallery/1
- Pricing: https://www.smsglobe.net/pricing
- Deposit Funds: https://www.smsglobe.net/deposit
- Contact: https://www.smsglobe.net/contact
- FAQ: https://www.smsglobe.net/faq

RESPONSE GUIDELINES:
1. Keep responses concise (1-2 short paragraphs)
2. Always maintain a professional, friendly tone
3. Provide direct links for:
   - Account access (sign in/dashboard)
   - Payment/Deposit
   - Tutorials/guides
4. For technical help, give clear steps
5. If unsure: "Please contact support@smsglobe.net or visit our Contact page: https://www.smsglobe.net/contact"

EXAMPLE RESPONSES:
User: "How do I check my balance?"
→ "Log in to your Dashboard at https://www.smsglobe.net/signin - your balance appears in the top right corner."

User: "What's your pricing?"
→ "Our rates start at $0.01/SMS with volume discounts. See full pricing here: https://www.smsglobe.net/pricing"`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error Details:", errorData);
        throw new Error(
          `API Error ${response.status}: ${errorData.error || "Unknown error"}`
        );
      }

      const data = await response.json();
      return (
        data.response || "I couldn't generate a response. Please try again."
      );
    } catch (error) {
      console.error("AI Response Error:", error);
      return "Sorry, I'm having trouble responding. Please try again later.";
    }
  };

  // Update your sendMessage function:
  const sendMessage = async (content: string) => {
    if (!content.trim() || !user?.email) return;

    try {
      setIsAIResponding(true);
      let convId = activeConversation?.id;

      if (!convId) {
        const newConvId = await startNewConversation(content);
        if (!newConvId) throw new Error("Failed to create conversation");
        convId = newConvId;
        setActiveConversation({
          id: newConvId,
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName || user.email.split("@")[0],
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Add user message
      await addDoc(collection(db, "support_messages"), {
        conversationId: convId,
        sender: user.email,
        content,
        createdAt: serverTimestamp(),
        read: true,
        type: "user",
      });

      // Get AI response
      const aiResponse = await getAIResponse(content);

      // Add AI response
      await addDoc(collection(db, "support_messages"), {
        conversationId: convId,
        sender: "ai", // Consistent sender value
        content: aiResponse,
        createdAt: serverTimestamp(),
        read: false,
        type: "ai",
        aiResponse: true,
      });

      // Update conversation
      await updateDoc(doc(db, "support_conversations", convId), {
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error in chat:", error);
    } finally {
      setIsAIResponding(false);
    }
  };

  return (
    <ChatWidget
      user={user}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      unreadCount={unreadCount}
      activeConversation={activeConversation}
      messages={messages}
      onSendMessage={sendMessage}
      isAIResponding={isAIResponding}
    />
  );
};

export default Support;

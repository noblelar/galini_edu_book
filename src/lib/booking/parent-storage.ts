"use client";
import { LocalDB } from "./storage";
import { Booking, ParentProfile } from "./types";

export interface ParentChild {
  id: string;
  parentId: string;
  name: string;
  age: number;
  schoolYear: string;
  subjects: string[];
  nextLessonDate?: string;
  progressNotes?: string;
  createdAt: string;
}

export interface ParentPayment {
  id: string;
  parentId: string;
  bookingId: string;
  amount: number;
  currency: "GBP";
  paymentMethod: "card" | "apple_pay" | "google_pay" | "paypal";
  status: "completed" | "failed" | "refunded";
  stripePaymentIntentId?: string;
  invoiceUrl?: string;
  transactionDate: string;
  createdAt: string;
}

export interface ParentAnnouncement {
  id: string;
  title: string;
  content: string;
  source: "tutor" | "admin" | "system";
  sourceId: string;
  sourceName: string;
  childId?: string;
  attachments?: string[];
  createdAt: string;
  readAt?: string;
}

export interface ParentMessage {
  id: string;
  parentId: string;
  tutorId: string;
  conversationId: string;
  childId?: string;
  senderId: string;
  senderRole: "parent" | "tutor";
  content: string;
  attachments?: string[];
  readAt?: string;
  createdAt: string;
}

function id(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

const PARENT_CHILDREN_KEY = "lessonsuk.parent_children";
const PARENT_PAYMENTS_KEY = "lessonsuk.parent_payments";
const PARENT_ANNOUNCEMENTS_KEY = "lessonsuk.parent_announcements";
const PARENT_MESSAGES_KEY = "lessonsuk.parent_messages";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [] as T[];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : ([] as T[]);
  } catch {
    return [] as T[];
  }
}

function write<T>(key: string, data: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

export const ParentDB = {
  // Children Management
  addChild(parentId: string, child: Omit<ParentChild, "id" | "createdAt">): ParentChild {
    const children = read<ParentChild>(PARENT_CHILDREN_KEY);
    const created: ParentChild = {
      ...child,
      id: id("child"),
      createdAt: new Date().toISOString(),
    };
    children.push(created);
    write(PARENT_CHILDREN_KEY, children);
    return created;
  },

  getChildrenByParent(parentId: string): ParentChild[] {
    return read<ParentChild>(PARENT_CHILDREN_KEY).filter((c) => c.parentId === parentId);
  },

  getChild(childId: string): ParentChild | null {
    return read<ParentChild>(PARENT_CHILDREN_KEY).find((c) => c.id === childId) || null;
  },

  updateChild(childId: string, patch: Partial<ParentChild>): ParentChild | null {
    const children = read<ParentChild>(PARENT_CHILDREN_KEY);
    const child = children.find((c) => c.id === childId);
    if (!child) return null;
    const updated = { ...child, ...patch } as ParentChild;
    write(PARENT_CHILDREN_KEY, children.map((c) => (c.id === childId ? updated : c)));
    return updated;
  },

  deleteChild(childId: string): boolean {
    const children = read<ParentChild>(PARENT_CHILDREN_KEY);
    const filtered = children.filter((c) => c.id !== childId);
    if (filtered.length === children.length) return false;
    write(PARENT_CHILDREN_KEY, filtered);
    return true;
  },

  // Payments Management
  recordPayment(payment: Omit<ParentPayment, "id" | "createdAt">): ParentPayment {
    const payments = read<ParentPayment>(PARENT_PAYMENTS_KEY);
    const created: ParentPayment = {
      ...payment,
      id: id("pmt"),
      createdAt: new Date().toISOString(),
    };
    payments.push(created);
    write(PARENT_PAYMENTS_KEY, payments);
    return created;
  },

  getPaymentsByParent(parentId: string): ParentPayment[] {
    return read<ParentPayment>(PARENT_PAYMENTS_KEY)
      .filter((p) => p.parentId === parentId)
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
  },

  getPayment(id: string): ParentPayment | null {
    return read<ParentPayment>(PARENT_PAYMENTS_KEY).find((p) => p.id === id) || null;
  },

  updatePayment(id: string, patch: Partial<ParentPayment>): ParentPayment | null {
    const payments = read<ParentPayment>(PARENT_PAYMENTS_KEY);
    const payment = payments.find((p) => p.id === id);
    if (!payment) return null;
    const updated = { ...payment, ...patch } as ParentPayment;
    write(PARENT_PAYMENTS_KEY, payments.map((p) => (p.id === id ? updated : p)));
    return updated;
  },

  // Announcements Management
  addAnnouncement(announcement: Omit<ParentAnnouncement, "id" | "createdAt">): ParentAnnouncement {
    const announcements = read<ParentAnnouncement>(PARENT_ANNOUNCEMENTS_KEY);
    const created: ParentAnnouncement = {
      ...announcement,
      id: id("ann"),
      createdAt: new Date().toISOString(),
    };
    announcements.push(created);
    write(PARENT_ANNOUNCEMENTS_KEY, announcements);
    return created;
  },

  getAnnouncementsByParent(parentId: string): ParentAnnouncement[] {
    return read<ParentAnnouncement>(PARENT_ANNOUNCEMENTS_KEY).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  markAnnouncementAsRead(id: string): ParentAnnouncement | null {
    const announcements = read<ParentAnnouncement>(PARENT_ANNOUNCEMENTS_KEY);
    const ann = announcements.find((a) => a.id === id);
    if (!ann) return null;
    const updated = { ...ann, readAt: new Date().toISOString() } as ParentAnnouncement;
    write(PARENT_ANNOUNCEMENTS_KEY, announcements.map((a) => (a.id === id ? updated : a)));
    return updated;
  },

  deleteAnnouncement(id: string): boolean {
    const announcements = read<ParentAnnouncement>(PARENT_ANNOUNCEMENTS_KEY);
    const filtered = announcements.filter((a) => a.id !== id);
    if (filtered.length === announcements.length) return false;
    write(PARENT_ANNOUNCEMENTS_KEY, filtered);
    return true;
  },

  // Messages Management
  sendMessage(message: Omit<ParentMessage, "id" | "createdAt">): ParentMessage {
    const messages = read<ParentMessage>(PARENT_MESSAGES_KEY);
    const created: ParentMessage = {
      ...message,
      id: id("pmsg"),
      createdAt: new Date().toISOString(),
    };
    messages.push(created);
    write(PARENT_MESSAGES_KEY, messages);
    return created;
  },

  getMessagesByConversation(conversationId: string): ParentMessage[] {
    return read<ParentMessage>(PARENT_MESSAGES_KEY)
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  getMessagesByParent(parentId: string): ParentMessage[] {
    return read<ParentMessage>(PARENT_MESSAGES_KEY).filter((m) => m.parentId === parentId);
  },

  getConversations(parentId: string): { tutorId: string; tutorName: string; lastMessage?: string; unreadCount: number }[] {
    const messages = read<ParentMessage>(PARENT_MESSAGES_KEY).filter((m) => m.parentId === parentId);
    const conversations = new Map<string, { tutorId: string; tutorName: string; lastMessage?: string; unreadCount: number }>();

    messages.forEach((msg) => {
      if (!conversations.has(msg.tutorId)) {
        conversations.set(msg.tutorId, {
          tutorId: msg.tutorId,
          tutorName: msg.senderRole === "tutor" ? "Tutor" : "You",
          lastMessage: msg.content,
          unreadCount: 0,
        });
      }
      const conv = conversations.get(msg.tutorId)!;
      conv.lastMessage = msg.content;
      if (!msg.readAt && msg.senderRole === "tutor") {
        conv.unreadCount++;
      }
    });

    return Array.from(conversations.values());
  },

  markMessageAsRead(messageId: string): ParentMessage | null {
    const messages = read<ParentMessage>(PARENT_MESSAGES_KEY);
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return null;
    const updated = { ...msg, readAt: new Date().toISOString() } as ParentMessage;
    write(PARENT_MESSAGES_KEY, messages.map((m) => (m.id === messageId ? updated : m)));
    return updated;
  },

  // Helper: Get all bookings for parent
  getParentBookings(parentId: string): Booking[] {
    return LocalDB.listBookings().filter((b) => b.parentId === parentId);
  },

  // Helper: Get parent profile
  getOrCreateParentProfile(parentId: string, email: string, name: string): ParentProfile {
    let parent = LocalDB.getParentByEmail(email);
    if (!parent) {
      parent = LocalDB.upsertParent({
        name,
        email,
        childName: "",
        schoolYear: "",
        verified: false,
      });
    }
    return parent;
  },
};

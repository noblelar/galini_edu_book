"use client";
import {
  Announcement,
  LessonMaterial,
  Message,
  Conversation,
  TutorAvailability,
  TutorEarnings,
  TutorPayoutSetting,
  LessonNote,
  Booking,
} from "./types";

function id(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

const ANNOUNCEMENTS_KEY = "lessonsuk.announcements";
const MATERIALS_KEY = "lessonsuk.materials";
const MESSAGES_KEY = "lessonsuk.messages";
const CONVERSATIONS_KEY = "lessonsuk.conversations";
const AVAILABILITY_KEY = "lessonsuk.availability";
const EARNINGS_KEY = "lessonsuk.earnings";
const PAYOUT_SETTINGS_KEY = "lessonsuk.payout_settings";
const LESSON_NOTES_KEY = "lessonsuk.lesson_notes";

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

export const TutorDB = {
  // Announcements
  createAnnouncement(announcement: Omit<Announcement, "id" | "createdAt">): Announcement {
    const announcements = read<Announcement>(ANNOUNCEMENTS_KEY);
    const created: Announcement = {
      ...announcement,
      id: id("ann"),
      createdAt: new Date().toISOString(),
    };
    announcements.push(created);
    write(ANNOUNCEMENTS_KEY, announcements);
    return created;
  },
  getAnnouncementsByTutor(tutorId: string): Announcement[] {
    return read<Announcement>(ANNOUNCEMENTS_KEY).filter((a) => a.tutorId === tutorId);
  },
  updateAnnouncement(id: string, patch: Partial<Announcement>): Announcement | null {
    const announcements = read<Announcement>(ANNOUNCEMENTS_KEY);
    const ann = announcements.find((a) => a.id === id);
    if (!ann) return null;
    const updated = { ...ann, ...patch } as Announcement;
    write(ANNOUNCEMENTS_KEY, announcements.map((a) => (a.id === id ? updated : a)));
    return updated;
  },
  deleteAnnouncement(id: string): boolean {
    const announcements = read<Announcement>(ANNOUNCEMENTS_KEY);
    const filtered = announcements.filter((a) => a.id !== id);
    if (filtered.length === announcements.length) return false;
    write(ANNOUNCEMENTS_KEY, filtered);
    return true;
  },

  // Materials
  createMaterial(material: Omit<LessonMaterial, "id" | "createdAt">): LessonMaterial {
    const materials = read<LessonMaterial>(MATERIALS_KEY);
    const created: LessonMaterial = {
      ...material,
      id: id("mat"),
      createdAt: new Date().toISOString(),
    };
    materials.push(created);
    write(MATERIALS_KEY, materials);
    return created;
  },
  getMaterialsByTutor(tutorId: string): LessonMaterial[] {
    return read<LessonMaterial>(MATERIALS_KEY).filter((m) => m.tutorId === tutorId);
  },
  updateMaterial(id: string, patch: Partial<LessonMaterial>): LessonMaterial | null {
    const materials = read<LessonMaterial>(MATERIALS_KEY);
    const mat = materials.find((m) => m.id === id);
    if (!mat) return null;
    const updated = { ...mat, ...patch } as LessonMaterial;
    write(MATERIALS_KEY, materials.map((m) => (m.id === id ? updated : m)));
    return updated;
  },
  deleteMaterial(id: string): boolean {
    const materials = read<LessonMaterial>(MATERIALS_KEY);
    const filtered = materials.filter((m) => m.id !== id);
    if (filtered.length === materials.length) return false;
    write(MATERIALS_KEY, filtered);
    return true;
  },

  // Messages
  sendMessage(message: Omit<Message, "id" | "createdAt">): Message {
    const messages = read<Message>(MESSAGES_KEY);
    const created: Message = {
      ...message,
      id: id("msg"),
      createdAt: new Date().toISOString(),
    };
    messages.push(created);
    write(MESSAGES_KEY, messages);

    const conversations = read<Conversation>(CONVERSATIONS_KEY);
    const conv = conversations.find((c) => c.id === message.conversationId);
    if (conv) {
      conv.lastMessage = message.content;
      conv.lastMessageAt = new Date().toISOString();
      write(CONVERSATIONS_KEY, conversations);
    }

    return created;
  },
  getMessagesByConversation(conversationId: string): Message[] {
    return read<Message>(MESSAGES_KEY)
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },
  markMessageAsRead(messageId: string): Message | null {
    const messages = read<Message>(MESSAGES_KEY);
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return null;
    const updated = { ...msg, readAt: new Date().toISOString() } as Message;
    write(MESSAGES_KEY, messages.map((m) => (m.id === messageId ? updated : m)));
    return updated;
  },

  // Conversations
  createConversation(conversation: Omit<Conversation, "id" | "createdAt" | "unreadCount" | "lastMessageAt">): Conversation {
    const conversations = read<Conversation>(CONVERSATIONS_KEY);
    const created: Conversation = {
      ...conversation,
      id: id("conv"),
      unreadCount: 0,
      createdAt: new Date().toISOString(),
    };
    conversations.push(created);
    write(CONVERSATIONS_KEY, conversations);
    return created;
  },
  getConversationsByTutor(tutorId: string): Conversation[] {
    return read<Conversation>(CONVERSATIONS_KEY)
      .filter((c) => c.tutorId === tutorId)
      .sort((a, b) => new Date(b.lastMessageAt || b.createdAt).getTime() - new Date(a.lastMessageAt || a.createdAt).getTime());
  },
  getConversation(id: string): Conversation | null {
    return read<Conversation>(CONVERSATIONS_KEY).find((c) => c.id === id) || null;
  },

  // Availability
  createAvailability(availability: Omit<TutorAvailability, "id" | "createdAt">): TutorAvailability {
    const avail = read<TutorAvailability>(AVAILABILITY_KEY);
    const created: TutorAvailability = {
      ...availability,
      id: id("avl"),
      createdAt: new Date().toISOString(),
    };
    avail.push(created);
    write(AVAILABILITY_KEY, avail);
    return created;
  },
  getAvailabilityByTutor(tutorId: string): TutorAvailability[] {
    return read<TutorAvailability>(AVAILABILITY_KEY).filter((a) => a.tutorId === tutorId);
  },
  updateAvailability(id: string, patch: Partial<TutorAvailability>): TutorAvailability | null {
    const avail = read<TutorAvailability>(AVAILABILITY_KEY);
    const item = avail.find((a) => a.id === id);
    if (!item) return null;
    const updated = { ...item, ...patch } as TutorAvailability;
    write(AVAILABILITY_KEY, avail.map((a) => (a.id === id ? updated : a)));
    return updated;
  },
  deleteAvailability(id: string): boolean {
    const avail = read<TutorAvailability>(AVAILABILITY_KEY);
    const filtered = avail.filter((a) => a.id !== id);
    if (filtered.length === avail.length) return false;
    write(AVAILABILITY_KEY, filtered);
    return true;
  },

  // Earnings
  createEarning(earning: Omit<TutorEarnings, "id" | "createdAt">): TutorEarnings {
    const earnings = read<TutorEarnings>(EARNINGS_KEY);
    const created: TutorEarnings = {
      ...earning,
      id: id("earn"),
      createdAt: new Date().toISOString(),
    };
    earnings.push(created);
    write(EARNINGS_KEY, earnings);
    return created;
  },
  getEarningsByTutor(tutorId: string): TutorEarnings[] {
    return read<TutorEarnings>(EARNINGS_KEY)
      .filter((e) => e.tutorId === tutorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  updateEarning(id: string, patch: Partial<TutorEarnings>): TutorEarnings | null {
    const earnings = read<TutorEarnings>(EARNINGS_KEY);
    const earning = earnings.find((e) => e.id === id);
    if (!earning) return null;
    const updated = { ...earning, ...patch } as TutorEarnings;
    write(EARNINGS_KEY, earnings.map((e) => (e.id === id ? updated : e)));
    return updated;
  },

  // Payout Settings
  getOrCreatePayoutSetting(tutorId: string): TutorPayoutSetting {
    const settings = read<TutorPayoutSetting>(PAYOUT_SETTINGS_KEY);
    let setting = settings.find((s) => s.tutorId === tutorId);
    if (!setting) {
      setting = {
        id: id("pst"),
        tutorId,
        payoutSchedule: "monthly",
        updatedAt: new Date().toISOString(),
      };
      settings.push(setting);
      write(PAYOUT_SETTINGS_KEY, settings);
    }
    return setting;
  },
  updatePayoutSetting(tutorId: string, patch: Partial<TutorPayoutSetting>): TutorPayoutSetting {
    const setting = this.getOrCreatePayoutSetting(tutorId);
    const updated = {
      ...setting,
      ...patch,
      updatedAt: new Date().toISOString(),
    } as TutorPayoutSetting;
    const settings = read<TutorPayoutSetting>(PAYOUT_SETTINGS_KEY);
    write(
      PAYOUT_SETTINGS_KEY,
      settings.map((s) => (s.tutorId === tutorId ? updated : s))
    );
    return updated;
  },

  // Lesson Notes
  createLessonNote(note: Omit<LessonNote, "id" | "createdAt">): LessonNote {
    const notes = read<LessonNote>(LESSON_NOTES_KEY);
    const created: LessonNote = {
      ...note,
      id: id("note"),
      createdAt: new Date().toISOString(),
    };
    notes.push(created);
    write(LESSON_NOTES_KEY, notes);
    return created;
  },
  getLessonNote(bookingId: string): LessonNote | null {
    return read<LessonNote>(LESSON_NOTES_KEY).find((n) => n.bookingId === bookingId) || null;
  },
  updateLessonNote(bookingId: string, patch: Partial<LessonNote>): LessonNote | null {
    const notes = read<LessonNote>(LESSON_NOTES_KEY);
    const note = notes.find((n) => n.bookingId === bookingId);
    if (!note) return null;
    const updated = { ...note, ...patch } as LessonNote;
    write(LESSON_NOTES_KEY, notes.map((n) => (n.bookingId === bookingId ? updated : n)));
    return updated;
  },
};

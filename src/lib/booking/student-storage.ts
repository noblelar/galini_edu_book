"use client";
import { LocalDB } from "./storage";

export interface StudentProfile {
  id: string;
  studentId: string;
  name: string;
  age: number;
  schoolYear: string;
  subjects: string[];
  parentId?: string;
  parentEmail?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentLesson {
  id: string;
  studentId: string;
  tutorId: string;
  tutorName: string;
  subject: string;
  lessonType: "one_to_one" | "group";
  date: string;
  slot: string;
  duration: number;
  meetingLink?: string;
  notes?: string;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  attendance?: "present" | "absent" | "excused";
  createdAt: string;
}

export interface StudentMaterial {
  id: string;
  studentId: string;
  tutorId: string;
  tutorName: string;
  name: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  category: "worksheet" | "video" | "pdf" | "presentation" | "image" | "document" | "assignment";
  subject: string;
  associatedLesson?: string;
  downloadedAt?: string;
  createdAt: string;
}

export interface StudentHomework {
  id: string;
  studentId: string;
  tutorId: string;
  tutorName: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string;
  instructions?: string;
  attachments?: string[];
  status: "pending" | "submitted" | "completed" | "overdue";
  submissionUrl?: string;
  submissionDate?: string;
  tutorFeedback?: string;
  tutorFeedbackDate?: string;
  createdAt: string;
}

export interface StudentAnnouncement {
  id: string;
  studentId: string;
  tutorId: string;
  tutorName: string;
  title: string;
  content: string;
  attachments?: string[];
  relatedSubject?: string;
  relatedLessonId?: string;
  readAt?: string;
  createdAt: string;
}

export interface StudentMessage {
  id: string;
  studentId: string;
  conversationId: string;
  tutorId: string;
  tutorName: string;
  senderId: string;
  senderRole: "student" | "tutor" | "parent";
  senderName: string;
  content: string;
  attachments?: string[];
  readAt?: string;
  createdAt: string;
}

export interface StudentConversation {
  id: string;
  studentId: string;
  tutorId: string;
  tutorName: string;
  tutorAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
}

export interface StudentProgress {
  id: string;
  studentId: string;
  tutorId: string;
  tutorName: string;
  subject: string;
  lessonDate: string;
  topicsCovered: string[];
  notes?: string;
  feedback?: string;
  createdAt: string;
}

export interface StudentAttendance {
  id: string;
  studentId: string;
  lessonId: string;
  tutorId: string;
  tutorName: string;
  lessonDate: string;
  subject: string;
  status: "present" | "absent" | "excused";
  createdAt: string;
}

function id(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

const STUDENT_PROFILES_KEY = "lessonsuk.student_profiles";
const STUDENT_LESSONS_KEY = "lessonsuk.student_lessons";
const STUDENT_MATERIALS_KEY = "lessonsuk.student_materials";
const STUDENT_HOMEWORK_KEY = "lessonsuk.student_homework";
const STUDENT_ANNOUNCEMENTS_KEY = "lessonsuk.student_announcements";
const STUDENT_MESSAGES_KEY = "lessonsuk.student_messages";
const STUDENT_CONVERSATIONS_KEY = "lessonsuk.student_conversations";
const STUDENT_PROGRESS_KEY = "lessonsuk.student_progress";
const STUDENT_ATTENDANCE_KEY = "lessonsuk.student_attendance";

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

export const StudentDB = {
  // Profile Management
  createProfile(profile: Omit<StudentProfile, "id" | "createdAt" | "updatedAt">): StudentProfile {
    const profiles = read<StudentProfile>(STUDENT_PROFILES_KEY);
    const existing = profiles.find((p) => p.studentId === profile.studentId);
    if (existing) return existing;

    const created: StudentProfile = {
      ...profile,
      id: id("stud"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    profiles.push(created);
    write(STUDENT_PROFILES_KEY, profiles);
    return created;
  },

  getProfile(studentId: string): StudentProfile | null {
    return read<StudentProfile>(STUDENT_PROFILES_KEY).find((p) => p.studentId === studentId) || null;
  },

  updateProfile(studentId: string, patch: Partial<StudentProfile>): StudentProfile | null {
    const profiles = read<StudentProfile>(STUDENT_PROFILES_KEY);
    const profile = profiles.find((p) => p.studentId === studentId);
    if (!profile) return null;

    const updated: StudentProfile = {
      ...profile,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    write(
      STUDENT_PROFILES_KEY,
      profiles.map((p) => (p.studentId === studentId ? updated : p))
    );
    return updated;
  },

  // Lessons
  addLesson(lesson: Omit<StudentLesson, "id" | "createdAt">): StudentLesson {
    const lessons = read<StudentLesson>(STUDENT_LESSONS_KEY);
    const created: StudentLesson = {
      ...lesson,
      id: id("less"),
      createdAt: new Date().toISOString(),
    };
    lessons.push(created);
    write(STUDENT_LESSONS_KEY, lessons);
    return created;
  },

  getLessonsByStudent(studentId: string): StudentLesson[] {
    return read<StudentLesson>(STUDENT_LESSONS_KEY)
      .filter((l) => l.studentId === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getLesson(lessonId: string): StudentLesson | null {
    return read<StudentLesson>(STUDENT_LESSONS_KEY).find((l) => l.id === lessonId) || null;
  },

  updateLesson(lessonId: string, patch: Partial<StudentLesson>): StudentLesson | null {
    const lessons = read<StudentLesson>(STUDENT_LESSONS_KEY);
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) return null;

    const updated: StudentLesson = { ...lesson, ...patch };
    write(
      STUDENT_LESSONS_KEY,
      lessons.map((l) => (l.id === lessonId ? updated : l))
    );
    return updated;
  },

  // Materials
  addMaterial(material: Omit<StudentMaterial, "id" | "createdAt">): StudentMaterial {
    const materials = read<StudentMaterial>(STUDENT_MATERIALS_KEY);
    const created: StudentMaterial = {
      ...material,
      id: id("mat"),
      createdAt: new Date().toISOString(),
    };
    materials.push(created);
    write(STUDENT_MATERIALS_KEY, materials);
    return created;
  },

  getMaterialsByStudent(studentId: string): StudentMaterial[] {
    return read<StudentMaterial>(STUDENT_MATERIALS_KEY)
      .filter((m) => m.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getMaterialsBySubject(studentId: string, subject: string): StudentMaterial[] {
    return read<StudentMaterial>(STUDENT_MATERIALS_KEY)
      .filter((m) => m.studentId === studentId && m.subject === subject)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Homework
  addHomework(homework: Omit<StudentHomework, "id" | "createdAt">): StudentHomework {
    const assignments = read<StudentHomework>(STUDENT_HOMEWORK_KEY);
    const created: StudentHomework = {
      ...homework,
      id: id("hw"),
      createdAt: new Date().toISOString(),
    };
    assignments.push(created);
    write(STUDENT_HOMEWORK_KEY, assignments);
    return created;
  },

  getHomeworkByStudent(studentId: string): StudentHomework[] {
    return read<StudentHomework>(STUDENT_HOMEWORK_KEY)
      .filter((h) => h.studentId === studentId)
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  },

  getHomework(homeworkId: string): StudentHomework | null {
    return read<StudentHomework>(STUDENT_HOMEWORK_KEY).find((h) => h.id === homeworkId) || null;
  },

  updateHomework(homeworkId: string, patch: Partial<StudentHomework>): StudentHomework | null {
    const assignments = read<StudentHomework>(STUDENT_HOMEWORK_KEY);
    const homework = assignments.find((h) => h.id === homeworkId);
    if (!homework) return null;

    const updated: StudentHomework = { ...homework, ...patch };
    write(
      STUDENT_HOMEWORK_KEY,
      assignments.map((h) => (h.id === homeworkId ? updated : h))
    );
    return updated;
  },

  // Announcements
  addAnnouncement(announcement: Omit<StudentAnnouncement, "id" | "createdAt">): StudentAnnouncement {
    const announcements = read<StudentAnnouncement>(STUDENT_ANNOUNCEMENTS_KEY);
    const created: StudentAnnouncement = {
      ...announcement,
      id: id("ann"),
      createdAt: new Date().toISOString(),
    };
    announcements.push(created);
    write(STUDENT_ANNOUNCEMENTS_KEY, announcements);
    return created;
  },

  getAnnouncementsByStudent(studentId: string): StudentAnnouncement[] {
    return read<StudentAnnouncement>(STUDENT_ANNOUNCEMENTS_KEY)
      .filter((a) => a.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  markAnnouncementAsRead(announcementId: string): StudentAnnouncement | null {
    const announcements = read<StudentAnnouncement>(STUDENT_ANNOUNCEMENTS_KEY);
    const announcement = announcements.find((a) => a.id === announcementId);
    if (!announcement) return null;

    const updated: StudentAnnouncement = {
      ...announcement,
      readAt: new Date().toISOString(),
    };
    write(
      STUDENT_ANNOUNCEMENTS_KEY,
      announcements.map((a) => (a.id === announcementId ? updated : a))
    );
    return updated;
  },

  // Messages
  sendMessage(message: Omit<StudentMessage, "id" | "createdAt">): StudentMessage {
    const messages = read<StudentMessage>(STUDENT_MESSAGES_KEY);
    const created: StudentMessage = {
      ...message,
      id: id("msg"),
      createdAt: new Date().toISOString(),
    };
    messages.push(created);
    write(STUDENT_MESSAGES_KEY, messages);
    return created;
  },

  getMessagesByConversation(conversationId: string): StudentMessage[] {
    return read<StudentMessage>(STUDENT_MESSAGES_KEY)
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  getConversations(studentId: string): StudentConversation[] {
    return read<StudentConversation>(STUDENT_CONVERSATIONS_KEY)
      .filter((c) => c.studentId === studentId)
      .sort((a, b) => new Date(b.lastMessageAt || b.createdAt).getTime() - new Date(a.lastMessageAt || a.createdAt).getTime());
  },

  getConversation(conversationId: string): StudentConversation | null {
    return read<StudentConversation>(STUDENT_CONVERSATIONS_KEY).find((c) => c.id === conversationId) || null;
  },

  createOrGetConversation(studentId: string, tutorId: string, tutorName: string): StudentConversation {
    const conversations = read<StudentConversation>(STUDENT_CONVERSATIONS_KEY);
    const existing = conversations.find((c) => c.studentId === studentId && c.tutorId === tutorId);

    if (existing) return existing;

    const created: StudentConversation = {
      id: id("conv"),
      studentId,
      tutorId,
      tutorName,
      unreadCount: 0,
      createdAt: new Date().toISOString(),
    };
    conversations.push(created);
    write(STUDENT_CONVERSATIONS_KEY, conversations);
    return created;
  },

  // Progress
  addProgressEntry(progress: Omit<StudentProgress, "id" | "createdAt">): StudentProgress {
    const entries = read<StudentProgress>(STUDENT_PROGRESS_KEY);
    const created: StudentProgress = {
      ...progress,
      id: id("prog"),
      createdAt: new Date().toISOString(),
    };
    entries.push(created);
    write(STUDENT_PROGRESS_KEY, entries);
    return created;
  },

  getProgressByStudent(studentId: string): StudentProgress[] {
    return read<StudentProgress>(STUDENT_PROGRESS_KEY)
      .filter((p) => p.studentId === studentId)
      .sort((a, b) => new Date(b.lessonDate).getTime() - new Date(a.lessonDate).getTime());
  },

  getProgressBySubject(studentId: string, subject: string): StudentProgress[] {
    return read<StudentProgress>(STUDENT_PROGRESS_KEY)
      .filter((p) => p.studentId === studentId && p.subject === subject)
      .sort((a, b) => new Date(b.lessonDate).getTime() - new Date(a.lessonDate).getTime());
  },

  // Attendance
  addAttendanceRecord(attendance: Omit<StudentAttendance, "id" | "createdAt">): StudentAttendance {
    const records = read<StudentAttendance>(STUDENT_ATTENDANCE_KEY);
    const created: StudentAttendance = {
      ...attendance,
      id: id("att"),
      createdAt: new Date().toISOString(),
    };
    records.push(created);
    write(STUDENT_ATTENDANCE_KEY, records);
    return created;
  },

  getAttendanceByStudent(studentId: string): StudentAttendance[] {
    return read<StudentAttendance>(STUDENT_ATTENDANCE_KEY)
      .filter((a) => a.studentId === studentId)
      .sort((a, b) => new Date(b.lessonDate).getTime() - new Date(a.lessonDate).getTime());
  },

  getAttendanceStats(studentId: string) {
    const records = read<StudentAttendance>(STUDENT_ATTENDANCE_KEY).filter((a) => a.studentId === studentId);
    const total = records.length;
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const excused = records.filter((r) => r.status === "excused").length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
      total,
      present,
      absent,
      excused,
      percentage,
    };
  },
};

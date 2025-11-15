export type LessonType = "one_to_one" | "group";
export type Subject = "Math" | "English" | "Science" | "History" | "Geography" | "Computer Science";
export type UserRole = "admin" | "tutor" | "parent" | "student";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "rescheduled";
export type TutorStatus = "pending" | "approved" | "rejected";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type AnnouncementAudience = "all" | "group" | "student";
export type AttendanceStatus = "present" | "absent" | "excused";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  verified: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ParentProfile {
  id: string;
  email: string;
  name: string;
  childName: string;
  schoolYear: string;
  verified: boolean;
  createdAt: string;
}

export interface Student {
  id: string;
  parentId: string;
  name: string;
  age: number;
  schoolYear: string;
  subjects: Subject[];
  createdAt: string;
}

export interface TutorInfo {
  id: string;
  name: string;
  avatarUrl?: string;
  subjects: Subject[];
}

export interface Tutor {
  id: string;
  userId: string;
  name: string;
  email: string;
  bio?: string;
  qualifications?: string;
  subjects: Subject[];
  hourlyRate: number;
  availability: AvailabilitySlot[];
  status: TutorStatus;
  commissionRate: number; // percentage
  totalEarnings: number;
  bankDetails?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySlot {
  day: string; // "Monday", "Tuesday", etc.
  startTime: string; // "09:00"
  endTime: string; // "17:00"
}

export interface Booking {
  id: string;
  parentId: string;
  studentName: string;
  tutorId: string | null;
  subject: Subject;
  lessonType: LessonType;
  date: string;
  slot: string;
  hours: number;
  ratePerHour: number;
  total: number;
  currency: "GBP";
  meetingLink?: string;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  parentId: string;
  tutorId: string;
  amount: number;
  currency: "GBP";
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  transactionDate: string;
  refundedAt?: string;
  createdAt: string;
}

export interface SubjectConfig {
  id: string;
  name: Subject;
  description?: string;
  recommendedRate: number;
  recommendedDuration: number;
  createdAt: string;
}

export interface LessonNote {
  id: string;
  bookingId: string;
  tutorId: string;
  content: string;
  attendance: AttendanceStatus;
  topics: string[];
  homework?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  tutorId: string;
  title: string;
  content: string;
  audience: AnnouncementAudience;
  targetStudentId?: string;
  targetGroupId?: string;
  attachments?: string[];
  publishDate?: string;
  createdAt: string;
}

export interface LessonMaterial {
  id: string;
  tutorId: string;
  name: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  category?: string;
  assignedTo?: string[];
  assignedToLesson?: string[];
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: UserRole;
  recipientId: string;
  content: string;
  attachments?: string[];
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  tutorId: string;
  participantId: string;
  participantRole: "parent" | "student";
  participantName: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
}

export interface TutorAvailability {
  id: string;
  tutorId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  recurring: boolean;
  blockedDates?: string[];
  createdAt: string;
}

export interface TutorEarnings {
  id: string;
  tutorId: string;
  bookingId: string;
  studentName: string;
  lessonType: LessonType;
  amount: number;
  rate: number;
  status: "paid" | "unpaid";
  paidAt?: string;
  createdAt: string;
}

export interface TutorPayoutSetting {
  id: string;
  tutorId: string;
  stripeAccountId?: string;
  bankDetails?: string;
  payoutSchedule: "weekly" | "monthly" | "on-demand";
  updatedAt: string;
}

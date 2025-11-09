export type LessonType = "one_to_one" | "group";
export type Subject = "Math" | "English" | "Science" | "History" | "Geography" | "Computer Science";

export interface ParentProfile {
  id: string;
  email: string;
  name: string;
  childName: string;
  schoolYear: string;
  verified: boolean;
  createdAt: string;
}

export interface TutorInfo {
  id: string;
  name: string;
  avatarUrl?: string;
  subjects: Subject[];
}

export interface Booking {
  id: string;
  parentId: string;
  studentName: string;
  tutorId: string | null; // null means any available tutor
  subject: Subject;
  lessonType: LessonType;
  date: string; // YYYY-MM-DD
  slot: string; // HH:MM–HH:MM
  hours: number; // 2
  ratePerHour: number; // 30 or 20
  total: number; // derived
  currency: "GBP";
  meetingLink?: string;
  status: "upcoming" | "completed" | "cancelled" | "rescheduled";
  createdAt: string;
}

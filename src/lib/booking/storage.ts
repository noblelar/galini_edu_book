"use client";
import { Booking, ParentProfile, User, Tutor, Payment, SubjectConfig, Announcement } from "./types";

function id(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

const PARENTS_KEY = "lessonsuk.parents";
const BOOKINGS_KEY = "lessonsuk.bookings";
const USERS_KEY = "lessonsuk.users";
const TUTORS_KEY = "lessonsuk.tutors";
const PAYMENTS_KEY = "lessonsuk.payments";
const SUBJECTS_KEY = "lessonsuk.subjects";
const ANNOUNCEMENTS_KEY = "lessonsuk.announcements";

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

export const LocalDB = {
  // Users
  createUser(user: Omit<User, "id" | "createdAt" | "updatedAt">): User {
    const users = read<User>(USERS_KEY);
    const existing = users.find((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (existing) return existing;
    const created: User = {
      ...user,
      id: id("usr"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(created);
    write(USERS_KEY, users);
    return created;
  },
  getUser(id: string): User | null {
    return read<User>(USERS_KEY).find((u) => u.id === id) || null;
  },
  getUserByEmail(email: string): User | null {
    return read<User>(USERS_KEY).find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },
  getAllUsers(): User[] {
    return read<User>(USERS_KEY);
  },
  updateUser(id: string, patch: Partial<User>): User | null {
    const users = read<User>(USERS_KEY);
    const user = users.find((u) => u.id === id);
    if (!user) return null;
    const updated = { ...user, ...patch, updatedAt: new Date().toISOString() } as User;
    write(USERS_KEY, users.map((u) => (u.id === id ? updated : u)));
    return updated;
  },
  deleteUser(id: string): boolean {
    const users = read<User>(USERS_KEY);
    const filtered = users.filter((u) => u.id !== id);
    if (filtered.length === users.length) return false;
    write(USERS_KEY, filtered);
    return true;
  },

  // Tutors
  createTutor(tutor: Omit<Tutor, "id" | "createdAt" | "updatedAt">): Tutor {
    const tutors = read<Tutor>(TUTORS_KEY);
    const created: Tutor = {
      ...tutor,
      id: id("tut"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tutors.push(created);
    write(TUTORS_KEY, tutors);
    return created;
  },
  getTutor(id: string): Tutor | null {
    return read<Tutor>(TUTORS_KEY).find((t) => t.id === id) || null;
  },
  getAllTutors(): Tutor[] {
    return read<Tutor>(TUTORS_KEY);
  },
  getTutorsByStatus(status: string): Tutor[] {
    return read<Tutor>(TUTORS_KEY).filter((t) => t.status === status);
  },
  updateTutor(id: string, patch: Partial<Tutor>): Tutor | null {
    const tutors = read<Tutor>(TUTORS_KEY);
    const tutor = tutors.find((t) => t.id === id);
    if (!tutor) return null;
    const updated = { ...tutor, ...patch, updatedAt: new Date().toISOString() } as Tutor;
    write(TUTORS_KEY, tutors.map((t) => (t.id === id ? updated : t)));
    return updated;
  },
  deleteTutor(id: string): boolean {
    const tutors = read<Tutor>(TUTORS_KEY);
    const filtered = tutors.filter((t) => t.id !== id);
    if (filtered.length === tutors.length) return false;
    write(TUTORS_KEY, filtered);
    return true;
  },

  // Parents
  upsertParent(profile: Omit<ParentProfile, "id" | "createdAt"> & { id?: string }): ParentProfile {
    const parents = read<ParentProfile>(PARENTS_KEY);
    let existing = parents.find((p) => p.email.toLowerCase() === profile.email.toLowerCase());
    if (existing) {
      existing = { ...existing, ...profile } as ParentProfile;
      write(PARENTS_KEY, parents.map((p) => (p.id === existing!.id ? existing! : p)));
      return existing!;
    }
    const created: ParentProfile = {
      id: profile.id || id("par"),
      name: profile.name,
      email: profile.email,
      childName: profile.childName,
      schoolYear: profile.schoolYear,
      password: profile.password,
      verified: !!profile.verified,
      createdAt: new Date().toISOString(),
    };
    parents.push(created);
    write(PARENTS_KEY, parents);
    return created;
  },
  getParentByEmail(email: string) {
    return read<ParentProfile>(PARENTS_KEY).find((p) => p.email.toLowerCase() === email.toLowerCase()) || null;
  },

  // Bookings
  listBookings(parentId?: string): Booking[] {
    const bookings = read<Booking>(BOOKINGS_KEY);
    return parentId ? bookings.filter((b) => b.parentId === parentId) : bookings;
  },
  getBooking(id: string): Booking | null {
    return read<Booking>(BOOKINGS_KEY).find((b) => b.id === id) || null;
  },
  addBooking(parentId: string, partial: Omit<Booking, "id" | "createdAt">): Booking {
    const bookings = read<Booking>(BOOKINGS_KEY);
    const created: Booking = { ...partial, id: id("bk"), createdAt: new Date().toISOString() };
    bookings.push(created);
    write(BOOKINGS_KEY, bookings);
    return created;
  },
  updateBooking(id: string, patch: Partial<Booking>) {
    const bookings = read<Booking>(BOOKINGS_KEY);
    const found = bookings.find((b) => b.id === id);
    if (!found) return null;
    const updated = { ...found, ...patch } as Booking;
    write(BOOKINGS_KEY, bookings.map((b) => (b.id === id ? updated : b)));
    return updated;
  },
  cancelBooking(id: string) {
    return this.updateBooking(id, { status: "cancelled" });
  },
  deleteBooking(id: string): boolean {
    const bookings = read<Booking>(BOOKINGS_KEY);
    const filtered = bookings.filter((b) => b.id !== id);
    if (filtered.length === bookings.length) return false;
    write(BOOKINGS_KEY, filtered);
    return true;
  },

  // Payments
  createPayment(payment: Omit<Payment, "id" | "createdAt">): Payment {
    const payments = read<Payment>(PAYMENTS_KEY);
    const created: Payment = {
      ...payment,
      id: id("pmt"),
      createdAt: new Date().toISOString(),
    };
    payments.push(created);
    write(PAYMENTS_KEY, payments);
    return created;
  },
  getPayment(id: string): Payment | null {
    return read<Payment>(PAYMENTS_KEY).find((p) => p.id === id) || null;
  },
  getPaymentsByBooking(bookingId: string): Payment[] {
    return read<Payment>(PAYMENTS_KEY).filter((p) => p.bookingId === bookingId);
  },
  getAllPayments(): Payment[] {
    return read<Payment>(PAYMENTS_KEY);
  },
  updatePayment(id: string, patch: Partial<Payment>): Payment | null {
    const payments = read<Payment>(PAYMENTS_KEY);
    const payment = payments.find((p) => p.id === id);
    if (!payment) return null;
    const updated = { ...payment, ...patch } as Payment;
    write(PAYMENTS_KEY, payments.map((p) => (p.id === id ? updated : p)));
    return updated;
  },

  // Subjects
  createSubject(subject: Omit<SubjectConfig, "id" | "createdAt">): SubjectConfig {
    const subjects = read<SubjectConfig>(SUBJECTS_KEY);
    const created: SubjectConfig = {
      ...subject,
      id: id("subj"),
      createdAt: new Date().toISOString(),
    };
    subjects.push(created);
    write(SUBJECTS_KEY, subjects);
    return created;
  },
  getSubject(name: string): SubjectConfig | null {
    return read<SubjectConfig>(SUBJECTS_KEY).find((s) => s.name === name) || null;
  },
  getAllSubjects(): SubjectConfig[] {
    return read<SubjectConfig>(SUBJECTS_KEY);
  },
  updateSubject(name: string, patch: Partial<SubjectConfig>): SubjectConfig | null {
    const subjects = read<SubjectConfig>(SUBJECTS_KEY);
    const subject = subjects.find((s) => s.name === name);
    if (!subject) return null;
    const updated = { ...subject, ...patch } as SubjectConfig;
    write(SUBJECTS_KEY, subjects.map((s) => (s.name === name ? updated : s)));
    return updated;
  },
  deleteSubject(name: string): boolean {
    const subjects = read<SubjectConfig>(SUBJECTS_KEY);
    const filtered = subjects.filter((s) => s.name !== name);
    if (filtered.length === subjects.length) return false;
    write(SUBJECTS_KEY, filtered);
    return true;
  },

  // Initialize default subjects if not present
  initializeSubjects() {
    const subjects = read<SubjectConfig>(SUBJECTS_KEY);
    if (subjects.length === 0) {
      const defaultSubjects: Omit<SubjectConfig, "id" | "createdAt">[] = [
        { name: "Math", recommendedRate: 30, recommendedDuration: 2 },
        { name: "English", recommendedRate: 30, recommendedDuration: 2 },
        { name: "Science", recommendedRate: 30, recommendedDuration: 2 },
        { name: "History", recommendedRate: 25, recommendedDuration: 2 },
        { name: "Geography", recommendedRate: 25, recommendedDuration: 2 },
        { name: "Computer Science", recommendedRate: 35, recommendedDuration: 2 },
      ] as any;
      defaultSubjects.forEach((s) => this.createSubject(s as any));
    }
  },
};

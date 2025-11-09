"use client";
import { Booking, ParentProfile } from "./types";

function id(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

const PARENTS_KEY = "lessonsuk.parents";
const BOOKINGS_KEY = "lessonsuk.bookings";

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
  listBookings(parentId: string): Booking[] {
    return read<Booking>(BOOKINGS_KEY).filter((b) => b.parentId === parentId);
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
};

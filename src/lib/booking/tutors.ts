"use client";
import { Subject } from "./types";

export interface TutorProfile {
  id: string;
  name: string;
  email: string;
  photo?: string;
  subjects: Subject[];
  rate: number;
  status: "pending" | "approved" | "rejected" | "inactive";
  commission: number; // percent
  createdAt: string;
}

const KEY = "lessonsuk.tutors";

function id() {
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function read(): TutorProfile[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TutorProfile[]) : [];
  } catch {
    return [];
  }
}
function write(list: TutorProfile[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export const TutorsDB = {
  seed() {
    if (read().length) return;
    const now = new Date().toISOString();
    write([
      { id: id(), name: "Ms. Johnson", email: "johnson@example.com", subjects: ["Math", "Science"], rate: 30, status: "approved", commission: 20, createdAt: now },
      { id: id(), name: "Mr. Smith", email: "smith@example.com", subjects: ["English"], rate: 28, status: "approved", commission: 20, createdAt: now },
      { id: id(), name: "Ms. Brown", email: "brown@example.com", subjects: ["History", "Geography"], rate: 26, status: "pending", commission: 20, createdAt: now },
    ]);
  },
  list() {
    return read();
  },
  create(data: Omit<TutorProfile, "id" | "createdAt">) {
    const list = read();
    const item: TutorProfile = { ...data, id: id(), createdAt: new Date().toISOString() };
    list.push(item);
    write(list);
    return item;
  },
  update(id: string, patch: Partial<TutorProfile>) {
    const list = read();
    const found = list.find((t) => t.id === id);
    if (!found) return null;
    const updated = { ...found, ...patch } as TutorProfile;
    write(list.map((t) => (t.id === id ? updated : t)));
    return updated;
  },
  remove(id: string) {
    write(read().filter((t) => t.id !== id));
  },
};

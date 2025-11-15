"use client";
import { Booking, Subject, User, Tutor } from "./types";

export interface DashboardMetrics {
  totalBookings: number;
  totalRevenue: number;
  activeTutors: number;
  activeParents: number;
  lessonsThisMonth: number;
  byMonth: Record<string, number>;
  bySubject: Record<Subject, number>;
  byStatus: Record<string, number>;
  dailyBookings: Record<string, number>;
  revenueTrend: Record<string, number>;
}

export function calcMetrics(bookings: Booking[], users: User[], tutors: Tutor[]): DashboardMetrics {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const completedBookings = bookings.filter((b) => b.status !== "cancelled");
  const revenue = completedBookings.reduce((sum, b) => sum + b.total, 0);

  const byMonth: Record<string, number> = {};
  const bySubject: Record<Subject, number> = {
    Math: 0,
    English: 0,
    Science: 0,
    History: 0,
    Geography: 0,
    "Computer Science": 0,
  };
  const byStatus: Record<string, number> = {
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    rescheduled: 0,
  };
  const dailyBookings: Record<string, number> = {};
  const revenueTrend: Record<string, number> = {};

  for (const b of bookings) {
    const monthKey = b.date.slice(0, 7);
    byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
    bySubject[b.subject] = (bySubject[b.subject] || 0) + 1 as any;
    byStatus[b.status] = (byStatus[b.status] || 0) + 1;

    const dailyKey = b.date;
    dailyBookings[dailyKey] = (dailyBookings[dailyKey] || 0) + 1;

    if (b.status !== "cancelled") {
      revenueTrend[monthKey] = (revenueTrend[monthKey] || 0) + b.total;
    }
  }

  const lessonsThisMonth = bookings.filter((b) => b.date.startsWith(currentMonth) && b.status !== "cancelled").length;
  const activeTutors = tutors.filter((t) => t.status === "approved").length;
  const activeParents = new Set(bookings.map((b) => b.parentId)).size;

  return {
    totalBookings: bookings.length,
    totalRevenue: revenue,
    activeTutors,
    activeParents,
    lessonsThisMonth,
    byMonth,
    bySubject,
    byStatus,
    dailyBookings,
    revenueTrend,
  };
}

export function toPercSeries(values: number[]) {
  const max = Math.max(1, ...values);
  return values.map((v) => Math.round((v / max) * 100));
}

export function getTopSubjects(bySubject: Record<Subject, number>, limit: number = 5) {
  return Object.entries(bySubject)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

export function getRevenueByMonth(revenueTrend: Record<string, number>) {
  return Object.entries(revenueTrend)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month, amount }));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

export function getTutorStats(tutors: Tutor[]) {
  const total = tutors.length;
  const approved = tutors.filter((t) => t.status === "approved").length;
  const pending = tutors.filter((t) => t.status === "pending").length;
  const rejected = tutors.filter((t) => t.status === "rejected").length;
  const totalEarnings = tutors.reduce((sum, t) => sum + t.totalEarnings, 0);

  return { total, approved, pending, rejected, totalEarnings };
}

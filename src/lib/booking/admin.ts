"use client";
import { Booking, Subject } from "./types";

export function calcMetrics(bookings: Booking[]) {
  const revenue = bookings.reduce((sum, b) => sum + (b.status !== "cancelled" ? b.total : 0), 0);
  const byMonth: Record<string, number> = {};
  const bySubject: Record<Subject, number> = {
    Math: 0,
    English: 0,
    Science: 0,
    History: 0,
    Geography: 0,
    "Computer Science": 0,
  };
  for (const b of bookings) {
    const key = b.date.slice(0, 7);
    byMonth[key] = (byMonth[key] || 0) + 1;
    bySubject[b.subject] = (bySubject[b.subject] || 0) + 1 as any;
  }
  return { revenue, byMonth, bySubject };
}

export function toPercSeries(values: number[]) {
  const max = Math.max(1, ...values);
  return values.map((v) => Math.round((v / max) * 100));
}

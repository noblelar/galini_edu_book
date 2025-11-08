import { NextResponse } from "next/server";

function generateId() {
  const rand = Math.random().toString(36).slice(2, 10);
  return `bk_${Date.now().toString(36)}_${rand}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      parentName,
      email,
      childName,
      lessonType,
      pupilsCount,
      date,
      slot,
    } = body ?? {};

    if (!parentName || !email || !childName || !lessonType || !date || !slot) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (lessonType !== "one_to_one" && lessonType !== "group") {
      return NextResponse.json({ error: "Invalid lesson type" }, { status: 400 });
    }
    const count = lessonType === "group" ? Math.max(1, Math.min(Number(pupilsCount) || 1, 5)) : 1;

    const ratePerHour = lessonType === "one_to_one" ? 30 : 20;
    const hours = 2;
    const total = ratePerHour * hours * count;

    const booking = {
      id: generateId(),
      parentName,
      email,
      childName,
      lessonType,
      pupilsCount: count,
      date,
      slot,
      ratePerHour,
      hours,
      currency: "GBP",
      total,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

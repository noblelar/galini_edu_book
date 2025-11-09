"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Dialog, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { LocalDB } from "@/lib/booking/storage";
import { Booking, LessonType, Subject } from "@/lib/booking/types";

const subjects: Subject[] = ["Math", "English", "Science", "History", "Geography", "Computer Science"];

function pounds(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
}

function generateTimeSlots() {
  const slots: string[] = [];
  for (let hour = 8; hour <= 18; hour += 2) {
    const start = String(hour).padStart(2, "0") + ":00";
    const end = String(hour + 2).padStart(2, "0") + ":00";
    slots.push(`${start}–${end}`);
  }
  return slots;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
function getMonthMatrix(base: Date) {
  const start = startOfMonth(base);
  const end = endOfMonth(base);
  const startWeekDay = (start.getDay() + 6) % 7; // Mon=0
  const days: Date[] = [];
  for (let i = -startWeekDay; i < end.getDate(); i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), i + 1);
    days.push(d);
  }
  const rows: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
  return rows;
}

export default function ManagePage() {
  const [email, setEmail] = React.useState("");
  const [profile, setProfile] = React.useState(LocalDB.getParentByEmail(email));
  const [onboardingOpen, setOnboardingOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [childName, setChildName] = React.useState("");
  const [schoolYear, setSchoolYear] = React.useState("");

  const [month, setMonth] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<string>("");
  const [lessonType, setLessonType] = React.useState<LessonType>("one_to_one");
  const [subject, setSubject] = React.useState<Subject>("Math");
  const [tutorFilter, setTutorFilter] = React.useState("any");
  const [selectedSlot, setSelectedSlot] = React.useState("");
  const [bookingsChanged, setBookingsChanged] = React.useState(0);

  const hours = 2;
  const rate = lessonType === "one_to_one" ? 30 : 20;
  const total = rate * hours * (lessonType === "group" ? 1 : 1);

  const slots = React.useMemo(() => generateTimeSlots(), []);

  function ensureProfile() {
    const existing = LocalDB.getParentByEmail(email);
    if (existing) {
      setProfile(existing);
      return;
    }
    setOnboardingOpen(true);
  }

  function completeOnboarding() {
    const created = LocalDB.upsertParent({ email, name, childName, schoolYear, verified: true });
    setProfile(created);
    setOnboardingOpen(false);
  }

  function createBooking() {
    if (!profile || !selectedDate || !selectedSlot) return;
    const booking: Omit<Booking, "id" | "createdAt"> = {
      parentId: profile.id,
      studentName: profile.childName,
      tutorId: tutorFilter === "any" ? null : tutorFilter,
      subject,
      lessonType,
      date: selectedDate,
      slot: selectedSlot,
      hours,
      ratePerHour: rate,
      total,
      currency: "GBP",
      meetingLink: `https://meet.lessonsuk.com/${Math.random().toString(36).slice(2, 8)}`,
      status: "upcoming",
    };
    LocalDB.addBooking(profile.id, booking);
    setBookingsChanged((n) => n + 1);
    alert("Booking confirmed");
  }

  const bookings = profile ? LocalDB.listBookings(profile.id) : [];
  const upcoming = bookings.filter((b) => b.status === "upcoming");
  const past = bookings.filter((b) => b.status !== "upcoming");

  function canCancel(b: Booking) {
    const date = new Date(`${b.date}T${b.slot.slice(0, 5)}:00`);
    const diff = date.getTime() - Date.now();
    return diff > 24 * 60 * 60 * 1000; // 24h
  }

  return (
    <div className="min-h-screen bg-white px-6 py-10 dark:bg-black lg:px-16">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
        {/* Left: Tutor / session details */}
        <Card>
          <CardHeader>
            <CardTitle>Parent Account</CardTitle>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Sign in or onboard to manage bookings.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" className="mt-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button onClick={ensureProfile} disabled={!email}>Continue</Button>
            <div className="pt-2 text-xs text-zinc-600 dark:text-zinc-400">
              Social sign-in requires connecting Supabase OAuth (Google, Apple, Microsoft).
            </div>
            {profile && (
              <div className="mt-4 flex items-center gap-3">
                <Avatar name={profile.name || profile.email} />
                <div>
                  <div className="text-sm font-semibold">{profile.name || "Unnamed"}</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">{profile.email}</div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <h4 className="text-sm font-semibold">Session Details</h4>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <Label>Subject</Label>
                  <Select className="mt-2" value={subject} onChange={(e) => setSubject(e.target.value as Subject)}>
                    {subjects.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Lesson type</Label>
                  <Select className="mt-2" value={lessonType} onChange={(e) => setLessonType(e.target.value as LessonType)}>
                    <option value="one_to_one">1:1</option>
                    <option value="group">Group</option>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Tutor availability</Label>
                  <Select className="mt-2" value={tutorFilter} onChange={(e) => setTutorFilter(e.target.value)}>
                    <option value="any">Any available tutor</option>
                    <option value="tutor_1">Ms. Johnson</option>
                    <option value="tutor_2">Mr. Smith</option>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
            <Link href="/book" className="underline">Quick book</Link>
            <span>Rate: {pounds(rate)}/hr • Duration: {hours}h</span>
          </CardFooter>
        </Card>

        {/* Middle: Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Pick a date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <Button variant="outline" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>Prev</Button>
              <div className="text-sm font-semibold">
                {month.toLocaleString("en-GB", { month: "long", year: "numeric" })}
              </div>
              <Button variant="outline" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>Next</Button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-zinc-500">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-2">
              {getMonthMatrix(month).map((week, wi) => (
                <React.Fragment key={wi}>
                  {week.map((d, di) => {
                    const isCurrentMonth = d.getMonth() === month.getMonth();
                    const dateStr = d.toISOString().slice(0, 10);
                    const isSelected = selectedDate === dateStr;
                    const isPast = d < new Date(new Date().toDateString());
                    return (
                      <button
                        key={di}
                        disabled={!isCurrentMonth || isPast}
                        onClick={() => setSelectedDate(dateStr)}
                        className={
                          "aspect-square rounded-md border text-sm " +
                          (isSelected
                            ? "border-[#4586F7] bg-[#4586F7]/10 text-[#0a46c4]"
                            : "border-black/[.08] hover:bg-black/[.03] dark:border-white/[.145] dark:hover:bg-[#111]")
                        }
                      >
                        <span className={isCurrentMonth ? "" : "text-zinc-400"}>{d.getDate()}</span>
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: Time slots */}
        <Card>
          <CardHeader>
            <CardTitle>Available time slots</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!selectedDate && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Select a date to see available 2-hour time blocks.</p>
            )}
            {selectedDate && (
              <div className="grid grid-cols-1 gap-2">
                {slots.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSlot(s)}
                    className={
                      "flex items-center justify-between rounded-md border p-3 text-sm " +
                      (selectedSlot === s
                        ? "border-[#4586F7] bg-[#4586F7]/10"
                        : "border-black/[.08] hover:bg-black/[.03] dark:border-white/[.145] dark:hover:bg-[#111]")
                    }
                  >
                    <span>{s}</span>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">{pounds(rate)}/hr • 2h</span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={createBooking} disabled={!profile || !selectedDate || !selectedSlot}>Confirm</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Management lists */}
      <div className="mx-auto mt-8 max-w-7xl">
        <Tabs>
          <TabsList>
            <TabsTrigger active>Upcoming</TabsTrigger>
            <TabsTrigger>Past</TabsTrigger>
          </TabsList>
          <TabsContent>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {upcoming.length === 0 && (
                <Card><CardContent className="p-6 text-sm text-zinc-600 dark:text-zinc-400">No upcoming lessons.</CardContent></Card>
              )}
              {upcoming.map((b) => (
                <Card key={b.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <div className="text-sm font-semibold">{b.subject} • {b.lessonType === "one_to_one" ? "1:1" : "Group"}</div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">{b.date} • {b.slot}</div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">Price: {pounds(b.total)}</div>
                      {b.meetingLink && (
                        <a className="text-sm text-[#4586F7] underline" href={b.meetingLink} target="_blank" rel="noreferrer">Meeting link</a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedDate(b.date)}>Reschedule</Button>
                      <Button variant="outline" size="sm" disabled={!canCancel(b)} onClick={() => { LocalDB.cancelBooking(b.id); setBookingsChanged((n) => n + 1); }}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent hidden>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {past.length === 0 && (
                <Card><CardContent className="p-6 text-sm text-zinc-600 dark:text-zinc-400">No past lessons.</CardContent></Card>
              )}
              {past.map((b) => (
                <Card key={b.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <div className="text-sm font-semibold">{b.subject} • {b.lessonType === "one_to_one" ? "1:1" : "Group"}</div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">{b.date} • {b.slot}</div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">Price: {pounds(b.total)}</div>
                    </div>
                    <div className="text-xs text-zinc-500">{b.status}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Onboarding */}
      <Dialog open={onboardingOpen} onOpenChange={setOnboardingOpen}>
        <DialogHeader>
          <DialogTitle>Complete your profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Parent name</Label>
            <Input className="mt-2" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Child name</Label>
            <Input className="mt-2" value={childName} onChange={(e) => setChildName(e.target.value)} />
          </div>
          <div>
            <Label>School year</Label>
            <Input className="mt-2" value={schoolYear} onChange={(e) => setSchoolYear(e.target.value)} placeholder="e.g. Year 6" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={completeOnboarding} disabled={!name || !childName || !schoolYear}>Save</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

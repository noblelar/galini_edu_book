"use client";

import * as React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select } from "@/components/ui/select";
import { Dialog, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type LessonType = "one_to_one" | "group";

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

export default function BookPage() {
  const [lessonType, setLessonType] = React.useState<LessonType>("one_to_one");
  const [pupilsCount, setPupilsCount] = React.useState(1);
  const [date, setDate] = React.useState("");
  const [slot, setSlot] = React.useState("");
  const [parentName, setParentName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [childName, setChildName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState<any>(null);

  const ratePerHour = lessonType === "one_to_one" ? 30 : 20;
  const hours = 2;
  const seats = lessonType === "group" ? pupilsCount : 1;
  const total = ratePerHour * hours * seats;

  const slots = React.useMemo(() => generateTimeSlots(), []);

  const canSubmit = parentName && email && childName && date && slot;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentName,
          email,
          childName,
          lessonType,
          pupilsCount: seats,
          date,
          slot,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Booking failed");
      setConfirmation(data.booking);
      setDialogOpen(true);
    } catch (_) {
      setConfirmation({ error: "Unable to create booking. Please try again." });
      setDialogOpen(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-4xl flex-col gap-8 px-6 py-12 sm:px-10">
        <Card>
          <CardHeader>
            <CardTitle>Book a Lesson (UK)</CardTitle>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              One-to-one is {pounds(30)}/hour. Group (up to 5 pupils) is {pounds(20)}/hour. Each slot is 2 hours.
            </p>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 gap-6 sm:grid-cols-2" onSubmit={handleSubmit}>
              <div className="sm:col-span-2">
                <Label htmlFor="lessonType">Lesson type</Label>
                <RadioGroup
                  name="lessonType"
                  value={lessonType}
                  onValueChange={(v) => setLessonType(v as LessonType)}
                  className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2"
                >
                  <RadioGroupItem value="one_to_one" label="One-to-one (£30/hour)" />
                  <RadioGroupItem value="group" label="Group (max 5 pupils) (£20/hour)" />
                </RadioGroup>
              </div>

              {lessonType === "group" && (
                <div>
                  <Label htmlFor="pupils">Number of pupils</Label>
                  <Select
                    id="pupils"
                    value={String(pupilsCount)}
                    onChange={(e) => setPupilsCount(Math.max(1, Math.min(5, Number(e.target.value))))}
                    className="mt-2"
                  >
                    {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" className="mt-2" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              <div>
                <Label htmlFor="slot">Time slot (2 hours)</Label>
                <Select id="slot" className="mt-2" value={slot} onChange={(e) => setSlot(e.target.value)}>
                  <option value="" disabled>
                    Select a slot
                  </option>
                  {slots.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="parentName">Parent/Guardian name</Label>
                <Input id="parentName" className="mt-2" value={parentName} onChange={(e) => setParentName(e.target.value)} />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" className="mt-2" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="childName">Child name</Label>
                <Input id="childName" className="mt-2" value={childName} onChange={(e) => setChildName(e.target.value)} />
              </div>

              <div className="sm:col-span-2">
                <Card className="mt-2">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <div className="flex items-center justify-between">
                        <span>Lesson type</span>
                        <span className="font-medium">
                          {lessonType === "one_to_one" ? "One-to-one" : `Group (${seats} ${seats === 1 ? "pupil" : "pupils"})`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Rate</span>
                        <span className="font-medium">{pounds(ratePerHour)}/hour</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Duration</span>
                        <span className="font-medium">{hours} hours</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Total</span>
                        <span className="font-semibold">{pounds(total)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <CardFooter className="sm:col-span-2">
                <Button type="submit" disabled={!canSubmit || loading} className="w-full sm:w-auto">
                  {loading ? "Processing..." : "Book now"}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogHeader>
            <DialogTitle>{confirmation?.error ? "Booking failed" : "Booking confirmed"}</DialogTitle>
          </DialogHeader>
          {confirmation?.error ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{confirmation.error}</p>
          ) : (
            <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              <p>Reference: <span className="font-medium">{confirmation?.id}</span></p>
              <p>Date: <span className="font-medium">{confirmation?.date}</span></p>
              <p>Time: <span className="font-medium">{confirmation?.slot}</span></p>
              <p>Total: <span className="font-medium">{pounds(confirmation?.total ?? 0)}</span></p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </Dialog>
      </main>
    </div>
  );
}

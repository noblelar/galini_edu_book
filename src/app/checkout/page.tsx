"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LocalDB } from "@/lib/booking/storage";
import { Booking } from "@/lib/booking/types";

function pounds(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
}

export default function CheckoutPage() {
  const params = useSearchParams();
  const id = params.get("booking");
  const [booking, setBooking] = React.useState<Booking | null>(null);

  React.useEffect(() => {
    if (!id) return;
    // naive lookup: scan local DB
    const all = (JSON.parse(localStorage.getItem("lessonsuk.bookings") || "[]") as Booking[]);
    setBooking(all.find((b) => b.id === id) || null);
  }, [id]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12 dark:bg-black">
      <main className="w-full max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            {!booking && <p>Booking not found.</p>}
            {booking && (
              <>
                <p>Reference: <span className="font-medium">{booking.id}</span></p>
                <p>Date & time: <span className="font-medium">{booking.date} • {booking.slot}</span></p>
                <p>Subject & type: <span className="font-medium">{booking.subject} • {booking.lessonType === "one_to_one" ? "1:1" : "Group"}</span></p>
                <p>Total: <span className="font-medium">{pounds(booking.total)}</span></p>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => history.back()}>Back</Button>
            <Button onClick={() => (window.location.href = `/api/checkout?booking=${encodeURIComponent(id || "")}`)} disabled={!booking}>
              Pay with Stripe
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

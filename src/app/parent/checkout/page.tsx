"use client";
import { useEffect, useState } from "react";
import { LocalDB } from "@/lib/booking/storage";
import { ParentDB } from "@/lib/booking/parent-storage";
import { Booking } from "@/lib/booking/types";
import { formatCurrency } from "@/lib/booking/admin";

export default function CheckoutPage() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get("bookingId");

    if (bookingId) {
      const b = LocalDB.getBooking(bookingId);
      setBooking(b);
    }

    setLoading(false);
  }, []);

  const handlePayment = async () => {
    if (!booking) return;

    setProcessing(true);

    // Simulate Stripe payment
    setTimeout(() => {
      ParentDB.recordPayment({
        parentId: booking.parentId,
        bookingId: booking.id,
        amount: booking.total,
        currency: "GBP",
        paymentMethod: paymentMethod as any,
        status: "completed",
        transactionDate: new Date().toISOString(),
      });

      // Update booking status
      LocalDB.updateBooking(booking.id, { status: "confirmed" });

      setProcessing(false);
      alert("Payment successful! Booking confirmed.");
      window.location.href = "/parent/bookings";
    }, 2000);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">Booking not found</p>
          <a href="/parent/book" className="text-blue-600 hover:text-blue-700 mt-3 inline-block font-medium">
            Back to booking →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Checkout</h1>
        <p className="text-gray-600 mt-2">Complete your lesson booking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-2 border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
          <h2 className="font-bold text-xl mb-6">Order Summary</h2>

          <div className="space-y-4 pb-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{booking.studentName}</p>
                <p className="text-sm text-gray-600">{booking.subject}</p>
              </div>
              <p className="font-semibold">{formatCurrency(booking.total)}</p>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p>📅 {booking.date}</p>
              <p>⏰ {booking.slot}</p>
              <p>👥 {booking.lessonType === "one_to_one" ? "1:1 Lesson" : "Group Lesson"}</p>
              <p>⏱️ 2 hours</p>
            </div>
          </div>

          <div className="my-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Price (£{booking.ratePerHour}/hr × 2 hrs)</span>
              <span>{formatCurrency(booking.total)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Tax (0%)</span>
              <span>£0.00</span>
            </div>
            <div className="flex items-center justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span>{formatCurrency(booking.total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm h-fit">
          <h2 className="font-bold text-xl mb-6">Payment Method</h2>

          <div className="space-y-3 mb-6">
            {[
              { id: "card", label: "💳 Credit Card", icon: "card" },
              { id: "apple_pay", label: "🍎 Apple Pay", icon: "apple" },
              { id: "google_pay", label: "🔵 Google Pay", icon: "google" },
            ].map((method) => (
              <label key={method.id} className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all"
                style={{
                  borderColor: paymentMethod === method.id ? "#2563eb" : "#d1d5db",
                  backgroundColor: paymentMethod === method.id ? "#eff6ff" : "white"
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="font-medium">{method.label}</span>
              </label>
            ))}
          </div>

          {paymentMethod === "card" && (
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CVC</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={processing}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-bold transition-all"
          >
            {processing ? "Processing..." : `Pay ${formatCurrency(booking.total)}`}
          </button>

          <p className="text-xs text-gray-600 text-center mt-4">
            🔒 Your payment is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}

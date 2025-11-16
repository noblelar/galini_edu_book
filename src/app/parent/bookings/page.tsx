"use client";
import { useEffect, useState } from "react";
import { LocalDB } from "@/lib/booking/storage";
import { Booking } from "@/lib/booking/types";
import { formatCurrency } from "@/lib/booking/admin";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [parentId] = useState("parent_demo_001");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");

  useEffect(() => {
    const allBookings = LocalDB.listBookings().filter((b) => b.parentId === parentId);
    setBookings(allBookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setLoading(false);
  }, [parentId]);

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "upcoming") return b.status !== "cancelled" && b.status !== "completed";
    return b.status === filterStatus;
  });

  const handleCancelBooking = (id: string) => {
    if (confirm("Cancel this booking?")) {
      const updated = LocalDB.cancelBooking(id);
      if (updated) {
        setBookings(bookings.map((b) => (b.id === id ? updated : b)));
        setSelectedBooking(null);
      }
    }
  };

  const handleReschedule = (id: string) => {
    alert("Reschedule feature would open a modal to select new date/time");
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">My Bookings</h1>
        <p className="text-gray-600 mt-2">View and manage all your lesson bookings</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        {(["all", "upcoming", "completed", "cancelled"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterStatus === status
                ? "bg-blue-600 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({bookings.filter((b) => b.status === status || (status === "upcoming" && b.status !== "completed" && b.status !== "cancelled")).length})
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              onClick={() => setSelectedBooking(booking)}
              className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{booking.studentName}</h3>
                  <p className="text-gray-600 text-sm">{booking.subject} • {booking.date} {booking.slot}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{formatCurrency(booking.total)}</p>
                  <span className={`inline-block px-3 py-1 rounded text-xs font-medium mt-1 ${
                    booking.status === "completed" ? "bg-green-100 text-green-800" :
                    booking.status === "cancelled" ? "bg-red-100 text-red-800" :
                    "bg-blue-100 text-blue-800"
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-600">
            <p className="text-lg">No {filterStatus === "all" ? "" : filterStatus} bookings</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{selectedBooking.studentName}</h2>
              <button onClick={() => setSelectedBooking(null)} className="text-2xl text-gray-500">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
              <div>
                <p className="text-sm text-gray-600">Subject</p>
                <p className="font-semibold">{selectedBooking.subject}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-semibold">{selectedBooking.lessonType === "one_to_one" ? "1:1" : "Group"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-semibold">{selectedBooking.date} {selectedBooking.slot}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="font-semibold">{formatCurrency(selectedBooking.total)}</p>
              </div>
            </div>

            {selectedBooking.meetingLink && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-gray-600 mb-2">Meeting Link</p>
                <a href={selectedBooking.meetingLink} target="_blank" className="text-blue-600 hover:text-blue-700 font-medium break-all">
                  {selectedBooking.meetingLink}
                </a>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {selectedBooking.status === "completed" ? (
                <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium">
                  ✓ Completed
                </button>
              ) : selectedBooking.status === "cancelled" ? (
                <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium">
                  ✕ Cancelled
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleReschedule(selectedBooking.id)}
                    className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => handleCancelBooking(selectedBooking.id)}
                    className="flex-1 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 font-medium"
                  >
                    Cancel
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

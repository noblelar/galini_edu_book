"use client";
import { useEffect, useState } from "react";
import { LocalDB } from "@/lib/booking/storage";
import { Booking } from "@/lib/booking/types";
import { formatCurrency } from "@/lib/booking/admin";

export default function CalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [parentId] = useState("parent_demo_001");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [viewType, setViewType] = useState<"month" | "week">("month");

  useEffect(() => {
    const allBookings = LocalDB.listBookings().filter((b) => b.parentId === parentId);
    setBookings(allBookings);
    setLoading(false);
  }, [parentId]);

  const getCalendarDays = () => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const prevLastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();
    const nextDays = 7 - lastDay.getDay();

    const daysArray = [];
    for (let i = firstDay.getDay(); i > 0; i--) {
      daysArray.push({ date: prevLastDay - i + 1, isCurrentMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      daysArray.push({ date: i, isCurrentMonth: true });
    }
    for (let i = 1; i <= nextDays; i++) {
      daysArray.push({ date: i, isCurrentMonth: false });
    }

    return daysArray;
  };

  const getDateString = (dayNum: number) => {
    return `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
  };

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      Math: "bg-blue-100 text-blue-800 border-blue-300",
      English: "bg-green-100 text-green-800 border-green-300",
      Science: "bg-purple-100 text-purple-800 border-purple-300",
      History: "bg-amber-100 text-amber-800 border-amber-300",
      Geography: "bg-cyan-100 text-cyan-800 border-cyan-300",
      "Computer Science": "bg-indigo-100 text-indigo-800 border-indigo-300",
    };
    return colors[subject] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const daysArray = getCalendarDays();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Calendar</h1>
          <p className="text-gray-600 mt-2">View all your scheduled lessons</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewType("month")}
            className={`px-4 py-2 rounded-lg font-medium ${
              viewType === "month" ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-700"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setViewType("week")}
            className={`px-4 py-2 rounded-lg font-medium ${
              viewType === "week" ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-700"
            }`}
          >
            Week
          </button>
        </div>
      </div>

      {/* Month View */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 font-medium"
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 font-medium"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 font-medium"
            >
              Next →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-3 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="font-bold text-gray-700 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {daysArray.map((day, i) => {
            const dateStr = day.isCurrentMonth ? getDateString(day.date) : "";
            const dayBookings = bookings.filter((b) => b.date === dateStr && b.status !== "cancelled");

            return (
              <div
                key={i}
                className={`min-h-24 p-2 border rounded ${
                  day.isCurrentMonth ? "bg-white border-gray-200 hover:shadow-md transition-shadow" : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className={`font-bold mb-1 ${day.isCurrentMonth ? "text-gray-900" : "text-gray-400"}`}>
                  {day.date}
                </div>
                <div className="space-y-1">
                  {dayBookings.map((booking) => (
                    <div
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      className={`px-2 py-1 rounded text-xs font-medium cursor-pointer hover:shadow-md transition-all border ${getSubjectColor(
                        booking.subject
                      )}`}
                    >
                      {booking.studentName}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <h3 className="font-bold mb-4">Subject Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {["Math", "English", "Science", "History", "Geography", "Computer Science"].map((subject) => (
            <div key={subject} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${getSubjectColor(subject).split(" ")[0]}`} />
              <span className="text-sm">{subject}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Details */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{selectedBooking.studentName}</h2>
              <button onClick={() => setSelectedBooking(null)} className="text-2xl text-gray-500">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Subject</p>
                <p className="font-semibold">{selectedBooking.subject}</p>
              </div>
              <div>
                <p className="text-gray-600">Date & Time</p>
                <p className="font-semibold">
                  {selectedBooking.date} {selectedBooking.slot}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Type</p>
                <p className="font-semibold">{selectedBooking.lessonType === "one_to_one" ? "One-on-One" : "Group"}</p>
              </div>
              <div>
                <p className="text-gray-600">Price</p>
                <p className="font-semibold">{formatCurrency(selectedBooking.total)}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-semibold capitalize">{selectedBooking.status}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

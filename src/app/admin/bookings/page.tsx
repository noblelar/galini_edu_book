"use client";
import { useEffect, useState } from "react";
import { LocalDB } from "@/lib/booking/storage";
import { Booking, BookingStatus, Subject } from "@/lib/booking/types";
import { formatCurrency } from "@/lib/booking/admin";

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState<BookingStatus | "all">("all");
  const [filterSubject, setFilterSubject] = useState<Subject | "all">("all");
  const [filterType, setFilterType] = useState<"all" | "one_to_one" | "group">("all");
  const [newDate, setNewDate] = useState("");
  const [newSlot, setNewSlot] = useState("");

  const allSubjects: Subject[] = ["Math", "English", "Science", "History", "Geography", "Computer Science"];

  useEffect(() => {
    const allBookings = LocalDB.listBookings();
    setBookings(allBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLoading(false);
  }, []);

  const handleCancelBooking = (id: string) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      const updated = LocalDB.cancelBooking(id);
      if (updated) {
        setBookings(bookings.map((b) => (b.id === id ? updated : b)));
      }
    }
  };

  const handleReschedule = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewDate(booking.date);
    setNewSlot(booking.slot);
    setShowRescheduleForm(true);
  };

  const handleSaveReschedule = () => {
    if (!selectedBooking || !newDate || !newSlot) {
      alert("Please fill in all fields");
      return;
    }

    const updated = LocalDB.updateBooking(selectedBooking.id, {
      date: newDate,
      slot: newSlot,
      status: "rescheduled",
    });

    if (updated) {
      setBookings(bookings.map((b) => (b.id === selectedBooking.id ? updated : b)));
      setShowRescheduleForm(false);
      setSelectedBooking(null);
    }
  };

  const handleDeleteBooking = (id: string) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      if (LocalDB.deleteBooking(id)) {
        setBookings(bookings.filter((b) => b.id !== id));
      }
    }
  };

  const handleChangeStatus = (id: string, status: BookingStatus) => {
    const updated = LocalDB.updateBooking(id, { status });
    if (updated) {
      setBookings(bookings.map((b) => (b.id === id ? updated : b)));
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus !== "all" && b.status !== filterStatus) return false;
    if (filterSubject !== "all" && b.subject !== filterSubject) return false;
    if (filterType !== "all" && b.lessonType !== filterType) return false;
    return true;
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Booking Management</h1>
        <p className="text-gray-600 mt-2">Manage and track all lesson bookings</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Bookings" value={bookings.length.toString()} />
        <StatCard label="Total Revenue" value={formatCurrency(bookings.reduce((sum, b) => sum + (b.status !== "cancelled" ? b.total : 0), 0))} />
        <StatCard label="Pending" value={bookings.filter((b) => b.status === "pending").length.toString()} />
        <StatCard label="Completed" value={bookings.filter((b) => b.status === "completed").length.toString()} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as BookingStatus | "all")}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rescheduled">Rescheduled</option>
        </select>

        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value as Subject | "all")}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Subjects</option>
          {allSubjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as "all" | "one_to_one" | "group")}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="one_to_one">One-on-One</option>
          <option value="group">Group</option>
        </select>
      </div>

      {/* Bookings Table */}
      <div className="border rounded-lg bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Booking ID</th>
                <th className="text-left py-3 px-4 font-semibold">Student</th>
                <th className="text-left py-3 px-4 font-semibold">Subject</th>
                <th className="text-left py-3 px-4 font-semibold">Date & Time</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">Amount</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-xs">{booking.id.slice(0, 8)}</td>
                  <td className="py-3 px-4">{booking.studentName}</td>
                  <td className="py-3 px-4">{booking.subject}</td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <div className="font-medium">{booking.date}</div>
                      <div className="text-gray-600">{booking.slot}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 capitalize text-sm">
                    {booking.lessonType === "one_to_one" ? "1:1" : "Group"}
                  </td>
                  <td className="py-3 px-4 font-semibold">{formatCurrency(booking.total)}</td>
                  <td className="py-3 px-4">
                    <select
                      value={booking.status}
                      onChange={(e) => handleChangeStatus(booking.id, e.target.value as BookingStatus)}
                      className="px-2 py-1 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="rescheduled">Rescheduled</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleReschedule(booking)}
                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredBookings.length === 0 && (
          <div className="py-8 text-center text-gray-600">No bookings found</div>
        )}
      </div>

      {/* Reschedule Modal */}
      {showRescheduleForm && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Reschedule Booking</h2>
            <p className="text-gray-600 mb-4">
              Current: {selectedBooking.date} {selectedBooking.slot}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">New Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">New Time Slot</label>
                <select
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a time slot</option>
                  <option value="09:00–11:00">09:00 – 11:00</option>
                  <option value="11:00–13:00">11:00 – 13:00</option>
                  <option value="13:00–15:00">13:00 – 15:00</option>
                  <option value="15:00–17:00">15:00 – 17:00</option>
                  <option value="17:00–19:00">17:00 – 19:00</option>
                  <option value="19:00–21:00">19:00 – 21:00</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowRescheduleForm(false);
                  setSelectedBooking(null);
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReschedule}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
      <p className="text-sm font-medium text-blue-900">{label}</p>
      <p className="text-2xl font-bold text-blue-900 mt-2">{value}</p>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { LocalDB } from "@/lib/booking/storage";
import { TutorDB } from "@/lib/booking/tutor-storage";
import { Booking, LessonNote } from "@/lib/booking/types";
import { formatCurrency } from "@/lib/booking/admin";

export default function LessonManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tutorId] = useState("tutor_demo_001");
  const [selectedLesson, setSelectedLesson] = useState<Booking | null>(null);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [noteData, setNoteData] = useState({
    content: "",
    attendance: "present" as const,
    topics: "",
    homework: "",
  });

  useEffect(() => {
    const allBookings = LocalDB.listBookings().filter((b) => b.tutorId === tutorId || !b.tutorId);
    setBookings(allBookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setLoading(false);
  }, [tutorId]);

  const handleSaveNote = () => {
    if (!selectedLesson) return;

    const existingNote = TutorDB.getLessonNote(selectedLesson.id);
    if (existingNote) {
      TutorDB.updateLessonNote(selectedLesson.id, {
        content: noteData.content,
        attendance: noteData.attendance,
        topics: noteData.topics.split(",").map((t) => t.trim()),
        homework: noteData.homework,
      });
    } else {
      TutorDB.createLessonNote({
        bookingId: selectedLesson.id,
        tutorId,
        content: noteData.content,
        attendance: noteData.attendance,
        topics: noteData.topics.split(",").map((t) => t.trim()),
        homework: noteData.homework,
      });
    }

    setShowNoteForm(false);
    setNoteData({ content: "", attendance: "present", topics: "", homework: "" });
  };

  const handleCompleteLesson = (lessonId: string) => {
    const updated = LocalDB.updateBooking(lessonId, { status: "completed" });
    if (updated) {
      setBookings(bookings.map((b) => (b.id === lessonId ? updated : b)));
      setSelectedLesson(null);
    }
  };

  const handleCancelLesson = (lessonId: string) => {
    if (confirm("Are you sure you want to cancel this lesson?")) {
      const updated = LocalDB.cancelBooking(lessonId);
      if (updated) {
        setBookings(bookings.map((b) => (b.id === lessonId ? updated : b)));
        setSelectedLesson(null);
      }
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus !== "all" && b.status !== filterStatus) return false;
    if (filterSubject !== "all" && b.subject !== filterSubject) return false;
    return true;
  });

  const subjects = Array.from(new Set(bookings.map((b) => b.subject)));

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Lesson Management</h1>
        <p className="text-gray-600 mt-2">Manage your lessons, accept bookings, and track attendance</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-4 flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setView("list")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === "list" ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            📋 List
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === "calendar" ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            📅 Calendar
          </button>
        </div>
      </div>

      {/* List View */}
      {view === "list" && (
        <div className="border rounded-lg bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
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
                {filteredBookings.map((lesson) => (
                  <tr key={lesson.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{lesson.studentName}</td>
                    <td className="py-3 px-4">{lesson.subject}</td>
                    <td className="py-3 px-4 text-gray-600">
                      <div className="text-sm">{lesson.date}</div>
                      <div className="text-xs text-gray-500">{lesson.slot}</div>
                    </td>
                    <td className="py-3 px-4 text-sm">{lesson.lessonType === "one_to_one" ? "1:1" : "Group"}</td>
                    <td className="py-3 px-4 font-semibold">{formatCurrency(lesson.total)}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={lesson.status} />
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          setSelectedLesson(lesson);
                          const note = TutorDB.getLessonNote(lesson.id);
                          if (note) {
                            setNoteData({
                              content: note.content,
                              attendance: note.attendance,
                              topics: note.topics.join(", "),
                              homework: note.homework || "",
                            });
                          }
                          setShowNoteForm(false);
                        }}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredBookings.length === 0 && (
            <div className="text-center py-8 text-gray-600">No lessons found</div>
          )}
        </div>
      )}

      {/* Calendar View */}
      {view === "calendar" && (
        <CalendarView bookings={filteredBookings} onSelectLesson={(lesson) => setSelectedLesson(lesson)} />
      )}

      {/* Lesson Details Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Lesson Details</h2>
              <button
                onClick={() => setSelectedLesson(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Lesson Info */}
              <div>
                <h3 className="font-bold text-lg mb-3">Lesson Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Student</p>
                    <p className="font-semibold">{selectedLesson.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Subject</p>
                    <p className="font-semibold">{selectedLesson.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold">{selectedLesson.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-semibold">{selectedLesson.slot}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-semibold">{selectedLesson.lessonType === "one_to_one" ? "1:1 Lesson" : "Group Lesson"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-semibold">{formatCurrency(selectedLesson.total)}</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="font-bold text-lg mb-3">Status</h3>
                <StatusBadge status={selectedLesson.status} />
              </div>

              {/* Notes Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">Session Notes</h3>
                  <button
                    onClick={() => setShowNoteForm(!showNoteForm)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    {showNoteForm ? "Cancel" : "Add Note"}
                  </button>
                </div>

                {showNoteForm ? (
                  <div className="space-y-4 border p-4 rounded-lg bg-blue-50">
                    <div>
                      <label className="block text-sm font-medium mb-2">Session Summary</label>
                      <textarea
                        value={noteData.content}
                        onChange={(e) => setNoteData({ ...noteData, content: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="Describe what was covered in this session..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Attendance</label>
                        <select
                          value={noteData.attendance}
                          onChange={(e) => setNoteData({ ...noteData, attendance: e.target.value as any })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="excused">Excused</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Topics Covered</label>
                        <input
                          type="text"
                          value={noteData.topics}
                          onChange={(e) => setNoteData({ ...noteData, topics: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Algebra, Word problems"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Homework</label>
                      <textarea
                        value={noteData.homework}
                        onChange={(e) => setNoteData({ ...noteData, homework: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        placeholder="Set homework for next session..."
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveNote}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-600">
                    <p>No notes added yet</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {selectedLesson.status === "pending" && (
                  <>
                    <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                      Accept
                    </button>
                    <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
                      Decline
                    </button>
                  </>
                )}
                {selectedLesson.status === "confirmed" && (
                  <>
                    <button
                      onClick={() => handleCompleteLesson(selectedLesson.id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                    >
                      Mark Complete
                    </button>
                    <button className="flex-1 px-4 py-2 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 font-medium">
                      Reschedule
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleCancelLesson(selectedLesson.id)}
                  className="flex-1 px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
    rescheduled: "bg-purple-100 text-purple-800",
  };

  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${styles[status] || "bg-gray-100"}`}>
      {status}
    </span>
  );
}

function CalendarView({
  bookings,
  onSelectLesson,
}: {
  bookings: Booking[];
  onSelectLesson: (lesson: Booking) => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  return (
    <div className="border rounded-lg bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="px-3 py-1 border rounded hover:bg-gray-50"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="px-3 py-1 border rounded hover:bg-gray-50"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-semibold text-sm py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysArray.map((day, i) => {
          const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day.date).padStart(2, "0")}`;
          const dayBookings = bookings.filter((b) => b.date === dateStr);

          return (
            <div
              key={i}
              className={`min-h-24 p-2 border rounded text-sm ${day.isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"}`}
            >
              <div className="font-semibold mb-1">{day.date}</div>
              <div className="space-y-1">
                {dayBookings.map((booking) => (
                  <div
                    key={booking.id}
                    onClick={() => onSelectLesson(booking)}
                    className="text-xs bg-blue-100 text-blue-800 p-1 rounded cursor-pointer hover:bg-blue-200 truncate"
                    title={booking.studentName}
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
  );
}

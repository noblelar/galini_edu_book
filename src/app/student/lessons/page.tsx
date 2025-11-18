"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { StudentDB, StudentLesson } from "@/lib/booking/student-storage";

type TabType = "upcoming" | "completed" | "cancelled";

export default function StudentLessons() {
  const [lessons, setLessons] = useState<StudentLesson[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [filteredLessons, setFilteredLessons] = useState<StudentLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId] = useState("student_demo_001");
  const [filterSubject, setFilterSubject] = useState<string>("");
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    const allLessons = StudentDB.getLessonsByStudent(studentId);
    setLessons(allLessons);

    const uniqueSubjects = Array.from(new Set(allLessons.map((l) => l.subject)));
    setSubjects(uniqueSubjects);

    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    let filtered = lessons;
    const now = new Date();

    if (activeTab === "upcoming") {
      filtered = lessons.filter((l) => {
        const lessonDate = new Date(l.date);
        return l.status === "scheduled" && lessonDate >= now;
      });
    } else if (activeTab === "completed") {
      filtered = lessons.filter((l) => l.status === "completed");
    } else if (activeTab === "cancelled") {
      filtered = lessons.filter((l) => l.status === "cancelled" || l.status === "rescheduled");
    }

    if (filterSubject) {
      filtered = filtered.filter((l) => l.subject === filterSubject);
    }

    setFilteredLessons(filtered);
  }, [lessons, activeTab, filterSubject]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const upcomingCount = lessons.filter((l) => {
    const now = new Date();
    const lessonDate = new Date(l.date);
    return l.status === "scheduled" && lessonDate >= now;
  }).length;

  const completedCount = lessons.filter((l) => l.status === "completed").length;
  const cancelledCount = lessons.filter((l) => l.status === "cancelled" || l.status === "rescheduled").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          📚 My Lessons
        </h1>
        <p className="text-gray-600 mt-2">View all your scheduled, completed, and cancelled lessons</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-6 py-3 font-semibold transition-all border-b-2 ${
            activeTab === "upcoming"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          📅 Upcoming ({upcomingCount})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-6 py-3 font-semibold transition-all border-b-2 ${
            activeTab === "completed"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          ✅ Completed ({completedCount})
        </button>
        <button
          onClick={() => setActiveTab("cancelled")}
          className={`px-6 py-3 font-semibold transition-all border-b-2 ${
            activeTab === "cancelled"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          ❌ Cancelled ({cancelledCount})
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Subject</label>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lessons List */}
      <div className="space-y-4">
        {filteredLessons.length > 0 ? (
          filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">{lesson.subject}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(lesson.status)}`}>
                      {lesson.status.charAt(0).toUpperCase() + lesson.status.slice(1)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${lesson.lessonType === "one_to_one" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                      {lesson.lessonType === "one_to_one" ? "1:1" : "Group"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Tutor</p>
                      <p className="font-semibold text-gray-900 mt-1">👨‍🏫 {lesson.tutorName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Date</p>
                      <p className="font-semibold text-gray-900 mt-1">📅 {lesson.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Time</p>
                      <p className="font-semibold text-gray-900 mt-1">🕐 {lesson.slot}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Duration</p>
                      <p className="font-semibold text-gray-900 mt-1">⏱️ {lesson.duration} hour{lesson.duration !== 1 ? "s" : ""}</p>
                    </div>
                  </div>

                  {lesson.notes && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-900">
                        <strong>📝 Notes:</strong> {lesson.notes}
                      </p>
                    </div>
                  )}

                  {lesson.attendance && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700">
                        ✅ Attendance: <span className="text-green-600">{lesson.attendance.charAt(0).toUpperCase() + lesson.attendance.slice(1)}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="ml-6 flex flex-col gap-2">
                  <Link
                    href={`/student/lessons/${lesson.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
                  >
                    View Details
                  </Link>
                  {lesson.status === "scheduled" && lesson.meetingLink && (
                    <a
                      href={lesson.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-center"
                    >
                      Join Now
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-600 text-lg mb-2">No lessons found</p>
            <p className="text-gray-500 text-sm">Try adjusting your filters or check back later</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    scheduled: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
    rescheduled: "bg-yellow-100 text-yellow-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}

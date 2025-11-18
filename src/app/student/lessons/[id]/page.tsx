"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { StudentDB, StudentLesson } from "@/lib/booking/student-storage";

export default function LessonDetail() {
  const params = useParams();
  const lessonId = params.id as string;
  const [lesson, setLesson] = useState<StudentLesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const lesson = StudentDB.getLesson(lessonId);
    setLesson(lesson);
    setLoading(false);
  }, [lessonId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg mb-4">Lesson not found</p>
        <Link href="/student/lessons" className="text-blue-600 hover:text-blue-700 font-medium">
          Back to lessons →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/student/lessons" className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block">
            ← Back to Lessons
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mt-2">{lesson.subject}</h1>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(lesson.status)}`}>
          {lesson.status.charAt(0).toUpperCase() + lesson.status.slice(1)}
        </span>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lesson Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tutor Card */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-4">👨‍🏫 Tutor Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Tutor Name</p>
                <p className="text-xl font-semibold text-gray-900 mt-1">{lesson.tutorName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Subject Expertise</p>
                <p className="text-lg font-semibold text-blue-600 mt-1">📚 {lesson.subject}</p>
              </div>
              <Link
                href={`/student/messages`}
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Message Tutor
              </Link>
            </div>
          </div>

          {/* Lesson Details */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-4">📅 Lesson Details</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Date</p>
                <p className="text-lg font-semibold text-gray-900 mt-2">{lesson.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Time</p>
                <p className="text-lg font-semibold text-gray-900 mt-2">{lesson.slot}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Duration</p>
                <p className="text-lg font-semibold text-gray-900 mt-2">{lesson.duration} hour{lesson.duration !== 1 ? "s" : ""}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Lesson Type</p>
                <p className="text-lg font-semibold text-gray-900 mt-2">
                  {lesson.lessonType === "one_to_one" ? "1:1 Lesson" : "Group Lesson"}
                </p>
              </div>
            </div>

            {lesson.status === "completed" && lesson.attendance && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-green-900">
                  ✅ Attendance: {lesson.attendance.charAt(0).toUpperCase() + lesson.attendance.slice(1)}
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          {lesson.notes && (
            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
              <h2 className="text-xl font-bold mb-4">📝 Lesson Notes</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">{lesson.notes}</p>
              </div>
            </div>
          )}

          {/* Resources Section */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-4">📚 Learning Resources</h2>
            <Link
              href={`/student/materials?lesson=${lesson.id}`}
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              View Materials
            </Link>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-4">
          {lesson.status === "scheduled" && lesson.meetingLink && (
            <div className="border border-green-300 rounded-lg p-6 bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm">
              <h3 className="font-bold text-green-900 mb-3">🎓 Ready to Join?</h3>
              <p className="text-sm text-green-800 mb-4">Click the button below to join the lesson</p>
              <a
                href={lesson.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all font-bold text-center"
              >
                Join Lesson
              </a>
            </div>
          )}

          {lesson.status === "scheduled" && !lesson.meetingLink && (
            <div className="border border-amber-300 rounded-lg p-6 bg-gradient-to-br from-amber-50 to-yellow-50">
              <h3 className="font-bold text-amber-900 mb-2">⏳ Waiting for Link</h3>
              <p className="text-sm text-amber-800">Your tutor will share the meeting link soon. Check back in a few minutes!</p>
            </div>
          )}

          {lesson.status === "completed" && (
            <div className="border border-blue-300 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
              <h3 className="font-bold text-blue-900 mb-3">✅ Lesson Completed</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>• Review your notes</p>
                <p>• Complete your homework</p>
                <p>• Download materials</p>
              </div>
            </div>
          )}

          {lesson.status === "cancelled" && (
            <div className="border border-red-300 rounded-lg p-6 bg-gradient-to-br from-red-50 to-pink-50">
              <h3 className="font-bold text-red-900 mb-2">❌ Lesson Cancelled</h3>
              <p className="text-sm text-red-800">Please contact your tutor to reschedule</p>
            </div>
          )}

          {/* Quick Links */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link
                href="/student/homework"
                className="block px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
              >
                📝 View Homework
              </Link>
              <Link
                href="/student/progress"
                className="block px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
              >
                📊 Check Progress
              </Link>
              <Link
                href="/student/materials"
                className="block px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
              >
                📚 Download Materials
              </Link>
            </div>
          </div>
        </div>
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

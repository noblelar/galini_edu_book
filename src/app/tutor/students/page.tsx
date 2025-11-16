"use client";
import { useEffect, useState } from "react";
import { LocalDB } from "@/lib/booking/storage";
import { Booking } from "@/lib/booking/types";

export default function StudentsManagement() {
  const [students, setStudents] = useState<any[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tutorId] = useState("tutor_demo_001");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  useEffect(() => {
    const allBookings = LocalDB.listBookings().filter((b) => b.tutorId === tutorId || !b.tutorId);
    setBookings(allBookings);

    const uniqueStudents = Array.from(new Set(allBookings.map((b) => b.studentName))).map((name) => {
      const studentBookings = allBookings.filter((b) => b.studentName === name);
      const nextLesson = studentBookings.find(
        (b) => b.status !== "cancelled" && new Date(b.date) >= new Date()
      );
      const completedLessons = studentBookings.filter((b) => b.status === "completed").length;

      return {
        name,
        id: name.toLowerCase().replace(/\s/g, "_"),
        lessonCount: studentBookings.length,
        subjects: Array.from(new Set(studentBookings.map((b) => b.subject))),
        nextLesson,
        completedLessons,
        progress: Math.round((completedLessons / Math.max(studentBookings.length, 1)) * 100),
      };
    });

    setStudents(uniqueStudents);
    setLoading(false);
  }, [tutorId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Students</h1>
        <p className="text-gray-600 mt-2">Manage and track your students' progress</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Students" value={students.length.toString()} color="blue" />
        <StatCard label="Active Lessons" value={bookings.filter((b) => b.status === "confirmed").length.toString()} color="green" />
        <StatCard label="Completed Lessons" value={bookings.filter((b) => b.status === "completed").length.toString()} color="purple" />
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((student) => (
          <div
            key={student.id}
            onClick={() => setSelectedStudent(student)}
            className="border rounded-lg p-5 bg-white hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg">{student.name}</h3>
                <p className="text-sm text-gray-600">{student.lessonCount} total lessons</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                {student.name.charAt(0)}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Subjects</p>
                <div className="flex flex-wrap gap-1">
                  {student.subjects.slice(0, 2).map((subject: string) => (
                    <span key={subject} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {subject}
                    </span>
                  ))}
                  {student.subjects.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                      +{student.subjects.length - 2}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-1">Progress</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${student.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">{student.completedLessons} of {student.lessonCount} completed</p>
              </div>
            </div>

            {student.nextLesson && (
              <div className="p-3 bg-blue-50 rounded border border-blue-200 mb-3">
                <p className="text-xs text-gray-600">Next Lesson</p>
                <p className="font-semibold text-sm">{student.nextLesson.date} {student.nextLesson.slot}</p>
              </div>
            )}

            <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors font-medium">
              View Details
            </button>
          </div>
        ))}
      </div>

      {students.length === 0 && (
        <div className="text-center py-12 text-gray-600">
          <p className="text-lg">No students yet</p>
          <p className="text-sm mt-2">Students will appear here once you have confirmed bookings</p>
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                  <p className="text-gray-600">{selectedStudent.lessonCount} lessons taken</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Subjects */}
              <div>
                <h3 className="font-bold text-lg mb-3">Subjects</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.subjects.map((subject: string) => (
                    <span key={subject} className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-medium">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress */}
              <div>
                <h3 className="font-bold text-lg mb-3">Progress</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="font-bold">{selectedStudent.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full"
                        style={{ width: `${selectedStudent.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-2xl font-bold text-gray-900">{selectedStudent.completedLessons}</p>
                      <p className="text-sm text-gray-600">Completed</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-2xl font-bold text-gray-900">{selectedStudent.lessonCount - selectedStudent.completedLessons}</p>
                      <p className="text-sm text-gray-600">Remaining</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-2xl font-bold text-gray-900">{selectedStudent.lessonCount}</p>
                      <p className="text-sm text-gray-600">Total</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lesson History */}
              <div>
                <h3 className="font-bold text-lg mb-3">Lesson History</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {bookings
                    .filter((b) => b.studentName === selectedStudent.name)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-3 border rounded bg-gray-50"
                      >
                        <div>
                          <p className="font-medium">{lesson.subject}</p>
                          <p className="text-sm text-gray-600">{lesson.date} {lesson.slot}</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            lesson.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : lesson.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {lesson.status}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  📧 Send Message
                </button>
                <button className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium">
                  📋 Progress Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    purple: "bg-purple-50 border-purple-200",
  };

  const textClasses: Record<string, string> = {
    blue: "text-blue-900",
    green: "text-green-900",
    purple: "text-purple-900",
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color] || colorClasses.blue}`}>
      <p className={`text-sm font-medium ${textClasses[color] || textClasses.blue}`}>{label}</p>
      <p className={`text-3xl font-bold mt-2 ${textClasses[color] || textClasses.blue}`}>{value}</p>
    </div>
  );
}

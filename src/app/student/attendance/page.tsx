"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { StudentDB, StudentAttendance, StudentLesson } from "@/lib/booking/student-storage";

export default function StudentAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState<StudentAttendance[]>([]);
  const [lessons, setLessons] = useState<StudentLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId] = useState("student_demo_001");
  const [filterSubject, setFilterSubject] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    const allAttendance = StudentDB.getAttendanceByStudent(studentId);
    const allLessons = StudentDB.getLessonsByStudent(studentId);

    // Add demo attendance if none exist
    if (allAttendance.length === 0) {
      const demoAttendance = [
        {
          studentId,
          lessonId: "lesson_001",
          tutorId: "tutor_001",
          tutorName: "John Smith",
          lessonDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          subject: "Math",
          status: "present" as const,
        },
        {
          studentId,
          lessonId: "lesson_002",
          tutorId: "tutor_002",
          tutorName: "Jane Doe",
          lessonDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
          subject: "English",
          status: "present" as const,
        },
        {
          studentId,
          lessonId: "lesson_003",
          tutorId: "tutor_003",
          tutorName: "Dr. Green",
          lessonDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          subject: "Science",
          status: "present" as const,
        },
        {
          studentId,
          lessonId: "lesson_004",
          tutorId: "tutor_001",
          tutorName: "John Smith",
          lessonDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          subject: "Math",
          status: "absent" as const,
        },
        {
          studentId,
          lessonId: "lesson_005",
          tutorId: "tutor_002",
          tutorName: "Jane Doe",
          lessonDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          subject: "English",
          status: "present" as const,
        },
        {
          studentId,
          lessonId: "lesson_006",
          tutorId: "tutor_003",
          tutorName: "Dr. Green",
          lessonDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          subject: "Science",
          status: "excused" as const,
        },
        {
          studentId,
          lessonId: "lesson_007",
          tutorId: "tutor_001",
          tutorName: "John Smith",
          lessonDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          subject: "Math",
          status: "present" as const,
        },
        {
          studentId,
          lessonId: "lesson_008",
          tutorId: "tutor_004",
          tutorName: "Mr. Brown",
          lessonDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          subject: "History",
          status: "present" as const,
        },
      ];

      demoAttendance.forEach((record) => {
        StudentDB.addAttendanceRecord({
          ...record,
        });
      });

      setAttendanceRecords(demoAttendance);
    } else {
      setAttendanceRecords(allAttendance);
    }

    setLessons(allLessons);

    const uniqueSubjects = Array.from(
      new Set([...allAttendance.map((a) => a.subject), ...allLessons.map((l) => l.subject)])
    );
    setSubjects(uniqueSubjects);

    setLoading(false);
  }, [studentId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Calculate statistics
  const stats = StudentDB.getAttendanceStats(studentId);
  const filteredRecords = attendanceRecords.filter((record) => {
    if (filterSubject && record.subject !== filterSubject) return false;
    if (filterStatus && record.status !== filterStatus) return false;
    return true;
  });

  // Calculate monthly stats
  const monthlyStats: Record<string, { present: number; absent: number; excused: number }> = {};
  attendanceRecords.forEach((record) => {
    const month = new Date(record.lessonDate).toISOString().slice(0, 7);
    if (!monthlyStats[month]) {
      monthlyStats[month] = { present: 0, absent: 0, excused: 0 };
    }
    monthlyStats[month][record.status]++;
  });

  const sortedMonths = Object.keys(monthlyStats).sort().reverse();

  // Subject stats
  const subjectStats = subjects.map((subject) => {
    const subjectRecords = attendanceRecords.filter((r) => r.subject === subject);
    const present = subjectRecords.filter((r) => r.status === "present").length;
    const percentage = subjectRecords.length > 0 ? Math.round((present / subjectRecords.length) * 100) : 0;

    return {
      subject,
      total: subjectRecords.length,
      present,
      absent: subjectRecords.filter((r) => r.status === "absent").length,
      excused: subjectRecords.filter((r) => r.status === "excused").length,
      percentage,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ✅ Attendance History
        </h1>
        <p className="text-gray-600 mt-2">Track your lesson attendance and participation</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Lessons" value={stats.total.toString()} icon="📚" color="blue" />
        <StatCard
          title="Present"
          value={stats.present.toString()}
          subtitle={`${stats.percentage}% attendance`}
          icon="✅"
          color="green"
        />
        <StatCard title="Absent" value={stats.absent.toString()} icon="❌" color="red" />
        <StatCard title="Excused" value={stats.excused.toString()} icon="📝" color="yellow" />
      </div>

      {/* Attendance Progress Bar */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-lg font-bold mb-4">Overall Attendance Rate</h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-gray-900">Attendance</p>
              <p className="text-3xl font-bold text-green-600">{stats.percentage}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-gray-600">
            You attended {stats.present} out of {stats.total} lessons. Keep up the consistency!
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Subject</label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="present">Present ✅</option>
              <option value="absent">Absent ❌</option>
              <option value="excused">Excused 📝</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subject Performance */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-4">📊 Attendance by Subject</h2>
        <div className="space-y-4">
          {subjectStats.map((stat) => (
            <div key={stat.subject} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{stat.subject}</h3>
                <span className="text-lg font-bold text-green-600">{stat.percentage}%</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full"
                  style={{ width: `${stat.percentage}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center p-2 bg-green-50 rounded">
                  <p className="text-green-700 font-semibold">{stat.present}</p>
                  <p className="text-xs text-green-600">Present</p>
                </div>
                <div className="text-center p-2 bg-red-50 rounded">
                  <p className="text-red-700 font-semibold">{stat.absent}</p>
                  <p className="text-xs text-red-600">Absent</p>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded">
                  <p className="text-yellow-700 font-semibold">{stat.excused}</p>
                  <p className="text-xs text-yellow-600">Excused</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-4">📅 Monthly Attendance Breakdown</h2>
        <div className="space-y-4">
          {sortedMonths.map((month) => {
            const stats = monthlyStats[month];
            const total = stats.present + stats.absent + stats.excused;
            const percentage = Math.round((stats.present / total) * 100);

            return (
              <div key={month} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{new Date(month + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h3>
                  <span className="text-lg font-bold text-green-600">{percentage}%</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">{stats.present}</p>
                    <p className="text-xs text-gray-600">Present</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">{stats.absent}</p>
                    <p className="text-xs text-gray-600">Absent</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">{stats.excused}</p>
                    <p className="text-xs text-gray-600">Excused</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Records */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-4">📋 Detailed Attendance Records</h2>
        <div className="space-y-3">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{record.subject}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(record.status)}`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    📅 {new Date(record.lessonDate).toLocaleDateString()} • 👨‍🏫 {record.tutorName}
                  </p>
                </div>
                <span className={`text-2xl ${getStatusIcon(record.status)}`} />
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-600">
              <p>No attendance records found</p>
            </div>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="border border-blue-300 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
        <h2 className="text-lg font-bold text-blue-900 mb-3">💡 Attendance Tips</h2>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✓ Regular attendance helps you understand better and improve your grades</li>
          <li>✓ If you must miss a lesson, notify your tutor as early as possible</li>
          <li>✓ Ask for excusal if you have a valid reason (illness, family emergency, etc.)</li>
          <li>✓ Review materials from any lessons you miss to stay on track</li>
          <li>✓ Aim for 95% or higher attendance rate</li>
        </ul>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/student/lessons"
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all text-center"
        >
          <div className="text-3xl mb-2">📚</div>
          <p className="font-semibold text-gray-900">View Upcoming Lessons</p>
        </Link>
        <Link
          href="/student/messages"
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all text-center"
        >
          <div className="text-3xl mb-2">💬</div>
          <p className="font-semibold text-gray-900">Message Your Tutors</p>
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  color: "blue" | "green" | "red" | "yellow";
}) {
  const colorClasses: Record<string, string> = {
    blue: "from-blue-50 to-cyan-50 border-blue-200",
    green: "from-green-50 to-emerald-50 border-green-200",
    red: "from-red-50 to-pink-50 border-red-200",
    yellow: "from-yellow-50 to-amber-50 border-yellow-200",
  };

  const textClasses: Record<string, string> = {
    blue: "text-blue-900",
    green: "text-green-900",
    red: "text-red-900",
    yellow: "text-yellow-900",
  };

  return (
    <div className={`border rounded-lg p-5 bg-gradient-to-br ${colorClasses[color]} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${textClasses[color]}`}>{title}</p>
          <p className={`text-3xl font-bold mt-2 ${textClasses[color]}`}>{value}</p>
          {subtitle && <p className={`text-xs mt-2 ${textClasses[color]}`}>{subtitle}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

function getStatusBadgeColor(status: string): string {
  const colors: Record<string, string> = {
    present: "bg-green-100 text-green-700",
    absent: "bg-red-100 text-red-700",
    excused: "bg-yellow-100 text-yellow-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}

function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    present: "✅",
    absent: "❌",
    excused: "📝",
  };
  return icons[status] || "❓";
}

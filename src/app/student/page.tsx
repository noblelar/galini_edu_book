"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { StudentDB, StudentLesson, StudentAnnouncement, StudentHomework, StudentAttendance } from "@/lib/booking/student-storage";

export default function StudentDashboard() {
  const [student, setStudent] = useState<any>(null);
  const [upcomingLessons, setUpcomingLessons] = useState<StudentLesson[]>([]);
  const [todayLessons, setTodayLessons] = useState<StudentLesson[]>([]);
  const [announcements, setAnnouncements] = useState<StudentAnnouncement[]>([]);
  const [pendingHomework, setPendingHomework] = useState<StudentHomework[]>([]);
  const [attendance, setAttendance] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId] = useState("student_demo_001");
  const [nextLessonCountdown, setNextLessonCountdown] = useState<string>("");

  useEffect(() => {
    const profile = StudentDB.getProfile(studentId) || StudentDB.createProfile({
      studentId,
      name: "Alex Johnson",
      age: 14,
      schoolYear: "Year 9",
      subjects: ["Math", "English", "Science"],
      parentId: "parent_demo_001",
    });

    setStudent(profile);

    const lessons = StudentDB.getLessonsByStudent(studentId);
    const now = new Date();
    const upcomingFiltered = lessons
      .filter((l) => {
        const lessonDate = new Date(l.date);
        return l.status !== "cancelled" && lessonDate >= now;
      })
      .slice(0, 5);

    const todayFiltered = lessons.filter((l) => {
      const today = new Date().toISOString().split("T")[0];
      return l.date === today && l.status !== "cancelled";
    });

    setUpcomingLessons(upcomingFiltered);
    setTodayLessons(todayFiltered);

    const announcementsList = StudentDB.getAnnouncementsByStudent(studentId);
    setAnnouncements(announcementsList.slice(0, 5));

    const homework = StudentDB.getHomeworkByStudent(studentId);
    const pending = homework.filter((h) => h.status === "pending" || h.status === "overdue");
    setPendingHomework(pending.slice(0, 3));

    const attendanceRecords = StudentDB.getAttendanceByStudent(studentId);
    setAttendance(attendanceRecords);

    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    if (upcomingLessons.length === 0) return;

    const updateCountdown = () => {
      const nextLesson = upcomingLessons[0];
      const lessonTime = new Date(`${nextLesson.date}T${nextLesson.slot.split("-")[0]}`);
      const now = new Date();
      const diff = lessonTime.getTime() - now.getTime();

      if (diff <= 0) {
        setNextLessonCountdown("Starting soon!");
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
          setNextLessonCountdown(`in ${days}d ${hours}h`);
        } else if (hours > 0) {
          setNextLessonCountdown(`in ${hours}h ${minutes}m`);
        } else {
          setNextLessonCountdown(`in ${minutes}m`);
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [upcomingLessons]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const attendanceStats = StudentDB.getAttendanceStats(studentId);
  const unreadAnnouncements = announcements.filter((a) => !a.readAt).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back, {student?.name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">Keep learning and growing!</p>
        </div>
      </div>

      {/* Next Lesson Card */}
      {upcomingLessons.length > 0 && (
        <div className="border border-gradient rounded-lg p-6 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Next Lesson</p>
              <h2 className="text-3xl font-bold mt-2 text-gray-900">{upcomingLessons[0].subject}</h2>
              <p className="text-gray-700 mt-2 font-semibold">
                📚 {upcomingLessons[0].tutorName}
              </p>
              <p className="text-gray-600 mt-1">
                📅 {upcomingLessons[0].date} at {upcomingLessons[0].slot}
              </p>
              <p className="text-gray-600 mt-1">
                ⏱️ {upcomingLessons[0].duration} hours • {upcomingLessons[0].lessonType === "one_to_one" ? "1:1" : "Group"}
              </p>
            </div>
            <div className="text-right">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg font-bold text-lg">
                {nextLessonCountdown}
              </div>
              {upcomingLessons[0].status === "scheduled" && (
                <Link
                  href={`/student/lessons/${upcomingLessons[0].id}`}
                  className="block mt-4 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold text-center"
                >
                  Join Lesson
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Lessons Today"
          value={todayLessons.length.toString()}
          subtitle="scheduled"
          icon="📚"
          color="blue"
        />
        <StatCard
          title="Upcoming"
          value={upcomingLessons.length.toString()}
          subtitle="lessons"
          icon="📅"
          color="purple"
        />
        <StatCard
          title="Homework"
          value={pendingHomework.length.toString()}
          subtitle="pending"
          icon="✏️"
          color="pink"
        />
        <StatCard
          title="Attendance"
          value={`${attendanceStats.percentage}%`}
          subtitle="present"
          icon="✅"
          color="green"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            📅 Today's Schedule
          </h2>
          {todayLessons.length > 0 ? (
            <div className="space-y-3">
              {todayLessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/student/lessons/${lesson.id}`}
                  className="flex items-center justify-between p-4 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{lesson.subject}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      👨‍🏫 {lesson.tutorName}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      🕐 {lesson.slot} • {lesson.duration}h
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {lesson.status}
                    </span>
                    {lesson.status === "scheduled" && (
                      <div className="mt-2 text-blue-600 font-semibold text-sm">
                        Join Now →
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              <p className="text-sm mb-3">No lessons scheduled for today</p>
              <Link
                href="/student/lessons"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all lessons →
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <h3 className="font-bold text-lg mb-4">⚡ Quick Actions</h3>
            <div className="space-y-2">
              <QuickActionButton icon="💬" label="Message Tutor" href="/student/messages" />
              <QuickActionButton icon="📚" label="My Materials" href="/student/materials" />
              <QuickActionButton icon="✏️" label="My Homework" href="/student/homework" />
              <QuickActionButton icon="📊" label="View Progress" href="/student/progress" />
            </div>
          </div>

          {/* Announcements Notification */}
          {unreadAnnouncements > 0 && (
            <Link
              href="/student/announcements"
              className="border border-amber-200 rounded-lg p-4 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <h3 className="font-bold text-amber-900 mb-2">
                📢 {unreadAnnouncements} New{unreadAnnouncements !== 1 ? "s" : ""}
              </h3>
              <p className="text-amber-700 text-sm font-medium">
                View announcements →
              </p>
            </Link>
          )}
        </div>
      </div>

      {/* Pending Homework */}
      {pendingHomework.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              ✏️ Pending Homework
            </h2>
            <Link href="/student/homework" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingHomework.map((hw) => (
              <Link
                key={hw.id}
                href={`/student/homework/${hw.id}`}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-white to-pink-50"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{hw.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{hw.subject}</p>
                <p className="text-xs text-gray-500 mb-3">Due: {hw.dueDate}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    {hw.status === "overdue" ? (
                      <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                        Overdue
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                        Pending
                      </span>
                    )}
                  </div>
                  <span className="text-blue-600 text-sm font-medium">Submit →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Subjects Overview */}
      {student?.subjects && (
        <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-bold mb-4">📚 Your Subjects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {student.subjects.map((subject: string) => {
              const subjectlessons = upcomingLessons.filter((l) => l.subject === subject);
              const subjectHomework = pendingHomework.filter((h) => h.subject === subject);
              const colorClass = getSubjectColor(subject);

              return (
                <div
                  key={subject}
                  className={`border rounded-lg p-4 ${colorClass.border} bg-gradient-to-br ${colorClass.gradient}`}
                >
                  <h3 className="font-bold text-gray-900 mb-3">{subject}</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      📚 {subjectlessons.length} upcoming lesson{subjectlessons.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-gray-700">
                      ✏️ {subjectHomework.length} homework pending
                    </p>
                  </div>
                  <Link
                    href="/student/lessons"
                    className="mt-3 block px-3 py-2 bg-blue-600 text-white text-xs rounded font-medium hover:bg-blue-700 transition-colors text-center"
                  >
                    View Details
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
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
  subtitle: string;
  icon: string;
  color: "blue" | "green" | "purple" | "pink";
}) {
  const colorClasses: Record<string, string> = {
    blue: "from-blue-50 to-blue-100 border-blue-200",
    green: "from-green-50 to-green-100 border-green-200",
    purple: "from-purple-50 to-purple-100 border-purple-200",
    pink: "from-pink-50 to-pink-100 border-pink-200",
  };

  const textClasses: Record<string, string> = {
    blue: "text-blue-900",
    green: "text-green-900",
    purple: "text-purple-900",
    pink: "text-pink-900",
  };

  return (
    <div className={`border rounded-lg p-5 bg-gradient-to-br ${colorClasses[color]} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${textClasses[color]}`}>{title}</p>
          <p className={`text-3xl font-bold mt-2 ${textClasses[color]}`}>{value}</p>
          <p className={`text-xs mt-2 ${textClasses[color]}`}>{subtitle}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

function QuickActionButton({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 transition-all text-gray-700 hover:text-blue-600 font-medium group"
    >
      <span className="text-lg group-hover:scale-110 transition-transform">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function getSubjectColor(subject: string) {
  const colors: Record<string, { border: string; gradient: string }> = {
    Math: { border: "border-blue-300", gradient: "from-blue-50 to-cyan-50" },
    English: { border: "border-purple-300", gradient: "from-purple-50 to-pink-50" },
    Science: { border: "border-green-300", gradient: "from-green-50 to-emerald-50" },
    History: { border: "border-amber-300", gradient: "from-amber-50 to-yellow-50" },
    Geography: { border: "border-teal-300", gradient: "from-teal-50 to-cyan-50" },
    "Computer Science": { border: "border-indigo-300", gradient: "from-indigo-50 to-blue-50" },
  };

  return colors[subject] || { border: "border-gray-300", gradient: "from-gray-50 to-white" };
}

"use client";
import { useEffect, useState } from "react";
import { LocalDB } from "@/lib/booking/storage";
import { TutorDB } from "@/lib/booking/tutor-storage";
import { Booking, Tutor } from "@/lib/booking/types";
import { formatCurrency } from "@/lib/booking/admin";

export default function TutorDashboard() {
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tutorId] = useState("tutor_demo_001"); // Demo tutor ID

  useEffect(() => {
    const allTutors = LocalDB.getAllTutors();
    let currentTutor = allTutors.find((t) => t.id === tutorId);

    if (!currentTutor) {
      currentTutor = LocalDB.createTutor({
        userId: tutorId,
        name: "John Smith",
        email: "john.smith@example.com",
        subjects: ["Math", "English"],
        hourlyRate: 30,
        status: "approved",
        commissionRate: 20,
        totalEarnings: 0,
      });
    }

    setTutor(currentTutor);

    const allBookings = LocalDB.listBookings().filter((b) => b.tutorId === currentTutor!.id || !b.tutorId);
    setBookings(allBookings);
    setLoading(false);
  }, [tutorId]);

  if (loading || !tutor) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const upcomingLessons = bookings.filter((b) => {
    const lessonDate = new Date(b.date);
    const now = new Date();
    const sevenDaysAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return b.status !== "cancelled" && lessonDate >= now && lessonDate <= sevenDaysAhead;
  });

  const todayLessons = bookings.filter((b) => {
    const lessonDate = b.date;
    const today = new Date().toISOString().split("T")[0];
    return b.status !== "cancelled" && lessonDate === today;
  });

  const students = new Set(bookings.map((b) => b.studentName)).size;
  const monthlyEarnings = bookings
    .filter((b) => {
      const month = new Date().toISOString().slice(0, 7);
      return b.date.startsWith(month) && b.status !== "cancelled";
    })
    .reduce((sum, b) => sum + b.total, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {tutor.name}! 👋</h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your lessons today</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Lessons"
          value={todayLessons.length.toString()}
          subtitle="scheduled lessons"
          icon="📅"
          color="blue"
        />
        <StatCard
          title="Upcoming (7 days)"
          value={upcomingLessons.length.toString()}
          subtitle="upcoming bookings"
          icon="📋"
          color="green"
        />
        <StatCard
          title="Students"
          value={students.toString()}
          subtitle="total students"
          icon="👥"
          color="purple"
        />
        <StatCard
          title="This Month"
          value={formatCurrency(monthlyEarnings)}
          subtitle="earnings this month"
          icon="💷"
          color="amber"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Lessons */}
        <div className="lg:col-span-2 border rounded-lg p-6 bg-white">
          <h2 className="text-xl font-bold mb-4">Today's Schedule</h2>
          {todayLessons.length > 0 ? (
            <div className="space-y-3">
              {todayLessons.map((lesson) => (
                <div key={lesson.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{lesson.studentName}</h3>
                    <p className="text-sm text-gray-600">
                      {lesson.subject} • {lesson.slot}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {lesson.lessonType === "one_to_one" ? "1:1 Lesson" : "Group Lesson"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(lesson.total)}</p>
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium mt-2">
                      {lesson.status === "confirmed" ? "Confirmed" : lesson.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              <p className="text-sm">No lessons scheduled for today</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="border rounded-lg p-6 bg-white">
            <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <QuickActionButton icon="➕" label="Add Availability" href="/tutor/availability?action=add" />
              <QuickActionButton icon="📢" label="Create Announcement" href="/tutor/announcements?action=create" />
              <QuickActionButton icon="📁" label="Upload Materials" href="/tutor/materials?action=upload" />
              <QuickActionButton icon="📖" label="View All Lessons" href="/tutor/lessons" />
            </div>
          </div>

          {/* Notifications */}
          <div className="border rounded-lg p-6 bg-blue-50 border-blue-200">
            <h3 className="font-bold text-lg mb-3 text-blue-900">Notifications</h3>
            <div className="space-y-2">
              {upcomingLessons.length > 0 && (
                <NotificationItem
                  icon="🔔"
                  title={`${upcomingLessons.length} upcoming lesson${upcomingLessons.length !== 1 ? "s" : ""}`}
                  description="in the next 7 days"
                />
              )}
              <NotificationItem icon="✅" title="Profile Complete" description="80% profile completion" />
              <NotificationItem icon="💬" title="1 new message" description="from a parent" />
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Lessons Preview */}
      <div className="border rounded-lg p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Upcoming Lessons (7 days)</h2>
          <a href="/tutor/lessons" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View all →
          </a>
        </div>
        {upcomingLessons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-4 font-semibold">Student</th>
                  <th className="text-left py-2 px-4 font-semibold">Subject</th>
                  <th className="text-left py-2 px-4 font-semibold">Date & Time</th>
                  <th className="text-left py-2 px-4 font-semibold">Type</th>
                  <th className="text-left py-2 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingLessons.slice(0, 5).map((lesson) => (
                  <tr key={lesson.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{lesson.studentName}</td>
                    <td className="py-3 px-4">{lesson.subject}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {lesson.date} {lesson.slot}
                    </td>
                    <td className="py-3 px-4 text-sm">{lesson.lessonType === "one_to_one" ? "1:1" : "Group"}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        {lesson.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            <p>No upcoming lessons in the next 7 days</p>
          </div>
        )}
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
  subtitle: string;
  icon: string;
  color: "blue" | "green" | "purple" | "amber";
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    purple: "bg-purple-50 border-purple-200",
    amber: "bg-amber-50 border-amber-200",
  };

  const textClasses: Record<string, string> = {
    blue: "text-blue-900",
    green: "text-green-900",
    purple: "text-purple-900",
    amber: "text-amber-900",
  };

  return (
    <div className={`border rounded-lg p-5 ${colorClasses[color]}`}>
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
    <a
      href={href}
      className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-gray-700 hover:text-blue-600 font-medium"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </a>
  );
}

function NotificationItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex gap-3 p-3 bg-white rounded border border-blue-100">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="font-medium text-sm text-gray-900">{title}</p>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  );
}

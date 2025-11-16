"use client";
import { useEffect, useState } from "react";
import { LocalDB } from "@/lib/booking/storage";
import { ParentDB } from "@/lib/booking/parent-storage";
import { Booking, ParentChild } from "@/lib/booking/types";
import { formatCurrency } from "@/lib/booking/admin";

export default function ParentDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [parentId] = useState("parent_demo_001");

  useEffect(() => {
    const allBookings = LocalDB.listBookings().filter((b) => b.parentId === parentId);
    const childrenList = ParentDB.getChildrenByParent(parentId);
    const announcementsList = ParentDB.getAnnouncementsByParent(parentId);

    setBookings(allBookings);
    setChildren(childrenList);
    setAnnouncements(announcementsList);
    setLoading(false);
  }, [parentId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const todayBookings = bookings.filter((b) => {
    const today = new Date().toISOString().split("T")[0];
    return b.date === today && b.status !== "cancelled";
  });

  const upcomingBookings = bookings.filter((b) => {
    const now = new Date();
    const lessonDate = new Date(b.date);
    const sevenDaysAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return b.status !== "cancelled" && lessonDate >= now && lessonDate <= sevenDaysAhead;
  });

  const thisMonthBookings = bookings.filter((b) => {
    const month = new Date().toISOString().slice(0, 7);
    return b.date.startsWith(month) && b.status !== "cancelled";
  });

  const totalSpent = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.total, 0);

  const unreadAnnouncements = announcements.filter((a) => !a.readAt).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your lessons today</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Lessons"
          value={todayBookings.length.toString()}
          subtitle="scheduled today"
          icon="📅"
          color="blue"
        />
        <StatCard
          title="Upcoming (7 days)"
          value={upcomingBookings.length.toString()}
          subtitle="upcoming bookings"
          icon="📋"
          color="green"
        />
        <StatCard
          title="This Month"
          value={thisMonthBookings.length.toString()}
          subtitle="lessons this month"
          icon="📊"
          color="purple"
        />
        <StatCard
          title="Total Spent"
          value={formatCurrency(totalSpent)}
          subtitle="on lessons"
          icon="💳"
          color="amber"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Lessons */}
        <div className="lg:col-span-2 border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-bold mb-4">Today's Lessons</h2>
          {todayBookings.length > 0 ? (
            <div className="space-y-3">
              {todayBookings.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-4 border border-blue-200 rounded-lg bg-blue-50 hover:shadow-md transition-shadow"
                >
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
                      {lesson.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              <p className="text-sm">No lessons scheduled for today</p>
              <a href="/parent/book" className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block">
                Book a lesson →
              </a>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <QuickActionButton icon="📅" label="Book a Lesson" href="/parent/book" />
              <QuickActionButton icon="👶" label="Add a Child" href="/parent/children?action=add" />
              <QuickActionButton icon="📆" label="View Calendar" href="/parent/calendar" />
              <QuickActionButton icon="💬" label="Contact Tutor" href="/parent/messages" />
            </div>
          </div>

          {/* Notifications */}
          {unreadAnnouncements > 0 && (
            <div className="border border-amber-200 rounded-lg p-4 bg-amber-50 shadow-sm">
              <h3 className="font-bold text-amber-900 mb-2">📢 {unreadAnnouncements} New Announcement{unreadAnnouncements !== 1 ? "s" : ""}</h3>
              <a href="/parent/announcements" className="text-amber-700 hover:text-amber-800 text-sm font-medium">
                View announcements →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Children Progress */}
      {children.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-bold mb-4">Children's Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map((child) => {
              const childBookings = bookings.filter((b) => b.studentName === child.name);
              const completedLessons = childBookings.filter((b) => b.status === "completed").length;
              const progress = Math.round((completedLessons / Math.max(childBookings.length, 1)) * 100);

              return (
                <div
                  key={child.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-white to-blue-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold">{child.name}</h3>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                      {child.name.charAt(0)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Progress</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {completedLessons} of {childBookings.length} completed
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600">Subjects</p>
                      <p className="text-sm font-medium">{child.subjects.join(", ") || "Not assigned"}</p>
                    </div>
                  </div>

                  <a
                    href={`/parent/children/${child.id}`}
                    className="block mt-3 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors font-medium text-center"
                  >
                    View Details
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Lessons Preview */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Upcoming Lessons (7 days)</h2>
          <a href="/parent/bookings" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View all →
          </a>
        </div>
        {upcomingBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-2 px-4 font-semibold">Student</th>
                  <th className="text-left py-2 px-4 font-semibold">Subject</th>
                  <th className="text-left py-2 px-4 font-semibold">Date & Time</th>
                  <th className="text-left py-2 px-4 font-semibold">Type</th>
                  <th className="text-left py-2 px-4 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {upcomingBookings.slice(0, 5).map((lesson) => (
                  <tr key={lesson.id} className="border-b hover:bg-blue-50">
                    <td className="py-3 px-4 font-medium">{lesson.studentName}</td>
                    <td className="py-3 px-4">{lesson.subject}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {lesson.date} {lesson.slot}
                    </td>
                    <td className="py-3 px-4 text-sm">{lesson.lessonType === "one_to_one" ? "1:1" : "Group"}</td>
                    <td className="py-3 px-4 font-semibold">{formatCurrency(lesson.total)}</td>
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
    blue: "from-blue-50 to-blue-100 border-blue-200",
    green: "from-green-50 to-green-100 border-green-200",
    purple: "from-purple-50 to-purple-100 border-purple-200",
    amber: "from-amber-50 to-amber-100 border-amber-200",
  };

  const textClasses: Record<string, string> = {
    blue: "text-blue-900",
    green: "text-green-900",
    purple: "text-purple-900",
    amber: "text-amber-900",
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
    <a
      href={href}
      className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-gray-700 hover:text-blue-600 font-medium group"
    >
      <span className="text-lg group-hover:scale-110 transition-transform">{icon}</span>
      <span>{label}</span>
    </a>
  );
}

"use client";
import { useEffect, useState } from "react";
import { LocalDB } from "@/lib/booking/storage";
import { Booking, User, Tutor } from "@/lib/booking/types";
import { calcMetrics, formatCurrency, getTopSubjects, getRevenueByMonth, getTutorStats, toPercSeries } from "@/lib/booking/admin";

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    LocalDB.initializeSubjects();
    setBookings(LocalDB.listBookings());
    setUsers(LocalDB.getAllUsers());
    setTutors(LocalDB.getAllTutors());
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const metrics = calcMetrics(bookings, users, tutors);
  const topSubjects = getTopSubjects(metrics.bySubject, 5);
  const tutorStats = getTutorStats(tutors);
  const revenueByMonth = getRevenueByMonth(metrics.revenueTrend);

  // Prepare chart data
  const lastSixMonths = getLastSixMonths();
  const monthlyRevenue = lastSixMonths.map((month) => ({
    month,
    revenue: metrics.revenueTrend[month] || 0,
  }));

  const statusData = [
    { label: "Pending", value: metrics.byStatus.pending || 0, color: "bg-yellow-500" },
    { label: "Confirmed", value: metrics.byStatus.confirmed || 0, color: "bg-blue-500" },
    { label: "Completed", value: metrics.byStatus.completed || 0, color: "bg-green-500" },
    { label: "Cancelled", value: metrics.byStatus.cancelled || 0, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to Lesson UK Admin Panel</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard title="Total Bookings" value={metrics.totalBookings.toString()} icon="📅" />
        <MetricCard title="Total Revenue" value={formatCurrency(metrics.totalRevenue)} icon="💷" />
        <MetricCard title="Active Tutors" value={tutorStats.approved.toString()} icon="👨‍🏫" />
        <MetricCard title="Active Parents" value={metrics.activeParents.toString()} icon="👨‍👩‍👧" />
        <MetricCard title="Lessons This Month" value={metrics.lessonsThisMonth.toString()} icon="📚" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Trend */}
        <div className="border rounded-lg p-6 bg-white">
          <h2 className="text-xl font-semibold mb-4">Revenue Trend (Last 6 Months)</h2>
          <div className="space-y-3">
            {monthlyRevenue.map((item) => (
              <div key={item.month} className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.month}</span>
                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(item.revenue / Math.max(...monthlyRevenue.map((m) => m.revenue), 1)) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">{formatCurrency(item.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="border rounded-lg p-6 bg-white">
          <h2 className="text-xl font-semibold mb-4">Booking Status Distribution</h2>
          <div className="space-y-3">
            {statusData.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                    <div
                      className={item.color}
                      style={{
                        width: `${(item.value / Math.max(...statusData.map((d) => d.value), 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-8">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Subjects */}
        <div className="border rounded-lg p-6 bg-white">
          <h2 className="text-xl font-semibold mb-4">Top Subjects by Bookings</h2>
          <div className="space-y-3">
            {topSubjects.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.name}</span>
                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${(item.count / Math.max(...topSubjects.map((s) => s.count), 1)) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tutor Statistics */}
        <div className="border rounded-lg p-6 bg-white">
          <h2 className="text-xl font-semibold mb-4">Tutor Statistics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm font-medium">Total Tutors</span>
              <span className="text-2xl font-bold">{tutorStats.total}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm font-medium text-green-600">Approved</span>
              <span className="text-2xl font-bold text-green-600">{tutorStats.approved}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm font-medium text-yellow-600">Pending Review</span>
              <span className="text-2xl font-bold text-yellow-600">{tutorStats.pending}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm font-medium text-red-600">Rejected</span>
              <span className="text-2xl font-bold text-red-600">{tutorStats.rejected}</span>
            </div>
            <div className="flex justify-between items-center pt-3">
              <span className="text-sm font-medium">Total Earnings</span>
              <span className="text-2xl font-bold text-purple-600">{formatCurrency(tutorStats.totalEarnings)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="border rounded-lg p-6 bg-white">
        <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 font-semibold">Booking ID</th>
                <th className="text-left py-2 px-4 font-semibold">Subject</th>
                <th className="text-left py-2 px-4 font-semibold">Date</th>
                <th className="text-left py-2 px-4 font-semibold">Type</th>
                <th className="text-left py-2 px-4 font-semibold">Amount</th>
                <th className="text-left py-2 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 10).map((booking) => (
                <tr key={booking.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-xs">{booking.id.slice(0, 8)}</td>
                  <td className="py-3 px-4">{booking.subject}</td>
                  <td className="py-3 px-4">{booking.date}</td>
                  <td className="py-3 px-4 capitalize">{booking.lessonType === "one_to_one" ? "1:1" : "Group"}</td>
                  <td className="py-3 px-4 font-semibold">{formatCurrency(booking.total)}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={booking.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    rescheduled: "bg-purple-100 text-purple-800",
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${styles[status] || "bg-gray-100"}`}>
      {status}
    </span>
  );
}

function getLastSixMonths(): string[] {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(date.toISOString().slice(0, 7));
  }
  return months;
}

"use client";
import { useEffect, useState } from "react";
import { TutorDB } from "@/lib/booking/tutor-storage";
import { LocalDB } from "@/lib/booking/storage";
import { TutorEarnings, TutorPayoutSetting, Booking } from "@/lib/booking/types";
import { formatCurrency } from "@/lib/booking/admin";

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<TutorEarnings[]>([]);
  const [payoutSetting, setPayoutSetting] = useState<TutorPayoutSetting | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tutorId] = useState("tutor_demo_001");
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [filterMonth, setFilterMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [payoutData, setPayoutData] = useState({
    stripeAccountId: "",
    bankDetails: "",
    payoutSchedule: "monthly",
  });

  useEffect(() => {
    const earn = TutorDB.getEarningsByTutor(tutorId);
    const payout = TutorDB.getOrCreatePayoutSetting(tutorId);
    const books = LocalDB.listBookings().filter((b) => b.tutorId === tutorId || !b.tutorId);

    setEarnings(earn);
    setPayoutSetting(payout);
    setBookings(books);

    // Generate earnings from bookings if not already created
    if (earn.length === 0 && books.length > 0) {
      books.forEach((booking) => {
        if (booking.status !== "cancelled") {
          TutorDB.createEarning({
            tutorId,
            bookingId: booking.id,
            studentName: booking.studentName,
            lessonType: booking.lessonType,
            amount: booking.total * 0.8, // After 20% commission
            rate: booking.ratePerHour,
            status: "unpaid",
          });
        }
      });
      const updatedEarn = TutorDB.getEarningsByTutor(tutorId);
      setEarnings(updatedEarn);
    }

    setLoading(false);
  }, [tutorId]);

  const handleUpdatePayoutSetting = () => {
    const updated = TutorDB.updatePayoutSetting(tutorId, payoutData as any);
    setPayoutSetting(updated);
    setShowPayoutForm(false);
  };

  const handleMarkAsPaid = (id: string) => {
    const updated = TutorDB.updateEarning(id, { status: "paid", paidAt: new Date().toISOString() });
    if (updated) {
      setEarnings(earnings.map((e) => (e.id === id ? updated : e)));
    }
  };

  const filteredEarnings = earnings.filter((e) => {
    const earningMonth = e.createdAt.slice(0, 7);
    return filterMonth === "all" || earningMonth === filterMonth;
  });

  const totalEarnings = filteredEarnings.reduce((sum, e) => sum + e.amount, 0);
  const paidEarnings = filteredEarnings.filter((e) => e.status === "paid").reduce((sum, e) => sum + e.amount, 0);
  const unpaidEarnings = filteredEarnings.filter((e) => e.status === "unpaid").reduce((sum, e) => sum + e.amount, 0);

  const months = Array.from(new Set(earnings.map((e) => e.createdAt.slice(0, 7)))).sort().reverse();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Earnings & Payouts</h1>
          <p className="text-gray-600 mt-2">Track your earnings and manage payout settings</p>
        </div>
        <button
          onClick={() => {
            setPayoutData({
              stripeAccountId: payoutSetting?.stripeAccountId || "",
              bankDetails: payoutSetting?.bankDetails || "",
              payoutSchedule: payoutSetting?.payoutSchedule || "monthly",
            });
            setShowPayoutForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          🔧 Payout Settings
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Earnings"
          value={formatCurrency(totalEarnings)}
          color="green"
          icon="💰"
        />
        <StatCard
          label="Paid Out"
          value={formatCurrency(paidEarnings)}
          color="blue"
          icon="✅"
        />
        <StatCard
          label="Pending Payment"
          value={formatCurrency(unpaidEarnings)}
          color="amber"
          icon="⏳"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Time</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {new Date(month + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </option>
          ))}
        </select>
      </div>

      {/* Earnings Table */}
      <div className="border rounded-lg bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Date</th>
                <th className="text-left py-3 px-4 font-semibold">Student</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">Amount</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEarnings.length > 0 ? (
                filteredEarnings.map((earning) => (
                  <tr key={earning.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(earning.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium">{earning.studentName}</td>
                    <td className="py-3 px-4 text-sm">
                      {earning.lessonType === "one_to_one" ? "1:1 Lesson" : "Group Lesson"}
                    </td>
                    <td className="py-3 px-4 font-bold">{formatCurrency(earning.amount)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          earning.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {earning.status === "paid" ? "✓ Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {earning.status === "unpaid" && (
                        <button
                          onClick={() => handleMarkAsPaid(earning.id)}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 font-medium"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-600">
                    No earnings for this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Settings Modal */}
      {showPayoutForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Payout Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Payout Schedule</label>
                <select
                  value={payoutData.payoutSchedule}
                  onChange={(e) => setPayoutData({ ...payoutData, payoutSchedule: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="on-demand">On-Demand</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Stripe Account ID</label>
                <input
                  type="text"
                  value={payoutData.stripeAccountId}
                  onChange={(e) => setPayoutData({ ...payoutData, stripeAccountId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="acct_..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bank Details (Alternative)</label>
                <textarea
                  value={payoutData.bankDetails}
                  onChange={(e) => setPayoutData({ ...payoutData, bankDetails: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Bank account details for direct transfer"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                💡 We'll use your Stripe account for secure payouts. Bank details are only used if Stripe is unavailable.
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowPayoutForm(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePayoutSetting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: "green" | "blue" | "amber";
  icon: string;
}) {
  const colorClasses: Record<string, string> = {
    green: "bg-green-50 border-green-200",
    blue: "bg-blue-50 border-blue-200",
    amber: "bg-amber-50 border-amber-200",
  };

  const textClasses: Record<string, string> = {
    green: "text-green-900",
    blue: "text-blue-900",
    amber: "text-amber-900",
  };

  return (
    <div className={`border rounded-lg p-5 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${textClasses[color]}`}>{label}</p>
          <p className={`text-3xl font-bold mt-2 ${textClasses[color]}`}>{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

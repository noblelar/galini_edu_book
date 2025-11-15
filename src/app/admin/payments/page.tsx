"use client";
import { useEffect, useState } from "react";
import { LocalDB } from "@/lib/booking/storage";
import { Payment, Booking } from "@/lib/booking/types";
import { formatCurrency } from "@/lib/booking/admin";

export default function PaymentsManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed" | "failed" | "refunded">("all");
  const [formData, setFormData] = useState<Partial<Payment>>({
    bookingId: "",
    parentId: "",
    tutorId: "",
    amount: 0,
    currency: "GBP",
    status: "pending",
  });

  useEffect(() => {
    const allPayments = LocalDB.getAllPayments();
    const allBookings = LocalDB.listBookings();
    setPayments(allPayments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setBookings(allBookings);
    setLoading(false);
  }, []);

  const handleAddPayment = () => {
    setFormData({
      bookingId: "",
      parentId: "",
      tutorId: "",
      amount: 0,
      currency: "GBP",
      status: "pending",
    });
    setShowForm(true);
  };

  const handleSavePayment = () => {
    if (!formData.bookingId || !formData.parentId || !formData.tutorId || !formData.amount) {
      alert("Please fill in all required fields");
      return;
    }

    const created = LocalDB.createPayment(formData as Omit<Payment, "id" | "createdAt">);
    setPayments([created, ...payments]);
    setShowForm(false);
  };

  const handleUpdateStatus = (id: string, status: Payment["status"]) => {
    const updated = LocalDB.updatePayment(id, { 
      status,
      refundedAt: status === "refunded" ? new Date().toISOString() : undefined 
    });
    if (updated) {
      setPayments(payments.map((p) => (p.id === id ? updated : p)));
    }
  };

  const getBookingInfo = (bookingId: string) => {
    return bookings.find((b) => b.id === bookingId);
  };

  const filteredPayments = filterStatus === "all" ? payments : payments.filter((p) => p.status === filterStatus);

  const stats = {
    total: payments.length,
    completed: payments.filter((p) => p.status === "completed").length,
    pending: payments.filter((p) => p.status === "pending").length,
    totalAmount: payments
      .filter((p) => p.status !== "refunded")
      .reduce((sum, p) => sum + p.amount, 0),
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments Management</h1>
          <p className="text-gray-600 mt-2">Track and manage all payments and transactions</p>
        </div>
        <button
          onClick={handleAddPayment}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Record Payment
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Transactions" value={stats.total.toString()} color="blue" />
        <StatCard label="Completed" value={stats.completed.toString()} color="green" />
        <StatCard label="Pending" value={stats.pending.toString()} color="yellow" />
        <StatCard label="Total Amount" value={formatCurrency(stats.totalAmount)} color="purple" />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="border rounded-lg bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Payment ID</th>
                <th className="text-left py-3 px-4 font-semibold">Booking</th>
                <th className="text-left py-3 px-4 font-semibold">Amount</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Date</th>
                <th className="text-left py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => {
                const booking = getBookingInfo(payment.bookingId);
                return (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-xs">{payment.id.slice(0, 8)}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {booking ? (
                          <>
                            <div className="font-medium">{booking.studentName}</div>
                            <div className="text-gray-600">{booking.subject}</div>
                          </>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold">{formatCurrency(payment.amount)}</td>
                    <td className="py-3 px-4">
                      <select
                        value={payment.status}
                        onChange={(e) => handleUpdateStatus(payment.id, e.target.value as any)}
                        className="px-2 py-1 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      <div className="text-sm">{new Date(payment.transactionDate).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleUpdateStatus(payment.id, "refunded")}
                        disabled={payment.status === "refunded"}
                        className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Refund
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredPayments.length === 0 && (
          <div className="py-8 text-center text-gray-600">No payments found</div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Record New Payment</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Booking ID *</label>
                <select
                  value={formData.bookingId || ""}
                  onChange={(e) => {
                    const booking = bookings.find((b) => b.id === e.target.value);
                    setFormData({
                      ...formData,
                      bookingId: e.target.value,
                      parentId: booking?.parentId || "",
                      tutorId: booking?.tutorId || "",
                      amount: booking?.total || 0,
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a booking</option>
                  {bookings
                    .filter((b) => b.status === "confirmed" || b.status === "pending")
                    .map((booking) => (
                      <option key={booking.id} value={booking.id}>
                        {booking.studentName} - {booking.subject} ({formatCurrency(booking.total)})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Amount (£) *</label>
                <input
                  type="number"
                  value={formData.amount || 0}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status *</label>
                <select
                  value={formData.status || "pending"}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Transaction Date *</label>
                <input
                  type="date"
                  value={new Date(formData.transactionDate || new Date()).toISOString().split("T")[0]}
                  onChange={(e) => setFormData({ ...formData, transactionDate: new Date(e.target.value).toISOString() })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePayment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: "blue" | "green" | "yellow" | "purple" }) {
  const colorClasses: Record<string, string> = {
    blue: "from-blue-50 to-blue-100 border-blue-200",
    green: "from-green-50 to-green-100 border-green-200",
    yellow: "from-yellow-50 to-yellow-100 border-yellow-200",
    purple: "from-purple-50 to-purple-100 border-purple-200",
  };

  const textClasses: Record<string, string> = {
    blue: "text-blue-900",
    green: "text-green-900",
    yellow: "text-yellow-900",
    purple: "text-purple-900",
  };

  return (
    <div className={`rounded-lg p-4 bg-gradient-to-br ${colorClasses[color]} border`}>
      <p className={`text-sm font-medium ${textClasses[color]}`}>{label}</p>
      <p className={`text-2xl font-bold mt-2 ${textClasses[color]}`}>{value}</p>
    </div>
  );
}

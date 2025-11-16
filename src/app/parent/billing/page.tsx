"use client";
import { useEffect, useState } from "react";
import { LocalDB } from "@/lib/booking/storage";
import { ParentDB, ParentPayment } from "@/lib/booking/parent-storage";
import { formatCurrency } from "@/lib/booking/admin";

export default function BillingPage() {
  const [payments, setPayments] = useState<ParentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [parentId] = useState("parent_demo_001");

  useEffect(() => {
    const allPayments = ParentDB.getPaymentsByParent(parentId);
    setPayments(allPayments);
    setLoading(false);
  }, [parentId]);

  const totalSpent = payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);
  const monthlyBreakdown = payments.reduce(
    (acc, p) => {
      const month = p.transactionDate.slice(0, 7);
      acc[month] = (acc[month] || 0) + (p.status === "completed" ? p.amount : 0);
      return acc;
    },
    {} as Record<string, number>
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Billing & Payments</h1>
        <p className="text-gray-600 mt-2">View your payment history and invoices</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-lg p-5 bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm">
          <p className="text-sm text-green-900 font-medium">Total Spent</p>
          <p className="text-3xl font-bold text-green-900 mt-2">{formatCurrency(totalSpent)}</p>
        </div>

        <div className="border border-gray-200 rounded-lg p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm">
          <p className="text-sm text-blue-900 font-medium">Transactions</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{payments.filter((p) => p.status === "completed").length}</p>
        </div>

        <div className="border border-gray-200 rounded-lg p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-sm">
          <p className="text-sm text-purple-900 font-medium">Payment Methods</p>
          <p className="text-3xl font-bold text-purple-900 mt-2">
            {new Set(payments.map((p) => p.paymentMethod)).size}
          </p>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <h2 className="font-bold text-lg mb-4">Monthly Spending</h2>
        <div className="space-y-3">
          {Object.entries(monthlyBreakdown)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([month, amount]) => (
              <div key={month} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <span className="font-medium">
                  {new Date(month + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
                <span className="font-bold text-lg">{formatCurrency(amount)}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Payment History */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <h2 className="font-bold text-lg mb-4">Payment History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Date</th>
                <th className="text-left py-3 px-4 font-semibold">Booking ID</th>
                <th className="text-left py-3 px-4 font-semibold">Method</th>
                <th className="text-left py-3 px-4 font-semibold">Amount</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{new Date(payment.transactionDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-mono text-xs">{payment.bookingId.slice(0, 8)}</td>
                    <td className="py-3 px-4 capitalize">{payment.paymentMethod.replace("_", " ")}</td>
                    <td className="py-3 px-4 font-semibold">{formatCurrency(payment.amount)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          payment.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-600">
                    No payments yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Saved Payment Methods */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <h2 className="font-bold text-lg mb-4">Saved Payment Methods</h2>
        <div className="space-y-3">
          <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between hover:bg-gray-50">
            <div>
              <p className="font-medium">💳 Visa ending in 4242</p>
              <p className="text-sm text-gray-600">Expires 12/25</p>
            </div>
            <button className="text-red-600 hover:text-red-700 font-medium text-sm">Remove</button>
          </div>

          <button className="w-full px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium mt-4">
            + Add Payment Method
          </button>
        </div>
      </div>
    </div>
  );
}

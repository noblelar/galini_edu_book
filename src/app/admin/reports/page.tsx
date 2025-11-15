"use client";
import { useEffect, useState } from "react";
import { LocalDB } from "@/lib/booking/storage";
import { Booking, Tutor, User } from "@/lib/booking/types";
import { formatCurrency, getTopSubjects, getRevenueByMonth } from "@/lib/booking/admin";

export default function ReportsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<"revenue" | "attendance" | "subjects" | "tutors" | "monthly">("revenue");

  useEffect(() => {
    setBookings(LocalDB.listBookings());
    setTutors(LocalDB.getAllTutors());
    setUsers(LocalDB.getAllUsers());
    setLoading(false);
  }, []);

  const handleExportCSV = () => {
    const data = generateReportData();
    const csv = convertToCSV(data);
    downloadCSV(csv, `${selectedReport}-report-${new Date().toISOString().split("T")[0]}.csv`);
  };

  const handleExportJSON = () => {
    const data = generateReportData();
    const json = JSON.stringify(data, null, 2);
    downloadJSON(json, `${selectedReport}-report-${new Date().toISOString().split("T")[0]}.json`);
  };

  const generateReportData = () => {
    switch (selectedReport) {
      case "revenue":
        return generateRevenueReport();
      case "attendance":
        return generateAttendanceReport();
      case "subjects":
        return generateSubjectsReport();
      case "tutors":
        return generateTutorsReport();
      case "monthly":
        return generateMonthlyReport();
      default:
        return [];
    }
  };

  const generateRevenueReport = () => {
    const revenueByMonth = getRevenueByMonth(
      Object.fromEntries(
        bookings
          .filter((b) => b.status !== "cancelled")
          .reduce((acc, b) => {
            const month = b.date.slice(0, 7);
            acc.set(month, (acc.get(month) || 0) + b.total);
            return acc;
          }, new Map<string, number>())
      )
    );

    return [
      {
        "Month": "Month",
        "Revenue": "Revenue (£)",
        "Bookings": "Bookings",
        "Avg Amount": "Avg Amount (£)",
      },
      ...revenueByMonth.map((item) => {
        const monthBookings = bookings.filter((b) => b.date.startsWith(item.month) && b.status !== "cancelled");
        return {
          "Month": item.month,
          "Revenue": item.amount.toFixed(2),
          "Bookings": monthBookings.length.toString(),
          "Avg Amount": (item.amount / Math.max(monthBookings.length, 1)).toFixed(2),
        };
      }),
    ];
  };

  const generateAttendanceReport = () => {
    const completedBookings = bookings.filter((b) => b.status === "completed");
    const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

    return [
      {
        "Metric": "Metric",
        "Count": "Count",
        "Percentage": "Percentage (%)",
      },
      {
        "Metric": "Completed Lessons",
        "Count": completedBookings.length.toString(),
        "Percentage": ((completedBookings.length / Math.max(bookings.length, 1)) * 100).toFixed(2),
      },
      {
        "Metric": "Cancelled Lessons",
        "Count": cancelledBookings.length.toString(),
        "Percentage": ((cancelledBookings.length / Math.max(bookings.length, 1)) * 100).toFixed(2),
      },
      {
        "Metric": "Pending/Confirmed",
        "Count": bookings.filter((b) => b.status === "pending" || b.status === "confirmed").length.toString(),
        "Percentage": ((bookings.filter((b) => b.status === "pending" || b.status === "confirmed").length / Math.max(bookings.length, 1)) * 100).toFixed(2),
      },
    ];
  };

  const generateSubjectsReport = () => {
    const bySubject: Record<string, number> = {};
    bookings.forEach((b) => {
      bySubject[b.subject] = (bySubject[b.subject] || 0) + 1;
    });

    const topSubjects = getTopSubjects(bySubject as any, 10);

    return [
      { "Subject": "Subject", "Bookings": "Bookings", "Percentage": "Percentage (%)" },
      ...topSubjects.map((item) => ({
        "Subject": item.name,
        "Bookings": item.count.toString(),
        "Percentage": ((item.count / Math.max(bookings.length, 1)) * 100).toFixed(2),
      })),
    ];
  };

  const generateTutorsReport = () => {
    const approvedTutors = tutors.filter((t) => t.status === "approved");
    const earnings = approvedTutors.map((t) => {
      const bookingsByTutor = bookings.filter((b) => b.tutorId === t.id && b.status !== "cancelled");
      const revenue = bookingsByTutor.reduce((sum, b) => sum + b.total, 0);
      const commission = revenue * (t.commissionRate / 100);
      return {
        ...t,
        bookingCount: bookingsByTutor.length,
        totalRevenue: revenue,
        commissionEarned: commission,
      };
    });

    return [
      {
        "Name": "Tutor Name",
        "Email": "Email",
        "Subjects": "Subjects",
        "Bookings": "Bookings",
        "Total Revenue": "Total Revenue (£)",
        "Commission Rate": "Commission Rate (%)",
        "Commission Earned": "Commission Earned (£)",
      },
      ...earnings.map((t) => ({
        "Name": t.name,
        "Email": t.email,
        "Subjects": t.subjects.join("; "),
        "Bookings": t.bookingCount.toString(),
        "Total Revenue": t.totalRevenue.toFixed(2),
        "Commission Rate": t.commissionRate.toString(),
        "Commission Earned": t.commissionEarned.toFixed(2),
      })),
    ];
  };

  const generateMonthlyReport = () => {
    const months = getLastTwelveMonths();
    const monthlyData = months.map((month) => {
      const monthBookings = bookings.filter((b) => b.date.startsWith(month) && b.status !== "cancelled");
      const completedBookings = monthBookings.filter((b) => b.status === "completed");
      const revenue = monthBookings.reduce((sum, b) => sum + b.total, 0);

      return {
        "Month": month,
        "Bookings": monthBookings.length.toString(),
        "Completed": completedBookings.length.toString(),
        "Revenue": revenue.toFixed(2),
        "Avg Per Booking": (revenue / Math.max(monthBookings.length, 1)).toFixed(2),
      };
    });

    return [
      {
        "Month": "Month",
        "Bookings": "Total Bookings",
        "Completed": "Completed",
        "Revenue": "Revenue (£)",
        "Avg Per Booking": "Avg Per Booking (£)",
      },
      ...monthlyData,
    ];
  };

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((header) => `"${row[header] ?? ""}"`).join(","));

    return [headers.join(","), ...rows].join("\n");
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const downloadJSON = (json: string, filename: string) => {
    const blob = new Blob([json], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const reportData = generateReportData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">Generate and export detailed business reports</p>
      </div>

      {/* Report Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { id: "revenue" as const, label: "Revenue Report", icon: "💷" },
          { id: "attendance" as const, label: "Attendance Report", icon: "📊" },
          { id: "subjects" as const, label: "Subjects Report", icon: "📚" },
          { id: "tutors" as const, label: "Tutors Report", icon: "👨‍🏫" },
          { id: "monthly" as const, label: "Monthly Report", icon: "📅" },
        ].map((report) => (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            className={`p-4 rounded-lg border-2 transition-all text-center ${
              selectedReport === report.id
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <div className="text-2xl mb-2">{report.icon}</div>
            <div className="font-medium text-sm">{report.label}</div>
          </button>
        ))}
      </div>

      {/* Export Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
        >
          📥 Export as CSV
        </button>
        <button
          onClick={handleExportJSON}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
        >
          📥 Export as JSON
        </button>
      </div>

      {/* Data Preview */}
      <div className="border rounded-lg bg-white overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h2 className="font-semibold text-lg">Report Preview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                {reportData.length > 0 &&
                  Object.keys(reportData[0]).map((key) => (
                    <th key={key} className="text-left py-3 px-4 font-semibold">
                      {key}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {reportData.slice(1).map((row, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  {Object.values(row).map((value, i) => (
                    <td key={i} className="py-3 px-4">
                      {String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reportData.length === 0 && (
          <div className="py-8 text-center text-gray-600">No data available for this report</div>
        )}
      </div>

      {/* Report Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6 bg-white">
          <h3 className="font-bold mb-3">Revenue Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Revenue:</span>
              <span className="font-semibold">
                {formatCurrency(bookings.filter((b) => b.status !== "cancelled").reduce((sum, b) => sum + b.total, 0))}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Bookings:</span>
              <span className="font-semibold">{bookings.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed Bookings:</span>
              <span className="font-semibold">{bookings.filter((b) => b.status === "completed").length}</span>
            </div>
            <div className="flex justify-between">
              <span>Cancelled Bookings:</span>
              <span className="font-semibold">{bookings.filter((b) => b.status === "cancelled").length}</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6 bg-white">
          <h3 className="font-bold mb-3">Tutor Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Tutors:</span>
              <span className="font-semibold">{tutors.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Approved Tutors:</span>
              <span className="font-semibold">{tutors.filter((t) => t.status === "approved").length}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending Applications:</span>
              <span className="font-semibold">{tutors.filter((t) => t.status === "pending").length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Users:</span>
              <span className="font-semibold">{users.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getLastTwelveMonths(): string[] {
  const months = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(date.toISOString().slice(0, 7));
  }
  return months;
}

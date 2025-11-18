"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { StudentDB, StudentHomework } from "@/lib/booking/student-storage";

export default function HomeworkDetail() {
  const params = useParams();
  const homeworkId = params.id as string;
  const [homework, setHomework] = useState<StudentHomework | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const hw = StudentDB.getHomework(homeworkId);
    setHomework(hw);
    setLoading(false);
  }, [homeworkId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSubmissionFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!homework) return;

    setIsSubmitting(true);
    // Simulate submission delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const updated = StudentDB.updateHomework(homework.id, {
      ...homework,
      status: "submitted",
      submissionDate: new Date().toISOString(),
      submissionUrl: submissionFile?.name || submissionText.substring(0, 50),
    });

    if (updated) {
      setHomework(updated);
      setSubmissionText("");
      setSubmissionFile(null);
      setShowConfirm(false);
    }

    setIsSubmitting(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!homework) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg mb-4">Homework not found</p>
        <Link href="/student/homework" className="text-blue-600 hover:text-blue-700 font-medium">
          Back to Homework →
        </Link>
      </div>
    );
  }

  const daysLeft = Math.ceil((new Date(homework.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0;
  const canSubmit = homework.status !== "completed";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/student/homework" className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block">
            ← Back to Homework
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mt-2">{homework.title}</h1>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(homework.status)}`}>
          {homework.status.charAt(0).toUpperCase() + homework.status.slice(1)}
        </span>
      </div>

      {/* Alert for Overdue */}
      {isOverdue && homework.status !== "completed" && (
        <div className="border border-red-300 rounded-lg p-6 bg-gradient-to-br from-red-50 to-pink-50">
          <h2 className="text-lg font-bold text-red-900 mb-2">⚠️ Assignment Overdue</h2>
          <p className="text-red-800">This assignment was due on {homework.dueDate}. Please submit as soon as possible!</p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-4">📋 Assignment Details</h2>
            <p className="text-gray-700 mb-4">{homework.description}</p>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Subject</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">📚 {homework.subject}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Tutor</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">👨‍🏫 {homework.tutorName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Due Date</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">📅 {homework.dueDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Days Left</p>
                <p className={`text-lg font-semibold mt-1 ${isOverdue ? "text-red-600" : "text-gray-900"}`}>
                  {isOverdue ? "⏰ Overdue" : `⏳ ${daysLeft} days`}
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          {homework.instructions && (
            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
              <h2 className="text-xl font-bold mb-4">📝 Instructions</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">{homework.instructions}</p>
              </div>
            </div>
          )}

          {/* Attachments */}
          {homework.attachments && homework.attachments.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
              <h2 className="text-xl font-bold mb-4">📎 Attached Files</h2>
              <div className="space-y-2">
                {homework.attachments.map((attachment, idx) => (
                  <a
                    key={idx}
                    href={attachment}
                    className="flex items-center gap-3 p-3 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <span className="text-2xl">📄</span>
                    <span className="font-medium text-blue-600 hover:text-blue-700">{attachment}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Tutor Feedback */}
          {homework.tutorFeedback && (
            <div className="border border-green-300 rounded-lg p-6 bg-gradient-to-br from-green-50 to-emerald-50">
              <h2 className="text-xl font-bold text-green-900 mb-4">✅ Tutor Feedback</h2>
              <p className="text-green-800 mb-2">{homework.tutorFeedback}</p>
              {homework.tutorFeedbackDate && (
                <p className="text-sm text-green-700">Provided on {homework.tutorFeedbackDate}</p>
              )}
            </div>
          )}

          {/* Submission Form */}
          {canSubmit && (
            <div className="border border-blue-300 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
              <h2 className="text-xl font-bold text-blue-900 mb-4">📤 Submit Your Work</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:bg-white transition-colors">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="text-4xl mb-2">📁</div>
                      <p className="font-medium text-blue-900">
                        {submissionFile ? submissionFile.name : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-sm text-blue-800 mt-1">PDF, DOC, IMAGE (max 10MB)</p>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Or Add Comments</label>
                  <textarea
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Add any comments or notes with your submission..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={!submissionFile && !submissionText}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 transition-all font-semibold"
                >
                  Submit Assignment
                </button>
              </div>
            </div>
          )}

          {/* Submitted Confirmation */}
          {homework.status === "submitted" && (
            <div className="border border-green-300 rounded-lg p-6 bg-gradient-to-br from-green-50 to-emerald-50">
              <h2 className="text-lg font-bold text-green-900 mb-2">✅ Submitted Successfully</h2>
              <p className="text-green-800">Your assignment was submitted on {homework.submissionDate}</p>
              <p className="text-sm text-green-700 mt-2">Your tutor will review and provide feedback soon!</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Info Card */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm sticky top-6">
            <h3 className="font-bold text-lg mb-4">ℹ️ Assignment Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600 uppercase">Status</p>
                <p className={`text-sm font-semibold mt-1 ${homework.status === "completed" ? "text-green-600" : "text-yellow-600"}`}>
                  {homework.status.charAt(0).toUpperCase() + homework.status.slice(1)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase">Due</p>
                <p className={`text-sm font-semibold mt-1 ${isOverdue ? "text-red-600" : "text-gray-900"}`}>
                  {homework.dueDate}
                </p>
              </div>
              {homework.submissionDate && (
                <div>
                  <p className="text-xs text-gray-600 uppercase">Submitted</p>
                  <p className="text-sm font-semibold text-green-600 mt-1">{homework.submissionDate}</p>
                </div>
              )}
            </div>
          </div>

          {/* Help Card */}
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <h3 className="font-bold text-blue-900 mb-2">💡 Need Help?</h3>
            <p className="text-sm text-blue-800 mb-3">Message your tutor if you have questions</p>
            <Link
              href={`/student/messages`}
              className="block w-full px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium text-center hover:bg-blue-700 transition-colors"
            >
              Message Tutor
            </Link>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirm Submission</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to submit this assignment? Once submitted, you won't be able to make changes.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
              >
                {isSubmitting ? "Submitting..." : "Confirm Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    submitted: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}

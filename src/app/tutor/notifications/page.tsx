"use client";
import { useState, useEffect } from "react";

interface Notification {
  id: string;
  type: "booking" | "message" | "announcement" | "payment" | "system";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  icon: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "booking",
      title: "New Booking Request",
      description: "Sarah Johnson booked a 1:1 Math lesson for Nov 15",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      read: false,
      icon: "📅",
    },
    {
      id: "2",
      type: "message",
      title: "New Message",
      description: "Michael Chen sent you a message about lesson notes",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      icon: "💬",
    },
    {
      id: "3",
      type: "payment",
      title: "Payment Received",
      description: "£120 payment received from 3 completed lessons",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      read: true,
      icon: "💷",
    },
    {
      id: "4",
      type: "announcement",
      title: "System Announcement",
      description: "New features available: Export lesson reports",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      icon: "📢",
    },
    {
      id: "5",
      type: "booking",
      title: "Lesson Reminder",
      description: "You have a lesson with Emma Wilson in 2 hours",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      icon: "⏰",
    },
  ]);

  const [filterType, setFilterType] = useState<"all" | Notification["type"]>("all");

  const filteredNotifications = filterType === "all" ? notifications : notifications.filter((n) => n.type === filterType);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleDeleteAll = () => {
    if (confirm("Delete all notifications?")) {
      setNotifications([]);
    }
  };

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "booking":
        return "bg-blue-100 border-blue-200 text-blue-900";
      case "message":
        return "bg-purple-100 border-purple-200 text-purple-900";
      case "payment":
        return "bg-green-100 border-green-200 text-green-900";
      case "announcement":
        return "bg-amber-100 border-amber-200 text-amber-900";
      default:
        return "bg-gray-100 border-gray-200 text-gray-900";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-gray-600 mt-2">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm"
            >
              Mark All as Read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 font-medium text-sm"
            >
              Delete All
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterType("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterType === "all" ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterType("booking")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterType === "booking" ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          📅 Bookings
        </button>
        <button
          onClick={() => setFilterType("message")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterType === "message" ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          💬 Messages
        </button>
        <button
          onClick={() => setFilterType("payment")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterType === "payment" ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          💷 Payments
        </button>
        <button
          onClick={() => setFilterType("announcement")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterType === "announcement" ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          📢 Announcements
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 transition-all ${
                notification.read
                  ? "bg-white border-gray-200 hover:border-gray-300"
                  : "bg-blue-50 border-blue-200 hover:border-blue-300"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{notification.icon}</span>
                    <div className="flex-1">
                      <h3
                        className={`font-bold ${notification.read ? "text-gray-900" : "text-blue-900"}`}
                      >
                        {notification.title}
                      </h3>
                      <p
                        className={`text-sm mt-1 ${
                          notification.read ? "text-gray-600" : "text-blue-800"
                        }`}
                      >
                        {notification.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      {new Date(notification.timestamp).toLocaleString()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(notification.type)}`}>
                      {notification.type}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 font-medium"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNotification(notification.id)}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-xs font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-600">
            <p className="text-lg">No notifications yet</p>
            <p className="text-sm mt-2">You'll receive notifications for bookings, messages, and payments</p>
          </div>
        )}
      </div>

      {/* Notification Preferences Info */}
      <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
        <h3 className="font-bold text-blue-900 mb-3">💡 Notification Preferences</h3>
        <p className="text-blue-800 text-sm mb-3">
          Customize how you receive notifications by visiting your settings page.
        </p>
        <a
          href="/tutor/settings"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
        >
          Go to Settings
        </a>
      </div>
    </div>
  );
}

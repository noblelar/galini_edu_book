"use client";
import { useEffect, useState } from "react";
import { StudentDB, StudentConversation, StudentMessage } from "@/lib/booking/student-storage";

export default function StudentMessages() {
  const [conversations, setConversations] = useState<StudentConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string>("");
  const [messages, setMessages] = useState<StudentMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [studentId] = useState("student_demo_001");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const allConversations = StudentDB.getConversations(studentId);

    // Create demo conversations if none exist
    if (allConversations.length === 0) {
      const conv1 = StudentDB.createOrGetConversation(studentId, "tutor_001", "John Smith");
      const conv2 = StudentDB.createOrGetConversation(studentId, "tutor_002", "Jane Doe");
      const conv3 = StudentDB.createOrGetConversation(studentId, "tutor_003", "Dr. Green");

      // Add demo messages
      const demoMessages = [
        {
          conversationId: conv1.id,
          tutorId: "tutor_001",
          tutorName: "John Smith",
          studentId,
          senderId: "tutor_001",
          senderRole: "tutor" as const,
          senderName: "John Smith",
          content: "Hi! How are you doing with the algebra homework?",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          conversationId: conv1.id,
          tutorId: "tutor_001",
          tutorName: "John Smith",
          studentId,
          senderId: studentId,
          senderRole: "student" as const,
          senderName: "Alex Johnson",
          content: "I'm struggling with question 5. Can you help me?",
          createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        },
        {
          conversationId: conv1.id,
          tutorId: "tutor_001",
          tutorName: "John Smith",
          studentId,
          senderId: "tutor_001",
          senderRole: "tutor" as const,
          senderName: "John Smith",
          content: "Of course! Let's break down question 5 step by step. First, what do you see as the main issue?",
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
        {
          conversationId: conv2.id,
          tutorId: "tutor_002",
          tutorName: "Jane Doe",
          studentId,
          senderId: "tutor_002",
          senderRole: "tutor" as const,
          senderName: "Jane Doe",
          content: "Great essay! I've left comments on your draft.",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          readAt: new Date().toISOString(),
        },
      ];

      demoMessages.forEach((msg) => {
        StudentDB.sendMessage({
          ...msg,
          id: "",
          createdAt: msg.createdAt,
        });
      });

      setConversations([conv1, conv2, conv3]);
      setSelectedConversationId(conv1.id);
    } else {
      setConversations(allConversations);
      if (allConversations.length > 0) {
        setSelectedConversationId(allConversations[0].id);
      }
    }

    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    if (selectedConversationId) {
      const msgs = StudentDB.getMessagesByConversation(selectedConversationId);
      setMessages(msgs);
    }
  }, [selectedConversationId]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversationId) return;

    setIsSending(true);

    const conversation = conversations.find((c) => c.id === selectedConversationId);
    if (!conversation) {
      setIsSending(false);
      return;
    }

    const newMessage = StudentDB.sendMessage({
      conversationId: selectedConversationId,
      studentId,
      tutorId: conversation.tutorId,
      tutorName: conversation.tutorName,
      senderId: studentId,
      senderRole: "student",
      senderName: "You",
      content: messageInput,
    });

    setMessages([...messages, newMessage]);
    setMessageInput("");

    // Simulate tutor response
    setTimeout(() => {
      const response = StudentDB.sendMessage({
        conversationId: selectedConversationId,
        studentId,
        tutorId: conversation.tutorId,
        tutorName: conversation.tutorName,
        senderId: conversation.tutorId,
        senderRole: "tutor",
        senderName: conversation.tutorName,
        content: "Thanks for your message! I'll get back to you soon. 😊",
      });
      setMessages((prev) => [...prev, response]);
    }, 2000);

    setIsSending(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          💬 Messages
        </h1>
        <p className="text-gray-600 mt-2">Chat with your tutors</p>
      </div>

      {/* Messages Layout */}
      <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden flex h-[600px]">
        {/* Conversations List */}
        <div className="w-80 border-r border-gray-200 overflow-y-auto bg-gray-50">
          <div className="p-4 border-b border-gray-200 bg-white">
            <h2 className="font-bold text-gray-900">Conversations</h2>
          </div>

          <div className="divide-y">
            {conversations.length > 0 ? (
              conversations.map((conversation) => {
                const isSelected = conversation.id === selectedConversationId;
                const unreadMessages = messages.filter((m) => m.conversationId === conversation.id && !m.readAt);

                return (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={`w-full text-left p-4 transition-colors hover:bg-gray-100 ${
                      isSelected ? "bg-blue-50 border-l-4 border-blue-600" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold ${isSelected ? "text-blue-600" : "text-gray-900"}`}>
                          👨‍🏫 {conversation.tutorName}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {conversation.lastMessage || "Start a conversation"}
                        </p>
                      </div>
                      {unreadMessages.length > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                          {unreadMessages.length}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center text-gray-600">
                <p>No conversations yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="border-b border-gray-200 p-4 bg-white">
                <h2 className="font-bold text-gray-900">👨‍🏫 {selectedConversation.tutorName}</h2>
                <p className="text-xs text-gray-600 mt-1">
                  Last message: {selectedConversation.lastMessageAt ? formatTime(selectedConversation.lastMessageAt) : "None"}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderRole === "student" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          message.senderRole === "student"
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-gray-200 text-gray-900 rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.senderRole === "student" ? "text-blue-100" : "text-gray-600"}`}>
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-600">
                    <p>Start a conversation with {selectedConversation.tutorName}</p>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || isSending}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
                  >
                    {isSending ? "..." : "Send"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>

      {/* Safety & Support Info */}
      <div className="border border-blue-300 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
        <h2 className="text-lg font-bold text-blue-900 mb-3">🛡️ Message Safety</h2>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✓ All messages are private and secure</li>
          <li>✓ Your parent/guardian may have access to view messages (depending on account settings)</li>
          <li>✓ Be respectful and keep conversations appropriate</li>
          <li>✓ For urgent matters, contact your parent or guardian</li>
        </ul>
      </div>
    </div>
  );
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

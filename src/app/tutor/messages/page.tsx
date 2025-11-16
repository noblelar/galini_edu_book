"use client";
import { useEffect, useState } from "react";
import { TutorDB } from "@/lib/booking/tutor-storage";
import { Conversation, Message } from "@/lib/booking/types";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [tutorId] = useState("tutor_demo_001");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    const convs = TutorDB.getConversationsByTutor(tutorId);
    setConversations(convs);
    setLoading(false);
  }, [tutorId]);

  useEffect(() => {
    if (selectedConversation) {
      const msgs = TutorDB.getMessagesByConversation(selectedConversation.id);
      setMessages(msgs);
    }
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    const created = TutorDB.sendMessage({
      conversationId: selectedConversation.id,
      senderId: tutorId,
      senderRole: "tutor",
      recipientId: selectedConversation.participantId,
      content: messageText,
    });

    setMessages([...messages, created]);
    setMessageText("");
  };

  const handleStartConversation = (participantId: string, participantName: string) => {
    let conv = conversations.find((c) => c.participantId === participantId);
    if (!conv) {
      conv = TutorDB.createConversation({
        tutorId,
        participantId,
        participantRole: "parent",
        participantName,
      });
      setConversations([...conversations, conv]);
    }
    setSelectedConversation(conv);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-gray-600 mt-2">Communicate with parents and students</p>
      </div>

      {/* Main Chat Layout */}
      <div className="flex h-[600px] gap-6 border rounded-lg bg-white overflow-hidden">
        {/* Conversations List */}
        <div className="w-full md:w-80 border-r flex flex-col">
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length > 0 ? (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-4 border-b cursor-pointer transition-colors ${
                    selectedConversation?.id === conv.id ? "bg-blue-50 border-l-4 border-l-blue-600" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                      {conv.participantName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{conv.participantName}</p>
                      <p className="text-xs text-gray-600 truncate">{conv.lastMessage || "No messages yet"}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : ""}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs font-bold">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-600">
                <p className="text-sm">No conversations yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="font-bold">{selectedConversation.participantName}</h2>
                <p className="text-xs text-gray-600">
                  {selectedConversation.participantRole === "parent" ? "👨‍👩‍👧 Parent" : "👦 Student"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderRole === "tutor" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.senderRole === "tutor"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.senderRole === "tutor" ? "text-blue-100" : "text-gray-600"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-gray-600">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600">
            <div className="text-center">
              <p className="text-lg font-medium">Select a conversation to start messaging</p>
              <p className="text-sm mt-2">or create a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Contacts Section */}
      <div className="border rounded-lg p-6 bg-white">
        <h2 className="font-bold text-lg mb-4">Quick Contact</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "Sarah Johnson", role: "parent" },
            { name: "Michael Chen", role: "parent" },
            { name: "Emma Wilson", role: "student" },
          ].map((contact) => (
            <button
              key={contact.name}
              onClick={() => handleStartConversation(contact.name.toLowerCase().replace(/\s/g, "_"), contact.name)}
              className="p-4 border rounded-lg hover:bg-blue-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {contact.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-xs text-gray-600">{contact.role === "parent" ? "👨‍👩‍👧 Parent" : "👦 Student"}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

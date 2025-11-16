"use client";
import { useEffect, useState } from "react";
import { ParentDB, ParentMessage } from "@/lib/booking/parent-storage";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<ParentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [parentId] = useState("parent_demo_001");
  const [selectedTutor, setSelectedTutor] = useState<any>(null);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    const convs = ParentDB.getConversations(parentId);
    setConversations(convs);
    setLoading(false);
  }, [parentId]);

  useEffect(() => {
    if (selectedTutor) {
      const convId = `conv_${parentId}_${selectedTutor.tutorId}`;
      const msgs = ParentDB.getMessagesByConversation(convId);
      setMessages(msgs);
    }
  }, [selectedTutor, parentId]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedTutor) return;

    const convId = `conv_${parentId}_${selectedTutor.tutorId}`;
    const created = ParentDB.sendMessage({
      parentId,
      tutorId: selectedTutor.tutorId,
      conversationId: convId,
      senderId: parentId,
      senderRole: "parent",
      content: messageText,
    });

    setMessages([...messages, created]);
    setMessageText("");
  };

  const handleStartConversation = (tutorId: string, tutorName: string) => {
    setSelectedTutor({ tutorId, tutorName });
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Messages</h1>

      {/* Chat Layout */}
      <div className="flex gap-6 h-[600px] border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
        {/* Conversations Sidebar */}
        <div className="w-full md:w-80 border-r flex flex-col">
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder="Search tutors..."
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length > 0 ? (
              conversations.map((conv) => (
                <div
                  key={conv.tutorId}
                  onClick={() => handleStartConversation(conv.tutorId, conv.tutorName)}
                  className={`p-4 border-b cursor-pointer transition-colors ${
                    selectedTutor?.tutorId === conv.tutorId ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                      {conv.tutorName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{conv.tutorName}</p>
                      <p className="text-xs text-gray-600 truncate">{conv.lastMessage || "No messages"}</p>
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
              <div className="p-4 text-center text-gray-600 text-sm">No conversations yet</div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        {selectedTutor ? (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-bold">{selectedTutor.tutorName}</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderRole === "parent" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.senderRole === "parent"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.senderRole === "parent" ? "text-blue-100" : "text-gray-600"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-gray-600">
                  <p>Start a conversation</p>
                </div>
              )}
            </div>

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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600">
            <p>Select a tutor to start messaging</p>
          </div>
        )}
      </div>

      {/* Quick Tutors */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <h2 className="font-bold text-lg mb-4">Your Tutors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {["John Smith", "Sarah Johnson", "Michael Chen"].map((name) => (
            <button
              key={name}
              onClick={() => handleStartConversation(name.toLowerCase().replace(/\s/g, "_"), name)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{name}</p>
                  <p className="text-xs text-gray-600">👨‍🏫 Tutor</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

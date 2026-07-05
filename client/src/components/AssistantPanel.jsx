import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useEmail } from "../context/EmailContext";

export default function AssistantPanel() {
  const navigate = useNavigate();

  const {
    setEmails,
    currentEmail,
  } = useEmail();

  const quickCommands = [
    "Show my unread emails",
    "Open my latest email",
    "Summarize this email",
    "Reply to this email",
    "Search LinkedIn emails",
    "Compose an email to HR",
  ];

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Hello! I'm your Processity Mail AI assistant. How can I help you today?",
    },
  ]);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: text,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const { data } = await api.post("/ai/chat", {
        message: text,
        currentEmailId: currentEmail?.id || "",
      });

      const result = data.result;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            result?.reply ||
            "Sorry, I couldn't understand that.",
        },
      ]);

      // ---------- AI Actions ----------

      if (
        result?.intent === "OPEN_LATEST_EMAIL" &&
        data.data
      ) {
        toast.success("Opening email...");
        navigate(`/email/${data.data.id}`);
      }

      if (
        (result?.intent === "SHOW_UNREAD" ||
          result?.intent === "SEARCH_EMAILS") &&
        Array.isArray(data.data)
      ) {
        setEmails(data.data);

        if (data.data.length === 0) {
          toast("No emails found.");
        } else {
          toast.success(
            `${data.data.length} email${
              data.data.length !== 1 ? "s" : ""
            } found`
          );
        }

        navigate("/");
      }

      if (
        (result?.intent === "COMPOSE_EMAIL" ||
          result?.intent === "REPLY_EMAIL") &&
        data.data
      ) {
        toast.success("Draft ready!");

        navigate("/compose", {
          state: {
            to: data.data.to,
            subject: data.data.subject,
            body: data.data.body,
          },
        });
      }

      console.log("AI Response:", data);

    } catch (err) {
      console.error(err);

      toast.error("AI request failed");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            err.response?.data?.message ||
            "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    sendMessage(message.trim());
  };

  const handleQuickCommand = (command) => {
    sendMessage(command);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <aside className="w-96 bg-white border-l border-gray-200 flex flex-col">

      {/* Header */}
      <div className="p-5 border-b">
        <h2 className="text-xl font-bold flex items-center gap-2">
          🤖 AI Assistant
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Control your mailbox using natural language.
        </p>

        {/* Quick Commands */}
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            💡 Quick Commands
          </p>

          <div className="flex flex-wrap gap-2">
            {quickCommands.map((command) => (
              <button
                key={command}
                type="button"
                disabled={loading}
                onClick={() => handleQuickCommand(command)}
                className="text-xs bg-gray-100 hover:bg-blue-100 hover:text-blue-700 border border-gray-200 rounded-full px-3 py-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {command}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap shadow-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3 text-sm animate-pulse">
              🤖 Thinking...
            </div>
          </div>
        )}

        <div ref={bottomRef} />

      </div>

      {/* Input */}
      <div className="border-t p-4 flex gap-2">

        <input
          type="text"
          value={message}
          placeholder="Ask AI anything..."
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
        />

        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-600 text-white px-5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "..." : "Send"}
        </button>

      </div>

    </aside>
  );
}
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Send, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useEmail } from "../context/EmailContext";

export default function AssistantPanel() {
  const navigate = useNavigate();

  const { currentEmail, openSearch } = useEmail();

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
        "Hello! I'm your Processity Mail AI assistant. What can I help you with?",
    },
  ]);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", content: text },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const { data } = await api.post("/ai/chat", {
        message: text,
        currentEmailId: currentEmail?.id || "",
      });

      const result = data.result;
      let assistantReply =
        result?.reply || "Sorry, I couldn't understand that.";

      // Handle unread emails using actual API results.
      if (result?.intent === "SHOW_UNREAD") {
        if (Array.isArray(data.data)) {
          const unreadCount =
            data.resultSizeEstimate ?? data.data.length;

          if (unreadCount === 0) {
            assistantReply =
              "You don't have any unread emails in your inbox.";
            toast("No unread emails found.");
          } else {
            assistantReply =
              `I found ${unreadCount} unread ${
                unreadCount === 1 ? "email" : "emails"
              } in your inbox.`;

            toast.success(
              `${unreadCount} unread ${
                unreadCount === 1 ? "email" : "emails"
              } found`
            );
          }

          openSearch("is:unread in:inbox");
          navigate("/");
        } else {
          assistantReply =
            "I couldn't retrieve your unread emails. Please try again.";

          toast.error("Unable to retrieve unread emails.");
        }
      }

      // Handle latest email.
      if (
        result?.intent === "OPEN_LATEST_EMAIL" &&
        data.data
      ) {
        toast.success("Opening email...");
        navigate(`/email/${data.data.id}`);
      }

      // Handle general email search.
      if (
        result?.intent === "SEARCH_EMAILS" &&
        Array.isArray(data.data)
      ) {
        if (!result.query) {
          assistantReply = "I couldn't determine your search query.";
          toast.error("Search query was not returned.");
        } else {
          const matchingCount =
            data.resultSizeEstimate ?? data.data.length;

          assistantReply =
            matchingCount === 0
              ? "I couldn't find any emails matching your search."
              : `I found ${matchingCount} matching ${
                  matchingCount === 1 ? "email" : "emails"
                }.`;

          openSearch(result.query);

          if (matchingCount > 0) {
            toast.success(
              `${matchingCount} matching ${
                matchingCount === 1 ? "email" : "emails"
              } found`
            );
          } else {
            toast("No matching emails found.");
          }

          navigate("/");
        }
      }

      // Handle compose and reply.
      if (
        ["COMPOSE_EMAIL", "REPLY_EMAIL"].includes(result?.intent) &&
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

      // Display the final response after processing the API results.
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: assistantReply,
        },
      ]);
    } catch (error) {
      console.error("AI Assistant error:", error);

      toast.error("AI request failed");

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            error.response?.data?.message ||
            "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="assistant-panel">
      <div className="p-5 border-b border-[#eeeef2]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#edf4ff] text-[#0066cc] grid place-items-center">
            <Sparkles size={16} />
          </div>

          <div>
            <h2 className="text-[14px] font-semibold">Mail AI</h2>
            <p className="text-[10px] text-[#86868b]">
              Your intelligent assistant
            </p>
          </div>
        </div>

        <p className="text-[11px] text-[#86868b] mt-4 mb-3">
          TRY ASKING
        </p>

        <div className="flex flex-wrap gap-2">
          {quickCommands.map((command) => (
            <button
              key={command}
              type="button"
              disabled={loading}
              onClick={() => sendMessage(command)}
              className="assistant-chip disabled:opacity-40"
            >
              {command}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
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
              className={`max-w-[92%] rounded-2xl px-3 py-2.5 text-[11px] leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-[#0071e3] text-white rounded-br-md"
                  : "bg-[#f5f5f7] text-[#333336] rounded-bl-md"
              }`}
            >
              {msg.role === "assistant" && (
                <Bot
                  size={13}
                  className="inline mr-1 text-[#0071e3]"
                />
              )}

              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <p className="text-[11px] text-[#86868b] animate-pulse">
            Thinking...
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage(message.trim());
        }}
        className="p-4 border-t border-[#eeeef2] flex gap-2"
      >
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask about your mail..."
          disabled={loading}
          className="assistant-input"
        />

        <button
          aria-label="Send message"
          disabled={loading || !message.trim()}
          className="w-10 shrink-0 rounded-xl bg-[#0071e3] text-white grid place-items-center disabled:opacity-40"
        >
          <Send size={15} />
        </button>
      </form>
    </aside>
  );
}
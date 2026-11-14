import { useState } from "react";
import api from "../api/axios";

export default function AIChat() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      setLoading(true);

      const res = await api.post("/ai/chat", {
        message,
      });

      setReply(res.data.reply);
    } catch (err) {
      console.error(err);

      setReply("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">

      <div className="flex-1 overflow-auto">

        <div className="bg-gray-100 rounded-lg p-3 text-sm whitespace-pre-wrap">
          {reply || "Ask anything about your mailbox..."}
        </div>

      </div>

      <div className="mt-4 flex gap-2">

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask AI..."
          className="flex-1 border rounded-lg px-3 py-2"
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 text-white px-4 rounded-lg"
        >
          {loading ? "..." : "Send"}
        </button>

      </div>

    </div>
  );
}
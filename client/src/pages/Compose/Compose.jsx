import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function Compose() {
  const location = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    to: "",
    subject: "",
    body: "",
  });

  const [loading, setLoading] = useState(false);
  // const [message, setMessage] = useState("");

  useEffect(() => {
    if (location.state) {
      setForm({
        to: location.state.to || "",
        subject: location.state.subject || "",
        body: location.state.body || "",
      });

      // Clear router state so it doesn't refill next time
      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSend = async (e) => {
    e.preventDefault();

    setLoading(true);
    // setMessage("");

    try {
      await api.post("/auth/send", form);

      toast.success("Email sent successfully!");

setTimeout(() => {
  navigate("/");
}, 1000);

      setForm({
        to: "",
        subject: "",
        body: "",
      });

    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message || "Failed to send email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-3xl font-bold mb-8">
        Compose Email
      </h1>

      <form onSubmit={handleSend} className="space-y-6">

        <div>
          <label className="block text-sm font-semibold mb-2">
            To
          </label>

          <input
            type="email"
            name="to"
            value={form.to}
            onChange={handleChange}
            placeholder="recipient@example.com"
            required
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Subject
          </label>

          <input
            type="text"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="Email subject"
            required
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Message
          </label>

          <textarea
            name="body"
            value={form.body}
            onChange={handleChange}
            rows={12}
            placeholder="Write your email..."
            required
            className="w-full border rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-4">

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Sending Email..." : "Send Email"}
          </button>

          {/* {message && (
            <p className="text-sm font-medium">
              {message}
            </p>
          )} */}

        </div>

      </form>
    </div>
  );
}
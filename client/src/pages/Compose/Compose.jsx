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
        err.response?.data?.message ||
          "Failed to send email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-lg p-8 transition-colors">

      <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">
        ✉️ Compose Email
      </h1>

      <form
        onSubmit={handleSend}
        className="space-y-6"
      >

        {/* To */}

        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
            To
          </label>

          <input
            type="email"
            name="to"
            value={form.to}
            onChange={handleChange}
            placeholder="recipient@example.com"
            required
            className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-3 outline-none transition focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Subject */}

        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
            Subject
          </label>

          <input
            type="text"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="Email subject"
            required
            className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-3 outline-none transition focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Message */}

        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
            Message
          </label>

          <textarea
            name="body"
            value={form.body}
            onChange={handleChange}
            rows={12}
            placeholder="Write your email..."
            required
            className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-3 resize-none outline-none transition focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Buttons */}

        <div className="flex items-center gap-4">

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Sending Email..." : "Send Email"}
          </button>

        </div>

      </form>

    </div>
  );
}
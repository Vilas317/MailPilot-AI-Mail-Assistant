import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Send, X } from "lucide-react";
import api from "../../api/axios";

export default function Compose() {
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ to: "", subject: "", body: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!location.state) return;
    setForm({ to: location.state.to || "", subject: location.state.subject || "", body: location.state.body || "" });
    navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  const handleChange = (event) => setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));

  const handleSend = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/send", form);
      toast.success("Email sent successfully!");
      setForm({ to: "", subject: "", body: "" });
      navigate("/sent");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send email.");
    } finally { setLoading(false); }
  };

  return (
    <section className="max-w-[920px] mx-auto">
      <div className="mb-7"><p className="page-eyebrow">New message</p><h1 className="page-title">Compose</h1><p className="page-subtitle">A little clarity goes a long way.</p></div>
      <form onSubmit={handleSend} className="compose-card">
        <div className="compose-line"><label htmlFor="to">To</label><input id="to" type="email" name="to" value={form.to} onChange={handleChange} placeholder="name@example.com" required /></div>
        <div className="compose-line"><label htmlFor="subject">Subject</label><input id="subject" type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="What's this about?" required /></div>
        <textarea aria-label="Message" name="body" value={form.body} onChange={handleChange} placeholder="Write your message..." className="compose-body" required />
        <div className="compose-actions">
          <button type="submit" disabled={loading} className="primary-btn inline-flex items-center gap-2"><Send size={14}/>{loading ? "Sending..." : "Send message"}</button>
          <button type="button" onClick={() => navigate(-1)} className="secondary-btn inline-flex items-center gap-2"><X size={14}/>Discard</button>
        </div>
      </form>
    </section>
  );
}

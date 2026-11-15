export default function EmailCard({ email, onClick }) {
  const senderInitial = email.sender?.trim()?.charAt(0)?.toUpperCase() || "?";
  return (
    <article onClick={onClick} onKeyDown={(event) => event.key === "Enter" && onClick?.()} role="button" tabIndex={0} className={`email-row ${email.unread ? "unread" : ""}`}>
      {email.unread && <span className="w-2 h-2 rounded-full bg-[#0071e3] shrink-0" aria-label="Unread" />}
      <div className="email-avatar">{senderInitial}</div>
      <div className="email-content">
        <div className="flex items-center gap-2 min-w-0"><h3 className={`email-sender truncate ${email.unread ? "font-bold" : ""}`}>{email.sender || "Unknown sender"}</h3>{email.unread && <span className="new-pill">New</span>}</div>
        <h4 className={`email-subject truncate ${email.unread ? "font-semibold" : ""}`}>{email.subject || "(No subject)"}</h4>
        <p className="email-preview">{email.preview || "No preview available"}</p>
      </div>
      <time className="email-date">{email.date ? new Date(email.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</time>
    </article>
  );
}

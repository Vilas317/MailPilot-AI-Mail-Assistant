export default function EmailCard({ email, onClick }) {
  const senderInitial = email.sender
    ? email.sender.charAt(0).toUpperCase()
    : "?";

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        email.unread
          ? "border-blue-200 bg-blue-50/40"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
            {senderInitial}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className={`truncate ${
                  email.unread
                    ? "font-bold text-gray-900"
                    : "font-semibold text-gray-800"
                }`}
              >
                {email.sender}
              </h3>

              {email.unread && (
                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                  New
                </span>
              )}
            </div>

            <h4
              className={`mt-1 truncate ${
                email.unread
                  ? "font-semibold text-gray-900"
                  : "font-medium text-gray-700"
              }`}
            >
              {email.subject}
            </h4>

            <p className="mt-2 line-clamp-2 text-sm text-gray-600">
              {email.preview}
            </p>
          </div>
        </div>

        <span className="shrink-0 text-xs text-gray-500">
          {email.date}
        </span>
      </div>
    </div>
  );
}
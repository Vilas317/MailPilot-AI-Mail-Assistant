import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import EmailCard from "../../components/EmailCard";
import { useEmail } from "../../context/EmailContext";

export default function Inbox() {
  const navigate = useNavigate();

  const { emails, setEmails } = useEmail();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't fetch again if emails already exist in Context
    if (emails.length > 0) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/emails")
      .then((res) => {
        setEmails(res.data.emails);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [emails, setEmails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-gray-500 dark:text-slate-400 animate-pulse">
          Loading emails...
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
        Inbox
      </h1>

      {emails.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-12 text-center transition-colors">
          <div className="text-6xl mb-4">📭</div>

          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            No emails found
          </h2>

          <p className="mt-2 text-gray-500 dark:text-slate-400">
            Try another search or check back later.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {emails.map((email) => (
            <EmailCard
              key={email.id}
              email={email}
              onClick={() =>
                navigate(`/email/${email.id}`, {
                  state: email,
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
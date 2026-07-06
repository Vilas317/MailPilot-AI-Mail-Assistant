import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../api/axios";

export default function Sent() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSentEmails();
  }, []);

  const fetchSentEmails = async () => {
    try {
      const res = await api.get("/auth/sent");
      setEmails(res.data.emails);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-gray-500 dark:text-slate-400 animate-pulse">
          Loading Sent Emails...
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
        Sent
      </h1>

      {emails.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-12 text-center transition-colors">
          <div className="text-6xl mb-4">📤</div>

          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            No sent emails found
          </h2>

          <p className="mt-2 text-gray-500 dark:text-slate-400">
            Emails you send will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {emails.map((email) => (
            <Link
              key={email.id}
              to={`/email/${email.id}`}
              className="block"
            >
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 p-5">

                <div className="flex justify-between items-start">

                  <div className="min-w-0">

                    <h2 className="font-semibold text-lg text-slate-900 dark:text-white truncate">
                      {email.receiver}
                    </h2>

                    <p className="mt-1 font-medium text-slate-700 dark:text-slate-300 truncate">
                      {email.subject}
                    </p>

                  </div>

                  <span className="ml-4 shrink-0 text-sm text-gray-500 dark:text-slate-500">
                    {email.date}
                  </span>

                </div>

                <p className="mt-3 line-clamp-2 text-gray-600 dark:text-slate-400">
                  {email.preview}
                </p>

              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
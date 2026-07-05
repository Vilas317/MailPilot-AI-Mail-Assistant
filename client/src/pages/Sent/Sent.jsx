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
      <h2 className="text-xl font-semibold">
        Loading Sent Emails...
      </h2>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Sent
      </h1>

      <div className="space-y-4">
        {emails.map((email) => (
          <Link
            key={email.id}
            to={`/email/${email.id}`}
            className="block"
          >
            <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-5 border">

              <div className="flex justify-between items-start">

                <div>

                  <h2 className="font-semibold text-lg">
                    {email.receiver}
                  </h2>

                  <p className="font-medium">
                    {email.subject}
                  </p>

                </div>

                <span className="text-sm text-gray-500">
                  {email.date}
                </span>

              </div>

              <p className="text-gray-500 mt-3 line-clamp-2">
                {email.preview}
              </p>

            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
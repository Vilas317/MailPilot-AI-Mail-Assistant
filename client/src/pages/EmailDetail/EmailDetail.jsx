import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import { useEmail } from "../../context/EmailContext";

export default function EmailDetail() {
  const { id } = useParams();

  const { setCurrentEmail } = useEmail();

  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/auth/emails/${id}`)
      .then((res) => {
        setEmail(res.data.email);

        // Store the currently opened email
        setCurrentEmail(res.data.email);
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });
  }, [id, setCurrentEmail]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-lg text-gray-500 dark:text-slate-400 animate-pulse">
          Loading email...
        </p>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm p-12 text-center transition-colors">

        <div className="text-6xl mb-4">📭</div>

        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Email not found
        </h2>

        <p className="mt-2 text-gray-500 dark:text-slate-400">
          The email may have been deleted or is no longer available.
        </p>

      </div>
    );
  }

  const headers = email.payload?.headers || [];

  const getHeader = (name) =>
    headers.find((h) => h.name === name)?.value || "";

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm p-8 transition-colors">

      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        {getHeader("Subject")}
      </h1>

      <div className="mt-6 space-y-3 text-sm text-gray-700 dark:text-slate-300">

        <div>
          <span className="font-semibold">From:</span>{" "}
          {getHeader("From")}
        </div>

        <div>
          <span className="font-semibold">To:</span>{" "}
          {getHeader("To")}
        </div>

        <div>
          <span className="font-semibold">Date:</span>{" "}
          {getHeader("Date")}
        </div>

      </div>

      <hr className="my-8 border-gray-200 dark:border-slate-700" />

      <div
        className="prose prose-gray dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{
          __html: email.decodedBody || email.snippet,
        }}
      />

    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import EmailCard from "../../components/EmailCard";
import { useEmail } from "../../context/EmailContext";

const EMAILS_PER_PAGE = 10;

export default function Inbox() {
  const navigate = useNavigate();

  const {
    emails,
    setEmails,
    inboxRefreshKey,
  } = useEmail();

  const [loading, setLoading] = useState(true);
  const [pageToken, setPageToken] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);

  const [pageTokens, setPageTokens] = useState([null]);
  const [currentPage, setCurrentPage] = useState(1);

  const [totalEmails, setTotalEmails] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchEmails = async () => {
      setLoading(true);
      setError("");

      try {
        const params = pageToken
          ? { pageToken }
          : {};

        const { data } = await api.get("/auth/emails", {
          params,
        });

        if (!isMounted) return;

        setEmails(data.emails || []);
        setNextPageToken(data.nextPageToken || null);
        setTotalEmails(data.resultSizeEstimate || 0);

      } catch (err) {
        console.error("Failed to fetch inbox:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
            "Failed to load emails. Please try again."
          );
        }

      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEmails();

    return () => {
      isMounted = false;
    };
  }, [pageToken, inboxRefreshKey, setEmails]);

  const totalPages = Math.max(
    1,
    Math.ceil(totalEmails / EMAILS_PER_PAGE)
  );

  const handleNext = () => {
    if (!nextPageToken || loading) return;

    setPageTokens((prev) => [
      ...prev.slice(0, currentPage),
      nextPageToken,
    ]);

    setPageToken(nextPageToken);
    setCurrentPage((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentPage <= 1 || loading) return;

    const previousToken = pageTokens[currentPage - 2];

    setPageToken(previousToken);
    setCurrentPage((prev) => prev - 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-gray-500 animate-pulse">
          Loading emails...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          Inbox
        </h1>

        <span className="text-sm text-gray-500">
          {totalEmails} emails
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-4">
          {error}
        </div>
      )}

      {/* Email List */}
      {!error && emails.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">
            📭
          </div>

          <h2 className="text-2xl font-semibold text-gray-800">
            No emails found
          </h2>

          <p className="mt-2 text-gray-500">
            Your inbox is currently empty.
          </p>
        </div>
      ) : (
        <>
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

          {/* Pagination */}
          <div className="flex items-center justify-center gap-5 mt-8 mb-6">

            <button
              onClick={handlePrevious}
              disabled={currentPage === 1 || loading}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            <span className="text-sm font-semibold text-gray-700">
              {currentPage} / {Math.max(totalPages, currentPage)}
            </span>

            <button
              onClick={handleNext}
              disabled={!nextPageToken || loading}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>

          </div>
        </>
      )}
    </div>
  );
}
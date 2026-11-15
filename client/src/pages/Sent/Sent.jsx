import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useEmail } from "../../context/EmailContext";

const EMAILS_PER_PAGE = 10;

export default function Sent() {
  const { sentRefreshKey } = useEmail();

  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination state
  const [pageToken, setPageToken] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [pageTokens, setPageTokens] = useState([null]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEmails, setTotalEmails] = useState(0);

  // Reset pagination whenever the Sent page is refreshed.
  useEffect(() => {
    setPageToken(null);
    setNextPageToken(null);
    setPageTokens([null]);
    setCurrentPage(1);
  }, [sentRefreshKey]);

  // Fetch sent emails.
  useEffect(() => {
    let isMounted = true;

    const controller = new AbortController();

    const fetchSentEmails = async () => {
      setLoading(true);
      setError("");

      try {
        const params = pageToken ? { pageToken } : {};

        const { data } = await api.get("/auth/sent", {
          params,
          signal: controller.signal,
        });

        if (!isMounted) return;

        setEmails(data.emails || []);
        setNextPageToken(data.nextPageToken || null);
        setTotalEmails(data.resultSizeEstimate || 0);
      } catch (err) {
        if (
          err.name === "CanceledError" ||
          err.code === "ERR_CANCELED"
        ) {
          return;
        }

        console.error("Failed to fetch sent emails:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "Failed to load sent emails. Please try again."
          );
        }
      } finally {
        if (isMounted && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchSentEmails();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [pageToken, sentRefreshKey]);

  // Next page
  const handleNext = () => {
    if (!nextPageToken || loading) return;

    setPageTokens((prev) => [
      ...prev.slice(0, currentPage),
      nextPageToken,
    ]);

    setPageToken(nextPageToken);
    setCurrentPage((prev) => prev + 1);
  };

  // Previous page
  const handlePrevious = () => {
    if (currentPage <= 1 || loading) return;

    const previousToken = pageTokens[currentPage - 2];

    setPageToken(previousToken);
    setCurrentPage((prev) => prev - 1);
  };

  const totalPages = Math.max(
    1,
    Math.ceil(totalEmails / EMAILS_PER_PAGE)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-gray-500 animate-pulse">
          Loading sent emails...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between gap-4 mb-7">
        <div>
          <p className="page-eyebrow">Mailbox</p>
          <h1 className="page-title">Sent</h1>
          <p className="page-subtitle">
            A record of the messages you've sent.
          </p>
        </div>

        <span className="text-xs text-[#86868b] pb-1">
          {totalEmails} messages
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-4">
          {error}
        </div>
      )}

      {/* Sent Emails */}
      {!error && emails.length === 0 ? (
        <div className="empty-state">
          <div className="text-6xl mb-4">📤</div>

          <h2 className="text-2xl font-semibold text-gray-800">
            No sent emails found
          </h2>

          <p className="mt-2 text-gray-500">
            Emails you send will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="border-t border-[#eeeef2]">
            {emails.map((email) => (
              <Link
                key={email.id}
                to={`/email/${email.id}`}
                className="block"
              >
                <div className="email-row">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="email-sender">
                        {email.receiver}
                      </h2>

                      <p className="email-subject">
                        {email.subject}
                      </p>
                    </div>

                    <span className="email-date">
                      {email.date}
                    </span>
                  </div>

                  <p className="email-preview">
                    {email.preview}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-5 mt-8 mb-6">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1 || loading}
              className="pagination-btn"
            >
              ← Previous
            </button>

            <span className="text-xs font-medium text-[#6e6e73]">
              {currentPage} / {Math.max(totalPages, currentPage)}
            </span>

            <button
              onClick={handleNext}
              disabled={!nextPageToken || loading}
              className="pagination-btn"
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
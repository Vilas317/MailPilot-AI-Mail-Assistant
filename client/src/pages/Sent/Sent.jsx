import { useEffect, useRef, useState } from "react";
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

  // Remember the last refresh key
  const previousRefreshKey = useRef(sentRefreshKey);

  // Reset pagination when Sent is clicked
  useEffect(() => {
    if (previousRefreshKey.current === sentRefreshKey) {
      return;
    }

    previousRefreshKey.current = sentRefreshKey;

    setPageToken(null);
    setNextPageToken(null);
    setPageTokens([null]);
    setCurrentPage(1);

  }, [sentRefreshKey]);

  // Fetch sent emails
  useEffect(() => {
    let isMounted = true;

    const controller = new AbortController();

    const fetchSentEmails = async () => {
      setLoading(true);
      setError("");

      try {
        const params = pageToken
          ? { pageToken }
          : {};

        const { data } = await api.get("/auth/sent", {
          params,
          signal: controller.signal,
        });

        if (!isMounted) return;

        setEmails(data.emails || []);

        setNextPageToken(
          data.nextPageToken || null
        );

        setTotalEmails(
          data.resultSizeEstimate || 0
        );

      } catch (err) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
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

  }, [pageToken]);

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
      <div className="flex items-center justify-between mb-6">

        <h1 className="text-3xl font-bold">
          Sent
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

      {/* Sent Emails */}
      {!error && emails.length === 0 ? (

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">

          <div className="text-6xl mb-4">
            📤
          </div>

          <h2 className="text-2xl font-semibold text-gray-800">
            No sent emails found
          </h2>

          <p className="mt-2 text-gray-500">
            Emails you send will appear here.
          </p>

        </div>

      ) : (

        <>
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
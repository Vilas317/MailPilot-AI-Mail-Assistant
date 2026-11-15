import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import EmailCard from "../../components/EmailCard";
import { useEmail } from "../../context/EmailContext";

const EMAILS_PER_PAGE = 10;

const initialPagination = {
  pageToken: null,
  nextPageToken: null,
  pageTokens: [null],
  currentPage: 1,
  totalEmails: 0,
};

export default function Inbox() {
  const navigate = useNavigate();

  const {
    emails,
    setEmails,
    inboxRefreshKey,
    viewMode,
    searchQuery,
  } = useEmail();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Independent Inbox pagination
  const [inboxPagination, setInboxPagination] = useState({
    ...initialPagination,
  });

  // Independent Search pagination
  const [searchPagination, setSearchPagination] = useState({
    ...initialPagination,
  });

  // Reset search pagination when a new query is submitted
  useEffect(() => {
    setSearchPagination({
      ...initialPagination,
    });
  }, [searchQuery]);

  // Reset Inbox pagination whenever Inbox is clicked
useEffect(() => {
  setInboxPagination({
    ...initialPagination,
  });
}, [inboxRefreshKey]);

  // Select active pagination state
  const activePagination =
    viewMode === "search"
      ? searchPagination
      : inboxPagination;

  const setActivePagination =
    viewMode === "search"
      ? setSearchPagination
      : setInboxPagination;

  const {
    pageToken,
    nextPageToken,
    pageTokens,
    currentPage,
    totalEmails,
  } = activePagination;

  // Fetch active view
  useEffect(() => {
    let isMounted = true;

    const fetchEmails = async () => {
      setLoading(true);
      setError("");

      try {
        let response;

        if (viewMode === "search") {
          if (!searchQuery) {
            setEmails([]);
            setLoading(false);
            return;
          }

          response = await api.post("/ai/chat", {
            searchQuery,
            pageToken,
          });

        } else {
          response = await api.get("/auth/emails", {
            params: pageToken
              ? { pageToken }
              : {},
          });
        }

        if (!isMounted) return;

        const data = response.data;

        const fetchedEmails =
          viewMode === "search"
            ? data.data || []
            : data.emails || [];

        setEmails(fetchedEmails);

        setActivePagination((prev) => ({
          ...prev,
          nextPageToken: data.nextPageToken || null,
          totalEmails: data.resultSizeEstimate || 0,
        }));

      } catch (err) {
        console.error("Failed to fetch emails:", err);

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

  }, [
    pageToken,
    inboxRefreshKey,
    viewMode,
    searchQuery,
    setEmails,
  ]);

  // Next page
  const handleNext = () => {
    if (!nextPageToken || loading) return;

    setActivePagination((prev) => ({
      ...prev,

      pageTokens: [
        ...prev.pageTokens.slice(0, prev.currentPage),
        nextPageToken,
      ],

      pageToken: nextPageToken,
      currentPage: prev.currentPage + 1,
    }));
  };

  // Previous page
  const handlePrevious = () => {
    if (currentPage <= 1 || loading) return;

    const previousToken = pageTokens[currentPage - 2];

    setActivePagination((prev) => ({
      ...prev,
      pageToken: previousToken,
      currentPage: prev.currentPage - 1,
    }));
  };

  const totalPages = Math.max(
    1,
    Math.ceil(totalEmails / EMAILS_PER_PAGE)
  );

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
          {viewMode === "search"
            ? "Search Results"
            : "Inbox"}
        </h1>

        <span className="text-sm text-gray-500">
          {totalEmails} emails
        </span>

      </div>

      {/* Active search */}
      {viewMode === "search" && (
        <div className="mb-5 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <p className="text-sm text-blue-800">
            Showing results for:{" "}
            <strong>{searchQuery}</strong>
          </p>
        </div>
      )}

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
            {viewMode === "search"
              ? "No emails matched your search."
              : "Your inbox is currently empty."}
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
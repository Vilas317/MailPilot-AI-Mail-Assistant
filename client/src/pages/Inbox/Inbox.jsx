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

  // Reset search pagination when a new query is submitted.
  useEffect(() => {
    setSearchPagination({ ...initialPagination });
  }, [searchQuery]);

  // Reset Inbox pagination whenever Inbox is refreshed.
  useEffect(() => {
    setInboxPagination({ ...initialPagination });
  }, [inboxRefreshKey]);

  // Select active pagination state.
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

  // Fetch active view.
  useEffect(() => {
    let isMounted = true;

    const controller = new AbortController();

    const fetchEmails = async () => {
      setLoading(true);
      setError("");

      try {
        // Handle empty search queries.
        if (viewMode === "search" && !searchQuery) {
          if (isMounted) {
            setEmails([]);
          }
          return;
        }

        let response;

        if (viewMode === "search") {
          response = await api.post(
            "/ai/chat",
            {
              searchQuery,
              pageToken,
            },
            {
              signal: controller.signal,
            }
          );
        } else {
          response = await api.get("/auth/emails", {
            params: pageToken ? { pageToken } : {},
            signal: controller.signal,
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
        if (
          err.name === "CanceledError" ||
          err.code === "ERR_CANCELED"
        ) {
          return;
        }

        console.error("Failed to fetch emails:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "Failed to load emails. Please try again."
          );
        }
      } finally {
        if (isMounted && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchEmails();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [
    pageToken,
    inboxRefreshKey,
    viewMode,
    searchQuery,
    setEmails,
    setActivePagination,
  ]);

  // Next page.
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

  // Previous page.
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
      <div className="flex items-end justify-between gap-4 mb-7">
        <div>
          <p className="page-eyebrow">
            {viewMode === "search" ? "Mailbox search" : "Your mailbox"}
          </p>

          <h1 className="page-title">
            {viewMode === "search" ? "Search Results" : "Inbox"}
          </h1>

          <p className="page-subtitle">
            {viewMode === "search"
              ? `Results for ${searchQuery}`
              : "A calmer space for everything that matters."}
          </p>
        </div>

        <span className="text-xs text-[#86868b] pb-1">
          {totalEmails} messages
        </span>
      </div>

      {/* Active search */}
      {viewMode === "search" && (
        <div className="mb-5 bg-[#f5f8ff] border border-[#e4edfb] rounded-xl px-4 py-3">
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
        <div className="empty-state">
          <div className="text-6xl mb-4">📭</div>

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
          <div className="border-t border-[#eeeef2]">
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
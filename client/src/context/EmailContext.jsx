import { createContext, useContext, useState } from "react";

const EmailContext = createContext();

export function EmailProvider({ children }) {
  const [emails, setEmails] = useState([]);

  const [currentEmail, setCurrentEmail] = useState(null);

  // Normal inbox refresh
  const [inboxRefreshKey, setInboxRefreshKey] = useState(0);

  // Current view: inbox or search
  const [viewMode, setViewMode] = useState("inbox");

  // Active Gmail search query
  const [searchQuery, setSearchQuery] = useState("");

  // Return to normal Inbox
  const refreshInbox = () => {
    setViewMode("inbox");
    setSearchQuery("");

    setInboxRefreshKey((prev) => prev + 1);
  };

  // Start a new Gmail search
  const openSearch = (query) => {
    setSearchQuery(query);
    setViewMode("search");
  };

  return (
    <EmailContext.Provider
      value={{
        emails,
        setEmails,

        currentEmail,
        setCurrentEmail,

        inboxRefreshKey,
        refreshInbox,

        viewMode,
        setViewMode,

        searchQuery,
        setSearchQuery,

        openSearch,
      }}
    >
      {children}
    </EmailContext.Provider>
  );
}

export function useEmail() {
  return useContext(EmailContext);
}
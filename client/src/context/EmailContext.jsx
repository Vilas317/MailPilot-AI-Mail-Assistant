import { createContext, useContext, useState } from "react";

const EmailContext = createContext();

export function EmailProvider({ children }) {
  const [emails, setEmails] = useState([]);
  const [currentEmail, setCurrentEmail] = useState(null);

  // Inbox refresh
  const [inboxRefreshKey, setInboxRefreshKey] = useState(0);

  // Sent refresh
  const [sentRefreshKey, setSentRefreshKey] = useState(0);

  // Current view
  const [viewMode, setViewMode] = useState("inbox");

  // Gmail search
  const [searchQuery, setSearchQuery] = useState("");

  const refreshInbox = () => {
    setViewMode("inbox");
    setSearchQuery("");
    setInboxRefreshKey((prev) => prev + 1);
  };

  const refreshSent = () => {
    setSentRefreshKey((prev) => prev + 1);
  };

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

        sentRefreshKey,
        refreshSent,

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
import { createContext, useContext, useState } from "react";

const EmailContext = createContext();

export function EmailProvider({ children }) {
  const [emails, setEmails] = useState([]);
  const [currentEmail, setCurrentEmail] = useState(null);

  const [inboxRefreshKey, setInboxRefreshKey] = useState(0);

  const refreshInbox = () => {
    setInboxRefreshKey((prev) => prev + 1);
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
      }}
    >
      {children}
    </EmailContext.Provider>
  );
}

export function useEmail() {
  return useContext(EmailContext);
}
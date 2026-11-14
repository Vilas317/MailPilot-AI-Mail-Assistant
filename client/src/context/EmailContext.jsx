import { createContext, useContext, useState } from "react";

const EmailContext = createContext();

export function EmailProvider({ children }) {
  const [emails, setEmails] = useState([]);

  // Currently opened email
  const [currentEmail, setCurrentEmail] = useState(null);

  return (
    <EmailContext.Provider
      value={{
        emails,
        setEmails,
        currentEmail,
        setCurrentEmail,
      }}
    >
      {children}
    </EmailContext.Provider>
  );
}

export function useEmail() {
  return useContext(EmailContext);
}
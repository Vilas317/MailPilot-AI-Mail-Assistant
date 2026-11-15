const { google } = require("googleapis");

const createGmailClient = (user) => {
  const oauth2Client = new google.auth.OAuth2();

  oauth2Client.setCredentials({
    access_token: user.accessToken,
  });

  return google.gmail({
    version: "v1",
    auth: oauth2Client,
  });
};

// Helper to clean sender name
const cleanSender = (sender = "") => {
  return sender.replace(/<.*?>/, "").trim();
};

const extractEmail = (sender = "") => {
  const match = sender.match(/<(.+?)>/);

  if (match) {
    return match[1];
  }

  return sender.trim();
};

// Convert Gmail message metadata into frontend email object
const getEmailMetadata = async (gmail, msg, headersToFetch = [
  "From",
  "Subject",
  "Date",
]) => {
  const mail = await gmail.users.messages.get({
    userId: "me",
    id: msg.id,
    format: "metadata",
    metadataHeaders: headersToFetch,
  });

  const headers = mail.data.payload?.headers || [];

  const getHeader = (name) =>
    headers.find(
      (h) => h.name.toLowerCase() === name.toLowerCase()
    )?.value || "";

  return {
    id: msg.id,
    threadId: msg.threadId,
    sender: cleanSender(getHeader("From")),
    subject: getHeader("Subject"),
    date: getHeader("Date"),
    preview: mail.data.snippet,
    unread: mail.data.labelIds?.includes("UNREAD") || false,
  };
};

// Normal Inbox - existing functionality
exports.getInbox = async (user) => {
  const gmail = createGmailClient(user);

  const response = await gmail.users.messages.list({
    userId: "me",
    maxResults: 10,
    labelIds: ["INBOX"],
  });

  const messages = response.data.messages || [];

  const emails = await Promise.all(
    messages.map((msg) =>
      getEmailMetadata(gmail, msg)
    )
  );

  emails.sort((a, b) => {
    if (a.unread === b.unread) return 0;
    return a.unread ? -1 : 1;
  });

  return emails;
};

// Decode Gmail message body
const decodeBody = (payload) => {
  if (!payload) return "";

  if (
    (payload.mimeType === "text/html" ||
      payload.mimeType === "text/plain") &&
    payload.body?.data
  ) {
    return Buffer.from(
      payload.body.data
        .replace(/-/g, "+")
        .replace(/_/g, "/"),
      "base64"
    ).toString("utf8");
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      const body = decodeBody(part);

      if (body) return body;
    }
  }

  return "";
};

// Sent emails
exports.getSentEmails = async (user) => {
  const gmail = createGmailClient(user);

  const response = await gmail.users.messages.list({
    userId: "me",
    maxResults: 10,
    labelIds: ["SENT"],
  });

  const messages = response.data.messages || [];

  const emails = await Promise.all(
    messages.map(async (msg) => {
      const mail = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "metadata",
        metadataHeaders: ["To", "Subject", "Date"],
      });

      const headers = mail.data.payload?.headers || [];

      const getHeader = (name) =>
        headers.find(
          (h) => h.name.toLowerCase() === name.toLowerCase()
        )?.value || "";

      return {
        id: msg.id,
        threadId: msg.threadId,
        receiver: getHeader("To"),
        subject: getHeader("Subject"),
        date: getHeader("Date"),
        preview: mail.data.snippet,
      };
    })
  );

  return emails;
};

// SENT EMAILS WITH PAGINATION
exports.getSentEmailsPage = async (user, pageToken = null) => {
  const gmail = createGmailClient(user);

  const params = {
    userId: "me",
    maxResults: 10,
    labelIds: ["SENT"],
  };

  if (pageToken) {
    params.pageToken = pageToken;
  }

  const response = await gmail.users.messages.list(params);

  const messages = response.data.messages || [];

  const emails = await Promise.all(
    messages.map(async (msg) => {
      const mail = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "metadata",
        metadataHeaders: ["To", "Subject", "Date"],
      });

      const headers = mail.data.payload?.headers || [];

      const getHeader = (name) =>
        headers.find(
          (h) => h.name.toLowerCase() === name.toLowerCase()
        )?.value || "";

      return {
        id: msg.id,
        threadId: msg.threadId,
        receiver: getHeader("To"),
        subject: getHeader("Subject"),
        date: getHeader("Date"),
        preview: mail.data.snippet,
      };
    })
  );

  return {
    emails,
    nextPageToken: response.data.nextPageToken || null,
    resultSizeEstimate: response.data.resultSizeEstimate || 0,
  };
};

// Get a single email
exports.getEmail = async (user, id) => {
  const gmail = createGmailClient(user);

  const response = await gmail.users.messages.get({
    userId: "me",
    id,
    format: "full",
  });

  const email = response.data;

  email.decodedBody = decodeBody(email.payload);

  return email;
};

// Send email
exports.sendEmail = async (user, { to, subject, body }) => {
  const gmail = createGmailClient(user);

  const htmlBody = body.replace(/\n/g, "<br>");

  const message = [
    `To: ${to}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    `Subject: ${subject}`,
    "",
    htmlBody,
  ].join("\r\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });

  return response.data;
};

// Unread emails
exports.getUnreadEmails = async (user) => {
  const emails = await exports.getInbox(user);

  return emails.filter((email) => email.unread);
};

// Latest email
exports.getLatestEmail = async (user) => {
  const emails = await exports.getInbox(user);

  if (emails.length === 0) {
    return null;
  }

  return exports.getEmail(user, emails[0].id);
};

// SEARCH EMAILS WITH PAGINATION
exports.searchEmails = async (
  user,
  query,
  pageToken = null
) => {
  const gmail = createGmailClient(user);

  const params = {
    userId: "me",
    q: query,
    maxResults: 10,
    includeSpamTrash: false,
  };

  if (pageToken) {
    params.pageToken = pageToken;
  }

  const response = await gmail.users.messages.list(params);

  const messages = response.data.messages || [];

  const emails = await Promise.all(
    messages.map((msg) =>
      getEmailMetadata(gmail, msg)
    )
  );

  return {
    emails,
    nextPageToken: response.data.nextPageToken || null,
    resultSizeEstimate: response.data.resultSizeEstimate || 0,
  };
};

// Latest reply data
exports.getLatestReplyData = async (user) => {
  const email = await exports.getLatestEmail(user);

  if (!email) {
    return null;
  }

  const headers = email.payload.headers || [];

  const getHeader = (name) =>
    headers.find(
      (h) => h.name.toLowerCase() === name.toLowerCase()
    )?.value || "";

  const from = getHeader("From");
  const subject = getHeader("Subject");

  return {
    email,
    to: extractEmail(from),
    subject: subject.startsWith("Re:")
      ? subject
      : `Re: ${subject}`,
  };
};

// NORMAL INBOX PAGINATION
exports.getInboxPage = async (
  user,
  pageToken = null
) => {
  const gmail = createGmailClient(user);

  const params = {
    userId: "me",
    maxResults: 10,
    labelIds: ["INBOX"],
  };

  if (pageToken) {
    params.pageToken = pageToken;
  }

  const response = await gmail.users.messages.list(params);

  const messages = response.data.messages || [];

  const emails = await Promise.all(
    messages.map((msg) =>
      getEmailMetadata(gmail, msg)
    )
  );

  emails.sort((a, b) => {
    if (a.unread === b.unread) return 0;
    return a.unread ? -1 : 1;
  });

  return {
    emails,
    nextPageToken: response.data.nextPageToken || null,
    resultSizeEstimate: response.data.resultSizeEstimate || 0,
  };
};
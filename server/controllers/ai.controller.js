const {
  detectIntent,
  summarizeEmail,
  generateReply,
} = require("../services/ai.service");

const {
  getUnreadEmails,
  getLatestEmail,
  getLatestReplyData,
  getEmail,
  searchEmails,
} = require("../services/gmail.service");

exports.chat = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const {
      message,
      currentEmailId,
      searchQuery,
      pageToken,
    } = req.body;

    // SEARCH PAGINATION
    // This must run before detectIntent().
    // Clicking Next/Previous does not require another AI call.

    if (typeof searchQuery === "string" && searchQuery.trim()) {
      const searchResult = await searchEmails(
        req.user,
        searchQuery.trim(),
        pageToken || null
      );

      return res.json({
        success: true,

        result: {
          intent: "SEARCH_EMAILS",
          query: searchQuery,
          reply: "Here are your search results.",
        },

        data: searchResult.emails,
        nextPageToken: searchResult.nextPageToken,
        resultSizeEstimate: searchResult.resultSizeEstimate,
      });
    }

    // Validate normal AI chat request
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    // Detect AI intent
    const result = await detectIntent(message);

    switch (result.intent) {

      // SHOW UNREAD EMAILS
      case "SHOW_UNREAD": {
        const emails = await getUnreadEmails(req.user);

        return res.json({
          success: true,
          result,
          data: emails,
        });
      }

      // OPEN LATEST EMAIL
      case "OPEN_LATEST_EMAIL": {
        const email = await getLatestEmail(req.user);

        return res.json({
          success: true,
          result,
          data: email,
        });
      }

      // SUMMARIZE EMAIL
      case "SUMMARIZE_EMAIL": {
        let email;

        if (currentEmailId) {
          email = await getEmail(req.user, currentEmailId);
        } else {
          email = await getLatestEmail(req.user);
        }

        if (!email) {
          return res.json({
            success: true,
            result: {
              ...result,
              reply: "No email found to summarize.",
            },
          });
        }

        const emailContent =
          email.decodedBody ||
          email.snippet ||
          "No email content found.";

        const summary = await summarizeEmail(emailContent);

        return res.json({
          success: true,
          result: {
            ...result,
            reply: summary,
          },
        });
      }

      // SEARCH EMAILS - FIRST PAGE
      case "SEARCH_EMAILS": {
        const searchResult = await searchEmails(
          req.user,
          result.query,
          null
        );

        return res.json({
          success: true,
          result,
          data: searchResult.emails,
          nextPageToken: searchResult.nextPageToken,
          resultSizeEstimate: searchResult.resultSizeEstimate,
        });
      }

      // COMPOSE EMAIL
      case "COMPOSE_EMAIL": {
        return res.json({
          success: true,
          result,
          data: {
            to: result.to,
            subject: result.subject,
            body: result.body,
          },
        });
      }

      // REPLY EMAIL
      case "REPLY_EMAIL": {
        let replyData;

        if (currentEmailId) {
          const email = await getEmail(
            req.user,
            currentEmailId
          );

          const headers = email.payload.headers || [];

          const getHeader = (name) =>
            headers.find(
              (h) => h.name.toLowerCase() === name.toLowerCase()
            )?.value || "";

          const from = getHeader("From");
          const subject = getHeader("Subject");

          const emailAddress =
            from.match(/<(.+?)>/)?.[1] || from;

          replyData = {
            email,
            to: emailAddress,
            subject: subject.startsWith("Re:")
              ? subject
              : `Re: ${subject}`,
          };

        } else {
          replyData = await getLatestReplyData(req.user);
        }

        if (!replyData) {
          return res.json({
            success: true,
            result: {
              ...result,
              reply: "No email found to reply to.",
            },
          });
        }

        const replyBody = await generateReply(
          replyData.email.decodedBody ||
            replyData.email.snippet ||
            "",
          result.body
        );

        return res.json({
          success: true,
          result,
          data: {
            to: replyData.to,
            subject: replyData.subject,
            body: replyBody,
          },
        });
      }

      // DEFAULT
      default:
        return res.json({
          success: true,
          result,
        });
    }

  } catch (err) {
    console.error("AI Controller Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
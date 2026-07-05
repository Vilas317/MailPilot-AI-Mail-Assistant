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

    const { message, currentEmailId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    const result = await detectIntent(message);

    switch (result.intent) {

      case "SHOW_UNREAD": {
        const emails = await getUnreadEmails(req.user);

        return res.json({
          success: true,
          result,
          data: emails,
        });
      }

      case "OPEN_LATEST_EMAIL": {
        const email = await getLatestEmail(req.user);

        return res.json({
          success: true,
          result,
          data: email,
        });
      }

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

      case "SEARCH_EMAILS": {
        const emails = await searchEmails(
          req.user,
          result.query
        );

        return res.json({
          success: true,
          result,
          data: emails,
        });
      }

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

      case "REPLY_EMAIL": {
        let replyData;
      
        if (currentEmailId) {
          const email = await getEmail(req.user, currentEmailId);
      
          const headers = email.payload.headers || [];
      
          const getHeader = (name) =>
            headers.find((h) => h.name === name)?.value || "";
      
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

      default:
        return res.json({
          success: true,
          result,
        });
    }

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
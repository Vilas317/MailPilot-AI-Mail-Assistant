const {
  getInbox,
  getInboxPage,
  getEmail,
  sendEmail,
  getSentEmails,
  getSentEmailsPage,
} = require("../services/gmail.service");

exports.googleSuccess = (req, res) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }
  
    res.json({
      success: true,
      user: req.user.profile,
    });
  };
  
  exports.logout = (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }
  
      req.session.destroy(() => {
        res.clearCookie("connect.sid");
  
        res.json({
          success: true,
          message: "Logged out successfully",
        });
      });
    });
  };


  exports.getEmail = async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
      }
  
      const email = await getEmail(req.user, req.params.id);
  
      res.json({
        success: true,
        email,
      });
  
    } catch (err) {
      console.error(err);
  
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };

  exports.sendEmail = async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
      }
  
      const { to, subject, body } = req.body;
  
      if (!to || !subject || !body) {
        return res.status(400).json({
          success: false,
          message: "To, subject and body are required.",
        });
      }
  
      const result = await sendEmail(req.user, {
        to,
        subject,
        body,
      });
  
      res.json({
        success: true,
        result,
      });
    } catch (err) {
      console.error(err);
  
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };
  
  exports.getInbox = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const pageToken = req.query.pageToken || null;

    const result = await getInboxPage(
      req.user,
      pageToken
    );

    res.json({
      success: true,
      emails: result.emails,
      nextPageToken: result.nextPageToken,
      resultSizeEstimate: result.resultSizeEstimate,
    });

  } catch (error) {
    console.error("Inbox pagination error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

  exports.getSentEmails = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const pageToken = req.query.pageToken || null;

    const result = await getSentEmailsPage(
      req.user,
      pageToken
    );

    res.json({
      success: true,
      emails: result.emails,
      nextPageToken: result.nextPageToken,
      resultSizeEstimate: result.resultSizeEstimate,
    });

  } catch (err) {
    console.error("Sent emails pagination error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
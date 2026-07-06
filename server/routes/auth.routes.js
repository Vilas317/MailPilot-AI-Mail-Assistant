const express = require("express");
const passport = require("passport");

const {
  googleSuccess,
  logout,
  getInbox,
  getEmail,
  sendEmail,
  getSentEmails,
} = require("../controllers/auth.controller");

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google")
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
  }),
  (req, res) => {
    console.log("========== CALLBACK ==========");
    console.log("req.user:", req.user);
    console.log("req.session:", req.session);
    console.log("Authenticated:", req.isAuthenticated());

    res.redirect(process.env.CLIENT_URL);
  }
);

router.get("/success", googleSuccess);

router.get("/logout", logout);

router.get("/emails", getInbox);

router.get("/emails/:id", getEmail);

router.get("/sent", getSentEmails);

router.post("/send", sendEmail);

module.exports = router;
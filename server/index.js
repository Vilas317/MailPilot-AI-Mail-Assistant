const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const session = require("express-session");

const passport = require("./config/passport");

const authRoutes = require("./routes/auth.routes");
const aiRoutes = require("./routes/ai.routes");

console.log("Working Directory:", process.cwd());
console.log("CLIENT ID:", process.env.GOOGLE_CLIENT_ID);
console.log("CALLBACK:", process.env.GOOGLE_CALLBACK_URL);

const app = express();
app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    proxy: true,

    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log("==============");
  console.log("Session:", req.session);
  console.log("User:", req.user);
  console.log("Authenticated:", req.isAuthenticated());
  console.log("==============");

  next();
});

app.use("/auth", authRoutes);
app.use("/ai", aiRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Processity Mail AI Backend Running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
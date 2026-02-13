require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const requestLogger = require("./middleware/logger");
const authMiddleware = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory stores
const loginSessions = {};
const otpStore = {};

// Middleware
app.use(requestLogger);
app.use(express.json());
app.use(cookieParser()); // 🔥 REQUIRED

app.get("/", (req, res) => {
  res.json({
    challenge: "Complete the Authentication Flow",
  });
});

/* ================================
   TASK 1 — LOGIN
================================ */
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || password !== "password123") {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const loginSessionId = Math.random().toString(36).substring(2, 10);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  loginSessions[loginSessionId] = {
    email,
    createdAt: Date.now(),
    expiresAt: Date.now() + 2 * 60 * 1000,
    verified: false,
  };

  otpStore[loginSessionId] = otp;

  console.log(`[OTP] Session ${loginSessionId} generated: ${otp}`);

  res.json({ loginSessionId });
});

/* ================================
   TASK 2 — VERIFY OTP
================================ */
app.post("/auth/verify-otp", (req, res) => {
  const { loginSessionId, otp } = req.body;

  const session = loginSessions[loginSessionId];

  if (!session) {
    return res.status(401).json({ error: "Invalid session" });
  }

  if (Date.now() > session.expiresAt) {
    return res.status(401).json({ error: "Session expired" });
  }

  if (otp !== otpStore[loginSessionId]) {
    return res.status(401).json({ error: "Invalid OTP" });
  }

  session.verified = true;
  delete otpStore[loginSessionId];

  res.cookie("session_token", loginSessionId, {
    httpOnly: true,
    maxAge: 15 * 60 * 1000,
  });

  res.json({ message: "OTP verified" });
});

/* ================================
   TASK 3 — GENERATE JWT
================================ */
app.post("/auth/token", (req, res) => {
  const sessionId = req.cookies.session_token;

  if (!sessionId) {
    return res.status(401).json({ error: "No session cookie found" });
  }

  const session = loginSessions[sessionId];

  if (!session || !session.verified) {
    return res.status(401).json({ error: "Invalid session" });
  }

  const secret = process.env.JWT_SECRET || "default-secret-key";

  const accessToken = jwt.sign(
    {
      email: session.email,
      sessionId: sessionId,
    },
    secret,
    { expiresIn: "15m" }
  );

  res.json({
    access_token: accessToken,
    expires_in: 900,
  });
});

/* ================================
   TASK 4 — PROTECTED ROUTE
================================ */
app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user,
    success_flag: `FLAG-${Buffer.from(
      req.user.email + "_COMPLETED_ASSIGNMENT"
    ).toString("base64")}`,
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
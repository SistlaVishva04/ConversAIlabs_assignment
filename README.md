# 🛠 The Silent Server – Backend Debugging Assignment

This project is a backend authentication debugging challenge built with Node.js and Express.

The objective was to fix broken authentication endpoints and complete the full login → OTP → session → JWT → protected route flow.

---

## 🚀 Assignment Objective

Fix the authentication system so that a user can:

1. Login and receive a loginSessionId
2. Verify OTP and receive a session cookie
3. Exchange session cookie for a JWT access token
4. Access a protected route using the JWT
5. Receive a unique success flag

---

## 🧠 What Was Fixed

The original project had multiple issues:

- Middleware did not call `next()`
- Logger middleware blocked requests
- `/auth/token` incorrectly read Authorization header instead of cookie
- Cookie parser middleware was missing
- JWT validation flow was broken
- Session validation logic was incomplete

All of these issues were identified and corrected.

---

## 🏗 Tech Stack

- Node.js
- Express
- JSON Web Tokens (jsonwebtoken)
- cookie-parser
- dotenv

---

## ⚙️ Setup Instructions

### 1️⃣ Install Dependencies

```bash
npm install
```


### 2️⃣ Create `.env` File

```bash
JWT_SECRET=your_generated_secret_here
```

Generate a secure secret using:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```


### 3️⃣ Start Server

```bash
npm start
```

Server runs at:

```
http://localhost:3000
```


---

## 🔐 Authentication Flow

### Step 1 – Login

```
POST /auth/login
```

Request Body:

```json
{
  "email": "your@email.com",
  "password": "password123"
}
```

Response:

```json
{
  "loginSessionId": "abc123"
}
```

OTP will be logged in the server console.

---

### Step 2 – Verify OTP

```
POST /auth/verify-otp
```

Request Body:

```json
{
  "loginSessionId": "abc123",
  "otp": "123456"
}
```

Response:

```json
{
  "message": "OTP verified"
}
```

A session cookie (`session_token`) is issued.

---

### Step 3 – Get Access Token

```
POST /auth/token
```

Uses session cookie automatically.

Response:

```json
{
  "access_token": "...",
  "expires_in": 900
}
```


---

### Step 4 – Access Protected Route

```
GET /protected
```

Header:

```
Authorization: Bearer <access_token>
```

Response:

```json
{
  "message": "Access granted",
  "user": {...},
  "success_flag": "FLAG-..."
}
```

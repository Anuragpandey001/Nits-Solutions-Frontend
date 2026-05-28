# Secure Notes Frontend

Frontend for the Secure Notes Application built using React.js, Vite, Tailwind CSS, Axios, Context API, JWT Authentication, Refresh Tokens, and AES Encryption.

---

# Live Demo

Frontend URL Here

---

# Features

## Authentication

* User Registration
* User Login
* JWT Authentication
* Access Token & Refresh Token
* Protected Routes
* Auto Login Persistence

---

## Notes Features

* Create Notes
* View Notes
* Delete Notes
* Search Notes
* Real-time UI Updates

---

## Security Features

* AES Encryption on Client Side
* JWT Token Authentication
* Refresh Token Handling
* Axios Interceptors
* Protected Dashboard Routes

---

# Tech Stack

* React.js
* Vite
* Tailwind CSS
* Axios
* React Router DOM
* Context API
* CryptoJS

---

# Folder Structure

```bash
src/
│
├── api/
│   └── axios-Instance.js
│
├── components/
│
├── context/
│   ├── AuthContext.jsx
│   └── AuthProvider.jsx
│
├── hooks/
│   └── useAuth.js
│
├── pages/
│   ├── Auth.jsx
│   └── Dashboard.jsx
│
├── routes/
│   └── ProtectedRoute.jsx
│
├── utils/
│   ├── encrypt.js
│   └── decrypt.js
│
├── App.jsx
└── main.jsx
```

---

# Environment Variables

Create a `.env.development` file:

```env
VITE_API_URL=http://localhost:5000/api

VITE_SECRET_KEY=nits-secret-key
```

---

Create a `.env.production` file:

```env
VITE_API_URL=https://nits-solutions-backend.onrender.com/api

VITE_SECRET_KEY=nits-secret-key
```

---

# Installation

## Clone Repository

```bash
git clone YOUR_REPOSITORY_URL
```

---

## Move To Frontend Folder

```bash
cd frontend
```

---

## Install Dependencies

```bash
npm install
```

---

## Start Development Server

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# Build For Production

```bash
npm run build
```

---

# Preview Production Build

```bash
npm run preview
```

---

# AES Encryption Flow

```text
User Writes Note
       ↓
Encrypt Note Using AES
       ↓
Send Encrypted Note To Backend
       ↓
Backend Stores Encrypted Note
       ↓
Frontend Decrypts While Displaying
```

---

# Refresh Token Flow

```text
Login
   ↓
Access Token + Refresh Token Generated
   ↓
Access Token Expires
   ↓
Axios Interceptor Detects 401 Error
   ↓
Refresh Token API Called
   ↓
New Access Token Generated
   ↓
Original Request Retried Automatically
```

---

# Main Packages Used

## Install Required Packages

```bash
npm install react-router-dom axios crypto-js
```

---

# Authentication Architecture

* Context API used for global authentication state
* Protected routes implemented using React Router
* Axios interceptors used for token refresh handling
* Tokens stored in localStorage

---

# Future Improvements

* Forgot Password
* OTP Verification
* HTTP Only Cookies
* Dark Mode
* Pagination
* Drag & Drop Notes
* Rich Text Editor
* Notes Categories
* Tags & Filters

---

# Author

Anurag Pandey



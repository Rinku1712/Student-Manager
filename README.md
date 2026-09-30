# Student Management System (Full-Stack with Authentication)

A production-grade Student Management System built with a React/Vite frontend and an Express.js layered backend architecture featuring complete authentication, email verification via Nodemailer, password reset flows, user profiles, session recovery via HTTP-only cookies, and persistent storage.

---

## 🏛️ System Architecture

```
[ React 19 Frontend (Vite, Port 5173) ]
       │ HTTP / JSON with credentials: "include"
       ▼
[ Express API Server (Node ES Modules, Port 5000) ]
  ├── routes/
  │    ├── authRoutes.js (Authentication & Profile endpoints)
  │    └── studentRoutes.js (Protected Student CRUD endpoints)
  ├── controllers/
  │    ├── authController.js
  │    └── studentController.js
  ├── services/
  │    ├── authService.js (Password hashing, JWT, crypto token logic)
  │    ├── emailService.js (Nodemailer HTML templates & dev logging)
  │    └── studentService.js (Student business logic)
  ├── repositories/
  │    ├── userRepository.js (Encapsulates users.json)
  │    └── studentRepository.js (Encapsulates students.json)
  ├── middleware/
  │    ├── authMiddleware.js (JWT validation, req.user injection, rate limiting)
  │    └── errorHandler.js (Centralized HTTP error mapping)
  └── data/
       ├── users.json (User accounts storage)
       └── students.json (Student records storage)
```

---

## 🔐 Authentication Features

- **Sign Up**: Full name, email, password strength check (min 8 chars, 1 uppercase, 1 lowercase, 1 number), confirm password match, duplicate email check (HTTP 409).
- **Email Verification**: Cryptographically secure random tokens (`crypto.randomBytes(32)`). Raw tokens are never stored; only SHA-256 hashes are persisted with 24-hour expiration. Single-use and reuse prevention.
- **Nodemailer Integration**: Professional, responsive HTML emails with branding, CTA button, security notice, and expiration details. Development logger prints clickable links directly to terminal for instant testing without SMTP setup.
- **Login**: Enforces `emailVerified: true` (HTTP 403 with inline "Resend Verification" link if unverified), verifies password using `bcryptjs` (salt 12), and issues signed JWT in an **HTTP-only, secure, SameSite cookie**.
- **Session Persistence**: On browser refresh, calls `/api/auth/me` with cookie credentials to seamlessly recover user session without flashing unauthenticated states.
- **Protected Routes**: Student APIs (`/api/students/*`) and pages (`/dashboard`, `/students`, `/register`, `/settings`, `/profile`) strictly require active, verified sessions. Unauthenticated visits automatically redirect to `/login?redirect=<page>`.
- **Forgot & Reset Password**: Secure token-based reset with 1-hour expiration. Prevents email enumeration by returning generic notices. Updates password securely using bcrypt.
- **User Profile**: View user ID, role (`admin`), verification status, registration date. Allows editing display name, changing email (triggers re-verification), and updating password (verifies current password).
- **Navbar Dropdown**: Displays authenticated user avatar/initials, name, role badge, and menu (`My Profile`, `Settings`, `Sign Out`). Displays `Sign In` / `Sign Up` when logged out.

---

## 📡 REST API Reference

### Authentication Endpoints (`/api/auth`)

| Verb | Endpoint | Protection | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Rate Limited | Register user, hashes password, dispatches verification email |
| `POST` | `/api/auth/login` | Rate Limited | Authenticate user, sets HTTP-only JWT cookie |
| `POST` | `/api/auth/logout` | Public | Clears authentication cookie |
| `GET` | `/api/auth/me` | **Authenticated** | Returns current user profile (excludes sensitive hashes) |
| `GET` / `POST` | `/api/auth/verify-email` | Public | Verifies account via token query parameter or body |
| `POST` | `/api/auth/resend-verification` | Rate Limited | Generates fresh token and resends verification email |
| `POST` | `/api/auth/forgot-password` | Rate Limited | Issues password reset token and sends email |
| `POST` | `/api/auth/reset-password` | Public | Resets password with valid single-use token |
| `POST` | `/api/auth/change-password` | **Authenticated** | Verifies current password and updates to new password |
| `PUT` | `/api/auth/profile` | **Authenticated** | Updates user name or email (re-verifies if email changed) |

### Student Endpoints (`/api/students`) — *All Require Authentication*

| Verb | Endpoint | Description |
|---|---|---|
| `GET` | `/api/students` | Get all students (supports `?search=`, `?status=`, `?course=`, `?sortBy=`) |
| `GET` | `/api/students/stats` | Get metrics summary (total, active, inactive, courses) |
| `GET` | `/api/students/search?q=:query` | Search by name, email, mobile, or student ID |
| `GET` | `/api/students/:id` | Get student by ID |
| `POST` | `/api/students` | Register a new student |
| `PUT` | `/api/students/:id` | Update student record |
| `DELETE` | `/api/students/:id` | Delete student record |

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# JWT & Cookie Security
AUTH_SECRET=dev_jwt_secret_student_portal_key_2026
COOKIE_SECRET=dev_cookie_secret_student_portal_key_2026

# Nodemailer / SMTP Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM="Student Management System" <noreply@studentmanagement.local>
```

> **Note on Local Email Testing**: If `MAIL_HOST` or credentials are blank, `emailService.js` automatically prints all verification and password reset links to the server terminal so you can test authentication workflows immediately.

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Getting Started

### Installation

1. **Install Frontend Dependencies:**
   ```bash
   npm install
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd server
   npm install
   cd ..
   ```

### Running the Application

Open two terminals:

#### Terminal 1: Backend Server (Port 5000)
```bash
npm run server
# or: cd server && npm run dev
```

#### Terminal 2: Frontend Client (Port 5173)
```bash
npm run dev
```

Visit **http://localhost:5173** to view the application.

---

## 🛡️ Security Measures Implemented

1. **Password Security**:
   - Minimum 8 characters, requiring uppercase, lowercase, and numbers.
   - Hashed using `bcryptjs` with salt round 12. Plaintext passwords never stored or logged.
2. **Token Protection**:
   - Verification and password reset tokens generated via `crypto.randomBytes(32)`.
   - Only SHA-256 hashes are stored in `users.json`. Raw tokens are never persisted in the database.
   - Verification tokens expire in 24 hours; reset tokens expire in 1 hour. Single-use only.
3. **Session Hardening**:
   - HTTP-only signed cookies (`SameSite: Lax` in dev, `SameSite: Strict` in prod, `Secure` in prod).
   - Prevents XSS token extraction from `localStorage`.
4. **Brute Force & Abuse Protection**:
   - `express-rate-limit` protects `/signup`, `/login`, `/forgot-password`, and `/resend-verification`.
5. **HTTP Headers**:
   - `helmet` applies Content Security Policy, frameguard, and nosniff protections.
6. **Information Disclosure Prevention**:
   - Forgot password and duplicate email endpoints return generic responses to prevent user enumeration.
   - `sanitizeUser()` strips all password hashes and token hashes from every API response.

---

## 🔄 Future Database Migration (MongoDB / PostgreSQL)

Data access is strictly isolated inside `server/repositories/`:
- `studentRepository.js`
- `userRepository.js`

To switch from JSON files to MongoDB or PostgreSQL:
1. Implement `MongoUserRepository` and `MongoStudentRepository` fulfilling the identical repository method contracts (`getAll`, `getById`, `findByEmail`, `create`, `update`, `delete`).
2. Swap the instantiated repository in `authService.js` and `studentService.js`.
3. Routes, controllers, middleware, and frontend code remain **100% untouched**.

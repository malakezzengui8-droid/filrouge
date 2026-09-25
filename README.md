# 🩸 Your Blood is Gold (دَمُكَ ذَهَب) — Full-Stack Platform

**Your Blood is Gold** is a full-stack blood donation platform engineered to bridge the gap between voluntary blood donors, patients in urgent need, and healthcare centers across Morocco.
<img width="2025" height="3375" alt="blood-is-gold-usecase-diagram (2)" src="https://github.com/user-attachments/assets/ba1c323d-23a9-41bd-99ee-56d751fc49c9" />
<img width="2025" height="2925" alt="blood-is-gold-class-diagram (1)" src="https://github.com/user-attachments/assets/03098e40-52ac-473c-8f11-07e1c498a868" />
<img width="2706" height="3636" alt="blood-is-gold-sequence-diagram-bw (4)" src="https://github.com/user-attachments/assets/05a2c196-22f5-42ae-be3b-648d3d51a7bd" />

---

## 📋 Table of Contents
1. [Project Architecture](#-project-architecture)
2. [Tech Stack](#-tech-stack)
3. [Environment Setup & Installation](#-environment-setup--installation)
4. [Database Schemas & Data Models](#-database-schemas--data-models)
5. [Complete REST API Reference](#-complete-rest-api-reference)
6. [Business Logic & Eligibility Rules](#-business-logic--eligibility-rules)
7. [Frontend Application & Routes](#-frontend-application--routes)
8. [API Contract & Design Adaptations](#-api-contract--design-adaptations)
9. [License](#-license)

---

## 🏗 Project Architecture

```text
blood-is-gold/
├── backend/                        # Node.js + Express REST API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB Mongoose connection handler
│   │   ├── controllers/           # Request & response handlers
│   │   │   ├── adminController.js
│   │   │   ├── appointmentController.js
│   │   │   ├── authController.js
│   │   │   ├── donorController.js
│   │   │   └── requestController.js
│   │   ├── middlewares/           # Custom Express middlewares
│   │   │   ├── authMiddleware.js   # JWT authentication check
│   │   │   ├── errorMiddleware.js  # Global exception & error handler
│   │   │   └── roleMiddleware.js   # Role Authorization (USER / ADMIN)
│   │   ├── models/                # Mongoose data schemas
│   │   │   ├── Appointment.js
│   │   │   ├── BloodRequest.js
│   │   │   └── User.js
│   │   ├── routes/                # Express API route endpoints
│   │   │   ├── adminRoutes.js
│   │   │   ├── appointmentRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── donorRoutes.js
│   │   │   └── requestRoutes.js
│   │   ├── services/              # Business logic & DB query layer
│   │   │   ├── adminService.js
│   │   │   ├── appointmentService.js
│   │   │   ├── authService.js
│   │   │   ├── donorService.js
│   │   │   └── requestService.js
│   │   ├── utils/                 # Eligibility & compatibility rules
│   │   │   ├── compatibility.js
│   │   │   └── eligibility.js
│   │   ├── validators/            # Express-validator schemas
│   │   │   ├── appointmentValidator.js
│   │   │   ├── authValidator.js
│   │   │   ├── donorValidator.js
│   │   │   └── requestValidator.js
│   │   ├── app.js                 # Express global middleware configuration
│   │   └── server.js              # HTTP Server entry point
│   ├── jest.config.js             # Jest test runner setup
│   └── package.json
│
└── frontend/                       # React 19 + Vite Single Page Application
    ├── src/
    │   ├── api/                   # Resource-specific API fetch clients
    │   │   ├── admin.js
    │   │   ├── appointments.js
    │   │   ├── auth.js
    │   │   ├── donors.js
    │   │   └── requests.js
    │   ├── components/            # Reusable UI components
    │   │   ├── Avatar.jsx
    │   │   ├── Badge.jsx
    │   │   ├── Layout.jsx
    │   │   └── Modal.jsx
    │   ├── context/               # Global state providers
    │   │   └── AuthContext.jsx    # User session, JWT token & auth flow
    │   ├── pages/                 # Route views and modular stylesheets
    │   │   ├── AdminPage.jsx
    │   │   ├── ChecklistPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── DonorsPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── RequestDetailPage.jsx
    │   │   ├── RequestNewPage.jsx
    │   │   └── UrgentPage.jsx
    │   └── utils/                 # Formatting, Moroccan cities, blood types
    │       ├── cities.js
    │       ├── dateHelpers.js
    │       └── formatters.js
    ├── index.html
    ├── vite.config.js
    └── package.json

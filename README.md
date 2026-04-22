# 🏡 CozyStay Finder

*A Cloud-Based Guest House Booking & Management System (MERN Stack)*

---

## 🚀 Overview

CozyStay Finder is a full-stack web application that allows users to explore, book, and manage guest house stays. It also includes an admin panel for managing guesthouses, rooms, and bookings.

This project replaces Supabase with a custom **Node.js + Express + MongoDB backend**, providing full control over authentication and data.

---

## ✨ Features

### 👤 User Features

* 🔐 Signup & Login (JWT + Cookies)
* 🏡 Browse guesthouses
* 🛏️ View rooms & availability
* 📅 Book rooms with dates
* 📖 View booking history
* ❌ Cancel bookings

---

### 🛠️ Admin Features

* ➕ Add guesthouses (with image)
* 🛏️ Add/manage rooms
* 🔄 Toggle room availability
* 📋 View all bookings
* ✅ Update booking status (Confirm / Done / Cancel)
* 👤 View user name & email for each booking

---

## 🧑‍💻 Tech Stack

### Frontend

* React + TypeScript
* TanStack Router
* React Query
* Tailwind CSS
* ShadCN UI

### Backend

* Node.js
* Express.js
* TypeScript
* MongoDB + Mongoose
* JWT Authentication (Cookies)

---

## 📁 Project Structure

```
cozystay-finder/
│
├── client/         # Frontend (React + TS)
│
├── server/         # Backend (Node + Express + TS)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.ts
│
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

```
git clone <your-repo-url>
cd cozystay-finder
```

---

### 2️⃣ Backend Setup

```
cd server
npm install
```

Create `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

Run server:

```
npm run dev
```

---

### 3️⃣ Frontend Setup

```
cd client
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:8080
```

Backend runs on:

```
http://localhost:5000
```

---

## 🔐 Authentication Flow

* Signup → user created
* Login → JWT stored in cookies
* `/auth/me` → fetch current user
* Protected routes use `useAuth()`

---

## 📦 API Endpoints

### Auth

```
POST   /auth/signup
POST   /auth/login
POST   /auth/logout
GET    /auth/me
```

### Guesthouses

```
GET    /guesthouses
POST   /admin/guesthouses
DELETE /admin/guesthouses/:id
```

### Rooms

```
GET    /rooms/:guesthouseId
POST   /rooms
PATCH  /rooms/:id
DELETE /rooms/:id
```

### Bookings

```
POST   /bookings
GET    /bookings
GET    /admin/bookings
PATCH  /admin/bookings/:id
```

---

## 🖼️ Image Handling

* Guesthouse images are stored as **URLs**
* Admin can add image URL while creating guesthouse
* Fallback image used if not provided

---

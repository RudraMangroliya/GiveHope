# GiveHope 🤝 - Modern Charity & Donation Platform

**GiveHope** is a full-stack web application designed to connect generous donors with meaningful causes. Built with a modern technology stack, it provides an intuitive donation experience, impact tracking, community leaderboards, and administrative tools.

---

## ✨ Features

- 💖 **Seamless Donation Flow**: Easy and transparent donation process for supporting various campaigns and causes.
- 🏆 **Leaderboard & Impact**: Real-time community leaderboard highlighting top donors and total contributions.
- 👤 **User Profiles**: Track individual donation history, saved causes, and personal impact.
- 🛠️ **Admin Dashboard**: Manage campaigns, view donation metrics, and oversee platform activities.
- 🛡️ **Secure Authentication**: User registration and login powered by JWT authentication and encrypted passwords.
- 🎨 **Modern Responsive UI**: Built with React 19, Vite, and Tailwind CSS for smooth animations and mobile responsiveness.

---

## 🛠️ Tech Stack

### Frontend (`/client`)
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons & Animations**: Lucide React, Framer Motion
- **HTTP Client**: Axios
- **Routing**: React Router v7

### Backend (`/server`)
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js (v5)
- **Database**: MongoDB with Mongoose ODM
- **Security**: JWT (JSON Web Tokens), BcryptJS, Helmet, Express Rate Limit

---

## 📁 Project Structure

```
internship project/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page views (Home, Profile, Donation, Admin, etc.)
│   │   └── config.ts       # API configuration
│   └── package.json
├── server/                 # Express backend server
│   ├── index.ts            # Server entry point
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local or MongoDB Atlas instance)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/RudraMangroliya/GiveHope.git
   cd GiveHope
   ```

2. **Backend Setup (`/server`)**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
   Start the backend server in development mode:
   ```bash
   npm run dev
   ```

3. **Frontend Setup (`/client`)**
   ```bash
   cd ../client
   npm install
   ```
   Start the Vite development server:
   ```bash
   npm run dev
   ```

4. **Access the application**
   Open your browser and navigate to `http://localhost:5173`.

---

## 📝 License

This project is developed as part of an internship project. All rights reserved.

# StudyHub 🎓

StudyHub is a comprehensive digital ecosystem built for students to access premium notes, submit homework, view past papers, and learn directly from top students. It is built as a monorepo featuring a robust backend API, a modern SaaS web portal, and a cross-platform mobile application.

## 🌟 Features

- **📚 Premium Notes:** Highly curated, subject-wise study notes prepared by expert teachers and top students.
- **✨ Topper Insights:** Exclusive content and strategies directly from school toppers.
- **📄 Past Papers:** A massive library of past examination papers and detailed marking schemes.
- **📝 Homework Help:** Step-by-step solutions for difficult homework questions.
- **📱 Cross-Platform Sync:** Start on your laptop, continue on your tablet, and review on your phone.
- **🛡️ Secure Access:** Token-based authentication and secure file viewing.

## 🏗️ Architecture & Tech Stack

This repository is structured as a monorepo containing three main components:

### 1. Website (`/website`)
A blazing-fast, responsive web portal built with a modern "neo-brutalism" design aesthetic.
- **Framework:** React 18 + Vite
- **Routing:** TanStack Router (File-based routing)
- **Styling:** Tailwind CSS (with custom SaaS/Brutalist components)
- **State Management:** Zustand
- **Icons:** Lucide React

### 2. Backend API (`/backend/StudyHub.API`)
A robust backend powering all applications.
- **Framework:** ASP.NET Core 8 Web API
- **Database:** Entity Framework Core (SQL Server / SQLite)
- **Authentication:** JWT (JSON Web Tokens) with Role-Based Access Control
- **Features:** File Uploads, App Version Management, Revenue Adjustments, Admin Dashboard APIs

### 3. Mobile App (`/mobile`)
A native mobile application for iOS and Android.
- **Framework:** React Native + Expo
- **Routing:** Expo Router
- **Features:** Push Notifications, Offline support, Device mismatch handling, Native file viewing

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Bun](https://bun.sh/) or npm (for frontend dependencies)

### Running the Backend
```bash
cd backend/StudyHub.API
dotnet restore
dotnet ef database update
dotnet run
```
The API will run locally at `http://localhost:5244` (or similar configured port).

### Running the Website
```bash
cd website
npm install
npm run dev
```
The web portal will be available at `http://localhost:5173`.

### Running the Mobile App
```bash
cd mobile
npm install
npx expo start
```
Use the Expo Go app on your phone to scan the QR code and test the app on a physical device.

## 🎨 Design Philosophy
The web portal uses a **Neo-brutalism** design system characterized by:
- High contrast layouts (black/white with vivid accents)
- Thick, harsh borders (`border-2 border-black`)
- Solid drop shadows (`shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`)
- Large, bold typography using `Inter` and `Plus Jakarta Sans`

## 🔒 Security
- Data is encrypted in transit and at rest.
- JWT tokens handle stateless secure authentication.
- API endpoints are heavily guarded with Role-based access modifiers (Admin, Student, Topper).

## 📄 License
All rights reserved. StudyHub 2026.
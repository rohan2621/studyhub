# StudyHub - Fresh Environment Setup Guide

This guide is designed to help you restore and run the StudyHub project exactly as we configured it, without running into version or setting mismatches after a fresh laptop reset.

## 1. Prerequisites (What to Install First)

Before you clone the repository, ensure you install the following exact/minimum versions of software on your new machine:

1. **Git:** To clone the repository.
   - [Download Git](https://git-scm.com/)
2. **Node.js (v18 or higher):** Required for both the `website` and `mobile` projects. We used `npm` for installing dependencies.
   - [Download Node.js](https://nodejs.org/)
3. **.NET 8 SDK:** Required for the C# backend.
   - [Download .NET 8.0 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
4. **PostgreSQL (Optional but recommended):** If you are running the database locally instead of using a cloud database. Otherwise, Docker Desktop can be used.
   - [Download PostgreSQL](https://www.postgresql.org/download/) or [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

## 2. Cloning the Repository

Open your terminal (PowerShell, CMD, or Git Bash) and run:

```bash
git clone https://github.com/rohan2621/studyhub.git
cd studyhub
```

---

## 3. Restoring the Backend (`/backend`)

The backend is built using ASP.NET Core 8.

1. Open a terminal in the backend directory:
   ```bash
   cd backend/StudyHub.API
   ```
2. Restore all NuGet packages (this downloads all the required libraries):
   ```bash
   dotnet restore
   ```
3. **Important Configuration:** Check the `appsettings.json` or `appsettings.Development.json` file. Ensure your `DefaultConnection` string points to your new local SQL Server/PostgreSQL instance if you are testing locally.
4. Apply any pending database migrations to create the tables on your new machine:
   ```bash
   dotnet ef database update
   ```
   *(If you don't have the EF Core CLI tools installed globally, run: `dotnet tool install --global dotnet-ef` first).*
5. Run the backend:
   ```bash
   dotnet run
   ```

---

## 4. Restoring the Web Portal (`/website`)

The web portal uses React 19, Vite, and Tailwind CSS.

1. Open a new terminal in the website directory:
   ```bash
   cd website
   ```
2. Install all node modules precisely as they are locked in `package-lock.json`:
   ```bash
   npm ci
   ```
   *(Note: Using `npm ci` instead of `npm install` is crucial here because it forcefully installs the exact versions listed in the lock file, preventing version mismatch issues).*
3. Run the development server:
   ```bash
   npm run dev
   ```

---

## 5. Restoring the Mobile App (`/mobile`)

The mobile app is built with Expo and React Native.

1. Open a new terminal in the mobile directory:
   ```bash
   cd mobile
   ```
2. Install all node modules precisely as locked in `package-lock.json`:
   ```bash
   npm ci
   ```
3. To start the local Expo server:
   ```bash
   npx expo start
   ```
4. If you need to build the APK (like we just did), make sure you log in to your Expo account globally on the new machine:
   ```bash
   npx eas-cli login
   npx eas-cli build --platform android --profile preview
   ```

## 6. Important Notes & Settings We Changed

- **Terms and Conditions:** We added "No Refunds", "Academic Outcomes", and "Liability" clauses to both the mobile (`activate-token.tsx`) and web (`profile.tsx`) apps. These are safely pushed to your repo.
- **File Extensions:** Ensure your IDE (like VS Code or Visual Studio) is set up with formatting rules (Prettier/ESLint for JS/TS, C# extension for the backend) so saving files doesn't automatically reformat them in a way that creates huge git diffs.

Save this guide safely. Once your laptop is reset, follow these instructions step-by-step!

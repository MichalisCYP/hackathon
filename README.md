# README.md
# Kudos App

## Purpose

Kudos App is a web application designed to facilitate peer recognition within organizations. Users can nominate colleagues for kudos, view a feed of nominations, and manage their profiles. The app supports admin features for managing users and occasions, and provides secure authentication and password management.

## Main Features

- **User Authentication:** Sign up, login, password reset, and update password flows.
- **Peer Nomination:** Users can nominate colleagues for kudos and view nominations in a dashboard feed.
- **Admin Panel:** Admins can manage users, sync kudos, and check occasions.
- **Profile Management:** Users can update their profiles and view their nomination history.
- **Notification System:** Dropdown notifications for new kudos and updates.
- **Responsive UI:** Modern, accessible interface with theme switching and mobile support.
- **Supabase Integration:** Real-time data and authentication powered by Supabase.

## Tech Stack

- **Next.js:** React-based framework for server-side rendering and routing.
- **Supabase:** Backend-as-a-service for authentication and database.
- **Tailwind CSS:** Utility-first CSS framework for styling.
- **TypeScript:** Static typing for safer and more maintainable code.
- **ESLint & PostCSS:** Code quality and CSS processing tools.

## Project Structure

- `app/` — Next.js app directory with pages, layouts, and API routes.
- `components/` — Reusable UI and dashboard components.
- `lib/` — Utility functions, global store, and Supabase client.
- `public/` — Static assets.
- `config/` — Configuration files for ESLint, Tailwind, PostCSS, and TypeScript.

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```
2. Set up environment variables for Supabase.
3. Run the development server:
   ```
   npm run dev
   ```

## License

MIT

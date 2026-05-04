# Study Tracker (Study-Mate)

A modern, full-featured web application for students to track their studies, manage notes, flashcards, focus sessions, and collaborate in study groups. Built with React, TypeScript, Tailwind CSS, and Firebase.

## Features

- **Dashboard**: Get a bird's-eye view of your study progress and upcoming tasks.
- **Subject Management**: Organize your studies by subject and topic.
- **Study Planner**: Schedule study sessions and track your daily goals.
- **Rich-Text Notes**: Write, format, and organize notes using Markdown.
- **Flashcards**: Create and review flashcards using an SM-2 spaced repetition algorithm.
- **Focus Timer**: Use a built-in Pomodoro timer to manage focus sessions.
- **Analytics**: Track your study time, session history, and overall progress with interactive charts.
- **Study Groups (Chat)**: Collaborate with peers in real-time study groups.
- **Admin Dashboard**: Manage application data (for admins only).

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **Routing**: React Router v6
- **State Management & Data Fetching**: React Context, Firebase SDK
- **Backend & Database**: Firebase Authentication, Cloud Firestore
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- A Firebase project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/shahnewajsrabon/Study-Mate.git
   cd Study-Mate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory based on `.env.example` and add your Firebase configuration details:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

Build the app for production:
```bash
npm run build
```
The optimized bundle will be generated in the `dist` directory, ready to be deployed to any static hosting service (Firebase Hosting, Vercel, Netlify, GitHub Pages, etc.).

## Security

Please see the [SECURITY.md](SECURITY.md) file for more information on security practices and reporting vulnerabilities.

## License

This project is licensed under the MIT License.

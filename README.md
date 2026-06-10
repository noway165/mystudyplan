# 🌸 MyStudyPlan - AI-Powered Kawaii Study Tracker

A highly interactive, gamified, and beautiful study management web app designed to boost productivity through virtual pet mechanics and AI integration.

## ✨ Core Features
*   **🐶 Virtual Pets Gamification:** Earn bones (🍖) by completing study sessions and tasks. Use them to buy accessories (Crowns 👑, Sunglasses 🕶️) for your cute pets!
*   **🧠 Gemini AI Integration:** Smart AI assistant (Mèo Hồng) analyzes your grades, cheers you up, and reminds you to study based on your performance.
*   **🍅 Pro Pomodoro Timer:** Beautiful SVG animated circle timer. Changes pet states (sleeping/reading) when focus mode is active.
*   **💯 Dual Grading System:** Supports both 10-point scale and 4.0 GPA (A, B, C, D) systems with local history tracking.
*   **💾 LocalStorage Persistence:** All data (coins, items, tasks, stats) are saved locally!
*   **📱 PWA Ready:** Installable on iOS/Android as a native-like app.
*   **🔊 Immersive UI/UX:** Built with TailwindCSS, featuring 3D buttons, bouncy animations, confetti fireworks, and sound effects!

## 🛠️ Tech Stack
*   **Framework:** Next.js 14 (App Router)
*   **Styling:** Tailwind CSS
*   **AI:** Google Gemini API
*   **Effects:** canvas-confetti, Web Audio API

## 🚀 How to Run Locally
1. Clone the repository.
2. Run `npm install` and `npm install canvas-confetti`.
3. Create a `.env.local` file and add: `NEXT_PUBLIC_GEMINI_KEY=your_google_api_key`.
4. Run `npm run dev`. Open `localhost:3000`.

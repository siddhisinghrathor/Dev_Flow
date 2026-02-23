# DevFlow - Developer Productivity Web App

DevFlow is a production-grade productivity tool designed specifically for software engineers. It helps track daily tasks, visualize consistency, and analyze productivity metrics.

## 🚀 Key Features

- **Smart Task Management**: Categorize by stack (Frontend, Backend, DSA), set priorities, and track progress.
- **GitHub-Style Heatmap**: Visualize your consistency over the year with an interactive grid.
- **Productivity Analytics**: Real-time stats on streaks, completion rates, and productivity scores.
- **Theme System**: Seamless Light/Dark mode transitions with system preference detection.
- **Premium UX**: Framer Motion animations, glassmorphism UI, and responsive layout.

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **State Management**: Zustand (with LocalStorage persistence)
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 🏗 Architecture Decisions

### 1. Feature-Based Folder Structure
The project follows a feature-based architecture (`src/features/...`) rather than just grouping by component type. This makes the codebase scalable and easier to navigate as functionality grows.
- `tasks/`: Logic and UI for task management.
- `heatmap/`: Logic for aggregating log data into a visual grid.
- `analytics/`: Metrics and statistics calculations.

### 2. State Management with Zustand
Zustand was chosen over Redux for its simplicity, performance, and minimal boilerplate. The store is split by concern (`useTaskStore`, `useThemeStore`) and uses the `persist` middleware to ensure data survives page reloads via LocalStorage.

### 3. Clean UI & Design System
- **CSS Variables**: Used for theme-aware tokens (colors, radii, spacing).
- **Custom Components**: Reusable UI components (`Button`, `Card`, `Badge`) built with `tailwind-merge` and `clsx` for flexible styling.
- **Micro-animations**: Leveraged `framer-motion` for layout transitions and list interactions, enhancing the "premium" feel.

### 4. Performance Optimization
- **Memoization**: Heavy calculations like heatmap grid generation and streak logic are wrapped in `useMemo`.
- **Atomic Components**: Components are kept small and focused to minimize re-renders.

## 📈 Roadmap

- [ ] GitHub API integration to sync actual commits.
- [ ] Weekly goal setting and notification system.
- [ ] Export data as JSON/CSV.
- [ ] PWA support for offline task tracking.

---
Built with ❤️ for Developers.

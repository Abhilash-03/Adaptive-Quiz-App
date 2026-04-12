# QuizAI - Adaptive Online Quiz Platform

An AI-powered online quiz platform with adaptive difficulty adjustment, real-time performance tracking, and gamification features.

![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![React](https://img.shields.io/badge/React-19-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-9.3-brightgreen)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Adaptive AI Algorithm](#adaptive-ai-algorithm)
- [Badge System](#badge-system)
- [Deployment](#deployment)

---

## Overview

QuizAI is a full-stack adaptive learning platform that uses AI-powered algorithms to dynamically adjust quiz difficulty based on student performance. The platform supports two user roles (Teachers and Students) and features real-time analytics, achievement badges, and comprehensive progress tracking.

### Key Highlights

- **AI-Powered Adaptive Difficulty**: Uses Item Response Theory (IRT) inspired algorithms to personalize question difficulty
- **Real-time Performance Tracking**: Charts, analytics, and skill progression visualization
- **Gamification**: 20+ achievement badges across multiple categories
- **Role-based Access**: Separate dashboards and features for teachers and students
- **Modern UI/UX**: Dark/light mode support, responsive design, and smooth animations

---

## Features

### For Students
- Take adaptive quizzes that adjust difficulty in real-time
- View performance analytics with charts and statistics
- Track skill level progression over time
- Earn achievement badges based on performance
- Review quiz attempts with detailed explanations
- Real-time notifications for quiz results

### For Teachers
- Create and manage quizzes with flexible settings
- Add questions with multiple types (MCQ, True/False, Short Answer)
- Set adaptive or fixed difficulty modes
- View student performance analytics
- Manage student access and progress
- Publish/unpublish quizzes with date scheduling

### Platform Features
- Google OAuth and local authentication
- Dark/Light theme toggle
- Responsive design for all devices
- Real-time difficulty adjustment indicators
- SEO optimized landing page

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2 | UI Framework |
| Vite | 8.0 | Build Tool & Dev Server |
| Tailwind CSS | 4.2 | Styling |
| Shadcn/UI | 4.1 | UI Component Library |
| React Router DOM | 7.13 | Client-side Routing |
| TanStack Query | 5.95 | Server State Management |
| Zustand | 5.0 | Client State Management |
| Recharts | 3.8 | Data Visualization |
| Lucide React | 0.468 | Icons |
| React Helmet Async | 3.0 | SEO Management |
| Axios | 1.14 | HTTP Client |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20+ | Runtime Environment |
| Express.js | 5.2 | Web Framework |
| MongoDB | - | Database |
| Mongoose | 9.3 | ODM |
| JWT | 9.0 | Authentication |
| Passport.js | 0.7 | OAuth Strategy |
| Bcrypt.js | 3.0 | Password Hashing |
| Joi | 18.1 | Validation |

---

## Project Structure

```
adaptive-online-quiz/
├── frontend/                    # React frontend application
│   ├── public/                  # Static assets
│   └── src/
│       ├── assets/              # Images, fonts, etc.
│       ├── components/
│       │   ├── shared/          # Reusable components
│       │   │   ├── AttemptCard.jsx
│       │   │   ├── Badges.jsx
│       │   │   ├── FilterBar.jsx
│       │   │   ├── QuizCard.jsx
│       │   │   ├── StatsCard.jsx
│       │   │   └── ...
│       │   └── ui/              # Base UI components (shadcn)
│       │       ├── button.jsx
│       │       ├── card.jsx
│       │       ├── chart.jsx
│       │       ├── dialog.jsx
│       │       └── ...
│       ├── hooks/               # Custom React hooks
│       │   ├── useAuth.js
│       │   ├── useQuizzes.js
│       │   ├── useAttempts.js
│       │   └── ...
│       ├── layouts/             # Layout components
│       │   └── DashboardLayout.jsx
│       ├── lib/                 # Utilities
│       │   ├── api.js           # Axios instance
│       │   └── utils.js         # Helper functions
│       ├── pages/
│       │   ├── auth/            # Login, Register modals
│       │   ├── landing/         # Public landing page
│       │   ├── shared/          # Shared pages
│       │   ├── student/         # Student dashboard & pages
│       │   └── teacher/         # Teacher dashboard & pages
│       ├── services/            # API service functions
│       └── store/               # Zustand stores
│           ├── authStore.js
│           └── settingsStore.js
│
├── backend/                     # Express backend application
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── passport.js         # OAuth configuration
│   ├── controllers/            # Route handlers
│   │   ├── auth.controller.js
│   │   ├── quizzes.controller.js
│   │   ├── attempts.controller.js
│   │   ├── analytics.controller.js
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.middleware.js  # JWT verification
│   │   ├── error.middleware.js # Global error handler
│   │   └── validate.middleware.js
│   ├── models/                 # Mongoose schemas
│   │   ├── users.schema.js
│   │   ├── quizzes.schema.js
│   │   ├── questions.schema.js
│   │   ├── quizAttempts.schema.js
│   │   ├── badges.schema.js
│   │   └── ...
│   ├── routes/                 # API routes
│   ├── services/
│   │   ├── adaptiveDifficulty.service.js  # AI algorithm
│   │   └── badges.service.js
│   ├── utils/
│   │   ├── ApiError.js
│   │   └── ApiResponse.js
│   └── app.js                  # Express app entry point
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 20+ 
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/adaptive-online-quiz.git
   cd adaptive-online-quiz
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables** (see [Environment Variables](#environment-variables))

5. **Run the development servers**

   Backend (from `/backend` directory):
   ```bash
   npm run dev
   ```

   Frontend (from `/frontend` directory):
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

---

## Environment Variables

### Backend (`/backend/.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/quizai
# Or MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/quizai

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### Frontend (`/frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## API Documentation

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/logout` | Logout user | Private |
| GET | `/api/auth/me` | Get current user | Private |
| GET | `/api/auth/google` | Google OAuth login | Public |
| GET | `/api/auth/google/callback` | Google OAuth callback | Public |

### Quizzes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/quizzes` | Get all quizzes | Teacher |
| GET | `/api/quizzes/available` | Get available quizzes for students | Student |
| GET | `/api/quizzes/:id` | Get quiz by ID | Private |
| POST | `/api/quizzes` | Create a new quiz | Teacher |
| PUT | `/api/quizzes/:id` | Update quiz | Teacher |
| DELETE | `/api/quizzes/:id` | Delete quiz | Teacher |
| PUT | `/api/quizzes/:id/publish` | Publish quiz | Teacher |
| PUT | `/api/quizzes/:id/unpublish` | Unpublish quiz | Teacher |

### Questions

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/questions` | Get all questions | Teacher |
| GET | `/api/questions/:id` | Get question by ID | Teacher |
| POST | `/api/questions` | Create question | Teacher |
| PUT | `/api/questions/:id` | Update question | Teacher |
| DELETE | `/api/questions/:id` | Delete question | Teacher |

### Quiz Attempts

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/attempts/:quizId/start` | Start a quiz attempt | Student |
| POST | `/api/attempts/:attemptId/answer` | Submit an answer | Student |
| POST | `/api/attempts/:attemptId/submit` | Submit entire quiz | Student |
| GET | `/api/attempts/my` | Get user's attempts | Student |
| GET | `/api/attempts/:id` | Get attempt details | Private |

### Analytics

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/analytics/dashboard` | Get student dashboard stats | Student |
| GET | `/api/analytics/teacher` | Get teacher dashboard stats | Teacher |
| GET | `/api/analytics/quiz/:id` | Get quiz analytics | Teacher |

### Badges

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/badges/my` | Get user's badges | Student |
| GET | `/api/badges/definitions` | Get all badge definitions | Private |

---

## Adaptive AI Algorithm

QuizAI uses an **Item Response Theory (IRT)** inspired algorithm to adaptively adjust quiz difficulty based on student performance.

### Algorithm Components

#### 1. Probability Calculation (IRT Logistic Model)
```javascript
P(correct) = 1 / (1 + e^(-(skill - difficulty) / scale))
```
- Calculates the probability of a correct answer based on user skill vs question difficulty
- Scale parameter (25) controls the steepness of the curve

#### 2. Performance Score Calculation
Weighted factors:
- **Accuracy (50%)**: Whether the answer was correct
- **Time Performance (20%)**: Speed of answering relative to time limit
- **Difficulty Bonus (15%)**: Higher points for harder questions
- **Streak Bonus (15%)**: Consecutive correct/incorrect answers

#### 3. Difficulty Adjustment (ELO-Inspired)
```javascript
adjustment = K_FACTOR × (successRate - TARGET_SUCCESS_RATE)
```
- **K-Factor**: 32 (controls volatility of changes)
- **Target Success Rate**: 70% (optimal for learning)
- **Sliding Window**: Last 5 answers considered

#### 4. Question Selection Strategy
1. Filter out already-answered questions
2. Find questions within ±15 difficulty range of target
3. Sort by closeness to target difficulty
4. Randomly select from top 3 candidates (for variety)

### Configuration Constants
```javascript
{
  MIN_DIFFICULTY: 1,
  MAX_DIFFICULTY: 100,
  SLIDING_WINDOW_SIZE: 5,
  K_FACTOR: 32,
  TARGET_SUCCESS_RATE: 0.7,
  DIFFICULTY_THRESHOLDS: {
    easy: { min: 1, max: 33 },
    medium: { min: 34, max: 66 },
    hard: { min: 67, max: 100 }
  }
}
```

### User Skill Update
After each quiz completion:
1. Calculate accuracy-based adjustment using expected vs actual performance
2. Apply bonuses for hard question performance
3. Reduce penalties for struggling on difficult content
4. Apply time efficiency multiplier
5. Bound final skill level (0-100)

---

## Badge System

QuizAI features a comprehensive gamification system with 20+ achievement badges across multiple categories.

### Badge Categories

#### Milestone Badges
| Badge | Requirement | Tier |
|-------|-------------|------|
| First Steps | Complete 1 quiz | Bronze |
| Getting Started | Complete 5 quizzes | Bronze |
| Quiz Enthusiast | Complete 10 quizzes | Silver |
| Quiz Master | Complete 25 quizzes | Gold |
| Quiz Legend | Complete 50 quizzes | Platinum |

#### Accuracy Badges
| Badge | Requirement | Tier |
|-------|-------------|------|
| Perfect! | Score 100% on a quiz | Gold |
| Hat Trick | Get 3 perfect scores | Platinum |
| High Achiever | Maintain 90%+ average | Gold |
| Consistent Performer | 70%+ average over 10+ quizzes | Silver |

#### Streak Badges
| Badge | Requirement | Tier |
|-------|-------------|------|
| On Fire | 3-day quiz streak | Bronze |
| Week Warrior | 7-day quiz streak | Silver |
| Dedicated | 14-day quiz streak | Gold |
| Unstoppable | 30-day quiz streak | Platinum |

#### Difficulty Badges
| Badge | Requirement | Tier |
|-------|-------------|------|
| Challenge Accepted | Pass a hard quiz | Bronze |
| Hard Mode Hero | Pass 5 hard quizzes | Silver |
| Difficulty Master | Pass 10 hard quizzes with 80%+ | Gold |

#### Speed Badges
| Badge | Requirement | Tier |
|-------|-------------|------|
| Quick Thinker | Complete quiz in < 50% time | Bronze |
| Speed Demon | Complete 5 quizzes quickly | Silver |
| Lightning Fast | Complete quiz in < 25% time with 90%+ | Gold |

#### Special Badges
| Badge | Requirement | Tier |
|-------|-------------|------|
| Night Owl | Complete quiz after midnight | Bronze |
| Early Bird | Complete quiz before 6 AM | Bronze |
| Comeback Kid | Pass after failing same quiz | Silver |
| Category Explorer | Complete quizzes in 5+ categories | Silver |

### Badge Tiers
- **Bronze**: Entry-level achievements
- **Silver**: Intermediate achievements
- **Gold**: Advanced achievements
- **Platinum**: Elite achievements

---

## Deployment

### Vercel Deployment (Recommended)

#### Backend Deployment

1. Create `vercel.json` in `/backend`:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "app.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "app.js"
       }
     ]
   }
   ```

2. Deploy to Vercel:
   ```bash
   cd backend
   vercel
   ```

3. Set environment variables in Vercel dashboard

#### Frontend Deployment

1. Create `vercel.json` in `/frontend`:
   ```json
   {
     "rewrites": [
       { "source": "/((?!api/).*)", "destination": "/index.html" }
     ]
   }
   ```

2. Deploy:
   ```bash
   cd frontend
   npm run build
   vercel
   ```

### Environment Variables for Production

Update the following for production:
- `NODE_ENV=production`
- `FRONTEND_URL=https://your-frontend-domain.vercel.app`
- `VITE_API_URL=https://your-backend-domain.vercel.app/api`
- Secure `JWT_SECRET`
- MongoDB Atlas connection string

---

## Scripts

### Backend
```bash
npm run dev      # Start with nodemon
npm start        # Start production server
npm test         # Run tests
```

### Frontend
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Acknowledgments

- [Shadcn/UI](https://ui.shadcn.com/) for the beautiful component library
- [Recharts](https://recharts.org/) for data visualization
- [Lucide Icons](https://lucide.dev/) for the icon set
- Item Response Theory research for inspiring the adaptive algorithm

---

## Contact

For questions or support, please open an issue on GitHub.

# InternLearningNetwork

**Mission:** Allows interns all over the place to share anything they found/learned in a new blog-like system, with a gamified way of levelling up with new skills and points and also points for sharing something that gives other users skills.

## Tech Stack

- **Frontend**: React + Vite, TypeScript
- **Backend**: Node.js + Express, TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Architecture**: Monorepo structure

## Project Structure

```
internlearningnetwork/
├── client/          # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API client
│   │   └── types/        # TypeScript definitions
│   └── package.json
├── server/          # Express backend API
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── middleware/   # Auth, validation, etc.
│   │   ├── services/     # Business logic
│   │   ├── prisma/       # Database schema & migrations
│   │   └── utils/        # Helper functions
│   └── package.json
├── shared/          # Shared TypeScript types & utilities
│   └── src/
│       ├── types/        # Common type definitions
│       └── validations/  # Shared validation schemas
├── .github/workflows/
│   └── test.yml    # CI/CD pipeline (to be created)
├── TASKS.md        # Development task list
└── README.md       # This file
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │
│  │   PostFeed  │ │CreatePost   │ │    UserProfile      │  │
│  └─────────────┘ └─────────────┘ └─────────────────────┘  │
│         │                │                   │             │
│         └────────────────┼───────────────────┘             │
│                          │                                 │
│                  ┌───────▼────────┐                        │
│                  │  API Client    │ (axios/fetch)         │
│                  └────────┬───────┘                        │
└───────────────────────────┼─────────────────────────────────┘
                            │ HTTPS/REST API
                            │ JWT Auth
┌───────────────────────────▼─────────────────────────────────┐
│                    Backend (Express)                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │
│  │   Auth API  │ │  Posts API  │ │  Skills & Points    │  │
│  └─────────────┘ └─────────────┘ └─────────────────────┘  │
│         │                │                   │             │
│         └────────────────┼───────────────────┘             │
│                          │                                 │
│                  ┌───────▼────────┐                        │
│                  │  Middleware    │ (auth, validation)    │
│                  └────────┬───────┘                        │
│                          │                                 │
│                  ┌───────▼────────┐                        │
│                  │  Services      │ (business logic)      │
│                  └────────┬───────┘                        │
└───────────────────────────┼─────────────────────────────────┘
                            │ Prisma ORM
┌───────────────────────────▼─────────────────────────────────┐
│                 PostgreSQL Database                        │
│  ┌────────┐ ┌───────┐ ┌──────┐ ┌─────────┐ ┌──────────┐  │
│  │  users │ │ posts │ │skills││user_skills│points_log│  │
│  └────────┘ └───────┘ └──────┘ └─────────┘ └──────────┘  │
│  ┌────────┐ ┌──────────────────────────────────────────┐   │
│  │ levels │ │        levels (calculated/derived)       │   │
│  └────────┘ └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### Core Tables
- **users**: id, email, password_hash, username, created_at, updated_at
- **posts**: id, title, content, author_id (FK), created_at, updated_at
- **skills**: id, name, description, created_at
- **post_skills**: post_id (FK), skill_id (FK) - junction table for many-to-many
- **user_skills**: user_id (FK), skill_id (FK), claimed_at, source_post_id (FK) - tracks skills users have claimed
- **points_log**: id, user_id (FK), points, action_type, reference_id (post/skill), created_at
- **levels**: id, level_number, min_points, max_points (or use calculated levels)

### Relationships
- User ↔ Post: One-to-many (one author, many posts)
- Post ↔ Skill: Many-to-many via post_skills
- User ↔ Skill: Many-to-many via user_skills (skills they've claimed)
- User ↔ Points: One-to-many via points_log (point history)
- User ↔ Level: Calculated based on total points

## Current Progress

**Phase 1: Planning & Setup**
- ✅ Technical stack defined (Node.js + Express, React, PostgreSQL, Prisma, JWT)
- ✅ Architecture diagram created
- ✅ Monorepo structure initialized with package.json files
- ✅ Root workspace configuration created
- ✅ Prisma schema designed
- ✅ `.env.example` created and dependencies installed
- ⏳ Next: Database setup with Prisma migrations

## Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- Git

### 1. Environment Configuration

Copy the example environment file and update with your values:

```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A secure random string for JWT signing

### 2. Database Setup

Generate Prisma client and create/update database schema:

```bash
npx prisma generate
npx prisma db push
```

(Optional) Seed the database with initial data:

```bash
npx prisma db seed
```

### 3. Running the Application

**Development mode** (runs both frontend and backend):

```bash
npm run dev
```

Or run them separately:

```bash
# Backend only (server on port 3001)
npm run dev:server

# Frontend only (client on port 5173)
npm run dev:client
```

**Build for production:**

```bash
npm run build
```

**Run linter:**

```bash
npm run lint
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- API Health check: http://localhost:3001/api/health (to be implemented)

## API Endpoints (Planned)

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET  /api/auth/profile` - Get current user profile

### Posts
- `GET    /api/posts` - List all posts (with skill tags)
- `GET    /api/posts/:id` - Get single post
- `POST   /api/posts` - Create new post
- `PUT    /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Skills
- `GET    /api/skills` - List all skills
- `POST   /api/skills` - Create skill (admin)
- `POST   /api/posts/:id/claim-skill` - Claim a skill from a post
- `GET    /api/users/:id/skills` - Get user's earned skills

### Points & Levels
- `GET /api/users/:id/points` - Get user's points and history
- `GET /api/users/:id/level` - Get user's current level

### Leaderboard
- `GET /api/leaderboard` - Users ranked by points/level

## Key Features

1. **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
2. **Blog Posts**: Create, read, update, delete posts with skill tag associations
3. **Skill System**: 
   - Skills can be attached to posts (like hashtags)
   - Other users can "claim" skills from posts
   - Claiming a skill adds it to the user's profile AND awards points to the post author
4. **Gamification**:
   - Points awarded: +10 for creating a post, +5 per skill claimed from your post
   - Level progression based on total points
   - Points log tracks all transactions
5. **User Profiles**: Display level, points, earned skills with dates, recent activity
6. **Leaderboard**: Competitive ranking based on points and level

## License

TBD

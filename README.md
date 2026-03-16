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

**Phase 2: Core Backend & Authentication**
- ✅ Implemented user registration/login endpoints with JWT token generation using bcrypt
  - `POST /api/auth/register` - User registration with email, username, password
  - `POST /api/auth/login` - User login, returns JWT token
  - `GET  /api/auth/me` - Get authenticated user's profile (requires Bearer token)
- ✅ Created CRUD API for blog posts with validation middleware
  - Posts include skill_tags array for associating skills
- ✅ Built skill management system with full CRUD endpoints (authenticated)
  - `GET    /api/skills` - List all skills
  - `GET    /api/skills/:id` - Get skill details
  - `POST   /api/skills` - Create new skill (requires authentication)
  - `PUT    /api/skills/:id` - Update skill (requires authentication)
  - `DELETE /api/skills/:id` - Delete skill (requires authentication)
  - Skills can be associated with posts via skill_tags field
- ✅ Implemented post approval system that assigns skills to authors
  - `PUT /api/posts/:id/approve` - Approve post and automatically assign associated skills to the author (requires authentication)

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

## API Endpoints

### Authentication ✅
- `POST /api/auth/register` - User registration
  - Body: `{ email, username, password }`
  - Returns: `{ message, user: { id, email, username, createdAt }, token }`
- `POST /api/auth/login` - User login
  - Body: `{ email, password }`
  - Returns: `{ message, user: { id, email, username, createdAt, totalPoints, level }, token }`
- `GET  /api/auth/me` - Get current user profile **(requires Bearer token)**
  - Headers: `Authorization: Bearer <jwt_token>`
  - Returns: `{ user: { id, email, username, createdAt, totalPoints, level, userSkills } }`

### Posts
- `GET    /api/posts` - List all posts (with skill tags)
- `GET    /api/posts/:id` - Get single post
- `POST   /api/posts` - Create new post
- `PUT    /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Skills
- `GET    /api/skills` - List all skills
- `GET    /api/skills/:id` - Get skill details
- `POST   /api/skills` - Create new skill (requires authentication)
- `PUT    /api/skills/:id` - Update skill (requires authentication)
- `DELETE /api/skills/:id` - Delete skill (requires authentication)

### Claims (Skill Claiming)
- `POST   /api/claims/posts/:postId/skills/:skillId/claim` - Claim a skill from a post (requires authentication)
  - Awards 5 points to the post author
  - Adds the skill to the claimant's profile
- `GET    /api/claims/user/skills` - Get authenticated user's claimed skills (requires authentication)

### Posts
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

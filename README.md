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
- ✅ Monorepo structure created
- ⏳ Next: Initialize Git, install dependencies, create .env.example

## Getting Started (After Dependencies Installation)

### Backend Setup (server/)
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend Setup (client/)
```bash
cd client
npm install
npm run dev
```

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

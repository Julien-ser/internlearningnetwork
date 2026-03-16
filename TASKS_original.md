# internlearningnetwork
**Mission:** Allows interns all over the place to share anything they found/learned in a new blog-like system, with a gamified way of levelling up with new skills and points and also points for sharing something that gives other users skills.

## Phase 1: Planning & Setup
- [ ] Define technical stack (Node.js + Express or Python + Flask/Django, React/Vue frontend, PostgreSQL) and create architecture diagram
- [ ] Set up monorepo structure with `/client`, `/server`, and `/shared` directories; initialize Git repository
- [ ] Design database schema with tables: `users`, `posts`, `skills`, `user_skills`, `points_log`, `levels`
- [ ] Create `.env.example` file and install dependencies: Express/Flask, React/Vue, Prisma/Sequelize/SQLAlchemy, JWT auth library

## Phase 2: Core Backend & Authentication
- [ ] Implement user registration/login endpoints with JWT token generation using bcrypt for password hashing
- [ ] Create CRUD API for blog posts with fields: title, content, skill_tags array, author_id, created_at; add validation middleware
- [ ] Build skill management system: endpoints to create/list skills, associate skills with posts, and assign skills to users upon post approval
- [ ] Implement basic point allocation logic: +10 points for creating a post, +5 points per skill tag that other users claim from the post

## Phase 3: Gamification & Frontend
- [ ] Design leveling algorithm (e.g., levels 1-10 based on total points with exponential thresholds) and create `/api/level` endpoint to calculate user level
- [ ] Build user profile page displaying: current level, total points, earned skills with dates, and recent points_log entries
- [ ] Create React/Vue components: PostFeed, CreatePost form, SkillBadge display, UserProfile, Leaderboard (sorted by points/level)
- [ ] Implement skill claiming system: users can click skill tags on posts to "claim" them, awarding the post author points and adding skill to claimant's profile

## Phase 4: Polish, Testing & Deployment
- [ ] Write unit tests for backend (Jest/Pytest) covering auth, post CRUD, point calculations, and skill claiming logic with 80%+ coverage
- [ ] Add input validation, rate limiting, and CORS configuration; set up error logging middleware and sanitize user inputs
- [ ] Configure production database migrations, create seed data for demo skills, and optimize queries with indexes on foreign keys
- [ ] Deploy to Vercel/Netlify (frontend) and Railway/Render (backend); create comprehensive README with setup instructions and API documentation

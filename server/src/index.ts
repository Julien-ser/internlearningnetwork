import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { generalRateLimiter } from './middleware/rate-limit'
import { sanitize } from './middleware/sanitize'
import { logger, errorHandler } from './middleware/logger'
import authRoutes from './auth/auth.routes'
import postsRoutes from './posts/posts.routes'
import skillsRoutes from './skills/skills.routes'
import claimsRoutes from './claims/claims.routes'
import levelsRoutes from './levels/levels.routes'

const app = express()
const PORT = process.env.PORT || 3001

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}
app.use(cors(corsOptions))

app.use(helmet())
app.use(generalRateLimiter)
app.use(express.json())
app.use(sanitize)
app.use(logger)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/posts', postsRoutes)
app.use('/api/skills', skillsRoutes)
app.use('/api/claims', claimsRoutes)
app.use('/api/level', levelsRoutes)

// Error handling middleware
app.use(errorHandler)

// Export app for testing
export { app }

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${PORT}`)
  })
}

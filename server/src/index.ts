import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import authRoutes from './auth/auth.routes'
import postsRoutes from './posts/posts.routes'
import skillsRoutes from './skills/skills.routes'
import claimsRoutes from './claims/claims.routes'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(helmet())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/posts', postsRoutes)
app.use('/api/skills', skillsRoutes)
app.use('/api/claims', claimsRoutes)

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`)
})

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import authRoutes from './auth/auth.routes'
import postsRoutes from './posts/posts.routes'

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

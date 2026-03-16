import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './UserProfile.css'

interface Skill {
  id: number
  name: string
  description?: string
}

interface UserSkill {
  skill: Skill
  claimedAt: string
}

interface PointsLog {
  id: number
  points: number
  reason: string
  createdAt: string
  skill?: Skill
  post?: { title: string } | null
}

interface User {
  id: number
  email: string
  username: string
  createdAt: string
  totalPoints: number
  level: {
    levelNumber: number
    name: string
  }
  userSkills: UserSkill[]
  pointsLog: PointsLog[]
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('No authentication token found')
          setLoading(false)
          return
        }

        const response = await axios.get('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        setUser(response.data.user)
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>
  }

  if (error) {
    return <div className="profile-error">Error: {error}</div>
  }

  if (!user) {
    return <div className="profile-error">No user data available</div>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="user-profile">
      <header className="profile-header">
        <h1>{user.username}'s Profile</h1>
        <div className="level-badge">
          <span className="level-number">Level {user.level.levelNumber}</span>
          <span className="level-name">{user.level.name}</span>
        </div>
      </header>

      <section className="profile-stats">
        <div className="stat-card">
          <h3>Total Points</h3>
          <p className="stat-value">{user.totalPoints}</p>
        </div>
        <div className="stat-card">
          <h3>Earned Skills</h3>
          <p className="stat-value">{user.userSkills.length}</p>
        </div>
      </section>

      <section className="profile-section">
        <h2>Earned Skills</h2>
        {user.userSkills.length === 0 ? (
          <p className="empty-message">No skills earned yet. Start sharing and claiming skills!</p>
        ) : (
          <div className="skills-grid">
            {user.userSkills.map((userSkill, index) => (
              <div key={`${userSkill.skill.id}-${index}`} className="skill-badge">
                <h4>{userSkill.skill.name}</h4>
                {userSkill.skill.description && (
                  <p className="skill-description">{userSkill.skill.description}</p>
                )}
                <span className="skill-date">Earned on {formatDate(userSkill.claimedAt)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="profile-section">
        <h2>Recent Activity</h2>
        {user.pointsLog.length === 0 ? (
          <p className="empty-message">No recent activity. Start posting and claiming skills!</p>
        ) : (
          <div className="activity-log">
            {user.pointsLog.map((log) => (
              <div key={log.id} className="activity-entry">
                <div className="activity-points">
                  <span className={`points ${log.points > 0 ? 'positive' : 'negative'}`}>
                    {log.points > 0 ? '+' : ''}{log.points}
                  </span>
                </div>
                <div className="activity-details">
                  <p className="activity-reason">{log.reason}</p>
                  <div className="activity-meta">
                    <span className="activity-date">{formatDate(log.createdAt)}</span>
                    {log.skill && <span className="activity-skill">Skill: {log.skill.name}</span>}
                    {log.post && <span className="activity-post">Post: {log.post.title}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default UserProfile

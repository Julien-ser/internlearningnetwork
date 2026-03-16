import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './Leaderboard.css'

interface LeaderboardUser {
  id: number
  username: string
  totalPoints: number
  level: {
    levelNumber: number
    name: string
  }
}

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('/api/users/leaderboard')
        setUsers(response.data.users)
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch leaderboard')
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const getMedal = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  if (loading) {
    return <div className="leaderboard-loading">Loading leaderboard...</div>
  }

  if (error) {
    return <div className="leaderboard-error">Error: {error}</div>
  }

  if (users.length === 0) {
    return (
      <div className="leaderboard-empty">
        <p>No users in leaderboard yet.</p>
      </div>
    )
  }

  return (
    <div className="leaderboard">
      <h2>🏆 Leaderboard</h2>
      <p className="leaderboard-subtitle">Top interns ranked by points and level</p>
      <div className="leaderboard-table-wrapper">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Level</th>
              <th>Total Points</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => {
              const rank = index + 1
              const medal = getMedal(rank)
              return (
                <tr
                  key={user.id}
                  className={rank <= 3 ? `top-${rank}` : ''}
                >
                  <td className="rank-cell">
                    {medal && <span className="medal">{medal}</span>}
                    <span className="rank-number">#{rank}</span>
                  </td>
                  <td className="username-cell">{user.username}</td>
                  <td className="level-cell">
                    <span className="level-badge">Lvl {user.level.levelNumber} - {user.level.name}</span>
                  </td>
                  <td className="points-cell">
                    <span className="points">{user.totalPoints.toLocaleString()} pts</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Leaderboard

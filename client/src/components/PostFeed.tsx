import React, { useEffect, useState } from 'react'
import axios from 'axios'
import SkillBadge, { Skill } from './SkillBadge'
import './PostFeed.css'

interface Post {
  id: number
  title: string
  content: string
  authorId: number
  author: {
    id: number
    username: string
  }
  createdAt: string
  updatedAt: string
  approved: boolean
  skill_tags: Skill[]
}

const PostFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [claimedSkills, setClaimedSkills] = useState<Set<string>>(new Set())
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const userResponse = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          })
          setCurrentUserId(userResponse.data.user.id)

          const claimedResponse = await axios.get('/api/claims/user/skills', {
            headers: { Authorization: `Bearer ${token}` }
          })
          const claimedSet = new Set<string>()
          claimedResponse.data.userSkills.forEach((us: { skill: Skill; claimedAt: string }) => {
            claimedSet.add(`${us.skill.id}`)
          })
          setClaimedSkills(claimedSet)
        }

        const postsResponse = await axios.get('/api/posts')
        setPosts(postsResponse.data.posts)
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  const handleClaimSkill = async (postId: number, skillId: number) => {
    if (!currentUserId) {
      alert('Please log in to claim skills')
      return
    }

    const skillKey = `${skillId}`
    if (claimedSkills.has(skillKey)) {
      alert('You have already claimed this skill')
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `/api/claims/posts/${postId}/skills/${skillId}/claim`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setClaimedSkills(prev => new Set(prev).add(skillKey))
      alert('Skill claimed successfully!')
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to claim skill')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  if (loading) {
    return <div className="post-feed-loading">Loading posts...</div>
  }

  if (error) {
    return <div className="post-feed-error">Error: {error}</div>
  }

  if (posts.length === 0) {
    return (
      <div className="post-feed-empty">
        <p>No posts yet. Be the first to share something!</p>
      </div>
    )
  }

  return (
    <div className="post-feed">
      <h2>Recent Posts</h2>
      <div className="posts-list">
        {posts.map(post => (
          <article key={post.id} className="post-card">
            <header className="post-header">
              <h3 className="post-title">{post.title}</h3>
              <div className="post-meta">
                <span className="post-author">by {post.author.username}</span>
                <span className="post-date">{formatDate(post.createdAt)}</span>
                {!post.approved && (
                  <span className="pending-badge">Pending Approval</span>
                )}
              </div>
            </header>

            <div className="post-content">
              <p>{truncateContent(post.content)}</p>
            </div>

            {post.skill_tags.length > 0 && (
              <div className="post-skills">
                <h4>Skills:</h4>
                <div className="skills-container">
                  {post.skill_tags.map(skill => {
                    const isOwnPost = currentUserId === post.authorId
                    const isClaimed = claimedSkills.has(`${skill.id}`)

                    return (
                      <SkillBadge
                        key={skill.id}
                        skill={skill}
                        onClick={!isOwnPost && !isClaimed ? () => handleClaimSkill(post.id, skill.id) : undefined}
                        claimed={isClaimed}
                        showDescription={false}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            <footer className="post-footer">
              <button className="view-post-btn">View Full Post</button>
            </footer>
          </article>
        ))}
      </div>
    </div>
  )
}

export default PostFeed

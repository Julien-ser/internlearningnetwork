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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/posts')
        setPosts(response.data.posts)
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch posts')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

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
                  {post.skill_tags.map(skill => (
                    <SkillBadge key={skill.id} skill={skill} />
                  ))}
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

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import SkillBadge, { Skill } from './SkillBadge'
import './CreatePost.css'

interface CreatePostProps {
  onPostCreated?: () => void
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([])
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [skillsLoading, setSkillsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await axios.get('/api/skills')
        setAvailableSkills(response.data.skills)
      } catch (err: any) {
        console.error('Failed to fetch skills:', err)
      } finally {
        setSkillsLoading(false)
      }
    }

    fetchSkills()
  }, [])

  const handleSkillToggle = (skillId: number) => {
    setSelectedSkillIds(prev =>
      prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('No authentication token found. Please log in.')
        setLoading(false)
        return
      }

      await axios.post(
        '/api/posts',
        {
          title: title.trim(),
          content: content.trim(),
          skill_tags: selectedSkillIds
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setSuccess(true)
      setTitle('')
      setContent('')
      setSelectedSkillIds([])

      if (onPostCreated) {
        onPostCreated()
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  if (skillsLoading) {
    return <div className="create-post-loading">Loading skills...</div>
  }

  return (
    <div className="create-post">
      <h2>Create New Post</h2>

      {error && <div className="create-post-error">{error}</div>}
      {success && <div className="create-post-success">Post created successfully!</div>}

      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a descriptive title"
            maxLength={200}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content *</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your knowledge, insights, or experiences..."
            rows={8}
            required
          />
        </div>

        <div className="form-group">
          <label>Skill Tags</label>
          <p className="form-hint">Select the skills this post relates to</p>
          <div className="skills-selector">
            {availableSkills.length === 0 ? (
              <p className="no-skills">No skills available. Contact an admin to add skills.</p>
            ) : (
              <div className="skills-grid">
                {availableSkills.map(skill => (
                  <div
                    key={skill.id}
                    className={`skill-option ${selectedSkillIds.includes(skill.id) ? 'selected' : ''}`}
                    onClick={() => handleSkillToggle(skill.id)}
                  >
                    <SkillBadge
                      skill={skill}
                      showDescription={false}
                    />
                    <span className="select-indicator">
                      {selectedSkillIds.includes(skill.id) ? '✓' : '+'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {selectedSkillIds.length > 0 && (
            <div className="selected-skills">
              <strong>Selected:</strong> {selectedSkillIds.length} skill(s)
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
          <button
            type="button"
            onClick={() => {
              setTitle('')
              setContent('')
              setSelectedSkillIds([])
              setError(null)
            }}
            className="cancel-btn"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreatePost

import React from 'react'
import './SkillBadge.css'

interface Skill {
  id: number
  name: string
  description?: string
}

interface SkillBadgeProps {
  skill: Skill
  onClick?: () => void
  claimed?: boolean
  showDescription?: boolean
}

const SkillBadge: React.FC<SkillBadgeProps> = ({
  skill,
  onClick,
  claimed = false,
  showDescription = true
}) => {
  return (
    <div
      className={`skill-badge ${onClick ? 'clickable' : ''} ${claimed ? 'claimed' : ''}`}
      onClick={onClick}
      title={skill.description || skill.name}
    >
      <h4 className="skill-name">{skill.name}</h4>
      {showDescription && skill.description && (
        <p className="skill-description">{skill.description}</p>
      )}
      {claimed && <span className="claimed-indicator">✓</span>}
    </div>
  )
}

export default SkillBadge
export type { Skill }

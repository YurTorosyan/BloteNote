import { useState, useEffect } from 'react'
import './SetupPage.css'

const GOALS = [101, 201, 301]

export default function SetupPage({ visible, onStart, onBack }) {
  const [mounted, setMounted] = useState(false)
  const [teamA, setTeamA]     = useState('')
  const [teamB, setTeamB]     = useState('')
  const [goal,  setGoal]      = useState(301)

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setMounted(true), 30)
      return () => clearTimeout(t)
    } else {
      setMounted(false)
    }
  }, [visible])

  const canStart = teamA.trim().length > 0 && teamB.trim().length > 0

  const handleStart = () => {
    if (!canStart) return
    onStart({ teamA: teamA.trim(), teamB: teamB.trim(), goal })
  }

  return (
    <div className={`setup${mounted ? ' setup--visible' : ''}`}>
      <header className="setup__header">
        <button className="btn-back" onClick={onBack}>← Назад</button>
        <span className="setup__title">Новая игра</span>
        <span />
      </header>

      <div className="setup__body">

        {/* Team names */}
        <div className="setup__section">
          <div className="section-label">Команды</div>

          <div className="team-inputs">
            <div className="team-input-wrap">
              <span className="team-input-badge team-input-badge--a">А</span>
              <input
                className="team-input"
                type="text"
                placeholder="Название команды А"
                maxLength={24}
                value={teamA}
                onChange={e => setTeamA(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && document.getElementById('input-b').focus()}
              />
            </div>

            <div className="teams-vs">VS</div>

            <div className="team-input-wrap">
              <span className="team-input-badge team-input-badge--b">Б</span>
              <input
                id="input-b"
                className="team-input"
                type="text"
                placeholder="Название команды Б"
                maxLength={24}
                value={teamB}
                onChange={e => setTeamB(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleStart()}
              />
            </div>
          </div>
        </div>

        {/* Goal */}
        <div className="setup__section">
          <div className="section-label">Цель</div>
          <div className="goal-picker">
            {GOALS.map(g => (
              <button
                key={g}
                className={`goal-btn${goal === g ? ' goal-btn--active' : ''}`}
                onClick={() => setGoal(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <button
          className={`btn-start${canStart ? ' btn-start--ready' : ''}`}
          onClick={handleStart}
          disabled={!canStart}
        >
          Начать игру
        </button>

      </div>
    </div>
  )
}

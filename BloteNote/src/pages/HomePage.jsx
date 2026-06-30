import { useEffect, useState } from 'react'
import './HomePage.css'

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 60)    return 'только что'
  if (diff < 3600)  return `${Math.floor(diff / 60)} мин назад`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`
  return `${Math.floor(diff / 86400)} д назад`
}

export default function HomePage({ visible, onNewGame, onContinue, onDelete, games }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setMounted(true), 30)
      return () => clearTimeout(t)
    }
  }, [visible])

  return (
    <div className={`home${mounted ? ' home--visible' : ''}`}>

      <header className="home__header">
        <div className="home__logo">
          <svg width="32" height="32" viewBox="0 0 56 56" fill="none">
            <rect width="56" height="56" rx="14" fill="url(#h-grad)"/>
            <text x="28" y="38" textAnchor="middle" fontSize="28" fill="white" fontFamily="serif">♠</text>
            <defs>
              <linearGradient id="h-grad" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                <stop stopColor="#a78bfa"/>
                <stop offset="1" stopColor="#6d57e8"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="home__wordmark">
            <span>Blote</span><span className="home__wordmark-note">Note</span>
          </span>
        </div>
      </header>

      <div className="home__cta-wrap">
        <button className="btn-new-game" onClick={onNewGame}>
          <span className="btn-new-game__icon">＋</span>
          Новая игра
        </button>
      </div>

      <section className="home__history">
        <div className="history-label">
          История игр
          {games.length > 0 && <span className="history-badge">{games.length}</span>}
        </div>

        {games.length === 0 ? (
          <div className="history-empty">
            <span className="history-empty__icon">🃏</span>
            <p>Игр пока нет</p>
            <p className="history-empty__sub">Нажми «Новая игра» чтобы начать</p>
          </div>
        ) : (
          <div className="game-list">
            {games.slice().reverse().map((g, i) => (
              <GameCard
                key={g.id}
                game={g}
                index={i}
                onClick={() => onContinue(g)}
                onDelete={() => onDelete(g.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function GameCard({ game, index, onClick, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const finished    = !!game.winner
  const winnerName  = game.winner === 'a' ? game.teamA : game.teamB

  const handleDelete = (e) => {
    e.stopPropagation()
    if (confirmDelete) {
      onDelete()
    } else {
      setConfirmDelete(true)
      // auto-reset after 3s
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <div
      className="game-card"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={onClick}
    >
      <div className="game-card__top">
        <div className="game-card__teams">
          <span className={`game-card__team${game.winner === 'a' ? ' game-card__team--winner' : ''}`}>
            {game.teamA}
          </span>
          <span className="game-card__vs">vs</span>
          <span className={`game-card__team${game.winner === 'b' ? ' game-card__team--winner' : ''}`}>
            {game.teamB}
          </span>
        </div>
        <div className="game-card__right">
          <span className="game-card__time">{timeAgo(game.startedAt)}</span>
          <button
            className={`btn-delete${confirmDelete ? ' btn-delete--confirm' : ''}`}
            onClick={handleDelete}
            title={confirmDelete ? 'Нажми ещё раз для удаления' : 'Удалить игру'}
          >
            {confirmDelete ? '✓ Удалить?' : '✕'}
          </button>
        </div>
      </div>

      <div className="game-card__bottom">
        <div className="game-card__score">
          <span className={game.winner === 'a' ? 'score--win' : 'score--neutral'}>{game.scoreA}</span>
          <span className="score-sep">:</span>
          <span className={game.winner === 'b' ? 'score--win' : 'score--neutral'}>{game.scoreB}</span>
        </div>
        <div className="game-card__meta">
          <span className="meta-chip">до {game.goal}</span>
          <span className="meta-chip">{game.rounds.length} раздач</span>
        </div>
      </div>

      <div className="game-card__footer">
        {finished
          ? <span className="footer-chip footer-chip--done">🏆 {winnerName}</span>
          : <span className="footer-chip footer-chip--active">▶ Продолжить</span>
        }
      </div>
    </div>
  )
}

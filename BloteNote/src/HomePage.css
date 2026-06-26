import { useEffect, useState } from 'react'
import './SplashScreen.css'

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('enter') // enter → hold → exit

  useEffect(() => {
    // after logo animates in, hold briefly, then fade out
    const holdTimer = setTimeout(() => setPhase('exit'), 1800)
    return () => clearTimeout(holdTimer)
  }, [])

  useEffect(() => {
    if (phase !== 'exit') return
    // wait for fade-out transition, then notify parent
    const doneTimer = setTimeout(onDone, 600)
    return () => clearTimeout(doneTimer)
  }, [phase, onDone])

  return (
    <div className={`splash splash--${phase}`}>
      <div className="splash__inner">
        <div className="splash__logo">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="56" height="56" rx="16" fill="url(#card-grad)"/>
            {/* card suit symbol */}
            <text x="28" y="38" textAnchor="middle" fontSize="28" fill="white" fontFamily="serif">♠</text>
            <defs>
              <linearGradient id="card-grad" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                <stop stopColor="#a78bfa"/>
                <stop offset="1" stopColor="#6d57e8"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="splash__wordmark">
          <span className="splash__word-blote">Blote</span>
          <span className="splash__word-note">Note</span>
        </div>

        <p className="splash__tagline">Счётчик очков</p>

        <div className="splash__dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  )
}

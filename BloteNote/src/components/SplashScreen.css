.splash {
  position: fixed;
  inset: 0;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: opacity 0.55s ease, transform 0.55s ease;
}

.splash--enter {
  opacity: 1;
  transform: scale(1);
}

.splash--hold {
  opacity: 1;
  transform: scale(1);
}

.splash--exit {
  opacity: 0;
  transform: scale(1.04);
  pointer-events: none;
}

/* ── inner wrapper ── */
.splash__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  animation: splash-rise 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes splash-rise {
  from { opacity: 0; transform: translateY(22px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}

/* ── logo icon ── */
.splash__logo {
  filter: drop-shadow(0 0 28px rgba(124, 106, 247, 0.45));
  animation: logo-pulse 2s ease-in-out infinite;
}

@keyframes logo-pulse {
  0%, 100% { filter: drop-shadow(0 0 24px rgba(124,106,247,0.40)); }
  50%       { filter: drop-shadow(0 0 40px rgba(124,106,247,0.70)); }
}

/* ── wordmark ── */
.splash__wordmark {
  display: flex;
  align-items: baseline;
  gap: 1px;
  line-height: 1;
}

.splash__word-blote {
  font-size: 38px;
  font-weight: 700;
  letter-spacing: -1.5px;
  color: var(--text);
}

.splash__word-note {
  font-size: 38px;
  font-weight: 700;
  letter-spacing: -1.5px;
  background: linear-gradient(135deg, var(--accent-light), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── tagline ── */
.splash__tagline {
  font-size: 13px;
  color: var(--text-dim);
  letter-spacing: 0.5px;
}

/* ── loading dots ── */
.splash__dots {
  display: flex;
  gap: 7px;
  margin-top: 8px;
}

.splash__dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0.3;
  animation: dot-bounce 1.1s ease-in-out infinite;
}

.splash__dots span:nth-child(1) { animation-delay: 0s; }
.splash__dots span:nth-child(2) { animation-delay: 0.18s; }
.splash__dots span:nth-child(3) { animation-delay: 0.36s; }

@keyframes dot-bounce {
  0%, 80%, 100% { opacity: 0.25; transform: scale(0.85); }
  40%            { opacity: 1;    transform: scale(1.2); }
}

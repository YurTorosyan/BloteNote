import { useState, useEffect } from 'react'
import {
  BONUS_BELOTE,
  BONUS_SEQUENCES,
  getQuadOptions,
} from '../scoring'
import './GamePage.css'

const SUITS = [
  { id: 'spades',   label: '♠', name: 'Пики' },
  { id: 'hearts',   label: '♥', name: 'Червы' },
  { id: 'diamonds', label: '♦', name: 'Бубны' },
  { id: 'clubs',    label: '♣', name: 'Трефы' },
  { id: 'notrump',  label: 'A', name: 'Без козыря' },
]

// ── BonusPanel ────────────────────────────────────────────────────────────────
// Белот: max count 1 (только одна К+Д козыря)
// Тёрц/Кварт/Квинт: count может быть > 1 (несколько разных последовательностей)
// Каре: одиночный выбор
function BonusPanel({ label, isNotrump, onChange }) {
  const [selected,  setSelected]  = useState([])  // [{id,label,pts,count}]
  const [quadOpen,  setQuadOpen]  = useState(false)
  const quadOptions = getQuadOptions(isNotrump)

  const emit = (next) => {
    setSelected(next)
    // Белот всегда засчитывается отдельно, не участвует в сравнении "старшинства"
    const beloteItem  = next.find(b => b.id === 'belote')
    const beloteTotal = beloteItem ? beloteItem.pts * beloteItem.count : 0

    const comboItems = next.filter(b => b.id !== 'belote')
    const comboTotal = comboItems.reduce((s, b) => s + b.pts * b.count, 0)
    const comboMax    = comboItems.reduce((m, b) => Math.max(m, b.pts), 0)

    onChange(beloteTotal, comboTotal, comboMax)
  }

  const toggleBelote = () => {
    const exists = selected.find(s => s.id === 'belote')
    const next = exists
      ? selected.filter(s => s.id !== 'belote')
      : [...selected, { ...BONUS_BELOTE, count: 1 }]
    emit(next)
  }

  // Тёрц/Кварт/Квинт: клик увеличивает count (1→2→3→0)
  const cycleSequence = (b) => {
    const exists = selected.find(s => s.id === b.id)
    let next
    if (!exists) {
      next = [...selected, { ...b, count: 1 }]
    } else if (exists.count < 4) {
      next = selected.map(s => s.id === b.id ? { ...s, count: s.count + 1 } : s)
    } else {
      next = selected.filter(s => s.id !== b.id)
    }
    emit(next)
  }

  const selectQuad = (quad) => {
    if (quad.pts === 0) {
      setQuadOpen(false)
      return
    }
    const exists = selected.find(s => s.id === quad.id)
    const next = exists
      ? selected.map(s => s.id === quad.id ? { ...s, count: s.count + 1 } : s)
      : [...selected, { ...quad, count: 1 }]
    emit(next)
  }

  const removeQuad = (id) => {
    const exists = selected.find(s => s.id === id)
    let next
    if (exists.count > 1) {
      next = selected.map(s => s.id === id ? { ...s, count: s.count - 1 } : s)
    } else {
      next = selected.filter(s => s.id !== id)
    }
    emit(next)
  }

  const quadEntries = selected.filter(s => s.id.startsWith('q_'))
  const quadTotal   = quadEntries.reduce((s, q) => s + q.pts * q.count, 0)
  const total       = selected.reduce((s, b) => s + b.pts * b.count, 0)

  return (
    <div className="bonus-panel">
      <div className="bonus-panel__label">{label}</div>
      <div className="bonus-chips">
        {!isNotrump && (
          <button
            className={`bchip${selected.find(s => s.id === 'belote') ? ' bchip--on' : ''}`}
            onClick={toggleBelote}
          >
            Белот <span className="bchip__pts">+{BONUS_BELOTE.pts}</span>
          </button>
        )}

        {BONUS_SEQUENCES.map(b => {
          const sel = selected.find(s => s.id === b.id)
          const count = sel?.count ?? 0
          return (
            <button
              key={b.id}
              className={`bchip${count > 0 ? ' bchip--on' : ''}`}
              onClick={() => cycleSequence(b)}
            >
              {b.label} <span className="bchip__pts">+{b.pts}</span>
              {count > 1 && <span className="bchip__count">×{count}</span>}
            </button>
          )
        })}

        <button
          className={`bchip bchip--quad${quadEntries.length > 0 ? ' bchip--on' : ''}`}
          onClick={() => setQuadOpen(o => !o)}
        >
          {quadEntries.length > 0 ? `Каре +${quadTotal}` : 'Каре ▾'}
        </button>
      </div>

      {/* Список выбранных каре (если несколько) */}
      {quadEntries.length > 0 && (
        <div className="quad-selected-list">
          {quadEntries.map(q => (
            <span key={q.id} className="quad-selected-chip">
              {q.label} +{q.pts}{q.count > 1 && ` ×${q.count}`}
              <button className="quad-selected-remove" onClick={() => removeQuad(q.id)}>✕</button>
            </span>
          ))}
        </div>
      )}

      {quadOpen && (
        <div className="quad-picker">
          {quadOptions.map(q => (
            <button
              key={q.id}
              className={`quad-btn${q.pts === 0 ? ' quad-btn--zero' : ''}`}
              onClick={() => selectQuad(q)}
            >
              <span className="quad-btn__label">{q.label}</span>
              <span className="quad-btn__pts">{q.pts > 0 ? `+${q.pts}` : '0'}</span>
              <span className="quad-btn__desc">{q.desc}</span>
            </button>
          ))}
          <button className="quad-btn quad-btn--cancel" onClick={() => setQuadOpen(false)}>
            Готово
          </button>
        </div>
      )}

      {total > 0 && <div className="bonus-total">Бонусов: +{total}</div>}
    </div>
  )
}

// ── Step 1: Bid form ──────────────────────────────────────────────────────────
function BidForm({ game, onConfirm }) {
  const [declarer,       setDeclarer]       = useState('a')
  const [suit,           setSuit]           = useState(null)
  const [bid,            setBid]            = useState('')
  const [isKaput,        setIsKaput]        = useState(false)
  const [kaputDeclBonus, setKaputDeclBonus] = useState(0)
  const [contra,         setContra]         = useState('none')

  const canConfirm = suit !== null && (
    isKaput ? true : (bid !== '' && Number(bid) >= 8)
  )

  const handleKaput = () => {
    setIsKaput(true)
    setBid('')
    setKaputDeclBonus(0)
  }

  const handleBidChange = (v) => {
    setIsKaput(false)
    setBid(v)
    setKaputDeclBonus(0)
  }

  const handleConfirm = () => {
    if (!canConfirm) return
    onConfirm({
      declarer,
      suit,
      bid: isKaput ? 25 : Number(bid),
      isKaput,
      contra,
      kaputDeclaredBonus: isKaput ? kaputDeclBonus : 0,
    })
  }

  return (
    <div className="bid-form">
      <div className="bid-form__title">Новая раздача — Заказ</div>

      <div className="form-block">
        <div className="form-block__label">Кто заказывает</div>
        <div className="seg">
          <button className={`seg-btn${declarer === 'a' ? ' seg-btn--active' : ''}`} onClick={() => setDeclarer('a')}>{game.teamA}</button>
          <button className={`seg-btn${declarer === 'b' ? ' seg-btn--active' : ''}`} onClick={() => setDeclarer('b')}>{game.teamB}</button>
        </div>
      </div>

      <div className="form-block">
        <div className="form-block__label">Масть</div>
        <div className="suit-picker">
          {SUITS.map(s => (
            <button key={s.id} className={`suit-btn suit-btn--${s.id}${suit === s.id ? ' suit-btn--active' : ''}`} onClick={() => setSuit(s.id)} title={s.name}>
              <span className="suit-btn__icon">{s.label}</span>
              <span className="suit-btn__name">{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="form-block">
        <div className="form-block__label">Ставка</div>
        <div className="bid-row">
          <input
            className={`bid-input${isKaput ? ' bid-input--kaput' : ''}`}
            type="number" min={8} max={16} placeholder="8"
            value={isKaput ? '' : bid}
            disabled={isKaput}
            onChange={e => handleBidChange(e.target.value)}
          />
          <button className={`btn-kaput${isKaput ? ' btn-kaput--active' : ''}`} onClick={handleKaput}>
            Капут<br/><small>25 очков</small>
          </button>
        </div>

        {isKaput && (
          <div className="kaput-bonus-section">
            <div className="kaput-hint">
              Капут (25{suit === 'notrump' ? '×2' : ''} + 25) · Введи сумму бонусных очков если заказчик объявляет (или оставь 0)
            </div>
            <input
              className="kaput-bonus-input"
              type="number"
              min={0}
              placeholder="0"
              value={kaputDeclBonus}
              onChange={e => setKaputDeclBonus(Number(e.target.value) || 0)}
            />
            <button className="kaput-cancel" onClick={() => { setIsKaput(false); setBid(''); setKaputDeclBonus(0) }}>✕ Отмена</button>
          </div>
        )}
      </div>

      <div className="form-block">
        <div className="form-block__label">Контра / Реконтра</div>
        <div className="seg seg--3">
          <button className={`seg-btn${contra === 'none' ? ' seg-btn--active' : ''}`} onClick={() => setContra('none')}>—</button>
          <button className={`seg-btn${contra === 'contra' ? ' seg-btn--active' : ''}`} onClick={() => setContra('contra')}>Контра</button>
          <button className={`seg-btn${contra === 'rekontra' ? ' seg-btn--active' : ''}`} onClick={() => setContra('rekontra')}>Реконтра</button>
        </div>
      </div>

      <button className={`btn-confirm${canConfirm ? ' btn-confirm--ready' : ''}`} onClick={handleConfirm} disabled={!canConfirm}>
        Подтвердить заказ →
      </button>
    </div>
  )
}

// ── Step 2: Result form ───────────────────────────────────────────────────────
function ResultForm({ game, bid, onSubmit, onCancel }) {
  const [oppSmall,      setOppSmall]      = useState(null)

  const [declBelote,    setDeclBelote]    = useState(0)  // Белот заказчика (всегда засчитывается)
  const [declComboSum,  setDeclComboSum]  = useState(0)
  const [declComboMax,  setDeclComboMax]  = useState(0)

  const [oppBelote,     setOppBelote]     = useState(0)  // Белот не-заказчика (всегда засчитывается)
  const [oppComboSum,   setOppComboSum]   = useState(0)
  const [oppComboMax,   setOppComboMax]   = useState(0)

  const isNotrump = bid.suit === 'notrump'
  const opp       = bid.declarer === 'a' ? 'b' : 'a'
  const declName  = bid.declarer === 'a' ? game.teamA : game.teamB
  const oppName   = opp === 'a' ? game.teamA : game.teamB

  const canSubmit = oppSmall !== null
  const declSmall = canSubmit ? 16 - oppSmall : null

  // ── Сравнение комбинаций (БЕЗ Белота): побеждает САМАЯ старшая комбинация,
  //    у другой команды комбинации аннулируются. Белот всегда остаётся у своей команды.
  let effectiveDeclCombo = declComboSum
  let effectiveOppCombo  = oppComboSum
  if (declComboMax > oppComboMax) {
    effectiveOppCombo = 0
  } else if (oppComboMax > declComboMax) {
    effectiveDeclCombo = 0
  }

  const effectiveDeclBonus = declBelote + effectiveDeclCombo
  const effectiveOppBonus  = oppBelote + effectiveOppCombo

  // Для Капута: если заказчик объявил бонус при заказе — реальные выбранные (после сравнения) должны быть > 0
  const kaputBonusRequired  = bid.isKaput && bid.kaputDeclaredBonus > 0
  const kaputBonusSatisfied = !kaputBonusRequired || effectiveDeclBonus > 0

  const made = canSubmit
    ? bid.isKaput
      ? (declSmall === 16 && kaputBonusSatisfied)
      : (declSmall + effectiveDeclBonus) >= bid.bid
    : null

  return (
    <div className="bid-form">
      <div className="bid-form__title result-title">
        <button className="back-step" onClick={onCancel}>←</button>
        Результат раздачи
      </div>

      <div className="order-summary">
        <span className="os-name">{declName}</span>
        <span className="os-sep">заказал</span>
        <span className={`suit-tag suit-tag--${bid.suit}`}>{SUITS.find(s => s.id === bid.suit)?.label}</span>
        <span className="os-bid">{bid.isKaput ? 'Капут' : bid.bid}</span>
        {bid.isKaput && bid.kaputDeclaredBonus > 0 && <span className="os-contra">+{bid.kaputDeclaredBonus}</span>}
        {bid.contra !== 'none' && <span className="os-contra">{bid.contra === 'contra' ? 'Контра' : 'Реконтра'}</span>}
      </div>

      <div className="form-block">
        <div className="form-block__label">
          Маленькие очки команды <strong>{oppName}</strong> (не заказывала) — от 0 до 16:
        </div>
        <div className="small-pts-row">
          {Array.from({ length: 17 }, (_, n) => (
            <button
              key={n}
              className={`small-btn${oppSmall === n ? ' small-btn--active' : ''}`}
              onClick={() => setOppSmall(n)}
            >{n}</button>
          ))}
        </div>
        {canSubmit && (
          <div className="pts-hint">
            {declName}: <strong>{declSmall}</strong> карт. очков
            {effectiveDeclBonus > 0 && <> + <strong>{effectiveDeclBonus}</strong> бонус = <strong>{declSmall + effectiveDeclBonus}</strong></>}
            {!bid.isKaput && (
              <> · Заказ {bid.bid} · {made
                ? <span className="hint-ok">✅ Сделали</span>
                : <span className="hint-fail">❌ Не сделали</span>}
              </>
            )}
            {bid.isKaput && (made
              ? <span className="hint-ok"> · 🏆 Капут!</span>
              : <span className="hint-fail"> · ❌ Не выполнен</span>
            )}
            {bid.isKaput && kaputBonusRequired && !kaputBonusSatisfied && (
              <div className="kaput-warn">⚠️ Заказчик объявил +{bid.kaputDeclaredBonus}, но не выбрал бонусы (или они отменились) — Капут провален</div>
            )}
          </div>
        )}
      </div>

      <BonusPanel
        label={`Комбинации ${declName} (заказчик)`}
        isNotrump={isNotrump}
        onChange={(belote, comboSum, comboMax) => { setDeclBelote(belote); setDeclComboSum(comboSum); setDeclComboMax(comboMax) }}
      />

      <BonusPanel
        label={`Комбинации ${oppName} (не заказывал)`}
        isNotrump={isNotrump}
        onChange={(belote, comboSum, comboMax) => { setOppBelote(belote); setOppComboSum(comboSum); setOppComboMax(comboMax) }}
      />

      {(declComboMax > 0 && oppComboMax > 0 && declComboMax !== oppComboMax) && (
        <div className="combo-clash">
          ⚔️ У обеих команд есть комбинации (кроме Белота) — старше у {declComboMax > oppComboMax ? declName : oppName}, комбинации другой команды аннулированы
        </div>
      )}

      <button
        className={`btn-confirm${canSubmit ? ' btn-confirm--ready' : ''}`}
        onClick={() => canSubmit && onSubmit({ oppSmall, declBonus: effectiveDeclBonus, oppBonus: effectiveOppBonus })}
        disabled={!canSubmit}
      >
        Записать результат →
      </button>
    </div>
  )
}

// ── Main GamePage ─────────────────────────────────────────────────────────────
export default function GamePage({ visible, game, onAddRound, onBack }) {
  const [mounted, setMounted] = useState(false)
  const [step,    setStep]    = useState('bid')
  const [bidData, setBidData] = useState(null)

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setMounted(true), 30)
      return () => clearTimeout(t)
    } else {
      setMounted(false)
      setStep('bid')
      setBidData(null)
    }
  }, [visible])

  if (!game) return null

  const suitLabel = (suit) => SUITS.find(s => s.id === suit)?.label ?? ''

  const handleBidConfirm = (data) => {
    setBidData(data)
    setStep('result')
  }

  const handleResultSubmit = (resultData) => {
    onAddRound({ ...bidData, ...resultData })
    setStep('bid')
    setBidData(null)
  }

  return (
    <div className={`gamepage${mounted ? ' gamepage--visible' : ''}`}>

      <header className="gamepage__header">
        <button className="btn-back" onClick={onBack}>← Выход</button>
        <div className="gamepage__goal">до {game.goal}</div>
      </header>

      <div className="scoreboard">
        <div className={`sb-team${game.winner === 'a' ? ' sb-team--winner' : ''}`}>
          <div className="sb-name">{game.teamA}</div>
          <div className="sb-score">{game.scoreA}</div>
        </div>
        <div className="sb-sep">:</div>
        <div className={`sb-team sb-team--right${game.winner === 'b' ? ' sb-team--winner' : ''}`}>
          <div className="sb-name">{game.teamB}</div>
          <div className="sb-score">{game.scoreB}</div>
        </div>
      </div>

      {game.rounds.length > 0 && (
        <div className="rounds-table-wrap">
          <table className="rounds-table">
            <thead>
              <tr>
                <th>{game.teamA}</th>
                <th>{game.teamB}</th>
                <th>Заказ</th>
              </tr>
            </thead>
            <tbody>
              {game.rounds.map((r, i) => (
                <tr key={i} className={r.made ? '' : 'row--fail'}>
                  <td className={r.declarer === 'a' ? 'cell--decl' : ''}>{r.scoreA > 0 ? `+${r.scoreA}` : '—'}</td>
                  <td className={r.declarer === 'b' ? 'cell--decl' : ''}>{r.scoreB > 0 ? `+${r.scoreB}` : '—'}</td>
                  <td className="cell--order">
                    <span className={`suit-tag suit-tag--${r.suit}`}>{suitLabel(r.suit)}</span>
                    <span>{r.isKaput ? 'Кап' : r.bid}</span>
                    {r.contra !== 'none' && <span className="contra-tag">{r.contra === 'contra' ? 'C' : 'RC'}</span>}
                    <span className="cell-decl-name">· {r.declarer === 'a' ? game.teamA : game.teamB}</span>
                    <span className={`made-icon ${r.made ? 'made-icon--ok' : 'made-icon--fail'}`}>
                      {r.made ? '🏆' : '💥'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {game.winner ? (
        <div className="winner-banner">
          <div className="winner-banner__trophy">🏆</div>
          <div className="winner-banner__text">{game.winner === 'a' ? game.teamA : game.teamB} победили!</div>
          <div className="winner-banner__score">{game.scoreA} : {game.scoreB}</div>
          <button className="btn-back-home" onClick={onBack}>← На главную</button>
        </div>
      ) : step === 'bid' ? (
        <BidForm game={game} onConfirm={handleBidConfirm} />
      ) : (
        <ResultForm game={game} bid={bidData} onSubmit={handleResultSubmit} onCancel={() => setStep('bid')} />
      )}
    </div>
  )
}

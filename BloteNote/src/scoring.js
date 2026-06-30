/**
 * БАЗАРНЫЙ БЛОТ — логика подсчёта (все очки в МАЛЕНЬКИХ единицах)
 *
 * Капут: bid = 25, множитель применяется ПО МАСТИ
 *   С козырем: 25 + 25 = 50
 *   Без козыря: (25×2) + 25 = 75
 *   Контра/Реконтра добавляются к множителю обычно
 *
 *   Бонусы объявляются ДО игры (при заказе Капута), одним числом.
 *   Выигрыш: базовая сумма + declBonus
 *   Проигрыш: противник получает всё + declBonus
 *
 * Обычная игра:
 *   made = (declSmall + declBonus) >= bid
 *
 * Множители:
 *   С козырем:   none→×1,  contra→×2,  rekontra→×4
 *   Без козыря:  none→×2,  contra→×3,  rekontra→×5
 */

function getMultiplier(notrump, contra) {
  if (!notrump) {
    if (contra === 'none')     return { win: 1, lose: 1 }
    if (contra === 'contra')   return { win: 2, lose: 2 }
    if (contra === 'rekontra') return { win: 4, lose: 4 }
  } else {
    if (contra === 'none')     return { win: 2, lose: 2 }
    if (contra === 'contra')   return { win: 3, lose: 3 }
    if (contra === 'rekontra') return { win: 5, lose: 5 }
  }
}

export function calcRound({
  declarer,
  suit,
  bid,        // 25 for kaput, 8–16 otherwise
  isKaput,
  contra,
  oppSmall,   // 0–16, маленькие очки НЕ-заказчика
  declBonus,  // бонусы заказчика (число, объявлено заранее для Капута)
  oppBonus,   // бонусы не-заказчика (вводятся после игры)
}) {
  const notrump = suit === 'notrump'
  const totalSmall = 16
  const declSmall  = totalSmall - oppSmall
  const mult       = getMultiplier(notrump, contra)

  let scoreDecl = 0
  let scoreOpp  = 0
  let made      = false

  if (isKaput) {
    // Капут: нужно взять ВСЕ 16 маленьких
    const allSmallTaken = declSmall === totalSmall

    // Если бонус был объявлен при заказе (declBonus > 0):
    //   нужно выбрать бонусы в окне результата равные объявленному числу
    // Если бонус не объявлен (declBonus = 0):
    //   просто нужны все 16 маленьких
    if (bid > 0) {
      // declBonus был объявлен - нужны эти бонусы + все 16
      made = allSmallTaken && declBonus > 0
    } else {
      // Капут без плюса - просто все 16
      made = allSmallTaken
    }

    if (made) {
      const kaputBase = 25 * mult.win + 25
      scoreDecl = kaputBase + declBonus
      scoreOpp  = oppBonus
    } else {
      const kaputLose = 25 * mult.lose + 16
      scoreOpp  = kaputLose + declBonus + oppBonus
      scoreDecl = 0
    }
    return { scoreDecl, scoreOpp, made, declSmall }
  }

  // Обычная игра
  made = (declSmall + declBonus) >= bid

  if (made) {
    scoreDecl = bid * mult.win + declSmall + declBonus
    scoreOpp  = oppSmall + oppBonus
  } else {
    scoreOpp  = bid * mult.lose + 16 + oppBonus + declBonus
    scoreDecl = 0
  }

  return { scoreDecl, scoreOpp, made, declSmall }
}

export const BONUS_BELOTE = { id: 'belote', label: 'Белот', pts: 2, desc: 'К + Д козыря' }

export const BONUS_SEQUENCES = [
  { id: 'terc',  label: 'Тёрц',  pts: 2,  desc: '3 карты подряд' },
  { id: 'quart', label: 'Кварт', pts: 5,  desc: '4 карты подряд' },
  { id: 'quint', label: 'Квинт', pts: 10, desc: '5 карт подряд'  },
]

export const QUADS_NOTRUMP = [
  { id: 'q_nt_ace',   label: '4 Туза',                             pts: 19, desc: 'Без козыря' },
  { id: 'q_nt_10kqj', label: '4 Десятки / Короля / Дамы / Валета', pts: 10, desc: 'Без козыря' },
  { id: 'q_nt_987',   label: '4 Девятки / Восьмёрки / Семёрки',    pts: 0,  desc: 'Без козыря — 0 очков' },
]

export const QUADS_TRUMP = [
  { id: 'q_tr_jack', label: '4 Валета',                  pts: 20, desc: 'С козырем' },
  { id: 'q_tr_9',    label: '4 Девятки',                 pts: 14, desc: 'С козырем' },
  { id: 'q_tr_ace',  label: '4 Туза',                    pts: 11, desc: 'С козырем' },
  { id: 'q_tr_10kq', label: '4 Десятки / Короля / Дамы', pts: 10, desc: 'С козырем' },
]

export function getQuadOptions(isNotrump) {
  return isNotrump ? QUADS_NOTRUMP : QUADS_TRUMP
}

export function sumBonuses(bonusList) {
  return bonusList.reduce((sum, b) => sum + b.pts, 0)
}

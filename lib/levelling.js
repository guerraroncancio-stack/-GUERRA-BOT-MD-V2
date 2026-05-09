// lib/levelling.js

export const growth =
  Math.pow(Math.PI / Math.E, 1.618) *
  Math.E *
  0.75

/**
 * 📈 Sistema de experiencia GUERRA BOT
 * Calcula el rango XP del nivel
 */
export function xpRange(level, multiplier = global.multiplier || 1) {
  if (level < 0)
    throw new TypeError('El nivel no puede ser negativo')

  level = Math.floor(level)

  const min =
    level === 0
      ? 0
      : Math.round(Math.pow(level, growth) * multiplier) + 1

  const max = Math.round(
    Math.pow(level + 1, growth) * multiplier
  )

  return {
    min,
    max,
    xp: max - min
  }
}

/**
 * 🔎 Detecta nivel según XP
 */
export function findLevel(
  xp,
  multiplier = global.multiplier || 1
) {
  if (xp === Infinity) return Infinity
  if (isNaN(xp)) return NaN
  if (xp <= 0) return 0

  let level = 0

  while (xpRange(level, multiplier).max <= xp) {
    level++
  }

  return level
}

/**
 * ⚡ Verifica si puede subir de nivel
 */
export function canLevelUp(
  level,
  xp,
  multiplier = global.multiplier || 1
) {
  if (level < 0) return false
  if (xp === Infinity) return true
  if (isNaN(xp)) return false
  if (xp <= 0) return false

  return findLevel(xp, multiplier) > level
}

/**
 * 🌟 Calcula porcentaje de progreso
 */
export function levelProgress(
  level,
  xp,
  multiplier = global.multiplier || 1
) {
  const { min, max } = xpRange(level, multiplier)

  const progress = xp - min
  const total = max - min

  return Math.max(
    0,
    Math.min(
      100,
      Math.floor((progress / total) * 100)
    )
  )
}

/**
 * 🎖️ Roles automáticos
 */
export function getRole(level = 0) {
  const roles = [
    { lvl: 0, role: '👶 Novato' },
    { lvl: 5, role: '🪖 Recluta' },
    { lvl: 10, role: '⚔️ Guerrero' },
    { lvl: 20, role: '🛡️ Elite' },
    { lvl: 30, role: '🔥 Maestro' },
    { lvl: 40, role: '👑 Leyenda' },
    { lvl: 50, role: '🐉 Emperador' },
    { lvl: 70, role: '☠️ Dios Supremo' },
    { lvl: 100, role: '🌌 GUERRA MASTER' }
  ]

  let role = roles[0].role

  for (const r of roles) {
    if (level >= r.lvl) {
      role = r.role
    }
  }

  return role
}

/**
 * 💎 Recompensa automática
 */
export function rewardDiamonds(level) {
  return Math.floor(level * 2.5)
}

/**
 * 🎁 Bonus XP aleatorio
 */
export function randomXP(min = 5, max = 25) {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min
}

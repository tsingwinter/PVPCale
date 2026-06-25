import type { PlayerStats } from '../types/player'

function pct(value: number): number {
  return value / 100
}

/** 法术暴击期望乘区（暴击率为概率，不加 100%；上限 100%，超出部分无效） */
export function critMultiplier(spellCrit: number, spellCritDamage: number): number {
  const rate = Math.min(1, Math.max(0, pct(spellCrit)))
  return rate * (1 + pct(spellCritDamage)) + (1 - rate)
}

/** 增伤乘区：同乘区内加法叠加后再 +100% */
export function buffMultiplier(stats: PlayerStats): number {
  return (
    1 +
    pct(
      stats.bossDamage +
        stats.allRoundDamage +
        stats.groundDamage +
        stats.challenge +
        stats.tianshuDamage,
    )
  )
}

/** PVP 乘区：最低为 0 */
export function pvpMultiplier(attacker: PlayerStats, defender: PlayerStats): number {
  return Math.max(0, 1 + pct(attacker.pvpBonus - defender.pvpReduction))
}

/**
 * 伤害 = 攻击力 × (1+伤害加成) × [暴击期望] × (1+火系) × (1+增伤合计) × (1+PVP增伤-敌PVP减免)
 * 最终伤害不低于 0
 */
export function calcDamage(attacker: PlayerStats, defender: PlayerStats): number {
  const raw =
    attacker.attack *
    (1 + pct(attacker.damageBonus)) *
    critMultiplier(attacker.spellCrit, attacker.spellCritDamage) *
    (1 + pct(attacker.fireDamage)) *
    buffMultiplier(attacker) *
    pvpMultiplier(attacker, defender)

  return Math.max(0, raw)
}

export interface DamageBreakdown {
  attack: number
  damageBonus: number
  crit: number
  fire: number
  buff: number
  pvp: number
  total: number
}

export function calcBreakdown(
  attacker: PlayerStats,
  defender: PlayerStats,
): DamageBreakdown {
  const attack = attacker.attack
  const damageBonus = 1 + pct(attacker.damageBonus)
  const crit = critMultiplier(attacker.spellCrit, attacker.spellCritDamage)
  const fire = 1 + pct(attacker.fireDamage)
  const buff = buffMultiplier(attacker)
  const pvp = pvpMultiplier(attacker, defender)

  return {
    attack,
    damageBonus,
    crit,
    fire,
    buff,
    pvp,
    total: Math.max(0, attack * damageBonus * crit * fire * buff * pvp),
  }
}

import type { CalcMode, PlayerStats } from '../types/player'

function pct(value: number): number {
  return value / 100
}

/**
 * 总攻击力 = (基础攻击力 + PVP攻击力) × (1 + 攻击力百分比加成)
 * PVP攻击力仅在 PVP 模式生效；首领 / 精英不计 PVP 攻击力
 */
export function totalAttack(stats: PlayerStats, mode: CalcMode): number {
  const pvpPart = mode === 'pvp' ? stats.pvpAttack : 0
  return (stats.baseAttack + pvpPart) * (1 + pct(stats.attackBonus))
}

/** 法术暴击期望乘区（暴击率为概率，不加 100%；上限 100%，超出部分无效） */
export function critMultiplier(spellCrit: number, spellCritDamage: number): number {
  const rate = Math.min(1, Math.max(0, pct(spellCrit)))
  return rate * (1 + pct(spellCritDamage)) + (1 - rate)
}

/**
 * 增伤乘区：同乘区内加法叠加后再 +100%
 * - PVP / 首领：计入「对首领增伤」
 * - 精英：用「对精英增伤」替换「对首领增伤」
 */
export function buffMultiplier(stats: PlayerStats, mode: CalcMode): number {
  const targetDamage = mode === 'elite' ? stats.eliteDamage : stats.bossDamage
  return (
    1 +
    pct(
      targetDamage +
        stats.allRoundDamage +
        stats.groundDamage +
        stats.challenge +
        stats.tianshuDamage,
    )
  )
}

/** PVP 乘区：最低为 0；首领 / 精英模式不计入（固定为 1） */
export function pvpMultiplier(
  attacker: PlayerStats,
  defender: PlayerStats,
  mode: CalcMode,
): number {
  if (mode !== 'pvp') return 1
  return Math.max(0, 1 + pct(attacker.pvpBonus - defender.pvpReduction))
}

/**
 * 伤害 = 总攻击力 × (1+伤害加成) × [暴击期望] × (1+火系) × (1+增伤合计) × PVP乘区
 * PVE（首领/精英）不含 PVP 攻击力与 PVP 乘区
 * 最终伤害不低于 0
 */
export function calcDamage(
  attacker: PlayerStats,
  defender: PlayerStats,
  mode: CalcMode = 'pvp',
): number {
  const raw =
    totalAttack(attacker, mode) *
    (1 + pct(attacker.damageBonus)) *
    critMultiplier(attacker.spellCrit, attacker.spellCritDamage) *
    (1 + pct(attacker.fireDamage)) *
    buffMultiplier(attacker, mode) *
    pvpMultiplier(attacker, defender, mode)

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
  mode: CalcMode = 'pvp',
): DamageBreakdown {
  const attack = totalAttack(attacker, mode)
  const damageBonus = 1 + pct(attacker.damageBonus)
  const crit = critMultiplier(attacker.spellCrit, attacker.spellCritDamage)
  const fire = 1 + pct(attacker.fireDamage)
  const buff = buffMultiplier(attacker, mode)
  const pvp = pvpMultiplier(attacker, defender, mode)

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

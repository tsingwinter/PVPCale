/** 计算模式 */
export type CalcMode = 'pvp' | 'boss' | 'elite'

/** 对比方式：双人对比 / 玩家 A 变动影响 */
export type CompareKind = 'versus' | 'delta'

export const CALC_MODES: { id: CalcMode; label: string; ready: boolean }[] = [
  { id: 'pvp', label: 'PVP', ready: true },
  { id: 'boss', label: '首领', ready: true },
  { id: 'elite', label: '精英', ready: true },
]

export const COMPARE_KINDS: { id: CompareKind; label: string }[] = [
  { id: 'versus', label: '双人对比' },
  { id: 'delta', label: '变动影响' },
]

/** 玩家属性（百分比类字段默认单位为 %，用户填数值即可） */
export interface PlayerStats {
  baseAttack: number
  pvpAttack: number
  attackBonus: number
  damageBonus: number
  spellCrit: number
  spellCritDamage: number
  fireDamage: number
  bossDamage: number
  eliteDamage: number
  groundDamage: number
  challenge: number
  tianshuDamage: number
  allRoundDamage: number
  pvpBonus: number
  pvpReduction: number
}

export function createEmptyPlayer(): PlayerStats {
  return {
    baseAttack: 0,
    pvpAttack: 0,
    attackBonus: 0,
    damageBonus: 0,
    spellCrit: 0,
    spellCritDamage: 0,
    fireDamage: 0,
    bossDamage: 0,
    eliteDamage: 0,
    groundDamage: 0,
    challenge: 0,
    tianshuDamage: 0,
    allRoundDamage: 0,
    pvpBonus: 0,
    pvpReduction: 0,
  }
}

/** 在基准面板上叠加增减量 */
export function applyDelta(base: PlayerStats, delta: PlayerStats): PlayerStats {
  const result = createEmptyPlayer()
  for (const key of Object.keys(result) as (keyof PlayerStats)[]) {
    result[key] = base[key] + delta[key]
  }
  return result
}

/** 兼容旧版本地存档（仅有 attack 字段时迁到 baseAttack） */
export function normalizePlayer(raw: Partial<PlayerStats> & { attack?: number }): PlayerStats {
  const base = createEmptyPlayer()
  const { attack, ...rest } = raw
  const merged = { ...base, ...rest }
  if ((merged.baseAttack === 0 || merged.baseAttack == null) && typeof attack === 'number') {
    merged.baseAttack = attack
  }
  return merged
}

export interface StatField {
  key: keyof PlayerStats
  label: string
  unit: '%' | ''
  group: 'base' | 'crit' | 'damageBonus' | 'element' | 'buff' | 'pvp'
  /** 仅在指定模式下显示；不填则所有模式显示 */
  modes?: CalcMode[]
}

export const STAT_FIELDS: StatField[] = [
  { key: 'baseAttack', label: '基础攻击力', unit: '', group: 'base' },
  { key: 'pvpAttack', label: 'PVP 攻击力', unit: '', group: 'base', modes: ['pvp'] },
  { key: 'attackBonus', label: '攻击力加成', unit: '%', group: 'base' },
  { key: 'spellCrit', label: '法术暴击', unit: '%', group: 'crit' },
  { key: 'spellCritDamage', label: '法术暴伤', unit: '%', group: 'crit' },
  { key: 'damageBonus', label: '伤害加成', unit: '%', group: 'damageBonus' },
  { key: 'fireDamage', label: '火系伤害增加', unit: '%', group: 'element' },
  {
    key: 'bossDamage',
    label: '对首领增伤',
    unit: '%',
    group: 'buff',
    modes: ['pvp', 'boss'],
  },
  {
    key: 'eliteDamage',
    label: '对精英增伤',
    unit: '%',
    group: 'buff',
    modes: ['elite'],
  },
  { key: 'groundDamage', label: '对地增伤', unit: '%', group: 'buff' },
  { key: 'challenge', label: '挑战', unit: '%', group: 'buff' },
  { key: 'tianshuDamage', label: '天书增伤', unit: '%', group: 'buff' },
  { key: 'allRoundDamage', label: '全能增伤', unit: '%', group: 'buff' },
  { key: 'pvpBonus', label: 'PVP 增伤', unit: '%', group: 'pvp', modes: ['pvp'] },
  { key: 'pvpReduction', label: 'PVP 减免', unit: '%', group: 'pvp', modes: ['pvp'] },
]

export const GROUP_LABELS: Record<StatField['group'], string> = {
  base: '攻击力',
  crit: '法术暴击 / 暴伤',
  damageBonus: '伤害加成',
  buff: '增伤乘区',
  element: '元素增伤',
  pvp: 'PVP',
}

/** 分组显示顺序 */
export const GROUP_ORDER: StatField['group'][] = [
  'base',
  'crit',
  'damageBonus',
  'buff',
  'pvp',
  'element',
]

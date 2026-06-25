/** 玩家 PVP 属性（百分比类字段默认单位为 %，用户填数值即可） */
export interface PlayerStats {
  attack: number
  damageBonus: number
  spellCrit: number
  spellCritDamage: number
  fireDamage: number
  bossDamage: number
  groundDamage: number
  challenge: number
  tianshuDamage: number
  allRoundDamage: number
  pvpBonus: number
  pvpReduction: number
}

export function createEmptyPlayer(): PlayerStats {
  return {
    attack: 0,
    damageBonus: 0,
    spellCrit: 0,
    spellCritDamage: 0,
    fireDamage: 0,
    bossDamage: 0,
    groundDamage: 0,
    challenge: 0,
    tianshuDamage: 0,
    allRoundDamage: 0,
    pvpBonus: 0,
    pvpReduction: 0,
  }
}

export interface StatField {
  key: keyof PlayerStats
  label: string
  unit: '%' | ''
  group: 'base' | 'crit' | 'damageBonus' | 'element' | 'buff' | 'pvp'
}

export const STAT_FIELDS: StatField[] = [
  { key: 'attack', label: '攻击力', unit: '', group: 'base' },
  { key: 'spellCrit', label: '法术暴击', unit: '%', group: 'crit' },
  { key: 'spellCritDamage', label: '法术暴伤', unit: '%', group: 'crit' },
  { key: 'damageBonus', label: '伤害加成', unit: '%', group: 'damageBonus' },
  { key: 'fireDamage', label: '火系伤害增加', unit: '%', group: 'element' },
  { key: 'bossDamage', label: '对首领增伤', unit: '%', group: 'buff' },
  { key: 'groundDamage', label: '对地增伤', unit: '%', group: 'buff' },
  { key: 'challenge', label: '挑战', unit: '%', group: 'buff' },
  { key: 'tianshuDamage', label: '天书增伤', unit: '%', group: 'buff' },
  { key: 'allRoundDamage', label: '全能增伤', unit: '%', group: 'buff' },
  { key: 'pvpBonus', label: 'PVP 增伤', unit: '%', group: 'pvp' },
  { key: 'pvpReduction', label: 'PVP 减免', unit: '%', group: 'pvp' },
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

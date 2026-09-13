/**
 * 数据统计：淬炼词条品质及属性数值
 *
 * 说明：
 * - 已接入前端「淬炼统计」页面
 * - 百分比类属性单位为 %（与计算器输入约定一致）
 * - 「平凡 / 良质 / 上乘」仅作简述，不填属性数值表
 * - 同品质下，PVP增伤与法术暴伤的数值范围相同
 */

/** 品质，由低到高 */
export const REFINE_QUALITIES = [
  '平凡',
  '良质',
  '上乘',
  '精妙',
  '卓越',
  '超凡',
  '绝伦',
  '臻极',
  '造化',
  '天工',
] as const

export type RefineQuality = (typeof REFINE_QUALITIES)[number]

/** 当前统计纳入的淬炼词条属性 */
export const REFINE_AFFIX_ATTRS = [
  { key: 'pvpBonus', label: 'PVP增伤', unit: '%' },
  { key: 'spellCritDamage', label: '法术暴伤', unit: '%' },
] as const

export type RefineAffixAttrKey = (typeof REFINE_AFFIX_ATTRS)[number]['key']

/** 属性在某一品质下的数值范围 */
export interface AffixValueRange {
  min: number | null
  max: number | null
  /** 备注，如「整数」「步进 0.1」等 */
  note?: string
}

/** 某一品质的完整条目 */
export interface RefineQualityEntry {
  quality: RefineQuality
  /** 品质档位，1 最低 … 10 最高 */
  tier: number
  /**
   * brief：仅简述，不填属性表
   * ranged：填写各属性 min/max
   */
  kind: 'brief' | 'ranged'
  /** 简述（brief 必填；ranged 可选补充说明） */
  summary?: string
  /** 属性数值范围（仅 kind === 'ranged' 时使用） */
  attrs?: Partial<Record<RefineAffixAttrKey, AffixValueRange>>
}

/**
 * 淬炼等级与可出品质范围
 * 前期过渡较快，统计从淬炼 5 级起
 */
export interface RefineLevelUnlock {
  /** 淬炼等级下限（含） */
  levelFrom: number
  /** 淬炼等级上限（含）；单级时与 levelFrom 相同 */
  levelTo: number
  /** 该等级段可淬炼出的品质 */
  qualities: RefineQuality[]
  note?: string
}

/** 数据统计标题 */
export const REFINE_AFFIX_STATS_TITLE = '淬炼词条品质及属性数值'

/** 同品质下 PVP增伤 / 法术暴伤 共用区间 */
function sameRange(min: number | null, max: number | null): {
  pvpBonus: AffixValueRange
  spellCritDamage: AffixValueRange
} {
  const range: AffixValueRange = { min, max }
  return { pvpBonus: { ...range }, spellCritDamage: { ...range } }
}

/**
 * 品质总表
 * - 平凡 / 良质 / 上乘：只做简述
 * - 精妙～绝伦：已填已知区间
 * - 臻极 / 造化 / 天工：结构预留，区间待补
 */
export const REFINE_QUALITY_ENTRIES: RefineQualityEntry[] = [
  {
    quality: '平凡',
    tier: 1,
    kind: 'brief',
    summary: '最低档品质，前期过渡用。本统计不收录其属性数值区间。',
  },
  {
    quality: '良质',
    tier: 2,
    kind: 'brief',
    summary: '次低档品质，仍属前期过渡。本统计不收录其属性数值区间。',
  },
  {
    quality: '上乘',
    tier: 3,
    kind: 'brief',
    summary: '精妙之前的最后一档过渡品质。本统计不收录其属性数值区间。',
  },
  {
    quality: '精妙',
    tier: 4,
    kind: 'ranged',
    summary: '已知区间：3.0% ~ 4.5%（PVP增伤与法术暴伤相同）。',
    attrs: sameRange(3.0, 4.5),
  },
  {
    quality: '卓越',
    tier: 5,
    kind: 'ranged',
    summary: '已知区间：4.5% ~ 5.4%（PVP增伤与法术暴伤相同）。',
    attrs: sameRange(4.5, 5.4),
  },
  {
    quality: '超凡',
    tier: 6,
    kind: 'ranged',
    summary: '已知区间：5.4% ~ 6.3%（PVP增伤与法术暴伤相同）。',
    attrs: sameRange(5.4, 6.3),
  },
  {
    quality: '绝伦',
    tier: 7,
    kind: 'ranged',
    summary: '已知区间：6.3% ~ 7.2%（PVP增伤与法术暴伤相同）。',
    attrs: sameRange(6.3, 7.2),
  },
  {
    quality: '臻极',
    tier: 8,
    kind: 'ranged',
    summary: '属性区间待补（PVP增伤与法术暴伤同品质应相同）。',
    attrs: sameRange(null, null),
  },
  {
    quality: '造化',
    tier: 9,
    kind: 'ranged',
    summary: '属性区间待补（PVP增伤与法术暴伤同品质应相同）。',
    attrs: sameRange(null, null),
  },
  {
    quality: '天工',
    tier: 10,
    kind: 'ranged',
    summary: '最高档；属性区间待补（PVP增伤与法术暴伤同品质应相同）。',
    attrs: sameRange(null, null),
  },
]

/** 淬炼等级 → 可出品质（从 5 级起） */
export const REFINE_LEVEL_UNLOCKS: RefineLevelUnlock[] = [
  {
    levelFrom: 5,
    levelTo: 6,
    qualities: ['精妙', '卓越', '超凡', '绝伦'],
  },
  {
    levelFrom: 7,
    levelTo: 8,
    qualities: ['卓越', '超凡', '绝伦', '臻极'],
  },
  {
    levelFrom: 9,
    levelTo: 9,
    qualities: ['卓越', '超凡', '绝伦', '臻极', '造化'],
  },
  {
    levelFrom: 10,
    levelTo: 10,
    qualities: ['超凡', '绝伦', '臻极', '造化'],
  },
  {
    levelFrom: 11,
    levelTo: 11,
    qualities: ['超凡', '绝伦', '臻极', '造化', '天工'],
  },
  {
    levelFrom: 12,
    levelTo: 12,
    qualities: ['绝伦', '臻极', '造化', '天工'],
  },
]

/** 取某一品质的属性区间（无表或未填则返回 null） */
export function getAffixRange(
  quality: RefineQuality,
  attr: RefineAffixAttrKey,
): AffixValueRange | null {
  const entry = REFINE_QUALITY_ENTRIES.find((item) => item.quality === quality)
  if (!entry || entry.kind !== 'ranged' || !entry.attrs) return null
  return entry.attrs[attr] ?? null
}

/** 查询某淬炼等级可出的品质列表 */
export function getQualitiesByRefineLevel(level: number): RefineQuality[] {
  const unlock = REFINE_LEVEL_UNLOCKS.find(
    (item) => level >= item.levelFrom && level <= item.levelTo,
  )
  return unlock ? [...unlock.qualities] : []
}

/** 格式化区间展示，如 3.0~4.5；未填返回「待填」 */
export function formatRange(range: AffixValueRange | null | undefined): string {
  if (!range || range.min == null || range.max == null) return '待填'
  return `${range.min}~${range.max}`
}

/**
 * 生成指定淬炼等级下的属性对照表
 * 行：该等级可出品质；列：各属性区间
 */
export function buildRangeTableForLevel(level: number): {
  quality: RefineQuality
  pvpBonus: AffixValueRange | null
  spellCritDamage: AffixValueRange | null
}[] {
  return getQualitiesByRefineLevel(level).map((quality) => ({
    quality,
    pvpBonus: getAffixRange(quality, 'pvpBonus'),
    spellCritDamage: getAffixRange(quality, 'spellCritDamage'),
  }))
}

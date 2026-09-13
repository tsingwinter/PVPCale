<script setup lang="ts">
import { computed } from 'vue'
import { calcBreakdown, calcDamage, type DamageBreakdown } from '../engine/damage'
import type { CalcMode, CompareKind, PlayerStats } from '../types/player'

const props = defineProps<{
  playerA: PlayerStats
  playerB: PlayerStats
  mode: CalcMode
  compareKind?: CompareKind
}>()

const isDelta = computed(() => props.compareKind === 'delta')

const leftLabel = computed(() => (isDelta.value ? '原面板' : 'A'))
const rightLabel = computed(() => (isDelta.value ? '变动后' : 'B'))

const damageAtoB = computed(() => calcDamage(props.playerA, props.playerB, props.mode))
const damageBtoA = computed(() => calcDamage(props.playerB, props.playerA, props.mode))

const breakdownA = computed(() => calcBreakdown(props.playerA, props.playerB, props.mode))
const breakdownB = computed(() => calcBreakdown(props.playerB, props.playerA, props.mode))

type Winner = 'A' | 'B' | 'tie'
type BreakdownKey = keyof Omit<DamageBreakdown, 'total'>

interface BreakdownRow {
  key: BreakdownKey
  label: string
  format: 'number' | 'mult'
}

const breakdownRows = computed((): BreakdownRow[] => {
  const rows: BreakdownRow[] = [
    { key: 'attack', label: '总攻击力', format: 'number' },
    { key: 'damageBonus', label: '伤害加成', format: 'mult' },
    { key: 'crit', label: '暴击期望', format: 'mult' },
    { key: 'fire', label: '火系增伤', format: 'mult' },
    {
      key: 'buff',
      label: props.mode === 'elite' ? '增伤乘区（含对精英）' : '增伤乘区',
      format: 'mult',
    },
  ]
  if (props.mode === 'pvp') {
    rows.push({ key: 'pvp', label: 'PVP 乘区', format: 'mult' })
  }
  return rows
})

const winner = computed((): Winner => {
  const a = damageAtoB.value
  const b = damageBtoA.value
  if (a === b) return 'tie'
  return a > b ? 'A' : 'B'
})

function zoneWinner(key: BreakdownKey): Winner {
  const a = breakdownA.value[key]
  const b = breakdownB.value[key]
  if (a === b) return 'tie'
  return a > b ? 'A' : 'B'
}

function formatDamage(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + 'M'
  if (value >= 10_000) return (value / 10_000).toFixed(2) + 'W'
  return Math.round(value).toLocaleString('zh-CN')
}

function formatMult(value: number): string {
  return value.toFixed(3) + '×'
}

function formatBreakdownValue(row: BreakdownRow, breakdown: DamageBreakdown): string {
  const value = breakdown[row.key]
  return row.format === 'number'
    ? Math.round(value).toLocaleString('zh-CN')
    : formatMult(value)
}
</script>

<template>
  <section class="result">
    <h2 class="result-title">{{ isDelta ? '变动影响结果' : '对战结果' }}</h2>

    <div class="damage-cards">
      <article class="damage-card" :class="{ winner: winner === 'A' }">
        <p class="card-label">{{ leftLabel }} → {{ rightLabel }} 伤害</p>
        <p class="card-value">{{ formatDamage(damageAtoB) }}</p>
      </article>

      <div class="vs">VS</div>

      <article class="damage-card" :class="{ winner: winner === 'B' }">
        <p class="card-label">{{ rightLabel }} → {{ leftLabel }} 伤害</p>
        <p class="card-value">{{ formatDamage(damageBtoA) }}</p>
      </article>
    </div>

    <p class="verdict">
      <template v-if="winner === 'tie'">两侧伤害相同</template>
      <template v-else-if="isDelta">
        {{ winner === 'A' ? '原面板' : '变动后' }}伤害更高
        <span class="diff">
          （差值 {{ formatDamage(Math.abs(damageAtoB - damageBtoA)) }}）
        </span>
      </template>
      <template v-else>
        玩家 {{ winner }} 伤害更高
        <span class="diff">
          （差值 {{ formatDamage(Math.abs(damageAtoB - damageBtoA)) }}）
        </span>
      </template>
    </p>

    <details class="breakdown">
      <summary>查看乘区明细</summary>
      <div class="breakdown-table-wrap">
        <table class="breakdown-table">
          <thead>
            <tr>
              <th>{{ leftLabel }} → {{ rightLabel }}</th>
              <th>乘区</th>
              <th>{{ rightLabel }} → {{ leftLabel }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in breakdownRows" :key="row.key">
              <td :class="{ 'breakdown-higher': zoneWinner(row.key) === 'A' }">
                {{ formatBreakdownValue(row, breakdownA) }}
              </td>
              <td class="breakdown-label">{{ row.label }}</td>
              <td :class="{ 'breakdown-higher': zoneWinner(row.key) === 'B' }">
                {{ formatBreakdownValue(row, breakdownB) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  </section>
</template>

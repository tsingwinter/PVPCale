<script setup lang="ts">
import { computed } from 'vue'
import {
  formatRange,
  REFINE_AFFIX_ATTRS,
  REFINE_AFFIX_STATS_TITLE,
  REFINE_LEVEL_UNLOCKS,
  REFINE_QUALITIES,
  REFINE_QUALITY_ENTRIES,
  type RefineQuality,
} from '../data/refineAffixStats'

const briefEntries = computed(() =>
  REFINE_QUALITY_ENTRIES.filter((entry) => entry.kind === 'brief'),
)

const rangedEntries = computed(() =>
  REFINE_QUALITY_ENTRIES.filter((entry) => entry.kind === 'ranged'),
)

function levelLabel(from: number, to: number): string {
  return from === to ? `淬炼 ${from} 级` : `淬炼 ${from}~${to} 级`
}

function qualityClass(quality: RefineQuality): string {
  const index = REFINE_QUALITIES.indexOf(quality)
  return `quality-tier-${Math.max(0, index)}`
}

function attrRangeText(quality: RefineQuality): string {
  const entry = REFINE_QUALITY_ENTRIES.find((item) => item.quality === quality)
  const range = entry?.attrs?.pvpBonus
  const text = formatRange(range ?? null)
  return text === '待填' ? '待填' : `${text}%`
}
</script>

<template>
  <section class="stats-panel">
    <header class="stats-header">
      <h2 class="stats-title">{{ REFINE_AFFIX_STATS_TITLE }}</h2>
      <p class="stats-desc">
        同品质下，PVP增伤与法术暴伤数值范围相同。平凡 / 良质 / 上乘仅作简述；统计自淬炼 5 级起。
      </p>
    </header>

    <div class="stats-section">
      <h3 class="stats-section-title">品质阶梯（低 → 高）</h3>
      <div class="quality-ladder">
        <span
          v-for="quality in REFINE_QUALITIES"
          :key="quality"
          class="quality-chip"
          :class="qualityClass(quality)"
        >
          {{ quality }}
        </span>
      </div>
    </div>

    <div class="stats-section">
      <h3 class="stats-section-title">简述品质</h3>
      <ul class="brief-list">
        <li v-for="entry in briefEntries" :key="entry.quality">
          <strong>{{ entry.quality }}</strong>
          <span>{{ entry.summary }}</span>
        </li>
      </ul>
    </div>

    <div class="stats-section">
      <h3 class="stats-section-title">淬炼等级 → 可出品质</h3>
      <div class="stats-table-wrap">
        <table class="stats-table">
          <thead>
            <tr>
              <th>淬炼等级</th>
              <th>可淬炼品质</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="unlock in REFINE_LEVEL_UNLOCKS" :key="`${unlock.levelFrom}-${unlock.levelTo}`">
              <td>{{ levelLabel(unlock.levelFrom, unlock.levelTo) }}</td>
              <td>
                <span
                  v-for="quality in unlock.qualities"
                  :key="quality"
                  class="quality-chip compact"
                  :class="qualityClass(quality)"
                >
                  {{ quality }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="stats-section">
      <h3 class="stats-section-title">属性数值范围</h3>
      <p class="stats-note">
        当前属性：
        <template v-for="(attr, index) in REFINE_AFFIX_ATTRS" :key="attr.key">
          {{ attr.label }}{{ index < REFINE_AFFIX_ATTRS.length - 1 ? '、' : '' }}
        </template>
        （单位 %）
      </p>
      <div class="stats-table-wrap">
        <table class="stats-table">
          <thead>
            <tr>
              <th>品质</th>
              <th>PVP增伤</th>
              <th>法术暴伤</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in rangedEntries" :key="entry.quality">
              <td>
                <span class="quality-chip compact" :class="qualityClass(entry.quality)">
                  {{ entry.quality }}
                </span>
              </td>
              <td>{{ attrRangeText(entry.quality) }}</td>
              <td>{{ attrRangeText(entry.quality) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

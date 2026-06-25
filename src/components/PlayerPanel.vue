<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  GROUP_LABELS,
  GROUP_ORDER,
  STAT_FIELDS,
  type PlayerStats,
  type StatField,
} from '../types/player'

const props = defineProps<{
  label: string
  model: PlayerStats
}>()

const emit = defineEmits<{
  'update:model': [value: PlayerStats]
}>()

/** 输入过程中的原始字符串，避免 12. 被 Number 转成 12 导致小数点消失 */
const drafts = ref<Partial<Record<keyof PlayerStats, string>>>({})

const DECIMAL_PATTERN = /^\d*\.?\d*$/

const groupedFields = computed(() => {
  const groups = new Map<StatField['group'], StatField[]>()
  for (const field of STAT_FIELDS) {
    const list = groups.get(field.group) ?? []
    list.push(field)
    groups.set(field.group, list)
  }
  return GROUP_ORDER.filter((group) => groups.has(group)).map((group) => ({
    group,
    fields: groups.get(group)!,
  }))
})

function displayValue(key: keyof PlayerStats): string {
  const draft = drafts.value[key]
  if (draft !== undefined) return draft
  const value = props.model[key]
  return value === 0 ? '' : String(value)
}

function parseInput(raw: string): number {
  if (raw === '' || raw === '.') return 0
  const value = Number(raw)
  return Number.isFinite(value) ? value : 0
}

function updateField(key: keyof PlayerStats, raw: string) {
  if (raw !== '' && !DECIMAL_PATTERN.test(raw)) return

  drafts.value = { ...drafts.value, [key]: raw }
  emit('update:model', { ...props.model, [key]: parseInput(raw) })
}

function finalizeField(key: keyof PlayerStats) {
  const next = { ...drafts.value }
  delete next[key]
  drafts.value = next
}
</script>

<template>
  <section class="panel">
    <h2 class="panel-title">{{ label }}</h2>

    <div v-for="{ group, fields } in groupedFields" :key="group" class="field-group">
      <h3 class="group-title">{{ GROUP_LABELS[group] }}</h3>
      <div class="field-grid">
        <label v-for="field in fields" :key="field.key" class="field">
          <span class="field-label">{{ field.label }}</span>
          <input
            class="field-input"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            :value="displayValue(field.key)"
            @input="updateField(field.key, ($event.target as HTMLInputElement).value)"
            @blur="finalizeField(field.key)"
          />
          <span class="field-unit">{{ field.unit }}</span>
        </label>
      </div>
    </div>
  </section>
</template>

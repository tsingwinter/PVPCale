<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  GROUP_LABELS,
  GROUP_ORDER,
  STAT_FIELDS,
  type CalcMode,
  type PlayerStats,
  type StatField,
} from '../types/player'

const props = withDefaults(
  defineProps<{
    label: string
    sourceLabel?: string
    model: PlayerStats
    source?: PlayerStats
    mode: CalcMode
    /** absolute：绝对值；delta：相对增减量 */
    valueMode?: 'absolute' | 'delta'
    showImport?: boolean
    hint?: string
    /** 标题右侧操作按钮文案，如「自我比对」 */
    headerActionLabel?: string
  }>(),
  {
    valueMode: 'absolute',
    showImport: true,
    sourceLabel: '',
    headerActionLabel: '',
  },
)

const emit = defineEmits<{
  'update:model': [value: PlayerStats]
  'header-action': []
}>()

/** 输入过程中的原始字符串，避免 12. 被 Number 转成 12 导致小数点消失 */
const drafts = ref<Partial<Record<keyof PlayerStats, string>>>({})
/** 变动模式：是否为负；未设置时跟随 model 符号 */
const deltaNegative = ref<Partial<Record<keyof PlayerStats, boolean>>>({})
const selectedKeys = ref<Set<keyof PlayerStats>>(new Set())
const importOpen = ref(false)
const importTip = ref('')

const ABSOLUTE_PATTERN = /^\d*\.?\d*$/

const visibleFields = computed(() =>
  STAT_FIELDS.filter((field) => !field.modes || field.modes.includes(props.mode)),
)

const groupedFields = computed(() => {
  const groups = new Map<StatField['group'], StatField[]>()
  for (const field of visibleFields.value) {
    const list = groups.get(field.group) ?? []
    list.push(field)
    groups.set(field.group, list)
  }
  return GROUP_ORDER.filter((group) => groups.has(group)).map((group) => ({
    group,
    fields: groups.get(group)!,
  }))
})

const allSelected = computed(() => {
  const fields = visibleFields.value
  return fields.length > 0 && fields.every((field) => selectedKeys.value.has(field.key))
})

const canImport = computed(
  () => props.showImport && props.valueMode === 'absolute' && !!props.source && !!props.sourceLabel,
)

watch(
  () => props.mode,
  () => {
    selectedKeys.value = new Set()
    importTip.value = ''
  },
)

function isDeltaNegative(key: keyof PlayerStats): boolean {
  const flagged = deltaNegative.value[key]
  if (flagged !== undefined) return flagged
  return props.model[key] < 0
}

function displayValue(key: keyof PlayerStats): string {
  const draft = drafts.value[key]
  if (draft !== undefined) return draft
  const value = props.model[key]
  if (value === 0) return ''
  return String(Math.abs(value))
}

function parseMagnitude(raw: string): number {
  if (raw === '' || raw === '.') return 0
  const value = Number(raw)
  return Number.isFinite(value) ? value : 0
}

function signedValue(key: keyof PlayerStats, magnitude: number): number {
  if (magnitude === 0) return 0
  return isDeltaNegative(key) ? -magnitude : magnitude
}

function updateField(key: keyof PlayerStats, raw: string) {
  if (raw !== '' && !ABSOLUTE_PATTERN.test(raw)) return

  drafts.value = { ...drafts.value, [key]: raw }
  const magnitude = parseMagnitude(raw)
  emit('update:model', { ...props.model, [key]: signedValue(key, magnitude) })
}

function finalizeField(key: keyof PlayerStats) {
  const draft = drafts.value[key]
  if (draft !== undefined) {
    if (draft === '' || draft === '.') {
      const cleared = { ...drafts.value }
      delete cleared[key]
      drafts.value = cleared
      const nextNeg = { ...deltaNegative.value }
      delete nextNeg[key]
      deltaNegative.value = nextNeg
      emit('update:model', { ...props.model, [key]: 0 })
      return
    }
    const magnitude = parseMagnitude(draft)
    emit('update:model', { ...props.model, [key]: signedValue(key, magnitude) })
  }
  const next = { ...drafts.value }
  delete next[key]
  drafts.value = next
  // 定稿后用 model 符号即可，清临时标记
  if (deltaNegative.value[key] !== undefined) {
    const nextNeg = { ...deltaNegative.value }
    delete nextNeg[key]
    deltaNegative.value = nextNeg
  }
}

function toggleDeltaNegative(key: keyof PlayerStats) {
  const nextNeg = !isDeltaNegative(key)
  deltaNegative.value = { ...deltaNegative.value, [key]: nextNeg }

  const raw = displayValue(key)
  const magnitude = parseMagnitude(raw)
  // 空值时只切换符号标记，数值仍为 0
  const signed = magnitude === 0 ? 0 : nextNeg ? -magnitude : magnitude
  emit('update:model', { ...props.model, [key]: signed })
}

function isSelected(key: keyof PlayerStats): boolean {
  return selectedKeys.value.has(key)
}

function toggleKey(key: keyof PlayerStats, checked: boolean) {
  const next = new Set(selectedKeys.value)
  if (checked) next.add(key)
  else next.delete(key)
  selectedKeys.value = next
  importTip.value = ''
}

function selectAll() {
  selectedKeys.value = new Set(visibleFields.value.map((field) => field.key))
  importTip.value = ''
}

function clearSelection() {
  selectedKeys.value = new Set()
  importTip.value = ''
}

function toggleSelectAll() {
  if (allSelected.value) clearSelection()
  else selectAll()
}

function applyFromSource() {
  if (!props.source) return
  const keys = [...selectedKeys.value].filter((key) =>
    visibleFields.value.some((field) => field.key === key),
  )
  if (keys.length === 0) {
    importTip.value = '请先勾选要替换的属性'
    return
  }

  const next: PlayerStats = { ...props.model }
  const nextDrafts = { ...drafts.value }
  for (const key of keys) {
    next[key] = props.source[key]
    delete nextDrafts[key]
  }
  drafts.value = nextDrafts
  emit('update:model', next)
  importTip.value = `已从${props.sourceLabel}替换 ${keys.length} 项`
}
</script>

<template>
  <section class="panel" :class="{ 'panel-delta': valueMode === 'delta' }">
    <div class="panel-header">
      <div class="panel-title-block">
        <div class="panel-title-row">
          <h2 class="panel-title">{{ label }}</h2>
          <button
            v-if="headerActionLabel"
            type="button"
            class="btn-header-action"
            :title="headerActionLabel"
            @click="emit('header-action')"
          >
            <svg
              class="btn-header-action-icon"
              viewBox="0 0 24 24"
              width="14"
              height="14"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M7 7h11l-1.5-1.5L18 4l4 4-4 4-1.5-1.5L18 9H7V7zm10 10H6l1.5 1.5L6 20l-4-4 4-4 1.5 1.5L6 15h11v2z"
              />
            </svg>
            <span>{{ headerActionLabel }}</span>
          </button>
        </div>
        <p v-if="hint" class="panel-hint">{{ hint }}</p>
      </div>
      <button
        v-if="canImport"
        type="button"
        class="btn-import-toggle"
        @click="importOpen = !importOpen"
      >
        {{ importOpen ? '收起导入' : `从${sourceLabel}导入` }}
      </button>
    </div>

    <div v-if="canImport && importOpen" class="import-box">
      <div class="import-toolbar">
        <label class="import-check">
          <input
            type="checkbox"
            :checked="allSelected"
            @change="toggleSelectAll()"
          />
          <span>全选</span>
        </label>
        <button type="button" class="btn-import-action" @click="clearSelection">清空勾选</button>
        <button type="button" class="btn-import-apply" @click="applyFromSource">
          替换为{{ sourceLabel }}的勾选项
        </button>
      </div>

      <div
        v-for="{ group, fields } in groupedFields"
        :key="`import-${group}`"
        class="field-group import-group"
      >
        <h3 class="group-title">{{ GROUP_LABELS[group] }}</h3>
        <div class="field-grid">
          <label
            v-for="field in fields"
            :key="field.key"
            class="field import-field"
          >
            <span class="field-label">{{ field.label }}</span>
            <span class="import-field-control">
              <input
                type="checkbox"
                :checked="isSelected(field.key)"
                @change="toggleKey(field.key, ($event.target as HTMLInputElement).checked)"
              />
            </span>
            <span class="field-unit"></span>
          </label>
        </div>
      </div>

      <p v-if="importTip" class="import-tip">{{ importTip }}</p>
    </div>

    <div v-for="{ group, fields } in groupedFields" :key="group" class="field-group">
      <h3 class="group-title">{{ GROUP_LABELS[group] }}</h3>
      <div class="field-grid">
        <label v-for="field in fields" :key="field.key" class="field">
          <span class="field-label">{{ field.label }}</span>
          <span class="field-input-wrap">
            <input
              class="field-input"
              type="text"
              inputmode="decimal"
              autocomplete="off"
              :value="displayValue(field.key)"
              @input="updateField(field.key, ($event.target as HTMLInputElement).value)"
              @blur="finalizeField(field.key)"
            />
            <button
              v-if="valueMode === 'delta'"
              type="button"
              class="delta-minus-btn"
              :class="{ active: isDeltaNegative(field.key) }"
              :title="isDeltaNegative(field.key) ? '当前为减少，点击改回增加' : '设为减少'"
              :aria-pressed="isDeltaNegative(field.key)"
              @mousedown.prevent
              @click="toggleDeltaNegative(field.key)"
            >
              −
            </button>
          </span>
          <span class="field-unit">{{ field.unit }}</span>
        </label>
      </div>
    </div>
  </section>
</template>

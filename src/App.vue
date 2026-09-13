<script setup lang="ts">
import { computed, ref } from 'vue'
import CompareResult from './components/CompareResult.vue'
import PlayerPanel from './components/PlayerPanel.vue'
import RefineAffixStats from './components/RefineAffixStats.vue'
import { usePlayerStorage } from './composables/usePlayerStorage'
import {
  applyDelta,
  CALC_MODES,
  type CalcMode,
} from './types/player'

type AppView = 'calc' | 'refineStats'

const {
  playerA,
  playerB,
  playerDelta,
  calcMode,
  compareKind,
  panelKey,
  resetAll,
} = usePlayerStorage()

const appView = ref<AppView>('calc')
const showResetConfirm = ref(false)

const isDelta = computed(() => compareKind.value === 'delta')

const effectiveB = computed(() =>
  isDelta.value ? applyDelta(playerA.value, playerDelta.value) : playerB.value,
)

function selectMode(mode: CalcMode, ready: boolean) {
  if (!ready) return
  calcMode.value = mode
}

function enterSelfCompare() {
  compareKind.value = 'delta'
}

function exitSelfCompare() {
  compareKind.value = 'versus'
}

function requestReset() {
  showResetConfirm.value = true
}

function cancelReset() {
  showResetConfirm.value = false
}

function confirmReset() {
  resetAll()
  showResetConfirm.value = false
}

const attackHint = computed(() => {
  if (isDelta.value) {
    return '自我比对：右侧填写相对玩家 A 的增减量（如 10、-5），实际面板 = 玩家 A + 增减量。'
  }
  return calcMode.value === 'pvp'
    ? '总攻击力 =（基础攻击力 + PVP攻击力）×（1 + 攻击力加成%）'
    : '总攻击力 = 基础攻击力 ×（1 + 攻击力加成%）（不含 PVP 攻击力与 PVP 乘区）'
})
</script>

<template>
  <div class="app">
    <header class="header">
      <div>
        <h1>PVPVECale</h1>
        <p class="subtitle">纯面板伤害计算器：忽略三尸核心效果、脸谱套装效果、鬼仆技能效果、天书倍率、天书羁绊和天书释放顺序，不计算普攻和符咒伤害，非实战情况，仅供推理使用。</p>
      </div>
      <div class="header-actions">
        <button
          v-if="appView === 'calc'"
          type="button"
          class="btn-header"
          @click="appView = 'refineStats'"
        >
          淬炼统计
        </button>
        <button
          v-else
          type="button"
          class="btn-header"
          @click="appView = 'calc'"
        >
          返回计算
        </button>
        <button
          v-if="appView === 'calc'"
          type="button"
          class="btn-reset"
          @click="requestReset"
        >
          清空数据
        </button>
      </div>
    </header>

    <div
      v-if="showResetConfirm"
      class="confirm-mask"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-confirm-title"
      @click.self="cancelReset"
    >
      <div class="confirm-card">
        <h3 id="reset-confirm-title" class="confirm-title">确认清空？</h3>
        <p class="confirm-text">将清空玩家 A、玩家 B 以及自我比对的增减量，此操作不可撤销。</p>
        <div class="confirm-actions">
          <button type="button" class="btn-reset" @click="cancelReset">取消</button>
          <button type="button" class="btn-confirm-danger" @click="confirmReset">确认清空</button>
        </div>
      </div>
    </div>

    <template v-if="appView === 'calc'">
      <nav class="mode-tabs" aria-label="计算模式">
        <button
          v-for="mode in CALC_MODES"
          :key="mode.id"
          type="button"
          class="mode-tab"
          :class="{
            active: calcMode === mode.id,
            disabled: !mode.ready,
          }"
          :disabled="!mode.ready"
          @click="selectMode(mode.id, mode.ready)"
        >
          {{ mode.label }}
          <span v-if="!mode.ready" class="mode-badge">暂未开放</span>
        </button>
      </nav>

      <div class="players">
        <PlayerPanel
          :key="`a-${panelKey}-${calcMode}-${compareKind}`"
          label="玩家 A"
          source-label="玩家 B"
          :model="playerA"
          :source="playerB"
          :mode="calcMode"
          value-mode="absolute"
          :show-import="!isDelta"
          @update:model="playerA = $event"
        />

        <PlayerPanel
          v-if="isDelta"
          :key="`delta-${panelKey}-${calcMode}`"
          label="数值变动"
          header-action-label="双人对比"
          :model="playerDelta"
          :mode="calcMode"
          value-mode="delta"
          :show-import="false"
          @update:model="playerDelta = $event"
          @header-action="exitSelfCompare"
        />
        <PlayerPanel
          v-else
          :key="`b-${panelKey}-${calcMode}`"
          label="玩家 B"
          source-label="玩家 A"
          header-action-label="自我比对"
          :model="playerB"
          :source="playerA"
          :mode="calcMode"
          value-mode="absolute"
          :show-import="true"
          @update:model="playerB = $event"
          @header-action="enterSelfCompare"
        />
      </div>

      <CompareResult
        :player-a="playerA"
        :player-b="effectiveB"
        :mode="calcMode"
        :compare-kind="compareKind"
      />

      <footer class="footer">
        输入均为数值，百分比词条默认单位 %（无需输入符号）。{{ attackHint }}
      </footer>
    </template>

    <RefineAffixStats v-else />
  </div>
</template>

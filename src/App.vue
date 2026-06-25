<script setup lang="ts">
import CompareResult from './components/CompareResult.vue'
import PlayerPanel from './components/PlayerPanel.vue'
import { usePlayerStorage } from './composables/usePlayerStorage'

const { playerA, playerB, panelKey, resetAll } = usePlayerStorage()
</script>

<template>
  <div class="app">
    <header class="header">
      <div>
        <h1>PVPCale</h1>
        <p class="subtitle">PVP纯面板伤害计算器：忽略PVP三尸加成、脸谱套装效果、鬼仆技能效果、天书倍率、天书羁绊和天书释放顺序，不计算普攻和符咒伤害，非PVP真实伤害，仅供参考。</p>
      </div>
      <button type="button" class="btn-reset" @click="resetAll">清空数据</button>
    </header>

    <div class="players">
      <PlayerPanel
        :key="`a-${panelKey}`"
        label="玩家 A"
        :model="playerA"
        @update:model="playerA = $event"
      />
      <PlayerPanel
        :key="`b-${panelKey}`"
        label="玩家 B"
        :model="playerB"
        @update:model="playerB = $event"
      />
    </div>

    <CompareResult :player-a="playerA" :player-b="playerB" />

    <footer class="footer">
      输入均为数值，百分比词条默认单位 %（无需输入符号）
    </footer>
  </div>
</template>

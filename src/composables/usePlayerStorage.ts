import { ref, watch } from 'vue'
import {
  createEmptyPlayer,
  normalizePlayer,
  type CalcMode,
  type CompareKind,
  type PlayerStats,
} from '../types/player'

const STORAGE_KEY = 'pvpcale-players'
const DELTA_KEY = 'pvpcale-delta'
const MODE_KEY = 'pvpcale-mode'
const COMPARE_KEY = 'pvpcale-compare-kind'

function loadPlayers(): [PlayerStats, PlayerStats] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [createEmptyPlayer(), createEmptyPlayer()]
    const parsed = JSON.parse(raw) as [unknown, unknown]
    return [normalizePlayer(parsed[0] as never), normalizePlayer(parsed[1] as never)]
  } catch {
    return [createEmptyPlayer(), createEmptyPlayer()]
  }
}

function loadDelta(): PlayerStats {
  try {
    const raw = localStorage.getItem(DELTA_KEY)
    if (!raw) return createEmptyPlayer()
    return normalizePlayer(JSON.parse(raw) as never)
  } catch {
    return createEmptyPlayer()
  }
}

function loadMode(): CalcMode {
  const raw = localStorage.getItem(MODE_KEY)
  if (raw === 'pvp' || raw === 'boss' || raw === 'elite') return raw
  return 'pvp'
}

function loadCompareKind(): CompareKind {
  const raw = localStorage.getItem(COMPARE_KEY)
  if (raw === 'versus' || raw === 'delta') return raw
  return 'versus'
}

export function usePlayerStorage() {
  const stored = loadPlayers()
  const playerA = ref<PlayerStats>(stored[0])
  const playerB = ref<PlayerStats>(stored[1])
  const playerDelta = ref<PlayerStats>(loadDelta())
  const calcMode = ref<CalcMode>(loadMode())
  const compareKind = ref<CompareKind>(loadCompareKind())
  const panelKey = ref(0)

  watch(
    [playerA, playerB],
    () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([playerA.value, playerB.value]),
      )
    },
    { deep: true },
  )

  watch(
    playerDelta,
    () => {
      localStorage.setItem(DELTA_KEY, JSON.stringify(playerDelta.value))
    },
    { deep: true },
  )

  watch(calcMode, (mode) => {
    localStorage.setItem(MODE_KEY, mode)
  })

  watch(compareKind, (kind) => {
    localStorage.setItem(COMPARE_KEY, kind)
  })

  function resetAll() {
    playerA.value = createEmptyPlayer()
    playerB.value = createEmptyPlayer()
    playerDelta.value = createEmptyPlayer()
    panelKey.value += 1
  }

  return {
    playerA,
    playerB,
    playerDelta,
    calcMode,
    compareKind,
    panelKey,
    resetAll,
  }
}

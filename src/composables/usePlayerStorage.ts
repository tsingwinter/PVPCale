import { ref, watch } from 'vue'
import { createEmptyPlayer, type PlayerStats } from '../types/player'

const STORAGE_KEY = 'pvpcale-players'

function loadPlayers(): [PlayerStats, PlayerStats] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [createEmptyPlayer(), createEmptyPlayer()]
    const parsed = JSON.parse(raw) as [PlayerStats, PlayerStats]
    return [
      { ...createEmptyPlayer(), ...parsed[0] },
      { ...createEmptyPlayer(), ...parsed[1] },
    ]
  } catch {
    return [createEmptyPlayer(), createEmptyPlayer()]
  }
}

export function usePlayerStorage() {
  const stored = loadPlayers()
  const playerA = ref<PlayerStats>(stored[0])
  const playerB = ref<PlayerStats>(stored[1])
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

  function resetAll() {
    playerA.value = createEmptyPlayer()
    playerB.value = createEmptyPlayer()
    panelKey.value += 1
  }

  return { playerA, playerB, panelKey, resetAll }
}

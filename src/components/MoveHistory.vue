
<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue';

const props = defineProps<{
  history: string[];
}>();

const historyContainer = ref<HTMLElement | null>(null);

// Auto-scroll to bottom when history changes
watch(() => props.history.length, async () => {
  await nextTick();
  if (historyContainer.value) {
    historyContainer.value.scrollTop = historyContainer.value.scrollHeight;
  }
});

// Format moves into pairs (1. e4 e5)
const formattedMoves = computed(() => {
  const pairs = [];
  for (let i = 0; i < props.history.length; i += 2) {
    pairs.push({
      num: Math.floor(i / 2) + 1,
      white: props.history[i],
      black: props.history[i + 1] || ''
    });
  }
  return pairs;
});

// Map SAN piece letter to Unicode chess piece
const pieceIcons: Record<string, string> = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘',
};

function renderMove(san: string, isBlack: boolean): string {
  if (!san) return '';
  const firstChar = san[0];

  // O-O or O-O-O (castling)
  if (san.startsWith('O-O')) {
    const icon = isBlack ? '♚' : '♔';
    return `<span class="piece-icon">${icon}</span>${san}`;
  }

  // Piece moves: starts with uppercase K, Q, R, B, N
  if (pieceIcons[firstChar]) {
    const icon = isBlack
      ? { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞' }[firstChar]
      : pieceIcons[firstChar];
    return `<span class="piece-icon">${icon}</span>${san.substring(1)}`;
  }

  // Pawn move: use pawn icon
  const pawnIcon = isBlack ? '♟' : '♙';
  return `<span class="piece-icon pawn-icon">${pawnIcon}</span>${san}`;
}
</script>

<template>
  <div class="move-history glass-panel">
    <div class="history-header">
      <div class="header-main">
        <span class="icon"><i class="fa-solid fa-list-ol"></i></span>
        <h3>Move History</h3>
      </div>
    </div>
    
    <div ref="historyContainer" class="history-table-wrapper">
      <table class="history-table">
        <thead>
          <tr>
            <th>#</th>
            <th>White</th>
            <th>Black</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pair in formattedMoves" :key="pair.num">
            <td class="move-num">{{ pair.num }}.</td>
            <td class="move-val" :class="{ last: pair.white === history[history.length-1] && !pair.black }">
              <span v-html="renderMove(pair.white, false)"></span>
            </td>
            <td class="move-val" :class="{ last: pair.black === history[history.length-1] }">
              <span v-html="renderMove(pair.black, true)"></span>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="history.length === 0" class="empty-state">
        <div class="empty-icon"><i class="fa-solid fa-chess-board"></i></div>
        <p>No moves yet.<br>Good luck with your game!</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.move-history {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 600px; /* Match board height roughly */
  overflow: hidden;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.history-header .icon {
  font-size: 1.2rem;
  color: #818cf8;
  display: flex;
  align-items: center;
}

h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.history-table-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.5rem 1.5rem 1.5rem;
}

/* Custom Scrollbar */
.history-table-wrapper::-webkit-scrollbar {
  width: 6px;
}
.history-table-wrapper::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
}

.history-table th {
  text-align: left;
  padding: 0.8rem 0;
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.7rem;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 1px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.05);
}

.history-table td {
  padding: 0.6rem 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.move-num {
  color: rgba(255, 255, 255, 0.3);
  font-weight: 600;
  width: 30px;
}

.move-val {
  color: #fff;
  font-weight: 500;
}

.move-val :deep(.piece-icon) {
  font-size: 1.05rem;
  margin-right: 1px;
  opacity: 0.85;
  vertical-align: -1px;
}

.move-val :deep(.pawn-icon) {
  font-size: 0.9rem;
  opacity: 0.5;
}

.move-val.last {
  color: #fbbf24;
  text-shadow: 0 0 8px rgba(251, 191, 36, 0.4);
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.2rem;
  padding: 3rem 1.5rem;
  color: rgba(255, 255, 255, 0.15);
  text-align: center;
}

.empty-icon {
  font-size: 2.5rem;
  opacity: 0.2;
}

.empty-state p {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.5;
}
</style>

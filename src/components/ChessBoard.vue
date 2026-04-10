
<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { Chess, type Move } from 'chess.js';

const props = defineProps<{
  fen: string;
  orientation: 'white' | 'black';
  bestMove?: string | null;
  isLocked?: boolean;
}>();

const emit = defineEmits<{
  (e: 'move', fen: string, move: Move): void;
}>();

const boardRef = ref<HTMLElement | null>(null);
let board: any = null;

// Store resize handler as a named reference so it can be properly cleaned up
const handleResize = () => board?.resize();

onMounted(() => {
  const initBoard = () => {
    if (typeof (window as any).Chessboard === 'undefined') {
      setTimeout(initBoard, 100);
      return;
    }

    const config = {
      draggable: true,
      position: props.fen,
      orientation: props.orientation,
      onDragStart: onDragStart,
      onDrop: onDrop,
      onSnapEnd: onSnapEnd,
      pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    };

    board = (window as any).Chessboard(boardRef.value, config);
    window.addEventListener('resize', handleResize);
  };

  initBoard();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

// Watch for external FEN changes
watch(() => props.fen, (newFen) => {
  if (board) {
    board.position(newFen);
  }
});

// Watch for orientation changes (flip board)
watch(() => props.orientation, (newOrientation) => {
  if (board) {
    board.orientation(newOrientation);
  }
});

// Watch for best move to highlight squares
watch(() => props.bestMove, (newBestMove) => {
  removeHighlights();
  if (newBestMove) {
    const from = newBestMove.substring(0, 2);
    const to = newBestMove.substring(2, 4);
    highlightSquare(from);
    highlightSquare(to);
  }
});

function onDragStart(source: string, piece: string) {
  if (props.isLocked) return false;
  
  const game = new Chess(props.fen);
  // Only pick up pieces for the player whose turn it is
  if (game.isGameOver() ||
      (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }
}

function onDrop(source: string, target: string) {
  const game = new Chess(props.fen);
  
  try {
    const move = game.move({
      from: source,
      to: target,
      promotion: 'q' // always promote to queen for simplicity
    });

    if (move === null) return 'snapback';

    emit('move', game.fen(), move);
  } catch (e) {
    return 'snapback';
  }
}

function onSnapEnd() {
  // Sync the board visual to the latest FEN via the watcher;
  // read from board's own position to avoid stale props.fen race condition
  if (board) {
    board.position(props.fen, false);
  }
}

function highlightSquare(square: string) {
  const $square = boardRef.value?.querySelector(`.square-${square}`);
  if ($square) {
    $square.classList.add('highlight-best');
  }
}

function removeHighlights() {
  boardRef.value?.querySelectorAll('.highlight-best').forEach(el => {
    el.classList.remove('highlight-best');
  });
}

function flip() {
  board?.flip();
}

defineExpose({ flip });
</script>

<template>
  <div class="chess-board-container">
    <div ref="boardRef" id="myBoard" class="board"></div>
  </div>
</template>

<style>
.chess-board-container {
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
  aspect-ratio: 1;
}

.board {
  width: 100%;
}

/* Custom Highlight Styles */
.highlight-best {
  box-shadow: inset 0 0 3px 3px rgba(255, 255, 0, 0.75);
}

.square-55d63 {
  transition: background-color 0.2s;
}

/* Glassmorphism for the board background if desired */
.board {
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
</style>

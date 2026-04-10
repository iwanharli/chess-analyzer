import { ref, shallowRef, computed } from 'vue';
import { defineStore } from 'pinia';
import { Chess, type Move } from 'chess.js';
import { StockfishService, type EngineAnalysis } from '@/services/stockfish-service';
import { SoundService } from '@/services/sound-service';

export type AutoPlayMode = 'off' | 'white' | 'black' | 'both';

export interface GameResult {
  title: string;
  message: string;
  icon: string;
  theme: 'victory' | 'draw';
  accent: string;
  glow: string;
  gradient: string;
}

export const useGameStore = defineStore('game', () => {
  // Use shallowRef so Vue doesn't deep-proxy the Chess instance.
  // chess.js relies on internal state mutations (undo, move, etc.)
  // that break when wrapped in Vue's reactive Proxy.
  const game = shallowRef(new Chess());
  const fen = ref(game.value.fen());
  const orientation = ref<'white' | 'black'>('white');
  const gameHistory = ref<string[]>([]);

  // ─── Engine ───
  const engine = new StockfishService();
  const analysisLines = ref<EngineAnalysis[]>([]);
  const bestMove = ref<string | null>(null);
  const engineDepth = ref(20);
  // Tracks the FEN that was sent to the engine for analysis.
  // When a bestmove arrives, we compare against the current FEN to reject stale responses.
  let activeFen = '';

  // ─── AI Control ───
  const autoPlayMode = ref<AutoPlayMode>('off');
  const isAITurn = ref(false);

  // ─── UI State ───
  const showGameOver = ref(false);
  const showPgnModal = ref(false);
  const pgnMode = ref<'export' | 'import'>('export');
  const pgnText = ref('');
  const pgnCopied = ref(false);
  const pgnError = ref('');
  const soundEnabled = ref(true);
  let analysisTimeout: number | undefined;

  // ─── Computed ───
  const gameResult = computed<GameResult | null>(() => {
    const g = game.value;
    if (!g.isGameOver()) return null;

    if (g.isCheckmate()) {
      const winner = g.turn() === 'w' ? 'Black' : 'White';
      return {
        title: 'Checkmate!', message: `${winner} wins`, icon: '👑',
        theme: 'victory', accent: '#fbbf24', glow: 'rgba(251, 191, 36, 0.4)',
        gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)'
      };
    }
    if (g.isStalemate()) {
      return {
        title: 'Stalemate', message: 'Draw by stalemate', icon: '🤝',
        theme: 'draw', accent: '#94a3b8', glow: 'rgba(148, 163, 184, 0.3)',
        gradient: 'linear-gradient(135deg, #94a3b8, #64748b)'
      };
    }
    if (g.isThreefoldRepetition()) {
      return {
        title: 'Draw', message: 'Threefold repetition', icon: '🔄',
        theme: 'draw', accent: '#94a3b8', glow: 'rgba(148, 163, 184, 0.3)',
        gradient: 'linear-gradient(135deg, #94a3b8, #64748b)'
      };
    }
    if (g.isInsufficientMaterial()) {
      return {
        title: 'Draw', message: 'Insufficient material', icon: '♟️',
        theme: 'draw', accent: '#94a3b8', glow: 'rgba(148, 163, 184, 0.3)',
        gradient: 'linear-gradient(135deg, #94a3b8, #64748b)'
      };
    }
    if (g.isDraw()) {
      return {
        title: 'Draw', message: '50-move rule', icon: '📜',
        theme: 'draw', accent: '#94a3b8', glow: 'rgba(148, 163, 184, 0.3)',
        gradient: 'linear-gradient(135deg, #94a3b8, #64748b)'
      };
    }
    return {
      title: 'Game Over', message: 'The game has ended', icon: '🏁',
      theme: 'draw', accent: '#a5b4fc', glow: 'rgba(165, 180, 252, 0.3)',
      gradient: 'linear-gradient(135deg, #a5b4fc, #6366f1)'
    };
  });

  const lastMove = computed(() => {
    const h = gameHistory.value;
    return h.length > 0 ? h[h.length - 1] : '—';
  });

  /**
   * Normalized evaluation for the eval bar.
   * Returns a number between 0 (black winning) and 1 (white winning).
   * 0.5 = equal position.
   */
  const evalBarValue = computed(() => {
    const line = analysisLines.value[0];
    if (!line?.score) return 0.5;

    if (line.score.type === 'mate') {
      return line.score.value > 0 ? 1 : 0;
    }

    // Sigmoid-like mapping: cp → [0, 1]
    // At ±500cp the bar is nearly full
    const cp = line.score.value;
    return 1 / (1 + Math.pow(10, -cp / 400));
  });

  // ─── Scoring ───
  const materialScore = computed(() => {
    const board = game.value.board();
    const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    let white = 0;
    let black = 0;

    for (const row of board) {
      for (const piece of row) {
        if (piece) {
          const val = values[piece.type] || 0;
          if (piece.color === 'w') white += val;
          else black += val;
        }
      }
    }

    return {
      white,
      black,
      diff: white - black
    };
  });

  // ─── Engine init ───
  function initEngine() {
    engine.onMessage((msg) => {
      // Reject any engine messages if the position has changed since analysis started.
      // This prevents stale "info" or "bestmove" responses from the previous position
      // (which may still be in flight from the worker) from polluting the new state.
      if (activeFen !== fen.value) return;

      const analysis = engine.parseEval(msg);
      if (analysis) {
        const idx = (analysis.multipv || 1) - 1;
        const lines = [...analysisLines.value];
        lines[idx] = analysis;
        analysisLines.value = lines.slice(0, engine.multiPV);
      }
      
      const move = engine.parseBestMove(msg);
      if (move) {
        bestMove.value = move;
        checkAutoPlay(move);
      }
    });
  }

  // ─── State refresh ───
  function refreshGameState() {
    fen.value = game.value.fen();
    gameHistory.value = game.value.history();

    // Kill any pending analysis immediately when position changes
    engine.stop();
    if (analysisTimeout) clearTimeout(analysisTimeout);

    if (game.value.isGameOver()) {
      isAITurn.value = false;
      showGameOver.value = true;
      SoundService.play('gameOver');
      return;
    }

    startAnalysis();
  }

  function startAnalysis() {
    // Clear UI lines immediately for visual feedback
    analysisLines.value = [];
    activeFen = ''; // Invalidate immediately to drop stale messages

    // Debounce analysis start to prevent flooding the worker during fast moves
    analysisTimeout = window.setTimeout(() => {
      activeFen = fen.value;
      engine.analyze(fen.value, engineDepth.value);
    }, 200);
  }

  // ─── AI auto-play logic ───
  function checkAutoPlay(move: string) {
    const turn = game.value.turn();
    const isWhiteTurn = turn === 'w';

    const shouldAIPlay = (autoPlayMode.value === 'both') ||
                         (autoPlayMode.value === 'white' && isWhiteTurn) ||
                         (autoPlayMode.value === 'black' && !isWhiteTurn);

    if (shouldAIPlay && !game.value.isGameOver()) {
      // Validate the move is legal in the current position before committing
      const testGame = new Chess(game.value.fen());
      try {
        const testResult = testGame.move({
          from: move.substring(0, 2),
          to: move.substring(2, 4),
          promotion: move.length === 5 ? move[4] : 'q'
        });
        if (!testResult) return; // Stale/invalid move, skip silently
      } catch {
        return; // Invalid move for current position, skip silently
      }

      isAITurn.value = true;
      setTimeout(() => {
        try {
          const moveResult = game.value.move({
            from: move.substring(0, 2),
            to: move.substring(2, 4),
            promotion: move.length === 5 ? move[4] : 'q'
          });

          if (moveResult) {
            playMoveSound(moveResult);
            bestMove.value = null;
            isAITurn.value = false;
            refreshGameState();
          }
        } catch (e) {
          console.error('AI move failed:', e);
          isAITurn.value = false;
          // Re-trigger analysis for a fresh bestmove
          startAnalysis();
        }
      }, 800);
    }
  }

  // ─── Sound helper ───
  function playMoveSound(move: Move) {
    if (game.value.isCheck()) {
      SoundService.play('check');
    } else if (move.captured) {
      SoundService.play('capture');
    } else if (move.flags.includes('k') || move.flags.includes('q')) {
      SoundService.play('castle');
    } else {
      SoundService.play('move');
    }
  }

  // ─── Actions ───
  function handleMove(newFen: string, move: Move) {
    // Apply the move to the existing instance to preserve history.
    game.value.move(move);
    // Notify Vue of the mutation since game is a shallowRef
    game.value = game.value;
    
    playMoveSound(move);
    bestMove.value = null;
    refreshGameState();
  }

  function handleNewGame() {
    game.value = new Chess();
    bestMove.value = null;
    analysisLines.value = [];
    showGameOver.value = false;
    refreshGameState();
  }

  function handleFlip() {
    orientation.value = orientation.value === 'white' ? 'black' : 'white';
  }

  function handleUndo() {
    isAITurn.value = false;
    bestMove.value = null;

    const stepsToUndo = autoPlayMode.value !== 'off' ? 2 : 1;
    const historyLen = game.value.history().length;
    const actualSteps = Math.min(stepsToUndo, historyLen);

    for (let i = 0; i < actualSteps; i++) {
      game.value.undo();
    }

    refreshGameState();
  }

  function handleModeChange(mode: AutoPlayMode) {
    autoPlayMode.value = mode;
    if (bestMove.value) {
      checkAutoPlay(bestMove.value);
    }
  }

  function setDepth(depth: number) {
    engineDepth.value = Math.max(1, Math.min(30, depth));
    // Re-analyze current position with new depth
    if (!game.value.isGameOver()) {
      startAnalysis();
    }
  }

  function toggleSound() {
    soundEnabled.value = !soundEnabled.value;
    SoundService.setEnabled(soundEnabled.value);
  }

  // ─── PGN ───
  function exportPgn() {
    pgnMode.value = 'export';
    pgnText.value = game.value.pgn() || '[No moves yet]';
    pgnCopied.value = false;
    pgnError.value = '';
    showPgnModal.value = true;
  }

  function importPgn() {
    pgnMode.value = 'import';
    pgnText.value = '';
    pgnCopied.value = false;
    pgnError.value = '';
    showPgnModal.value = true;
  }

  function copyPgn() {
    navigator.clipboard.writeText(pgnText.value).then(() => {
      pgnCopied.value = true;
      setTimeout(() => pgnCopied.value = false, 2000);
    });
  }

  function loadPgn() {
    pgnError.value = '';
    try {
      const newGame = new Chess();
      newGame.loadPgn(pgnText.value);
      game.value = newGame;
      bestMove.value = null;
      analysisLines.value = [];
      showGameOver.value = false;
      showPgnModal.value = false;
      refreshGameState();
    } catch (e) {
      pgnError.value = 'Invalid PGN format. Please check your input.';
    }
  }

  return {
    // State
    game, fen, orientation, gameHistory,
    analysisLines, bestMove, engineDepth,
    autoPlayMode, isAITurn,
    showGameOver, showPgnModal, pgnMode, pgnText, pgnCopied, pgnError,
    soundEnabled,

    // Computed
    gameResult, lastMove, evalBarValue, materialScore,

    // Actions
    initEngine, refreshGameState,
    handleMove, handleNewGame, handleFlip, handleUndo, handleModeChange,
    setDepth, toggleSound,
    exportPgn, importPgn, copyPgn, loadPgn,
  };
});

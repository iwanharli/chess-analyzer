
<script setup lang="ts">
import { onMounted, computed } from 'vue';
import ChessBoard from './components/ChessBoard.vue';
import EngineStatus from './components/EngineStatus.vue';
import ControlPanel from './components/ControlPanel.vue';
import MoveHistory from './components/MoveHistory.vue';
import { useGameStore } from './stores/game';

const store = useGameStore();

onMounted(() => {
  store.initEngine();
  store.refreshGameState();
});
</script>

<template>
  <div class="app-container">
    <header class="main-header">
      <div class="logo">
        <span class="logo-icon"><i class="fa-solid fa-chess-knight"></i></span>
        <h1>Antigravity<span>Chess AI</span></h1>
      </div>
      <div class="header-status">
        <button @click="store.toggleSound" class="header-sound-btn" :class="{ muted: !store.soundEnabled }" :title="store.soundEnabled ? 'Mute' : 'Unmute'">
          <i v-if="store.soundEnabled" class="fa-solid fa-volume-high"></i>
          <i v-else class="fa-solid fa-volume-xmark"></i>
        </button>
        <div class="credits">Powered by Stockfish 18 WASM & Vue.js</div>
        <div class="status-indicator">
          <div class="dot" :class="{ pulse: store.isAITurn, 'game-over-dot': store.gameResult }"></div>
          {{ store.gameResult ? store.gameResult.title : (store.isAITurn ? 'AI is Thinking...' : 'Waiting for Move') }}
        </div>
      </div>
    </header>

    <main class="main-content">
      <aside class="history-sidebar">
        <MoveHistory :history="store.gameHistory" />
        <div class="sidebar-actions history-actions">
          <button @click="store.exportPgn" class="sidebar-btn">
            <span class="icon"><i class="fa-solid fa-file-export"></i></span>
            <span>Export PGN</span>
          </button>
          <button @click="store.importPgn" class="sidebar-btn">
            <span class="icon"><i class="fa-solid fa-file-import"></i></span>
            <span>Import PGN</span>
          </button>
        </div>
      </aside>

      <section class="board-area">
        <div class="board-with-controls">
          <ChessBoard
            :fen="store.fen"
            :orientation="store.orientation"
            :best-move="store.bestMove"
            :is-locked="store.isAITurn"
            @move="store.handleMove"
          />
          
          <div class="board-under-controls">
            <div class="ai-mode-selector glass-panel">
              <button @click="store.handleModeChange('off')" :class="{ active: store.autoPlayMode === 'off' }">Manual</button>
              <button @click="store.handleModeChange('black')" :class="{ active: store.autoPlayMode === 'black' }">AI Black</button>
              <button @click="store.handleModeChange('white')" :class="{ active: store.autoPlayMode === 'white' }">AI White</button>
              <button @click="store.handleModeChange('both')" :class="{ active: store.autoPlayMode === 'both' }">AI vs AI</button>
            </div>
          </div>
        </div>
      </section>

      <aside class="control-sidebar">
        <button @click="store.handleNewGame" class="new-game-btn-large">
          <span class="icon"><i class="fa-solid fa-plus"></i></span>
          <span>New Game</span>
        </button>
        
        <EngineStatus
          :analysis-lines="store.analysisLines"
          :best-move="store.bestMove"
        />

        <div class="sidebar-actions">
          <button @click="store.handleFlip" class="sidebar-btn">
            <span class="icon"><i class="fa-solid fa-arrows-rotate"></i></span>
            <span>Flip Board</span>
          </button>
          <button @click="store.handleUndo" class="sidebar-btn">
            <span class="icon"><i class="fa-solid fa-rotate-left"></i></span>
            <span>Undo Move</span>
          </button>
        </div>
      </aside>
    </main>

    <section class="bottom-controls">
      <ControlPanel
        :auto-play-mode="store.autoPlayMode"
        :engine-depth="store.engineDepth"
        :sound-enabled="store.soundEnabled"
        :turn="store.game.turn()"
        :nodes="store.analysisLines[0]?.nodes || 0"
        :nps="store.analysisLines[0]?.nps || 0"
        :is-thinking="store.isAITurn"
        :material-score="store.materialScore"
        @flip="store.handleFlip"
        @undo="store.handleUndo"
        @change-mode="store.handleModeChange"
        @export-pgn="store.exportPgn"
        @import-pgn="store.importPgn"
        @set-depth="store.setDepth"
        @toggle-sound="store.toggleSound"
      />
    </section>

    <!-- Game Over Overlay -->
    <Transition name="fade">
      <div v-if="store.showGameOver && store.gameResult" class="game-over-overlay" @click.self="store.showGameOver = false">
        <!-- Confetti particles for checkmate -->
        <div v-if="store.gameResult.theme === 'victory'" class="confetti-container">
          <div v-for="i in 40" :key="i" class="confetti-piece" :style="{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
            backgroundColor: ['#fbbf24', '#f59e0b', '#a855f7', '#6366f1', '#4ade80', '#f87171', '#38bdf8'][i % 7],
            width: `${4 + Math.random() * 6}px`,
            height: `${4 + Math.random() * 6}px`,
          }"></div>
        </div>

        <div class="game-over-modal glass-panel" :class="`theme-${store.gameResult.theme}`"
             :style="{ '--result-accent': store.gameResult.accent, '--result-glow': store.gameResult.glow, '--result-gradient': store.gameResult.gradient }">
          
          <!-- Glowing ring behind icon -->
          <div class="icon-ring">
            <div class="game-over-icon">{{ store.gameResult.icon }}</div>
          </div>

          <h2 class="game-over-title">{{ store.gameResult.title }}</h2>
          <p class="game-over-message">{{ store.gameResult.message }}</p>
          
          <div class="game-over-stats">
            <div class="stat">
              <span class="stat-label">Total Moves</span>
              <span class="stat-value">{{ store.gameHistory.length }}</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-label">Last Move</span>
              <span class="stat-value stat-move">{{ store.lastMove }}</span>
            </div>
          </div>

          <div class="game-over-actions">
            <button class="btn primary result-btn" @click="store.handleNewGame">🔄 Play Again</button>
            <button class="btn secondary" @click="store.showGameOver = false">Review Board</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- PGN Modal -->
    <Transition name="fade">
      <div v-if="store.showPgnModal" class="game-over-overlay" @click.self="store.showPgnModal = false">
        <div class="pgn-modal glass-panel">
          <div class="pgn-modal-header">
            <h2>{{ store.pgnMode === 'export' ? '📋 Export PGN' : '📥 Import PGN' }}</h2>
            <button class="close-btn" @click="store.showPgnModal = false">✕</button>
          </div>
          
          <textarea 
            v-model="store.pgnText" 
            class="pgn-textarea"
            :placeholder="store.pgnMode === 'import' ? 'Paste your PGN here...\n\n1. e4 e5 2. Nf3 Nc6 ...' : ''"
            :readonly="store.pgnMode === 'export'"
            spellcheck="false"
          ></textarea>

          <p v-if="store.pgnError" class="pgn-error">⚠️ {{ store.pgnError }}</p>

          <div class="pgn-modal-actions">
            <button v-if="store.pgnMode === 'export'" class="btn primary" @click="store.copyPgn">
              {{ store.pgnCopied ? '✅ Copied!' : '📋 Copy to Clipboard' }}
            </button>
            <button v-if="store.pgnMode === 'import'" class="btn primary" @click="store.loadPgn">
              📥 Load Game
            </button>
            <button class="btn secondary" @click="store.showPgnModal = false">Cancel</button>
          </div>
        </div>
      </div>
    </Transition>

    <footer class="app-footer">
    </footer>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Outfit:wght@400;600;800&display=swap');
@import url('/css/chessboard-1.0.0.min.css');

:root {
  --bg-dark: #0f172a;
  --bg-panel: rgba(30, 41, 59, 0.7);
  --accent: #6366f1;
}

body {
  margin: 0;
  background-color: var(--bg-dark);
  background-image: 
    radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 40%),
    radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 40%);
  color: #f8fafc;
  font-family: 'Inter', sans-serif;
  height: 100vh;
  overflow: hidden;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 1rem 2rem;
  box-sizing: border-box;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  margin-bottom: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-icon {
  font-size: 2rem;
  filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.5));
}

h1 {
  font-family: 'Outfit', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
}

h1 span {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-top: -4px;
}

.header-status {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem 1.2rem;
  border-radius: 99px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.header-sound-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  font-size: 1rem;
  cursor: pointer;
  padding: 0.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.header-sound-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.header-sound-btn.muted {
  color: #f87171;
}

.credits {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 500;
  letter-spacing: 0.5px;
  padding-right: 1.5rem;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.dot {
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
  box-shadow: 0 0 10px #4ade80;
}

.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.4; }
  100% { transform: scale(1); opacity: 1; }
}

.main-content {
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: 2rem;
  flex: 1;
  align-items: start;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  min-height: 0;
  padding-bottom: 1rem;
}

.history-sidebar {
  height: 680px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.board-area {
  display: flex;
  justify-content: center;
  gap: 1.2rem;
  align-items: stretch;
}

.board-with-controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  flex: 1;
}

.board-under-controls {
  width: 100%;
  display: flex;
  justify-content: center;
}

.ai-mode-selector {
  display: flex;
  gap: 0.5rem;
  padding: 0.4rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
}

.ai-mode-selector button {
  padding: 0.6rem 1.4rem;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ai-mode-selector button:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.ai-mode-selector button.active {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.3);
  color: #818cf8;
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
}

.control-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.new-game-btn-large {
  width: 100%;
  padding: 1.2rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 1.1rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3),
              inset 0 1px 1px rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.new-game-btn-large:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 15px 30px rgba(99, 102, 241, 0.4),
              inset 0 1px 1px rgba(255, 255, 255, 0.4);
  filter: brightness(1.1);
}

.new-game-btn-large:active {
  transform: translateY(1px);
}

.new-game-btn-large .icon {
  font-size: 1.4rem;
  transition: transform 0.5s ease;
}

.new-game-btn-large:hover .icon {
  transform: rotate(180deg);
}

.sidebar-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
}

.sidebar-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  padding: 0.9rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.sidebar-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: #fff;
  transform: translateY(-2px);
}

.sidebar-btn:active {
  transform: translateY(0);
}

.sidebar-btn .icon {
  font-size: 1.1rem;
}

.bottom-controls {
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.glass-panel {
  background: var(--bg-panel);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.main-footer {
  text-align: center;
  padding: 1rem 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.3);
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    overflow-y: auto;
  }
  .side-col {
    padding-bottom: 2rem;
  }
}

/* Game Over Dot */
.game-over-dot {
  background: #f87171 !important;
  box-shadow: 0 0 10px #f87171 !important;
  animation: none !important;
}

/* Game Over Overlay */
.game-over-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* Confetti System */
.confetti-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1001;
}

.confetti-piece {
  position: absolute;
  top: -10px;
  border-radius: 2px;
  animation: confettiFall linear forwards;
  opacity: 0;
}

@keyframes confettiFall {
  0% {
    transform: translateY(0) rotate(0deg) scale(1);
    opacity: 1;
  }
  25% {
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg) scale(0.3);
    opacity: 0;
  }
}

/* Modal Card */
.game-over-modal {
  padding: 3rem;
  text-align: center;
  min-width: 380px;
  max-width: 440px;
  z-index: 1002;
  position: relative;
  animation: modalBounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  border-color: var(--result-accent, rgba(255,255,255,0.1));
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 40px var(--result-glow, transparent),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.theme-victory {
  animation: modalBounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
             borderGlow 2s ease-in-out infinite;
}

@keyframes modalBounceIn {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(40px);
  }
  60% {
    opacity: 1;
    transform: scale(1.03) translateY(-5px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes borderGlow {
  0%, 100% {
    border-color: var(--result-accent);
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.4),
      0 0 30px var(--result-glow),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  50% {
    border-color: color-mix(in srgb, var(--result-accent) 60%, transparent);
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.4),
      0 0 60px var(--result-glow),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
}

/* Icon Ring */
.icon-ring {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--result-glow) 0%, transparent 70%);
  margin-bottom: 0.5rem;
  animation: iconFloat 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}

@keyframes iconFloat {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-30deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.game-over-icon {
  font-size: 4rem;
  filter: drop-shadow(0 0 20px var(--result-glow));
  animation: iconShimmer 2s ease-in-out infinite 1s;
}

@keyframes iconShimmer {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

/* Title */
.game-over-title {
  font-family: 'Outfit', sans-serif;
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0 0 0.4rem;
  background: var(--result-gradient, linear-gradient(135deg, #fff, #a5b4fc));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: titleSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
}

@keyframes titleSlideUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Message */
.game-over-message {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.05rem;
  margin: 0 0 1.5rem;
  animation: titleSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
}

/* Stats Row */
.game-over-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  animation: titleSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
}

.stat-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 700;
}

.stat-value {
  font-family: 'Outfit', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
}

.stat-move {
  color: var(--result-accent, #fbbf24);
  font-family: 'Courier New', monospace;
  font-size: 1.3rem;
}

/* Actions */
.game-over-actions {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  animation: titleSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
}

.result-btn {
  background: var(--result-gradient, linear-gradient(135deg, #6366f1, #a855f7)) !important;
  box-shadow: 0 4px 20px var(--result-glow, rgba(99, 102, 241, 0.3)) !important;
}

/* Overlay transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* PGN Modal */
.pgn-modal {
  padding: 2rem;
  min-width: 480px;
  max-width: 560px;
  animation: modalBounceIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.pgn-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.pgn-modal-header h2 {
  margin: 0;
  font-family: 'Outfit', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
}

.close-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.pgn-textarea {
  width: 100%;
  min-height: 180px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #e2e8f0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  padding: 1rem;
  resize: vertical;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
}

.pgn-textarea:focus {
  border-color: rgba(99, 102, 241, 0.5);
}

.pgn-textarea::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.pgn-error {
  color: #f87171;
  font-size: 0.85rem;
  margin: 0.8rem 0 0;
}

.pgn-modal-actions {
  display: flex;
  gap: 0.8rem;
  margin-top: 1.5rem;
}

.pgn-modal-actions .btn {
  flex: 1;
}
</style>

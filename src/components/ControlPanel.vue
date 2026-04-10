
<script setup lang="ts">
import type { AutoPlayMode } from '@/stores/game';

const props = withDefaults(defineProps<{
  autoPlayMode?: AutoPlayMode;
  engineDepth?: number;
  soundEnabled?: boolean;
  turn?: 'w' | 'b';
  nodes?: number;
  nps?: number;
  isThinking?: boolean;
  materialScore?: { white: number; black: number; diff: number };
}>(), {
  autoPlayMode: 'off',
  engineDepth: 20,
  soundEnabled: true,
  turn: 'w',
  nodes: 0,
  nps: 0,
  isThinking: false,
  materialScore: () => ({ white: 39, black: 39, diff: 0 })
});

const emit = defineEmits<{
  (e: 'newGame'): void;
  (e: 'flip'): void;
  (e: 'undo'): void;
  (e: 'changeMode', mode: AutoPlayMode): void;
  (e: 'exportPgn'): void;
  (e: 'importPgn'): void;
  (e: 'setDepth', depth: number): void;
  (e: 'toggleSound'): void;
}>();

function onDepthChange(event: Event) {
  const value = parseInt((event.target as HTMLInputElement).value);
  emit('setDepth', value);
}
</script>

<template>
  <div class="control-panel glass-panel">
    <!-- Depth -->
    <div class="cp-group cp-depth">
      <div class="section-title">DEPTH <span class="depth-val">{{ engineDepth }}</span> <span class="depth-hint">{{ engineDepth <= 8 ? 'Fast' : engineDepth <= 18 ? 'Normal' : 'Deep' }}</span></div>
      <input 
        type="range" min="1" max="30" 
        :value="engineDepth" @input="onDepthChange" 
        class="depth-slider"
      />
    </div>

    <div class="cp-divider"></div>

    <!-- System Status (Fills the right side) -->

    <!-- System Status (Fills the right side) -->
    <div class="cp-group status-group">
      <div class="section-title">SYSTEM STATUS</div>
      <div class="status-content">
        <div class="status-item">
          <span class="status-label">TURN</span>
          <div class="turn-indicator" :class="turn === 'w' ? 'white' : 'black'">
            <div class="pulse" v-if="isThinking"></div>
            {{ turn === 'w' ? 'White' : 'Black' }}
          </div>
        </div>
        <div class="status-item">
          <span class="status-label">NODES</span>
          <span class="status-value">{{ (nodes / 1000).toFixed(1) }}k</span>
        </div>
        <div class="status-item">
          <span class="status-label">NPS</span>
          <span class="status-value">{{ (nps / 1000).toFixed(1) }}k</span>
        </div>
        
        <div class="cp-divider small"></div>

        <div class="status-item material-status">
          <span class="status-label">MATERIAL</span>
          <div class="material-scores">
            <div class="m-score white" :class="{ advantage: materialScore.diff > 0 }">
              <span class="m-dot"></span>
              {{ materialScore.white }}
              <span v-if="materialScore.diff > 0" class="m-diff">+{{ materialScore.diff }}</span>
            </div>
            <div class="m-score black" :class="{ advantage: materialScore.diff < 0 }">
              <span class="m-dot"></span>
              {{ materialScore.black }}
              <span v-if="materialScore.diff < 0" class="m-diff">+{{ Math.abs(materialScore.diff) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.control-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0;
  padding: 0.8rem 1.5rem;
  border-radius: 16px;
  width: 100%;
}

.cp-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 1.2rem;
}

.cp-group:first-child {
  padding-left: 0;
}

.cp-group:last-child {
  padding-right: 0;
}

.cp-divider {
  width: 1px;
  align-self: stretch;
  background: rgba(255, 255, 255, 0.08);
  margin: 0 0.2rem;
  flex-shrink: 0;
}

.cp-row {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}

.cp-depth {
  min-width: 160px;
}

.section-title {
  font-size: 0.65rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.35);
  letter-spacing: 1.5px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mode-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
  padding: 0.45rem 0.7rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.mode-btn.active {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.5);
  color: #a5b4fc;
}

.mode-btn:hover:not(.active) {
  background: rgba(255, 255, 255, 0.1);
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.45rem 0.9rem;
  border: none;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.85rem;
  white-space: nowrap;
}

.icon {
  font-size: 0.95rem;
}

.primary {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.secondary {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}

/* Depth Slider */
.depth-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 5px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  cursor: pointer;
}

.depth-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
  cursor: pointer;
  transition: transform 0.15s;
}

.depth-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.depth-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
  border: none;
  cursor: pointer;
}

.depth-val {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  font-weight: 800;
  color: #a5b4fc;
}

.depth-hint {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.25);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Status Group */
.status-group {
  flex: 1;
  max-width: 380px;
  padding-right: 0;
}

.status-content {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.status-label {
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.25);
  font-weight: 700;
  letter-spacing: 0.5px;
}

.status-value {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
}

.turn-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  position: relative;
}

.turn-indicator.white {
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.turn-indicator.black {
  color: #94a3b8;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.cp-divider.small {
  height: 20px;
  width: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 0.5rem;
}

.material-scores {
  display: flex;
  gap: 0.8rem;
  align-items: center;
}

.m-score {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.03);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.8rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.m-score.advantage {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.m-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.white .m-dot { background: #fff; box-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
.black .m-dot { background: #64748b; }

.m-diff {
  font-size: 0.65rem;
  color: #4ade80;
  margin-left: 2px;
}

.pulse {
  width: 6px;
  height: 6px;
  background: #4ade80;
  border-radius: 50%;
  box-shadow: 0 0 8px #4ade80;
  animation: statusPulse 1.5s infinite;
}

@keyframes statusPulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}
</style>

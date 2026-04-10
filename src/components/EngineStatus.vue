
<script setup lang="ts">
import type { EngineAnalysis } from '../services/stockfish-service';

const props = defineProps<{
  analysisLines: EngineAnalysis[];
  bestMove: string | null;
}>();

function formatEval(score: { type: 'cp' | 'mate', value: number } | undefined) {
  if (!score) return '0.00';
  if (score.type === 'mate') return `M${score.value}`;
  return (score.value / 100).toFixed(2);
}

function formatPV(pv: string, maxMoves: number = 6): string {
  return pv.split(' ').slice(0, maxMoves).join(' ');
}

// The primary line is always index 0 (multipv = 1)
const primaryLine = () => props.analysisLines[0] || null;
</script>

<template>
  <div class="engine-status glass-panel">
    <div class="status-header">
      <div class="header-main">
        <span class="icon"><i class="fa-solid fa-microchip"></i></span>
        <h3>Engine Analysis</h3>
      </div>
      <div
        class="eval-badge"
        :class="{
          plus: (primaryLine()?.score.value || 0) >= 0,
          minus: (primaryLine()?.score.value || 0) < 0,
        }"
      >
        {{ formatEval(primaryLine()?.score) }}
      </div>
    </div>

    <!-- Engine Stats -->
    <div class="status-body">
      <div class="stat-item">
        <span class="label">Best Move:</span>
        <span class="valueHighlight">{{ bestMove || 'Calculating...' }}</span>
      </div>
      <div class="stat-item">
        <span class="label">Depth:</span>
        <span class="value"
          >{{ primaryLine()?.depth || 0 }}/{{
            primaryLine()?.selDepth || 0
          }}</span
        >
      </div>
      <div class="stat-item">
        <span class="label">Nodes:</span>
        <span class="value"
          >{{ Math.floor((primaryLine()?.nodes || 0) / 1000) }}k</span
        >
      </div>
      <div class="stat-item">
        <span class="label">NPS:</span>
        <span class="value"
          >{{ Math.floor((primaryLine()?.nps || 0) / 1000) }}k/s</span
        >
      </div>
    </div>

    <!-- Multi-PV Lines -->
    <div class="pv-section" v-if="analysisLines.length > 0">
      <div class="pv-header">
        <span class="label">Top Lines</span>
        <span class="pv-count">{{ analysisLines.length }} PV</span>
      </div>
      <div class="pv-lines">
        <div
          v-for="(line, idx) in analysisLines"
          :key="idx"
          class="pv-line"
          :class="{ 'pv-best': idx === 0 }"
        >
          <div class="pv-line-header">
            <span class="pv-rank">{{ idx + 1 }}</span>
            <span
              class="pv-eval"
              :class="{
                plus: (line.score?.value || 0) >= 0,
                minus: (line.score?.value || 0) < 0,
              }"
            >
              {{ formatEval(line.score) }}
            </span>
          </div>
          <p class="pv-text">{{ formatPV(line.pv) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.engine-status {
  padding: 1.5rem;
  min-width: 280px;
}

.status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.status-header .icon {
  font-size: 1.2rem;
  color: #818cf8;
  display: flex;
  align-items: center;
}

.status-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.eval-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 800;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-width: 70px;
  text-align: center;
}

.plus {
  color: #4ade80;
  border-color: rgba(74, 222, 128, 0.2);
  background: rgba(74, 222, 128, 0.05);
  text-shadow: 0 0 15px rgba(74, 222, 128, 0.2);
}
.minus {
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.2);
  background: rgba(248, 113, 113, 0.05);
  text-shadow: 0 0 15px rgba(248, 113, 113, 0.2);
}

.status-body {
  display: grid;
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
}

.label {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
  font-weight: 500;
}

.value {
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
}

.valueHighlight {
  color: #fbbf24;
  font-weight: 800;
  font-size: 1rem;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.2);
}

/* Multi-PV Section */
.pv-section {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.pv-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.pv-count {
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.05);
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

.pv-lines {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pv-line {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 0.6rem 0.8rem;
  transition: all 0.2s;
}

.pv-line:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}

.pv-best {
  border-color: rgba(99, 102, 241, 0.25);
  background: rgba(99, 102, 241, 0.06);
}

.pv-line-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.3rem;
}

.pv-rank {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
}

.pv-best .pv-rank {
  background: rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
}

.pv-eval {
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
  font-size: 0.85rem;
}

.pv-text {
  margin: 0;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.3;
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

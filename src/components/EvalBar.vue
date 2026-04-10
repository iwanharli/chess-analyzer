
<script setup lang="ts">
const props = defineProps<{
  /** 0 = black winning, 0.5 = equal, 1 = white winning */
  value: number;
  /** Raw centipawn or mate string for tooltip display */
  evalText?: string;
}>();
</script>

<template>
  <div class="eval-bar-container">
    <div class="eval-bar" :title="`Eval: ${evalText || '0.00'}`">
      <div class="eval-white" :style="{ height: `${value * 100}%` }">
        <span v-if="value > 0.55" class="eval-label white-label">{{ evalText }}</span>
      </div>
      <div class="eval-black" :style="{ height: `${(1 - value) * 100}%` }">
        <span v-if="value < 0.45" class="eval-label black-label">{{ evalText }}</span>
      </div>
      <!-- Center marker -->
      <div class="eval-center-line"></div>
    </div>
  </div>
</template>

<style scoped>
.eval-bar-container {
  width: 28px;
  height: 100%;
  min-height: 400px;
  max-height: 600px;
  flex-shrink: 0;
}

.eval-bar {
  width: 100%;
  height: 100%;
  border-radius: 14px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column-reverse;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.eval-white {
  background: linear-gradient(to top, #e2e8f0, #f8fafc);
  transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  min-height: 2px;
}

.eval-black {
  background: linear-gradient(to bottom, #1e293b, #334155);
  transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 2px;
}

.eval-center-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(99, 102, 241, 0.5);
  transform: translateY(-0.5px);
  pointer-events: none;
  z-index: 2;
}

.eval-label {
  font-family: 'Courier New', monospace;
  font-size: 0.6rem;
  font-weight: 800;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  padding: 4px 0;
  user-select: none;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.white-label {
  color: #1e293b;
}

.black-label {
  color: #94a3b8;
}
</style>

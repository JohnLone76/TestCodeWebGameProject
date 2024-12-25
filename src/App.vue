<template>
  <div class="game-container">
    <div v-if="gameState === 'ready'" class="start-screen">
      <div class="start-content">
        <h1>3D Match Game</h1>
        <button @click="startGame">Start Game</button>
      </div>
    </div>
    <div v-if="gameState !== 'ready'" class="info-panel">
      <div class="score">Score: {{ score }}</div>
      <div class="timer" :class="{ 'warning': timeLeft <= 10 }">Time: {{ timeLeft }}s</div>
    </div>
    <GameBoard ref="gameContainer" class="game" :gameState="gameState" />
    <div v-if="gameState === 'over'" class="game-over">
      <div class="game-over-content">
        <h2>Game Over!</h2>
        <p>Final Score: {{ score }}</p>
        <button @click="restartGame">Play Again</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import GameBoard from './components/GameBoard.vue'

type GameState = 'ready' | 'playing' | 'over'

const gameContainer = ref<HTMLElement>()
const score = ref(0)
const timeLeft = ref(60)
const gameState = ref<GameState>('ready')
let timerInterval: number | null = null

const startGame = () => {
  gameState.value = 'playing'
  score.value = 0
  timeLeft.value = 60
  startTimer()
  // 发送游戏开始事件
  window.dispatchEvent(new CustomEvent('game-start'))
}

const startTimer = () => {
  timerInterval = window.setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
      if (timeLeft.value === 0) {
        gameOver()
      }
    }
  }, 1000)
}

const gameOver = () => {
  gameState.value = 'over'
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  // 发送游戏结束事件
  window.dispatchEvent(new CustomEvent('game-over'))
}

const restartGame = () => {
  gameState.value = 'ready'
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  // 发送重新开始事件
  window.dispatchEvent(new CustomEvent('game-restart'))
}

onMounted(() => {
  // 监听分数更新事件
  window.addEventListener('score-updated', ((event: CustomEvent) => {
    score.value = event.detail.score
  }) as EventListener)
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style>
.game-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: #2c3e50;
}

.game {
  width: 100%;
  height: 100%;
}

.start-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 20;
}

.start-content {
  background-color: white;
  padding: 40px;
  border-radius: 10px;
  text-align: center;
}

.start-content h1 {
  margin: 0 0 30px 0;
  color: #2c3e50;
  font-size: 36px;
}

.info-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  gap: 20px;
  z-index: 1;
}

.score, .timer {
  font-size: 24px;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10px 20px;
  border-radius: 5px;
}

.timer.warning {
  background-color: rgba(255, 0, 0, 0.5);
  animation: pulse 1s infinite;
}

.game-over {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.game-over-content {
  background-color: white;
  padding: 40px;
  border-radius: 10px;
  text-align: center;
}

.game-over-content h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.start-content button,
.game-over-content button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 5px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-content button:hover,
.game-over-content button:hover {
  background-color: #3aa876;
  transform: scale(1.05);
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>

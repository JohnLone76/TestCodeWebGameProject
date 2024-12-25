<template>
  <div ref="gameContainer" class="game-board"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Scene } from '../game/Scene'

const gameContainer = ref<HTMLElement>()

onMounted(() => {
  if (gameContainer.value) {
    new Scene(gameContainer.value)
  }
})
</script>

<style scoped>
.game-board {
  width: 100%;
  height: 100vh;
}
</style>

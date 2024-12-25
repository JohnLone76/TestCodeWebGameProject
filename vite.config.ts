import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/TestCodeWebGameProject/',  // 添加这一行，使用仓库名作为base
  plugins: [vue()],
})

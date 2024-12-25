# 3D消消乐游戏

一个基于 Vue3 + Three.js 的 3D 消除游戏。

## 功能特点

- 3D 游戏场景
- 点击两个相同方块即可消除
- 流畅的消除动画
- 自动填充空缺
- 支持移动端

## 技术栈

- Vue 3
- TypeScript
- Three.js
- GSAP (动画库)

## 开发环境设置

1. 安装依赖
```bash
npm install
```

2. 启动开发服务器
```bash
npm run dev
```

3. 构建生产版本
```bash
npm run build
```

## 游戏规则

1. 点击一个方块，它会高亮显示
2. 点击另一个相同类型的方块，两个方块会被消除
3. 上方的方块会自动下落填充空缺
4. 顶部会生成新的方块

## 项目结构

```
src/
├── components/     # Vue组件
│   └── GameBoard.vue
├── game/          # 游戏核心逻辑
│   ├── Board.ts   # 游戏板逻辑
│   ├── Cube.ts    # 方块类
│   └── Scene.ts   # Three.js场景管理
└── App.vue        # 根组件
```

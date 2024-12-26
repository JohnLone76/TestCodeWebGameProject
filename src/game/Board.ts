import { Cube } from './Cube';
import * as THREE from 'three';

export class Board {
    private cubes: Cube[][][];  // 3D数组
    public readonly width: number = 10;   // 宽度
    public readonly height: number = 3;   // 高度
    private selectedCube: Cube | null = null;
    private score: number = 0;  // 添加分数属性
    private scene: THREE.Scene;
    private gameState: 'ready' | 'playing' | 'over' = 'ready';
    private isGameOver: boolean = false;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        // 初始化3D数组
        this.cubes = Array(this.height).fill(null).map(() => 
            Array(this.width).fill(null).map(() => 
                Array(this.width).fill(null)
            )
        );
        this.initializeBoard();

        // 监听游戏开始事件
        window.addEventListener('game-start', () => {
            this.gameState = 'playing';
        });

        // 监听游戏结束事件
        window.addEventListener('game-over', () => {
            this.gameState = 'over';
            this.isGameOver = true;
            this.selectedCube?.removeHighlight();
            this.selectedCube = null;
        });

        // 监听游戏重新开始事件
        window.addEventListener('game-restart', () => {
            this.restart();
        });
    }

    private restart() {
        // 清除所有现有方块
        for (let y = 0; y < this.height; y++) {
            for (let z = 0; z < this.width; z++) {
                for (let x = 0; x < this.width; x++) {
                    const cube = this.cubes[y][z][x];
                    if (cube) {
                        this.scene.remove(cube.mesh);
                    }
                }
            }
        }

        // 重置状态
        this.gameState = 'ready';
        this.isGameOver = false;
        this.score = 0;
        this.selectedCube = null;

        // 重新初始化棋盘
        this.initializeBoard();
    }

    private initializeBoard() {
        const spacing = 1.2;
        // 计算偏移量，使网格居中
        const xOffset = (this.width - 1) * spacing / 2;
        const yOffset = (this.height - 1) * spacing / 2;
        const zOffset = (this.width - 1) * spacing / 2;

        for (let y = 0; y < this.height; y++) {
            for (let z = 0; z < this.width; z++) {
                for (let x = 0; x < this.width; x++) {
                    const type = Math.floor(Math.random() * 10) + 1;
                    const cube = new Cube(type);
                    
                    // 设置方块位置
                    cube.mesh.position.set(
                        (x * spacing) - xOffset,
                        (y * spacing) - yOffset,
                        (z * spacing) - zOffset
                    );
                    
                    this.cubes[y][z][x] = cube;
                    this.scene.add(cube.mesh);
                }
            }
        }
    }

    public getCube(y: number, z: number, x: number): Cube | null {
        if (y >= 0 && y < this.height && 
            z >= 0 && z < this.width && 
            x >= 0 && x < this.width) {
            return this.cubes[y][z][x];
        }
        return null;
    }

    handleCubeClick(cube: Cube) {
        if (this.gameState !== 'playing') return;  // 只有在游戏进行中才响应点击

        if (this.isGameOver) return;  // 游戏结束时不响应点击

        if (!cube) return;

        if (this.selectedCube === null) {
            // 第一次点击
            this.selectedCube = cube;
            cube.highlight();
        } else {
            if (this.selectedCube === cube) {
                // 点击同一个方块，取消选择
                cube.removeHighlight();
                this.selectedCube = null;
            } else if (this.selectedCube.type === cube.type) {
                // 找到匹配的方块，执行消除
                this.selectedCube.removeHighlight();
                cube.removeHighlight();  // 确保第二个方块的高亮也被移除
                this.removeCubes(this.selectedCube, cube);
                this.selectedCube = null;
            } else {
                // 不匹配，取消第一个选择，高亮新选择
                this.selectedCube.removeHighlight();
                this.selectedCube = cube;
                cube.highlight();
            }
        }
    }

    private async removeCubes(cube1: Cube, cube2: Cube) {
        // 获取方块位置
        const pos1 = this.findCubePosition(cube1);
        const pos2 = this.findCubePosition(cube2);

        if (!pos1 || !pos2) return;

        // 从场景中移除
        await Promise.all([
            cube1.animateDestroy(),
            cube2.animateDestroy()
        ]);

        this.scene.remove(cube1.mesh);
        this.scene.remove(cube2.mesh);

        // 从数组中移除
        this.cubes[pos1.y][pos1.z][pos1.x] = null;
        this.cubes[pos2.y][pos2.z][pos2.x] = null;

        // 增加分数
        this.score += 1;
        // 发送事件通知分数更新
        const event = new CustomEvent('score-updated', { detail: { score: this.score } });
        window.dispatchEvent(event);

        // 处理方块下落
        await this.handleCubesFalling();
    }

    private findCubePosition(cube: Cube): {x: number, y: number, z: number} | null {
        for (let y = 0; y < this.height; y++) {
            for (let z = 0; z < this.width; z++) {
                for (let x = 0; x < this.width; x++) {
                    if (this.cubes[y][z][x] === cube) {
                        return {x, y, z};
                    }
                }
            }
        }
        return null;
    }

    private async handleCubesFalling() {
        let hasBlocksFallen;
        do {
            hasBlocksFallen = false;
            // 按照y坐标排序，确保从下往上处理
            const emptyPositions: {x: number, y: number, z: number}[] = [];
            for (let y = 0; y < this.height; y++) {
                for (let z = 0; z < this.width; z++) {
                    for (let x = 0; x < this.width; x++) {
                        if (!this.cubes[y][z][x]) {
                            emptyPositions.push({x, y, z});
                        }
                    }
                }
            }
            emptyPositions.sort((a, b) => a.y - b.y);
            
            const fallPromises: Promise<void>[] = [];
            
            for (const pos of emptyPositions) {
                // 对每个空位，找到它上方的所有方块
                for (let y = pos.y + 1; y < this.height; y++) {
                    const cube = this.cubes[y][pos.z][pos.x];
                    if (cube) {
                        // 找到了上方的方块，让它下落
                        const fallDistance = (y - pos.y) * 1.2; // 1.2是方块间距
                        this.cubes[pos.y][pos.z][pos.x] = cube;
                        this.cubes[y][pos.z][pos.x] = null;
                        fallPromises.push(cube.animateFall(fallDistance));
                        hasBlocksFallen = true;
                        break;
                    }
                }
            }
            
            // 等待所有方块完成下落
            await Promise.all(fallPromises);
        } while (hasBlocksFallen); // 如果有方块下落，继续检查
    }

    private createNewCube(): Cube {
        const types = [1, 2, 3, 4, 5];
        const randomType = types[Math.floor(Math.random() * types.length)];
        return new Cube(randomType);
    }

    // 获取当前分数
    getScore(): number {
        return this.score;
    }
}

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Board } from './Board'

export class Scene {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private board: Board;
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;

    constructor(container: HTMLElement) {
        // 初始化场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x2c3e50);

        // 初始化相机
        this.camera = new THREE.PerspectiveCamera(
            60,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        // 调整相机位置以获得更好的视角
        this.camera.position.set(12, 8, 12);
        this.camera.lookAt(0, 0, 0);

        // 初始化渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(this.renderer.domElement);

        // 初始化控制器
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 30;
        this.controls.maxPolarAngle = Math.PI / 2;  // 限制垂直旋转角度

        // 添加光源
        this.addLights();

        // 初始化射线检测器
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // 创建游戏板
        this.board = new Board(this.scene);

        // 添加事件监听
        this.setupEventListeners();

        // 开始动画循环
        this.animate();
    }

    private addLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // 方向光
        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight1.position.set(5, 5, 5);
        this.scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight2.position.set(-5, -5, -5);
        this.scene.add(directionalLight2);
    }

    private setupEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.renderer.domElement.addEventListener('click', this.onMouseClick.bind(this));
    }

    private onWindowResize() {
        const container = this.renderer.domElement.parentElement;
        if (!container) return;

        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    private onMouseClick(event: MouseEvent) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        // 获取所有可能的相交对象
        const allMeshes: THREE.Object3D[] = [];
        this.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                allMeshes.push(object);
            }
        });

        const intersects = this.raycaster.intersectObjects(allMeshes, false);

        if (intersects.length > 0) {
            const clickedMesh = intersects[0].object as THREE.Mesh;
            
            // 遍历所有方块找到完全匹配的那个
            let clickedCube: Cube | null = null;
            let minDistance = Infinity;

            for (let y = 0; y < this.board.height; y++) {
                for (let z = 0; z < this.board.width; z++) {
                    for (let x = 0; x < this.board.width; x++) {
                        const cube = this.board.getCube(y, z, x);
                        if (cube && cube.mesh === clickedMesh) {
                            const distance = intersects[0].distance;
                            if (distance < minDistance) {
                                minDistance = distance;
                                clickedCube = cube;
                            }
                        }
                    }
                }
            }

            if (clickedCube) {
                this.board.handleCubeClick(clickedCube);
            }
        }
    }

    private animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

import * as THREE from 'three';
import gsap from 'gsap';

export class Cube {
    public mesh: THREE.Mesh;
    public hitbox: THREE.Mesh;
    public type: number;
    private isHighlighted: boolean = false;

    constructor(type: number) {
        this.type = type;
        
        // 使用更容易区分的颜色
        const colors = [
            0xff0000, // 鲜红色
            0x00cc00, // 深绿色
            0x0066ff, // 天蓝色
            0xffcc00, // 金黄色
            0xff00ff, // 洋红色
            0xff6600, // 橙色
            0x6600cc, // 深紫色
            0x00ffff, // 青色
            0x996633, // 棕色
            0x333333  // 深灰色
        ];
        
        const color = colors[this.type - 1];
        
        // 创建几何体
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        
        // 创建材质
        const material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: 0x000000,
            specular: 0x111111,
            shininess: 30
        });
        
        // 创建网格
        this.mesh = new THREE.Mesh(geometry, material);
        
        // 添加一个稍大的透明外壳用于点击检测
        const hitboxGeometry = new THREE.BoxGeometry(1, 1, 1);
        const hitboxMaterial = new THREE.MeshBasicMaterial({
            visible: false
        });
        this.hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
        this.mesh.add(this.hitbox);
        
        // 添加白色边框增加对比度
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ 
                color: 0xffffff,
                opacity: 0.7,
                transparent: true 
            })
        );
        this.mesh.add(line);
    }

    highlight() {
        this.isHighlighted = true;
        const material = this.mesh.material as THREE.MeshPhongMaterial;
        material.emissive.setHex(0x444444);
        material.emissiveIntensity = 2;
    }

    removeHighlight() {
        this.isHighlighted = false;
        const material = this.mesh.material as THREE.MeshPhongMaterial;
        material.emissive.setHex(0x000000);
        material.emissiveIntensity = 1;
    }

    async animateDestroy(): Promise<void> {
        return new Promise((resolve) => {
            gsap.to(this.mesh.scale, {
                x: 0,
                y: 0,
                z: 0,
                duration: 0.3,
                ease: "back.in",
                onComplete: resolve
            });
        });
    }

    async animateFall(distance: number): Promise<void> {
        return new Promise((resolve) => {
            gsap.to(this.mesh.position, {
                y: this.mesh.position.y - distance,
                duration: 0.3,
                ease: "power1.in",
                onComplete: resolve
            });
        });
    }

    async animateNew(): Promise<void> {
        const originalScale = this.mesh.scale.clone();
        this.mesh.scale.set(0, 0, 0);
        
        return new Promise((resolve) => {
            gsap.to(this.mesh.scale, {
                x: originalScale.x,
                y: originalScale.y,
                z: originalScale.z,
                duration: 0.3,
                ease: "back.out",
                onComplete: resolve
            });
        });
    }
}

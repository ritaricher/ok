

<code_start project_name=太阳系模拟 filename=solar-system.js title=太阳系核心逻辑 entrypoint=false runnable=false project_final_file=true>
class SolarSystem {
    constructor() {
        this.canvas = document.getElementById('solarSystem');
        this.ctx = this.canvas.getContext('2d');
        this.planets = [];
        this.camera = { x: 0, y: 0, scale: 1 };
        this.mouse = { x: 0, y: 0, down: false, lastX: 0, lastY: 0 };
        this.time = 0;
        this.speed = 1;
        this.selectedPlanet = null;
        
        this.init();
        this.setupEventListeners();
        this.createPlanets();
        this.animate();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        document.getElementById('loading').style.display = 'none';
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.camera.x = this.canvas.width / 2;
        this.camera.y = this.canvas.height / 2;
    }

    createPlanets() {
        // 太阳系行星数据 (相对比例)
        this.planets = [
            {
                name: '太阳', radius: 30, color: '#FFD700', orbitRadius: 0,
                speed: 0, hasRings: false, moons: 0, description: '恒星，太阳系的中心'
            },
            {
                name: '水星', radius: 4, color: '#A9A9A9', orbitRadius: 80,
                speed: 4.1, hasRings: false, moons: 0, description: '最靠近太阳的行星'
            },
            {
                name: '金星', radius: 8, color: '#FFA500', orbitRadius: 120,
                speed: 1.6, hasRings: false, moons: 0, description: '最热的行星'
            },
            {
                name: '地球', radius: 8.5, color: '#1E90FF', orbitRadius: 160,
                speed: 1, hasRings: false, moons: 1, description: '我们的家园'
            },
            {
                name: '火星', radius: 6, color: '#FF4500', orbitRadius: 200,
                speed: 0.5, hasRings: false, moons: 2, description: '红色行星'
            },
            {
                name: '木星', radius: 20, color: '#FFA07A', orbitRadius: 280,
                speed: 0.08, hasRings: true, moons: 79, description: '最大的行星'
            },
            {
                name: '土星', radius: 18, color: '#F0E68C', orbitRadius: 360,
                speed: 0.03, hasRings: true, moons: 82, description: '拥有美丽光环'
            },
            {
                name: '天王星', radius: 12, color: '#87CEEB', orbitRadius: 420,
                speed: 0.01, hasRings: true, moons: 27, description: '侧向旋转的行星'
            },
            {
                name: '海王星', radius: 11, color: '#4169E1', orbitRadius: 480,
                speed: 0.006, hasRings: true, moons: 14, description: '冰巨行星'
            }
        ];
    }

    setupEventListeners() {
        // 鼠标事件
        this.canvas.addEventListener('mousedown', (e) => {
            this.mouse.down = true;
            this.mouse.lastX = e.clientX;
            this.mouse.lastY = e.clientY;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;

            if (this.mouse.down) {
                this.camera.x += (e.clientX - this.mouse.lastX);
                this.camera.y += (e.clientY - this.mouse.lastY);
                this.mouse.lastX = e.clientX;
                this.mouse.lastY = e.clientY;
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.mouse.down = false;
        });

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            const oldScale = this.camera.scale;
            
            this.camera.scale *= zoomFactor;
            this.camera.scale = Math.max(0.1, Math.min(5, this.camera.scale));
            
            // 基于鼠标位置缩放
            const mouseX = e.clientX - this.canvas.getBoundingClientRect().left;
            const mouseY = e.clientY - this.canvas.getBoundingClientRect().top;
            
            this.camera.x = mouseX - (mouseX - this.camera.x) * (this.camera.scale / oldScale);
            this.camera.y = mouseY - (mouseY - this.camera.y) * (this.camera.scale / oldScale);
            
            document.getElementById('zoomLevel').textContent = 
                Math.round(this.camera.scale * 100) + '%';
        });

        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left - this.camera.x) / this.camera.scale;
            const y = (e.clientY - rect.top - this.camera.y) / this.camera.scale;
            
            this.selectedPlanet = null;
            let minDist = Infinity;
            
            this.planets.forEach(planet => {
                if (planet.orbitRadius === 0) {
                    const dist = Math.sqrt(x * x + y * y);
                    if (dist < planet.radius && dist < minDist) {
                        this.selectedPlanet = planet;
                        minDist = dist;
                    }
                } else {
                    const angle = this.time * planet.speed * 0.001;
                    const planetX = Math.cos(angle) * planet.orbitRadius;
                    const planetY = Math.sin(angle) * planet.orbitRadius;
                    const dist = Math.sqrt((x - planetX) * (x - planetX) + (y - planetY) * (y - planetY));
                    
                    if (dist < planet.radius && dist < minDist) {
                        this.selectedPlanet = planet;
                        minDist = dist;
                    }
                }
            });
            
            this.updatePlanetInfo();
        });

        // 控制面板事件
        document.getElementById('zoomSlider').addEventListener('input', (e) => {
            this.camera.scale = e.target.value / 100;
            document.getElementById('zoomLevel').textContent = e.target.value + '%';
        });

        document.getElementById('speedSlider').addEventListener('input', (e) => {
            this.speed = e.target.value / 100;
        });

        document.getElementById('resetView').addEventListener('click', () => {
            this.camera.x = this.canvas.width / 2;
            this.camera.y = this.canvas.height / 2;
            this.camera.scale = 1;
            document.getElementById('zoomLevel').textContent = '100%';
            document.getElementById('zoomSlider').value = 100;
        });
    }

    updatePlanetInfo() {
        const detailsDiv = document.getElementById('planetDetails');
        
        if (!this.selectedPlanet) {
            detailsDiv.innerHTML = `
                <div class="text-center text-gray-300 py-8">
                    <i class="fas fa-mouse-pointer text-2xl mb-2"></i>
                    <p>点击行星查看详细信息</p>
                </div>
            `;
            return;
        }

        const planet = this.selectedPlanet;
        detailsDiv.innerHTML = `
            <div class="text-center mb-4">
                <div class="w-12 h-12 rounded-full mx-auto mb-2" 
                     style="background: ${planet.color}; box-shadow: 0 0 20px ${planet.color}"></div>
                <h4 class="text-xl font-bold">${planet.name}</h4>
            </div>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span>直径:</span>
                    <span>${(planet.radius * 2).toFixed(1)} 单位</span>
                </div>
                <div class="flex justify-between">
                    <span>轨道半径:</span>
                    <span>${planet.orbitRadius || 0} 单位</span>
                </div>
                <div class="flex justify-between">
                    <span>公转速度:</span>
                    <span>${planet.speed.toFixed(2)}</span>
                </div>
                <div class="flex justify-between">
                    <span>卫星数量:</span>
                    <span>${planet.moons}</span>
                </div>
                <div class="flex justify-between">
                    <span>行星环:</span>
                    <span>${planet.hasRings ? '有' : '无'}</span>
                </div>
            </div>
            <div class="mt-3 p-2 bg-gray-700/50 rounded text-xs">
                ${planet.description}
            </div>
        `;
    }

    drawOrbits() {
        if (!document.getElementById('showOrbits').checked) return;
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        this.planets.forEach(planet => {
            if (planet.orbitRadius > 0) {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, planet.orbitRadius, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        });
    }

    drawPlanets() {
        this.planets.forEach(planet => {
            const angle = this.time * planet.speed * 0.001;
            let x, y;
            
            if (planet.orbitRadius === 0) {
                x = 0;
                y = 0;
            } else {
                x = Math.cos(angle) * planet.orbitRadius;
                y = Math.sin(angle) * planet.orbitRadius;
            }
            
            // 绘制行星
            this.ctx.save();
            this.ctx.translate(x, y);
            
            // 行星发光效果
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, planet.radius * 1.5);
            gradient.addColorStop(0, planet.color);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = planet.color;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, planet.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 太阳特殊效果
            if (planet.name === '太阳') {
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, planet.radius * 1.5, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // 行星环
            if (planet.hasRings && document.getElementById('showAtmosphere').checked) {
                this.ctx.strokeStyle = planet.color + '80';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, planet.radius * 1.8, planet.radius * 0.6, 0, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            
            // 行星标签
            if (document.getElementById('showLabels').checked) {
                this.ctx.fillStyle = 'white';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(planet.name, 0, -planet.radius - 10);
            }
            
            this.ctx.restore();
        });
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = '#0F172A';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 应用相机变换
        this.ctx.save();
        this.ctx.translate(this.camera.x, this.camera.y);
        this.ctx.scale(this.camera.scale, this.camera.scale);
        
        // 绘制轨道
        this.drawOrbits();
        
        // 绘制行星
        this.drawPlanets();
        
        this.ctx.restore();
        
        // 绘制选中效果
        if (this.selectedPlanet) {
            this.ctx.save();
            this.ctx.translate(this.camera.x, this.camera.y);
        this.ctx.scale(this.camera.scale, this.camera.scale);
            
            const planet = this.selectedPlanet;
            const angle = this.time * planet.speed * 0.001;
            let x, y;
            
            if (planet.orbitRadius === 0) {
                x = 0;
                y = 0;
            } else {
                x = Math.cos(angle) * planet.orbitRadius;
                y = Math.sin(angle) * planet.orbitRadius;
            }
            
            this.ctx.strokeStyle = '#00FF00';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, planet.radius + 3, 0, Math.PI * 2);
            this.ctx.stroke();
            
            this.ctx.restore();
        }
    }

    animate() {
        this.time += 16 * this.speed;
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// 初始化太阳系
document.addEventListener('DOMContentLoaded', () => {
    new SolarSystem();
});


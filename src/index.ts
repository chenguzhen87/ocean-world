// 海洋世界SDK配置选项接口
interface OceanWorldOptions {
    /** 
     * 鲨鱼数量
     * @default 1
     * @example 3 // 创建3条鲨鱼
     */
    sharkCount?: number;
    
    /** 
     * 鲨鱼大小（像素）
     * @default 40
     * @example 60 // 创建更大的鲨鱼
     */
    sharkSize?: number;
    
    /** 
     * 鲨鱼移动速度
     * @default 3
     * @example 5 // 更快的移动速度
     */
    sharkSpeed?: number;
    
    /** 
     * 海浪层数
     * @default 3
     * @example 5 // 创建5层海浪，效果更丰富
     */
    waveCount?: number;
    
    /** 
     * 气泡数量
     * @default 30
     * @example 50 // 更多的气泡效果
     */
    bubbleCount?: number;
    
    /** 
     * 是否启用气泡效果
     * @default true
     * @example false // 禁用气泡效果
     */
    enableBubbles?: boolean;
    
    /** 
     * 水面位置（占画布高度的比例），0-1之间
     * @default 0.2
     * @example 0.3 // 水面在画布30%高度处
     */
    waterLevel?: number;
    
    /** 
     * 鲨鱼自动移动间隔（毫秒）
     * 当鼠标离开画布时，鲨鱼会自动随机游动，此配置控制改变方向的频率
     * @default 3000
     * @example 5000 // 每5秒改变一次方向
     */
    autoMoveInterval?: number;
    
    /** 
     * 是否启用背景渐变
     * @default true
     * @example false // 禁用背景，显示透明背景
     */
    enableBackground?: boolean;
    
    /** 
     * 是否启用鼠标跟随
     * @default true
     * @example false // 禁用鼠标跟随，鲨鱼只会自动游动
     */
    enableMouseFollow?: boolean;
    
    /** 
     * 背景渐变配置
     * 用于自定义海洋背景的颜色渐变效果
     */
    backgroundGradient?: {
        /** 
         * 渐变颜色数组
         * @default ['#1a2980', '#26d0ce', '#1a6d80']
         * @example ['#000033', '#0066cc', '#00ccff'] // 深蓝色到浅蓝色的渐变
         */
        colors?: string[];
        
        /** 
         * 渐变位置数组，与colors对应，0-1之间
         * @default [0, waterLevel, 1]
         * @example [0, 0.3, 0.7, 1] // 自定义渐变位置
         */
        stops?: number[];
    };
    
    /** 
     * 海浪颜色配置，RGBA格式字符串数组
     * 每个海浪层会循环使用这些颜色
     * @default [
     *   'rgba(0, 50, 100, 0.6)',
     *   'rgba(0, 80, 150, 0.5)', 
     *   'rgba(0, 120, 200, 0.4)',
     *   'rgba(0, 150, 220, 0.3)',
     *   'rgba(0, 180, 240, 0.2)'
     * ]
     * @example [
     *   'rgba(30, 144, 255, 0.7)',   // 道奇蓝
     *   'rgba(0, 191, 255, 0.6)',    // 深天蓝
     *   'rgba(135, 206, 250, 0.5)'   // 浅天蓝
     * ]
     */
    waveColors?: string[];
}

interface Shark {
    x: number;
    y: number;
    size: number;
    speed: number;
    angle: number;
    tailAngle: number;
    tailDirection: number;
    targetX: number;
    targetY: number;
    color: string;
    isFollowingMouse: boolean;
    autoMoveTimer: number;
    nextMoveTime: number;
}

interface Wave {
    y: number;
    amplitude: number;
    frequency: number;
    speed: number;
    color: string;
    time: number;
}

class OceanWorld {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private config: Required<OceanWorldOptions>;
    private sharks: Shark[] = [];
    private waves: Wave[] = [];
    private bubbles: Bubble[] = [];
    private mouseX: number;
    private mouseY: number;
    private animationId: number | null = null;
    private waterSurfaceY: number = 0;
    private isMouseInCanvas: boolean = false;

    constructor(canvasId: string, options: OceanWorldOptions = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
            throw new Error(`Canvas element with id '${canvasId}' not found`);
        }
        
        this.canvas = canvas;
        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error('Could not get 2D context from canvas');
        }
        
        this.ctx = context;
        
        // 默认配置
        this.config = {
            sharkCount: options.sharkCount || 1,
            sharkSize: options.sharkSize || 40,
            sharkSpeed: options.sharkSpeed || 3,
            waveCount: options.waveCount || 3,
            bubbleCount: options.bubbleCount || 30,
            enableBubbles: options.enableBubbles !== false,
            waterLevel: options.waterLevel || 0.2,
            autoMoveInterval: options.autoMoveInterval || 3000,
            enableBackground: options.enableBackground !== false,
            enableMouseFollow: options.enableMouseFollow !== false,
            backgroundGradient: {
                colors: options.backgroundGradient?.colors || ['#1a2980', '#26d0ce', '#1a6d80'],
                stops: options.backgroundGradient?.stops || [0, options.waterLevel || 0.2, 1]
            },
            waveColors: options.waveColors || [
                'rgba(0, 50, 100, 0.6)',
                'rgba(0, 80, 150, 0.5)',
                'rgba(0, 120, 200, 0.4)',
                'rgba(0, 150, 220, 0.3)',
                'rgba(0, 180, 240, 0.2)'
            ],
            ...options
        };
        
        // 初始化变量
        this.mouseX = this.canvas.width / 2;
        this.mouseY = this.canvas.height / 2;
        
        // 绑定事件
        this.bindEvents();
        
        // 初始化
        this.init();
    }
    
    // 初始化画布尺寸
    private initCanvasSize(): void {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.waterSurfaceY = this.canvas.height * this.config.waterLevel;
    }
    
    // 绑定事件
    private bindEvents(): void {
        // 窗口大小改变时调整画布
        window.addEventListener('resize', () => {
            this.initCanvasSize();
        });

        // 只有在启用鼠标跟随时才绑定鼠标/触摸事件
        if (this.config.enableMouseFollow) {
            let isMouseOver = false;
            const hasTouch = 'ontouchstart' in window || 
                            navigator.maxTouchPoints > 0;
            
            if(hasTouch){
                // 触摸移动事件
                document.addEventListener('touchmove', (e) => {
                    e.preventDefault();
                    const rect = this.canvas.getBoundingClientRect();
                    const touch = e.touches[0];
                    const isInside = touch.clientX >= rect.left && touch.clientX <= rect.right &&
                        touch.clientY >= rect.top && touch.clientY <= rect.bottom;
                        
                    if (isInside) {
                        if (!isMouseOver) {
                            isMouseOver = true;
                            this.isMouseInCanvas = true;
                        }
                        this.handlePointerMove(touch.clientX, touch.clientY);
                    } else if (isMouseOver) {
                        isMouseOver = false;
                        this.isMouseInCanvas = false;
                        this.handlePointerLeave();
                    }
                });
            } else {
                // 鼠标移动事件
                document.addEventListener('mousemove', (e) => {
                    const rect = this.canvas.getBoundingClientRect();
                    const isInside = e.clientX >= rect.left && e.clientX <= rect.right &&
                        e.clientY >= rect.top && e.clientY <= rect.bottom;
                        
                    if (isInside) {
                        if (!isMouseOver) {
                            isMouseOver = true;
                            this.isMouseInCanvas = true;
                        }
                        this.handlePointerMove(e.clientX, e.clientY);
                    } else if (isMouseOver) {
                        isMouseOver = false;
                        this.isMouseInCanvas = false;
                        this.handlePointerLeave();
                    }
                });
            }
        }
    }

    // 处理指针移动
    private handlePointerMove(clientX: number, clientY: number): void {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = clientX - rect.left;
        this.mouseY = clientY - rect.top;

        if (this.isMouseInCanvas && this.config.enableMouseFollow) {
            this.sharks.forEach(shark => {
                shark.isFollowingMouse = true;
                shark.targetX = this.mouseX;
                shark.targetY = this.mouseY;
            });
        }
    }

    // 处理指针离开
    private handlePointerLeave(): void {
        this.sharks.forEach(shark => {
            shark.isFollowingMouse = false;
            this.setRandomTarget(shark);
        });
    }
    
    // 设置随机目标点
    private setRandomTarget(shark: Shark): void {
        const margin = shark.size * 2;
        shark.targetX = margin + Math.random() * (this.canvas.width - margin * 2);
        shark.targetY = margin + Math.random() * (this.canvas.height - margin * 2);
        shark.nextMoveTime = Date.now() + Math.random() * this.config.autoMoveInterval + 1000;
    }
    
    // 初始化海洋世界
    private init(): void {
        this.initCanvasSize();
        this.createWaves();
        this.createSharks();
        if (this.config.enableBubbles) {
            this.createBubbles();
        }
        this.start();
    }
    
    // 创建海浪
    private createWaves(): void {
        this.waves = [];
        
        for (let i = 0; i < this.config.waveCount; i++) {
            const colorIndex = i % this.config.waveColors.length;
            const wave: Wave = {
                y: this.waterSurfaceY + i * 15,
                amplitude: 10 + i * 5,
                frequency: 0.01 + i * 0.005,
                speed: 0.02 + i * 0.01,
                color: this.config.waveColors[colorIndex],
                time: 0
            };
            this.waves.push(wave);
        }
    }
    
    // 创建鲨鱼
    private createSharks(): void {
        this.sharks = [];
        const now = Date.now();
        
        for (let i = 0; i < this.config.sharkCount; i++) {
            const shark: Shark = {
                x: Math.random() * this.canvas.width,
                y: Math.random() * (this.canvas.height - 100) + 50,
                size: this.config.sharkSize,
                speed: this.config.sharkSpeed,
                angle: 0,
                tailAngle: 0,
                tailDirection: 1,
                targetX: this.canvas.width / 2,
                targetY: this.canvas.height / 2,
                color: `hsl(${Math.random() * 60}, 70%, 40%)`,
                isFollowingMouse: false,
                autoMoveTimer: 0,
                nextMoveTime: now + Math.random() * this.config.autoMoveInterval
            };
            this.sharks.push(shark);
        }
    }
    
    // 创建气泡
    private createBubbles(): void {
        this.bubbles = [];
        for (let i = 0; i < this.config.bubbleCount; i++) {
            this.bubbles.push(new Bubble(this.canvas));
        }
    }
    
    // 添加鲨鱼
    addShark(): void {
        const now = Date.now();
        const shark: Shark = {
            x: Math.random() * this.canvas.width,
            y: Math.random() * (this.canvas.height - 100) + 50,
            size: this.config.sharkSize,
            speed: this.config.sharkSpeed,
            angle: 0,
            tailAngle: 0,
            tailDirection: 1,
            targetX: this.canvas.width / 2,
            targetY: this.canvas.height / 2,
            color: `hsl(${Math.random() * 60}, 70%, 40%)`,
            isFollowingMouse: this.isMouseInCanvas && this.config.enableMouseFollow,
            autoMoveTimer: 0,
            nextMoveTime: now + Math.random() * this.config.autoMoveInterval
        };
        this.sharks.push(shark);
    }
    
    // 移除鲨鱼
    removeShark(): void {
        if (this.sharks.length > 0) {
            this.sharks.pop();
        }
    }
    
    // 改变鲨鱼速度
    changeSharkSpeed(): void {
        this.config.sharkSpeed = 2 + Math.random() * 4;
        this.sharks.forEach(shark => {
            shark.speed = this.config.sharkSpeed;
        });
    }
    
    // 切换气泡显示
    toggleBubbles(): void {
        this.config.enableBubbles = !this.config.enableBubbles;
        if (this.config.enableBubbles && this.bubbles.length === 0) {
            this.createBubbles();
        }
    }
    
    // 切换背景显示
    toggleBackground(): void {
        this.config.enableBackground = !this.config.enableBackground;
    }
    
    // 设置背景渐变
    setBackgroundGradient(colors: string[], stops?: number[]): void {
        this.config.backgroundGradient.colors = colors;
        if (stops) {
            this.config.backgroundGradient.stops = stops;
        }
    }
    
    // 设置海浪颜色
    setWaveColors(colors: string[]): void {
        this.config.waveColors = colors;
        this.createWaves();
    }
    
    // 添加海浪颜色
    addWaveColor(color: string): void {
        this.config.waveColors.push(color);
        this.createWaves();
    }
    
    // 移除海浪颜色
    removeWaveColor(index: number): void {
        if (index >= 0 && index < this.config.waveColors.length) {
            this.config.waveColors.splice(index, 1);
            this.createWaves();
        }
    }
    
    // 清空海浪颜色并设置新颜色
    clearAndSetWaveColors(colors: string[]): void {
        this.config.waveColors = [...colors];
        this.createWaves();
    }
    
    // 获取当前海浪颜色
    getWaveColors(): string[] {
        return [...this.config.waveColors];
    }
    
    // 重置海洋世界
    reset(): void {
        this.sharks = [];
        this.bubbles = [];
        this.createSharks();
        if (this.config.enableBubbles) {
            this.createBubbles();
        }
    }
    
    // 切换鼠标跟随
    toggleMouseFollow(): void {
        this.config.enableMouseFollow = !this.config.enableMouseFollow;
        
        if (!this.config.enableMouseFollow) {
            this.sharks.forEach(shark => {
                shark.isFollowingMouse = false;
                this.setRandomTarget(shark);
            });
        }
    }
    
    // 设置鼠标跟随
    setMouseFollow(enabled: boolean): void {
        this.config.enableMouseFollow = enabled;
        
        if (!enabled) {
            this.sharks.forEach(shark => {
                shark.isFollowingMouse = false;
                this.setRandomTarget(shark);
            });
        }
    }
    
    // 更新海浪
    private updateWaves(): void {
        this.waves.forEach(wave => {
            wave.time += wave.speed;
        });
    }
    
    // 绘制海浪
    private drawWaves(): void {
        this.waves.forEach(wave => {
            this.ctx.beginPath();
            this.ctx.moveTo(0, wave.y);
            
            for (let x = 0; x < this.canvas.width; x += 5) {
                const y = wave.y + Math.sin(x * wave.frequency + wave.time) * wave.amplitude;
                this.ctx.lineTo(x, y);
            }
            
            this.ctx.lineTo(this.canvas.width, this.canvas.height);
            this.ctx.lineTo(0, this.canvas.height);
            this.ctx.closePath();
            
            this.ctx.fillStyle = wave.color;
            this.ctx.fill();
        });
    }
    
    // 更新鲨鱼
    private updateSharks(): void {
        const now = Date.now();
        
        this.sharks.forEach(shark => {
            if (this.isMouseInCanvas && shark.isFollowingMouse && this.config.enableMouseFollow) {
                shark.targetX = this.mouseX;
                shark.targetY = this.mouseY;
            } else {
                shark.isFollowingMouse = false;
                
                if (now >= shark.nextMoveTime) {
                    this.setRandomTarget(shark);
                }
            }
            
            const dx = shark.targetX - shark.x;
            const dy = shark.targetY - shark.y;
            
            shark.angle = Math.atan2(dy, dx);
            
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 5) {
                shark.x += Math.cos(shark.angle) * shark.speed;
                shark.y += Math.sin(shark.angle) * shark.speed;
                
                shark.x = Math.max(shark.size, Math.min(this.canvas.width - shark.size, shark.x));
                shark.y = Math.max(shark.size, Math.min(this.canvas.height - shark.size, shark.y));
            }
            
            shark.tailAngle += 0.2 * shark.tailDirection;
            if (Math.abs(shark.tailAngle) > 0.5) {
                shark.tailDirection *= -1;
            }
        });
    }

    // 绘制鲨鱼
    private drawSharks(): void {
        this.sharks.forEach(shark => {
            this.ctx.save();
            this.ctx.translate(shark.x, shark.y);
            
            const isMovingLeft = Math.cos(shark.angle) < 0;
            
            if (isMovingLeft) {
                this.ctx.scale(-1, 1);
            }
            
            this.drawRealisticShark(this.ctx, shark.size, shark.tailAngle);
            
            this.ctx.restore();
        });
    }

    /**
     * 绘制逼真的鲨鱼形状
     */
    private drawRealisticShark(
        ctx: CanvasRenderingContext2D, 
        size: number, 
        tailAngle: number
    ): void {
        const darkBlue = '#36387f';
        const mediumBlue = '#36379b';
        const black = '#2b2b40';
        const white = '#eef0ff';
        
        this.drawSharkBodyRealistic(ctx, size, mediumBlue, white);
        this.drawSharkTailRealistic(ctx, size, tailAngle, mediumBlue, white);
        this.drawDorsalFinRealistic(ctx, size, darkBlue);
        this.drawPectoralFinsRealistic(ctx, size, mediumBlue, white);
        this.drawSharkHeadRealistic(ctx, size, white, black, mediumBlue);
        this.drawSecondaryFinsRealistic(ctx, size, mediumBlue, darkBlue, white);
    }

    /**
     * 绘制逼真的鲨鱼身体
     */
    private drawSharkBodyRealistic(
        ctx: CanvasRenderingContext2D, 
        size: number, 
        mediumBlue: string, 
        white: string
    ): void {
        ctx.fillStyle = mediumBlue;
        ctx.beginPath();
        
        ctx.moveTo(size * 0.9, 0);
        
        ctx.bezierCurveTo(
            size * 0.7, -size * 0.25,
            size * 0.3, -size * 0.35,
            -size * 0.2, -size * 0.3
        );
        
        ctx.bezierCurveTo(
            -size * 0.6, -size * 0.25,
            -size * 0.8, -size * 0.15,
            -size * 1.0, -size * 0.1
        );
        
        ctx.lineTo(-size * 1.0, size * 0.05);
        
        ctx.bezierCurveTo(
            -size * 0.8, size * 0.1,
            -size * 0.6, size * 0.15,
            -size * 0.2, size * 0.2
        );
        
        ctx.bezierCurveTo(
            size * 0.3, size * 0.18,
            size * 0.7, size * 0.1,
            size * 0.9, size * 0.05
        );
        
        ctx.closePath();
        ctx.fill();
        
        const bellyGradient = ctx.createLinearGradient(0, -size * 0.05, 0, size * 0.3);
        bellyGradient.addColorStop(0, mediumBlue);
        bellyGradient.addColorStop(0.2, '#5a5ab5');
        bellyGradient.addColorStop(0.4, '#8a8acf');
        bellyGradient.addColorStop(0.6, '#b5b5e6');
        bellyGradient.addColorStop(0.8, '#d5d5f0');
        bellyGradient.addColorStop(1, white);
        
        ctx.fillStyle = bellyGradient;
        ctx.beginPath();
        
        ctx.moveTo(size * 0.8, size * 0.05);
        
        ctx.bezierCurveTo(
            size * 0.6, -size * 0.1,
            size * 0.3, -size * 0.15,
            -size * 0.1, -size * 0.1
        );
        
        ctx.bezierCurveTo(
            -size * 0.5, -size * 0.05,
            -size * 0.7, size * 0.05,
            -size * 0.9, size * 0.1
        );
        
        ctx.bezierCurveTo(
            -size * 0.7, size * 0.2,
            -size * 0.5, size * 0.25,
            -size * 0.2, size * 0.28
        );
        
        ctx.bezierCurveTo(
            size * 0.3, size * 0.25,
            size * 0.6, size * 0.15,
            size * 0.8, size * 0.05
        );
        
        ctx.closePath();
        ctx.fill();
        
        const highlightGradient = ctx.createLinearGradient(0, 0, 0, size * 0.25);
        highlightGradient.addColorStop(0, '#ffffff');
        highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.7)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0.3)');
        
        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        
        ctx.moveTo(size * 0.7, size * 0.08);
        ctx.bezierCurveTo(
            size * 0.5, size * 0.1,
            size * 0.2, size * 0.12,
            -size * 0.1, size * 0.15
        );
        ctx.bezierCurveTo(
            -size * 0.3, size * 0.18,
            -size * 0.5, size * 0.2,
            -size * 0.7, size * 0.18
        );
        ctx.bezierCurveTo(
            -size * 0.5, size * 0.15,
            -size * 0.3, size * 0.12,
            -size * 0.1, size * 0.1
        );
        ctx.bezierCurveTo(
            size * 0.2, size * 0.08,
            size * 0.5, size * 0.08,
            size * 0.7, size * 0.08
        );
        
        ctx.closePath();
        ctx.fill();
    }

    /**
     * 绘制逼真的鲨鱼尾巴
     */
    private drawSharkTailRealistic(
        ctx: CanvasRenderingContext2D, 
        size: number, 
        tailAngle: number, 
        mediumBlue: string,
        white: string
    ): void {
        ctx.fillStyle = mediumBlue;
        
        ctx.beginPath();
        ctx.moveTo(-size * 0.9, -size * 0.1);
        ctx.lineTo(-size * 1.5, -size * 0.4 + tailAngle * 6);
        ctx.lineTo(-size * 1.2, -size * 0.05);
        ctx.closePath();
        ctx.fill();
        
        const tailGradient = ctx.createLinearGradient(-size * 1.0, 0, -size * 1.5, size * 0.3);
        tailGradient.addColorStop(0, mediumBlue);
        tailGradient.addColorStop(0.4, '#8a8acf');
        tailGradient.addColorStop(0.7, '#d5d5f0');
        tailGradient.addColorStop(1, white);
        
        ctx.fillStyle = tailGradient;
        ctx.beginPath();
        ctx.moveTo(-size * 0.9, size * 0.1);
        ctx.lineTo(-size * 1.5, size * 0.3 + tailAngle * 6);
        ctx.lineTo(-size * 1.2, size * 0.05);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = mediumBlue;
        ctx.beginPath();
        ctx.moveTo(-size * 0.9, -size * 0.08);
        ctx.lineTo(-size * 1.1, 0);
        ctx.lineTo(-size * 0.9, size * 0.08);
        ctx.closePath();
        ctx.fill();
        
        const tailBaseGradient = ctx.createLinearGradient(-size * 0.9, 0, -size * 1.1, size * 0.08);
        tailBaseGradient.addColorStop(0, mediumBlue);
        tailBaseGradient.addColorStop(0.7, white);
        
        ctx.fillStyle = tailBaseGradient;
        ctx.beginPath();
        ctx.moveTo(-size * 0.9, size * 0.05);
        ctx.lineTo(-size * 1.1, size * 0.08);
        ctx.lineTo(-size * 0.9, size * 0.08);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * 绘制逼真的背鳍
     */
    private drawDorsalFinRealistic(
        ctx: CanvasRenderingContext2D, 
        size: number, 
        darkBlue: string
    ): void {
        ctx.fillStyle = darkBlue;
        ctx.beginPath();
        ctx.moveTo(-size * 0.1, -size * 0.3);
        ctx.lineTo(-size * 0.3, -size * 0.5);
        ctx.lineTo(-size * 0.5, -size * 0.25);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = this.lightenColor(darkBlue, 20);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-size * 0.1, -size * 0.3);
        ctx.lineTo(-size * 0.3, -size * 0.5);
        ctx.stroke();
    }

    /**
     * 绘制逼真的胸鳍
     */
    private drawPectoralFinsRealistic(
        ctx: CanvasRenderingContext2D, 
        size: number, 
        mediumBlue: string,
        white: string
    ): void {
        const finGradient = ctx.createLinearGradient(size * 0.2, 0, size * 0.6, size * 0.3);
        finGradient.addColorStop(0, mediumBlue);
        finGradient.addColorStop(0.3, '#8a8acf');
        finGradient.addColorStop(0.6, '#d5d5f0');
        finGradient.addColorStop(1, white);
        
        ctx.fillStyle = finGradient;
        ctx.beginPath();
        ctx.moveTo(size * 0.2, size * 0.05);
        ctx.lineTo(size * 0.6, size * 0.2);
        ctx.lineTo(size * 0.3, size * 0.3);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(size * 0.2, -size * 0.05);
        ctx.lineTo(size * 0.6, -size * 0.2);
        ctx.lineTo(size * 0.3, -size * 0.3);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * 绘制逼真的鲨鱼头部
     */
    private drawSharkHeadRealistic(
        ctx: CanvasRenderingContext2D, 
        size: number, 
        white: string, 
        black: string,
        mediumBlue: string
    ): void {
        ctx.fillStyle = black;
        ctx.beginPath();
        ctx.arc(size * 0.6, -size * 0.15, size * 0.04, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = white;
        ctx.beginPath();
        ctx.arc(size * 0.62, -size * 0.16, size * 0.01, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = mediumBlue;
        ctx.beginPath();
        ctx.moveTo(size * 0.9, 0);
        ctx.lineTo(size * 0.8, -size * 0.1);
        ctx.lineTo(size * 0.8, size * 0.1);
        ctx.closePath();
        ctx.fill();
        
        const noseGradient = ctx.createLinearGradient(size * 0.8, 0, size * 0.9, size * 0.1);
        noseGradient.addColorStop(0, mediumBlue);
        noseGradient.addColorStop(0.7, white);
        
        ctx.fillStyle = noseGradient;
        ctx.beginPath();
        ctx.moveTo(size * 0.85, size * 0.02);
        ctx.lineTo(size * 0.8, size * 0.08);
        ctx.lineTo(size * 0.8, -size * 0.02);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = black;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(size * 0.7, size * 0.05);
        ctx.bezierCurveTo(
            size * 0.5, size * 0.15,
            size * 0.3, size * 0.12,
            size * 0.2, size * 0.08
        );
        ctx.stroke();
        
        const gillGradient = ctx.createLinearGradient(size * 0.3, -size * 0.05, size * 0.8, size * 0.05);
        gillGradient.addColorStop(0, mediumBlue);
        gillGradient.addColorStop(0.3, '#5a5ab5');
        gillGradient.addColorStop(0.7, '#b5b5e6');
        gillGradient.addColorStop(1, white);
        
        ctx.strokeStyle = gillGradient;
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(size * 0.3 + i * size * 0.1, 0, size * 0.03, 0.2 * Math.PI, 0.8 * Math.PI);
            ctx.stroke();
        }
        
        ctx.fillStyle = black;
        for (let i = 0; i < 2; i++) {
            ctx.beginPath();
            ctx.arc(size * 0.8, size * 0.02 + i * size * 0.03, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const chinGradient = ctx.createLinearGradient(size * 0.2, size * 0.08, size * 0.7, size * 0.05);
        chinGradient.addColorStop(0, mediumBlue);
        chinGradient.addColorStop(0.3, '#8a8acf');
        chinGradient.addColorStop(0.7, '#d5d5f0');
        chinGradient.addColorStop(1, white);
        
        ctx.fillStyle = chinGradient;
        ctx.beginPath();
        ctx.moveTo(size * 0.7, size * 0.05);
        ctx.bezierCurveTo(
            size * 0.6, size * 0.08,
            size * 0.4, size * 0.1,
            size * 0.2, size * 0.08
        );
        ctx.bezierCurveTo(
            size * 0.4, size * 0.06,
            size * 0.6, size * 0.04,
            size * 0.7, size * 0.05
        );
        ctx.closePath();
        ctx.fill();
    }

    /**
     * 绘制次要鳍
     */
    private drawSecondaryFinsRealistic(
        ctx: CanvasRenderingContext2D, 
        size: number, 
        mediumBlue: string, 
        darkBlue: string,
        white: string
    ): void {
        ctx.fillStyle = darkBlue;
        ctx.beginPath();
        ctx.moveTo(-size * 0.7, -size * 0.25);
        ctx.lineTo(-size * 0.8, -size * 0.35);
        ctx.lineTo(-size * 0.9, -size * 0.2);
        ctx.closePath();
        ctx.fill();
        
        const analFinGradient = ctx.createLinearGradient(-size * 0.7, size * 0.15, -size * 0.9, size * 0.25);
        analFinGradient.addColorStop(0, mediumBlue);
        analFinGradient.addColorStop(0.3, '#8a8acf');
        analFinGradient.addColorStop(0.7, '#d5d5f0');
        analFinGradient.addColorStop(1, white);
        
        ctx.fillStyle = analFinGradient;
        ctx.beginPath();
        ctx.moveTo(-size * 0.7, size * 0.15);
        ctx.lineTo(-size * 0.8, size * 0.25);
        ctx.lineTo(-size * 0.9, size * 0.1);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * 工具函数：变亮颜色
     */
    private lightenColor(color: string, percent: number): string {
        const num = parseInt(color.slice(1), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return "#" + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
    }
    
    // 更新气泡
    private updateBubbles(): void {
        if (!this.config.enableBubbles) return;
        
        this.bubbles.forEach(bubble => {
            bubble.update();
        });
    }
    
    // 绘制气泡
    private drawBubbles(): void {
        if (!this.config.enableBubbles) return;
        
        this.bubbles.forEach(bubble => {
            bubble.draw(this.ctx);
        });
    }
    
    // 绘制海洋背景
    private drawBackground(): void {
        if (!this.config.enableBackground) return;
        
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        const { colors, stops } = this.config.backgroundGradient;
        
        if (colors) {
            colors.forEach((color, index) => {
                const stop = (stops && stops[index] !== undefined) ? stops[index] : index / (colors.length - 1);
                gradient.addColorStop(stop, color);
            });
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
   
    
    // 动画循环
    private animate(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawBackground();
        
        this.updateWaves();
        this.drawWaves();
        
        this.updateBubbles();
        this.drawBubbles();
        
        this.updateSharks();
        this.drawSharks();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    // 开始动画
    start(): void {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.animate();
    }
    
    // 停止动画
    stop(): void {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    // 更新配置
    updateConfig(newConfig: Partial<OceanWorldOptions>): void {
        const oldWaveColors = [...this.config.waveColors];
        
        this.config = { ...this.config, ...newConfig };
        
        if (newConfig.waveCount !== undefined || newConfig.waterLevel !== undefined) {
            this.createWaves();
        }
        
        if (newConfig.sharkCount !== undefined) {
            this.createSharks();
        }
        
        if (newConfig.enableBubbles !== undefined) {
            if (this.config.enableBubbles && this.bubbles.length === 0) {
                this.createBubbles();
            }
        }
        
        if (newConfig.backgroundGradient) {
            this.config.backgroundGradient = {
                ...this.config.backgroundGradient,
                ...newConfig.backgroundGradient
            };
        }
        
        if (newConfig.waveColors && JSON.stringify(newConfig.waveColors) !== JSON.stringify(oldWaveColors)) {
            this.createWaves();
        }
        
        // 更新鼠标跟随配置时重新绑定事件
        if (newConfig.enableMouseFollow !== undefined) {
            // 这里可以添加事件重新绑定的逻辑
        }
    }
    
    // 销毁实例
    destroy(): void {
        this.stop();
        // 可以在这里添加更多清理逻辑
    }
}

// 气泡类
class Bubble {
    private canvas: HTMLCanvasElement;
    private x: number;
    private y: number;
    private size: number;
    private speed: number;
    private opacity: number;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.x = 0;
        this.y = 0;
        this.size = 0;
        this.speed = 0;
        this.opacity = 0;
        this.reset();
    }
    
    reset(): void {
        this.x = Math.random() * this.canvas.width;
        this.y = this.canvas.height + Math.random() * 100;
        this.size = Math.random() * 10 + 5;
        this.speed = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.2;
    }
    
    update(): void {
        this.y -= this.speed;
        this.x += Math.sin(this.y * 0.05) * 0.5;
        
        if (this.y < -this.size) {
            this.reset();
        }
    }
    
    draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
    }
}

export { OceanWorld, type OceanWorldOptions };
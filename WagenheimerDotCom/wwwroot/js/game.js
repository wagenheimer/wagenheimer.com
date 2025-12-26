// Code Breaker | System Architect - Game Engine
// Restored from original implementation

lucide.createIcons();

const canvas = document.getElementById('canvas');
if (!canvas) {
    console.error("Canvas not found!");
} else {
    const ctx = canvas.getContext('2d');
    const startScreen = document.getElementById('start-screen');
    const gameUI = document.getElementById('game-ui');
    const scoreVal = document.getElementById('score-val');
    const livesVal = document.getElementById('lives-val');
    const powerupDisplay = document.getElementById('powerup-display');
    const powerupsHud = document.getElementById('powerups-hud');

    // Config
    let width, height;
    let paddle, balls = [], bricks = [], particles = [], fireworks = [], lasers = [];
    let gameRunning = false;
    let score = 0;
    let lives = 3;
    let shake = 0;
    let timeScale = 1;

    // Active Powerups State
    let activePowerups = {
        safetyNet: { active: false, label: 'SAFETY', icon: 'shield', color: '#f43f5e' },
        laser: { active: false, label: 'LASER', icon: 'zap', color: '#8b5cf6' },
        wide: { active: false, label: 'WIDE', icon: 'move-horizontal', color: '#06b6d4' },
        giant: { active: false, label: 'GIANT', icon: 'maximize', color: '#3b82f6' },
        penetrate: { active: false, label: 'PENETRATE', icon: 'arrow-up-circle', color: '#d946ef' },
        multiball: { active: false, label: 'MULTI', icon: 'layers', color: '#ffffff' }
    };

    let unlockedTechs = 0;
    const totalTechs = 6;

    // Tech Bricks Configuration
    const techBricks = [
        { id: 'csharp', color: '#d946ef', name: 'C#', row: 1, col: 1, power: 'penetrate' },
        { id: 'unity', color: '#cbd5e1', name: 'Unity', row: 1, col: 6, power: 'multiball' },
        { id: 'aspnet', color: '#8b5cf6', name: 'ASP', row: 2, col: 2, power: 'laser' },
        { id: 'postgres', color: '#3b82f6', name: 'SQL', row: 2, col: 5, power: 'giant' },
        { id: 'blazor', color: '#06b6d4', name: 'Blazor', row: 3, col: 1, power: 'wide' },
        { id: 'maui', color: '#f43f5e', name: 'MAUI', row: 3, col: 6, power: 'safetyNet' }
    ];

    // Resize Logic
    function resize() {
        if (!canvas.parentElement) return;
        const rect = canvas.parentElement.getBoundingClientRect();
        width = canvas.width = rect.width;
        height = canvas.height = rect.height;
        if (paddle) paddle.y = height - 40;
    }
    window.addEventListener('resize', resize);

    // Input
    let mouseX = width / 2; // Start center

    function updateMouse(x) {
        mouseX = x;
        // Clamp
        if (mouseX < 0) mouseX = 0;
        if (mouseX > width) mouseX = width;
    }

    document.addEventListener('mousemove', e => {
        if (document.pointerLockElement === canvas) {
            updateMouse(mouseX + e.movementX);
        } else {
            const rect = canvas.getBoundingClientRect();
            updateMouse(e.clientX - rect.left);
        }
    });

    document.addEventListener('touchmove', e => {
        const rect = canvas.getBoundingClientRect();
        updateMouse(e.touches[0].clientX - rect.left);
    }, { passive: true });

    // Pointer Lock State Handling
    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === canvas) {
            // Locked
            if (!gameRunning && lives > 0 && unlockedTechs < totalTechs && balls.length > 0) {
                gameRunning = true; // Resume if was paused
            }
        } else {
            // Unlocked
            if (gameRunning) {
                gameRunning = false;
                startScreen.innerHTML = `
                    <div class="flex flex-col items-center">
                        <h2 class="text-4xl font-cyber font-bold text-brand-orange mb-2 drop-shadow-lg">PAUSED</h2>
                        <div class="text-white text-sm animate-pulse">(CLIQUE PARA CONTINUAR)</div>
                    </div>`;
                startScreen.style.opacity = 1;
                startScreen.style.pointerEvents = 'auto'; // allow click to resume
            }
        }
    });

    // Click on game container to start/reset
    document.getElementById('game-container').addEventListener('click', async () => {
        // If game over or fresh start
        if ((!gameRunning && lives <= 0) || (unlockedTechs >= totalTechs)) {
            resetGame(); // Reset first if game over
            return;
        }

        // Request lock to play/resume
        try {
            if (!document.pointerLockElement) {
                await canvas.requestPointerLock();
            }

            if (!gameRunning && lives > 0) {
                startGame();
            }
        } catch (err) {
            console.warn("Pointer lock denied:", err);
            // Fallback play without lock
            if (!gameRunning && lives > 0) startGame();
        }
    });

    // --- CLASSES ---

    class Paddle {
        constructor() {
            this.baseW = 120;
            this.w = this.baseW;
            this.h = 14;
            this.x = width / 2 - this.w / 2;
            this.y = height - 40;
            this.color = '#06b6d4';
            this.laserCooldown = 0;
        }
        update() {
            if (activePowerups.wide.active) {
                this.w = this.baseW * 1.5;
            } else {
                this.w = this.baseW;
            }

            if (activePowerups.laser.active) {
                if (this.laserCooldown <= 0 && gameRunning) {
                    lasers.push(new Laser(this.x + 10, this.y));
                    lasers.push(new Laser(this.x + this.w - 10, this.y));
                    this.laserCooldown = 25;
                    playSound('laser');
                }
                this.laserCooldown--;
            }

            const targetX = mouseX - this.w / 2;
            this.x += (targetX - this.x) * 0.15;

            if (this.x < 0) this.x = 0;
            if (this.x + this.w > width) this.x = width - this.w;
        }
        draw() {
            ctx.shadowBlur = activePowerups.laser.active ? 30 : 20;
            ctx.shadowColor = activePowerups.laser.active ? '#f43f5e' : this.color;

            const grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.h);
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.5, activePowerups.laser.active ? '#f43f5e' : this.color);
            grad.addColorStop(1, '#020617');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(this.x, this.y, this.w, this.h, 8);
            ctx.fill();

            if (activePowerups.laser.active) {
                ctx.fillStyle = '#fff';
                ctx.fillRect(this.x + 5, this.y - 5, 4, 10);
                ctx.fillRect(this.x + this.w - 9, this.y - 5, 4, 10);
            }

            ctx.shadowBlur = 0;
        }
    }

    class Laser {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.dy = -10;
            this.w = 4;
            this.h = 12;
            this.active = true;
        }
        update() {
            this.y += this.dy;
            if (this.y < 0) this.active = false;

            for (let i = 0; i < bricks.length; i++) {
                let b = bricks[i];
                if (b.active) {
                    if (this.x > b.x && this.x < b.x + b.w &&
                        this.y > b.y && this.y < b.y + b.h) {

                        if (b.isTech && b.hp > 1) {
                            b.hp--;
                            spawnParticles(b.x + b.w / 2, b.y + b.h / 2, '#64748b', 3);
                            playSound('hit');
                            this.active = false;
                            break;
                        }

                        b.hp--;
                        if (b.hp <= 0) b.active = false;

                        this.active = false;
                        spawnParticles(b.x + b.w / 2, b.y + b.h / 2, b.color, 15);
                        score += 50;
                        scoreVal.innerText = score;

                        if (b.isTech && b.hp <= 0) {
                            triggerTech(b.techId, b.color, b.techInfo.power);
                            playSound('powerup');
                            unlockedTechs++;
                            if (unlockedTechs === totalTechs) winGame();
                        } else {
                            playSound('break');
                        }
                        break;
                    }
                }
            }
        }
        draw() {
            ctx.fillStyle = '#f43f5e';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#f43f5e';
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.shadowBlur = 0;
        }
    }

    class Ball {
        constructor() {
            this.baseR = 7;
            this.r = this.baseR;
            this.reset();
        }
        reset() {
            this.x = width / 2;
            this.y = height - 60;
            this.dx = (Math.random() * 2 - 1) * 3;
            this.dy = -7;
            this.active = false;
            this.trail = [];
            this.color = '#fff';
        }
        update() {
            if (activePowerups.giant.active) {
                this.r = this.baseR * 2.0;
            } else {
                this.r = this.baseR;
            }

            if (activePowerups.penetrate.active) {
                this.color = '#d946ef';
            } else {
                this.color = '#fff';
            }

            if (!this.active) {
                if (paddle) {
                    this.x = paddle.x + paddle.w / 2;
                    this.y = paddle.y - 15 - this.r;
                }
                return;
            }

            let steps = 3;
            for (let s = 0; s < steps; s++) {
                this.x += (this.dx / steps) * timeScale;
                this.y += (this.dy / steps) * timeScale;

                if (this.x + this.r > width || this.x - this.r < 0) {
                    this.dx *= -1;
                    this.x = Math.max(this.r, Math.min(width - this.r, this.x));
                    playSound('hit');
                }
                if (this.y - this.r < 0) {
                    this.dy *= -1;
                    this.y = this.r;
                    playSound('hit');
                }

                if (this.y > height) {
                    if (activePowerups.safetyNet.active) {
                        this.dy *= -1;
                        this.y = height - this.r - 15;
                        playSound('powerup');
                        shake = 10;
                    } else {
                        this.active = false;
                        return;
                    }
                }

                if (paddle && this.y + this.r > paddle.y &&
                    this.y - this.r < paddle.y + paddle.h &&
                    this.x > paddle.x && this.x < paddle.x + paddle.w) {

                    this.y = paddle.y - this.r;
                    this.dy = -Math.abs(this.dy);

                    let hitPoint = this.x - (paddle.x + paddle.w / 2);
                    this.dx = hitPoint * 0.15;

                    const speed = Math.min(10, Math.hypot(this.dx, this.dy) * 1.02);
                    const angle = Math.atan2(this.dy, this.dx);
                    this.dx = Math.cos(angle) * speed;
                    this.dy = Math.sin(angle) * speed;

                    spawnParticles(this.x, this.y, '#f97316', 15);
                    shake = 5;
                    playSound('paddle');
                }

                for (let i = 0; i < bricks.length; i++) {
                    let b = bricks[i];
                    if (b.active) {
                        if (this.x + this.r > b.x && this.x - this.r < b.x + b.w &&
                            this.y + this.r > b.y && this.y - this.r < b.y + b.h) {

                            const overlapX = (this.x < b.x + b.w / 2) ? (this.x + this.r) - b.x : b.x + b.w - (this.x - this.r);
                            const overlapY = (this.y < b.y + b.h / 2) ? (this.y + this.r) - b.y : b.y + b.h - (this.y - this.r);

                            if (overlapX < overlapY) {
                                this.dx *= -1;
                                this.x += (this.dx > 0) ? overlapX : -overlapX;
                            } else {
                                this.dy *= -1;
                                this.y += (this.dy > 0) ? overlapY : -overlapY;
                            }

                            if (b.isTech && b.hp > 1) {
                                b.hp--;
                                spawnParticles(b.x + b.w / 2, b.y + b.h / 2, '#64748b', 5);
                                playSound('hit');
                                break;
                            }

                            b.hp--;
                            if (b.hp <= 0) b.active = false;

                            spawnParticles(b.x + b.w / 2, b.y + b.h / 2, b.color, 30);
                            score += 100;
                            scoreVal.innerText = score;

                            if (b.isTech && b.hp <= 0) {
                                triggerTech(b.techId, b.color, b.techInfo.power);
                                playSound('powerup');
                                unlockedTechs++;
                                if (unlockedTechs === totalTechs) winGame();
                            } else {
                                playSound('break');
                            }

                            if (!activePowerups.penetrate.active) break;
                        }
                    }
                }
            }

            this.trail.push({ x: this.x, y: this.y, color: this.color });
            if (this.trail.length > 12) this.trail.shift();
        }

        draw() {
            for (let i = 0; i < this.trail.length; i++) {
                const p = this.trail[i];
                const alpha = i / this.trail.length;
                ctx.fillStyle = p.color === '#fff' ? `rgba(6, 182, 212, ${alpha * 0.4})` : p.color;
                ctx.globalAlpha = alpha * 0.5;
                ctx.beginPath();
                ctx.arc(p.x, p.y, this.r * (i / this.trail.length), 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    class Brick {
        constructor(x, y, w, h, techId = null) {
            this.x = x; this.y = y; this.w = w; this.h = h;
            this.active = true;
            this.techId = techId;
            this.isTech = !!techId;
            this.hp = 1;

            if (this.isTech) {
                const tech = techBricks.find(t => t.id === techId);
                this.color = tech.color;
                this.icon = tech.name;
                this.techInfo = tech;
            } else {
                const row = Math.floor(y / 40);
                const colors = ['#1e1b4b', '#312e81', '#4338ca', '#3730a3'];
                this.color = colors[row % colors.length];
            }
        }
        draw() {
            if (!this.active) return;

            if (this.isTech && this.hp > 1) {
                ctx.fillStyle = '#475569';
                ctx.strokeStyle = '#94a3b8';
                ctx.lineWidth = 2;
                ctx.shadowBlur = 0;

                ctx.beginPath();
                ctx.roundRect(this.x, this.y, this.w - 2, this.h - 2, 4);
                ctx.fill();
                ctx.stroke();

                const hpW = (this.w - 10) / 3;
                ctx.fillStyle = '#f59e0b';
                for (let i = 0; i < this.hp; i++) {
                    ctx.fillRect(this.x + 5 + (i * (hpW + 2)), this.y + this.h - 8, hpW - 2, 4);
                }

                ctx.fillStyle = '#fff';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText("LOCKED", this.x + this.w / 2, this.y + this.h / 2 - 4);
                return;
            }

            ctx.fillStyle = this.color;

            if (this.isTech) {
                ctx.shadowBlur = 20;
                ctx.shadowColor = this.color;
            }

            ctx.beginPath();
            ctx.roundRect(this.x, this.y, this.w - 2, this.h - 2, 4);
            ctx.fill();
            ctx.shadowBlur = 0;

            if (this.isTech) {
                ctx.fillStyle = (this.color === '#ffffff' || this.color === '#cbd5e1') ? '#0f172a' : '#fff';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.icon, this.x + this.w / 2, this.y + this.h / 2);
            }
        }
    }

    class Particle {
        constructor(x, y, color, isFirework = false) {
            this.x = x; this.y = y;
            this.color = color;
            const angle = Math.random() * Math.PI * 2;
            const speed = isFirework ? Math.random() * 8 + 3 : Math.random() * 4 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.life = 1;
            this.decay = Math.random() * 0.02 + 0.01;
            this.size = isFirework ? Math.random() * 4 + 2 : Math.random() * 3 + 1;
            this.gravity = isFirework ? 0.05 : 0;
        }
        update() {
            this.x += this.vx * timeScale;
            this.y += this.vy * timeScale;
            this.vy += this.gravity;
            this.life -= this.decay;
        }
        draw() {
            ctx.globalAlpha = Math.max(0, this.life);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    // --- SYSTEMS ---

    function initGame() {
        resize();
        mouseX = width / 2; // Initialize valid mouse position
        paddle = new Paddle();
        balls = [new Ball()];
        createBricks();
    }

    function createBricks() {
        bricks = [];
        const cols = 8;
        const rows = 5;
        const padding = 8;
        const brW = (width - (cols + 1) * padding) / cols;
        const brH = 30;
        const offsetTop = 60;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let techId = null;
                const techDef = techBricks.find(t => t.row === r && t.col === c);
                if (techDef) techId = techDef.id;

                const x = padding + c * (brW + padding);
                const y = offsetTop + r * (brH + padding);
                bricks.push(new Brick(x, y, brW, brH, techId));
            }
        }
    }

    function startGame() {
        if (balls.length === 0) balls.push(new Ball());
        gameRunning = true;
        balls[0].active = true;
        startScreen.style.opacity = 0;
        startScreen.style.pointerEvents = 'none';
        gameUI.style.opacity = 1;

        if (audioCtx.state === 'suspended') audioCtx.resume();
    }

    function winGame() {
        gameRunning = false;
        balls.forEach(b => b.active = false);
        playSound('win');

        let fwCount = 0;
        const fwInterval = setInterval(() => {
            spawnFireworks();
            fwCount++;
            if (fwCount > 50) clearInterval(fwInterval);
        }, 100);

        startScreen.innerHTML = `
            <div class="animate-victory-zoom flex flex-col items-center z-50 relative pointer-events-auto" onclick="event.stopPropagation()">
                <div class="mb-4 relative">
                    <div class="absolute -inset-4 bg-yellow-500/30 blur-xl animate-pulse rounded-full"></div>
                    <i data-lucide="award" class="w-24 h-24 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,1)] animate-bounce"></i>
                </div>
                
                <h2 class="victory-title text-4xl md:text-6xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-sm">
                    FULL STACK
                </h2>
                <h2 class="text-white font-cyber text-2xl md:text-4xl mb-8 tracking-[0.5em] text-glow animate-pulse">
                    ACHIEVED!
                </h2>
                
                <div class="flex flex-col gap-4 w-full max-w-xs">    
                    <button class="text-slate-400 hover:text-white transition text-xs font-mono uppercase tracking-widest mt-4" onclick="location.reload()">
                        [ JOGAR NOVAMENTE ]
                    </button>
                </div>
            </div>
        `;
        startScreen.style.opacity = 1;
        startScreen.style.pointerEvents = "auto";
        lucide.createIcons();
    }

    function resetGame() {
        score = 0;
        lives = 3;
        unlockedTechs = 0;

        Object.keys(activePowerups).forEach(k => {
            activePowerups[k].active = false;
        });
        renderPowerupIcons();

        livesVal.innerText = "❤❤❤";
        scoreVal.innerText = "0";
        createBricks();
        balls = [new Ball()];
        gameRunning = false;
        fireworks = [];

        startScreen.innerHTML = `
            <div class="cursor-pointer group flex flex-col items-center">
                <div class="relative mb-6 group-hover:scale-105 transition duration-300">
                    <h2 class="text-4xl md:text-6xl font-cyber font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-violet to-brand-cyan drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                        TESTE SUAS<br/>HABILIDADES
                    </h2>
                    <div class="absolute -inset-1 blur-xl bg-gradient-to-r from-brand-violet to-brand-cyan opacity-20 group-hover:opacity-40 transition duration-500 animate-pulse"></div>
                </div>
                
                <div class="relative overflow-hidden">
                    <div class="text-white font-mono text-sm font-bold tracking-[0.2em] bg-black/60 px-8 py-3 rounded border border-brand-cyan/30 group-hover:border-brand-cyan/80 transition shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                        <span class="animate-pulse">CLIQUE PARA INICIAR</span>
                    </div>
                </div>
            </div>`;
        startScreen.style.opacity = 1;
        startScreen.style.pointerEvents = 'auto';

        document.querySelectorAll('.tech-card').forEach(c => c.classList.remove('unlocked', 'pop-active'));
    }

    function triggerTech(id, color, powerType) {
        timeScale = 0.2;
        shake = 20;

        // Play Powerup Sound
        playSound('powerup');

        bricks.forEach(b => {
            if (b.isTech && b.techId !== id && b.active) {
                b.hp = 3;
            }
        });

        const card = document.getElementById('card-' + id);
        if (card) {
            card.classList.add('unlocked', 'pop-active');
        }

        showFloatingText(activePowerups[powerType].label, color);

        if (powerType) {
            if (powerType === 'multiball') {
                for (let i = 0; i < 2; i++) {
                    let newBall = new Ball();
                    newBall.x = paddle.x + paddle.w / 2;
                    newBall.y = paddle.y - 20;
                    newBall.dx = (Math.random() * 4 - 2) * 2;
                    newBall.dy = -6;
                    newBall.active = true;
                    balls.push(newBall);
                }
                activePowerups[powerType].active = true;
            } else {
                activePowerups[powerType].active = true;
            }
            renderPowerupIcons();
        }

        setTimeout(() => { timeScale = 1; }, 800);
    }

    function renderPowerupIcons() {
        powerupsHud.innerHTML = '';
        Object.keys(activePowerups).forEach(k => {
            const p = activePowerups[k];
            if (p.active) {
                const iconEl = document.createElement('div');
                iconEl.className = 'hud-icon';
                iconEl.style.borderColor = p.color;
                iconEl.style.boxShadow = `0 0 10px ${p.color}`;
                iconEl.innerHTML = `<i data-lucide="${p.icon}"></i>`;
                powerupsHud.appendChild(iconEl);
            }
        });
        lucide.createIcons();
    }

    function showFloatingText(text, color) {
        const el = document.createElement('div');
        el.innerText = text + " ACTIVATED";
        el.className = 'powerup-text';
        el.style.color = color;
        el.style.textShadow = `0 0 20px ${color}`;
        powerupDisplay.appendChild(el);
        setTimeout(() => el.remove(), 1500);
    }

    function loseLife() {
        if (balls.some(b => b.active)) return;

        lives--;
        livesVal.innerText = "❤".repeat(Math.max(0, lives));
        shake = 20;
        playSound('hit');

        if (lives <= 0) {
            gameRunning = false;

            if (document.pointerLockElement) {
                document.exitPointerLock();
            }

            startScreen.innerHTML = `
                <div class="flex flex-col items-center z-50 relative pointer-events-auto" onclick="event.stopPropagation()">
                    <h2 class="text-brand-orange font-cyber font-bold text-5xl mb-2 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]">GAME OVER</h2>
                    <p class="text-white text-lg font-mono mb-8">SCORE: ${score}</p>
                    
                    <button onclick="resetGame()" 
                            class="bg-white/10 border border-white/20 text-white hover:bg-white hover:text-black font-bold py-3 px-8 rounded-full transition duration-300 font-mono text-sm tracking-widest cursor-pointer relative z-50">
                        TENTAR NOVAMENTE
                    </button>
                    <div onclick="resetGame()" class="text-white/40 hover:text-white mt-4 cursor-pointer font-mono text-xs">(OU CLIQUE AQUI)</div>
                </div>`;
            startScreen.style.opacity = 1;
            startScreen.style.pointerEvents = 'auto';
            startScreen.style.display = 'flex';
        } else {
            balls = [new Ball()];
            setTimeout(() => { if (lives > 0 && balls[0]) balls[0].active = true; }, 1000);
        }
    }

    function spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x, y, color));
        }
    }

    function spawnFireworks() {
        const x = Math.random() * width;
        const y = Math.random() * (height / 2);
        const colors = ['#d946ef', '#06b6d4', '#f43f5e', '#facc15', '#ffffff'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        for (let i = 0; i < 60; i++) {
            fireworks.push(new Particle(x, y, color, true));
        }
    }

    // Audio
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playSound(type) {
        // Resume context if suspended (browser policy)
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        if (type === 'paddle') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'break') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'powerup') {
            // Powerup Jingle (Coin-like)
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0.1, now + 0.2);
            gain.gain.linearRampToValueAtTime(0, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        } else if (type === 'hit') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, now);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'laser') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
            gain.gain.setValueAtTime(0.005, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'win') {
            // Victory Fanfare
            const notes = [
                { f: 523.25, d: 0.15, t: 0 },    // C5
                { f: 523.25, d: 0.15, t: 0.15 }, // C5
                { f: 523.25, d: 0.15, t: 0.30 }, // C5
                { f: 659.25, d: 0.4, t: 0.45 }, // E5
                { f: 587.33, d: 0.2, t: 0.85 }, // D5
                { f: 659.25, d: 0.2, t: 1.05 }, // E5
                { f: 783.99, d: 0.2, t: 1.25 }, // G5
                { f: 1046.50, d: 0.8, t: 1.45 }  // C6
            ];

            notes.forEach(n => {
                const o = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                o.connect(g);
                g.connect(audioCtx.destination);
                o.type = 'square'; // chiptune style
                o.frequency.value = n.f;
                g.gain.setValueAtTime(0, now + n.t);
                g.gain.linearRampToValueAtTime(0.1, now + n.t + 0.05);
                g.gain.linearRampToValueAtTime(0, now + n.t + n.d);
                o.start(now + n.t);
                o.stop(now + n.t + n.d + 0.1);
            });
        }
    }

    function loop() {
        requestAnimationFrame(loop);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (shake > 0) {
            ctx.save();
            const dx = (Math.random() - 0.5) * shake;
            const dy = (Math.random() - 0.5) * shake;
            ctx.translate(dx, dy);
            shake *= 0.9;
            if (shake < 0.5) shake = 0;
        }

        if (activePowerups.safetyNet.active) {
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#f43f5e';
            ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
            ctx.fillRect(0, height - 10, width, 10);

            ctx.fillStyle = '#fff';
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.3;
            ctx.fillRect(0, height - 10, width, 2);
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        if (paddle) {
            paddle.update();
            paddle.draw();
        }

        for (let i = lasers.length - 1; i >= 0; i--) {
            const l = lasers[i];
            l.update();
            l.draw();
            if (!l.active) lasers.splice(i, 1);
        }

        for (let i = balls.length - 1; i >= 0; i--) {
            const b = balls[i];
            b.update();
            b.draw();
            if (b.y > height && !b.active) balls.splice(i, 1);
        }

        if (balls.length === 0 && gameRunning) {
            loseLife();
        }

        if (bricks) {
            bricks.forEach(b => b.draw());
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            p.draw();
            if (p.life <= 0) particles.splice(i, 1);
        }

        for (let i = fireworks.length - 1; i >= 0; i--) {
            const p = fireworks[i];
            p.update();
            p.draw();
            if (p.life <= 0) fireworks.splice(i, 1);
        }

        if (shake > 0) ctx.restore();
    }

    initGame();
    loop();
}

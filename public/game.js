// Enhanced Backyard Life Game with SNES-style Graphics
// Author: Claude Code Assistant

// Game canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const dayCounter = document.getElementById('dayCounter');
const activityMessage = document.getElementById('activityMessage');

// SNES Color Palette
const SNES_COLORS = {
    // Character colors
    SKIN_BASE: '#FDBCB4',
    SKIN_SHADE: '#F4A79E',
    SKIN_HIGHLIGHT: '#F7B69E',
    SKIN_BLUSH: '#FAB1A0',
    
    // Clothing colors
    SHIRT_RED: '#E74C3C',
    SHIRT_DARK: '#C0392B',
    SHIRT_LIGHT: '#F85C5C',
    SHIRT_BRIGHT: '#FF7979',
    HAT_BLUE: '#3498DB',
    HAT_LIGHT: '#5DADE2',
    HAT_DARK: '#2980B9',
    HAT_SHINE: '#74B9FF',
    PANTS_DARK: '#2C3E50',
    PANTS_LIGHT: '#34495E',
    SHOES_BROWN: '#8B4513',
    SHOES_LIGHT: '#A0522D',
    
    // Environment colors
    GRASS_BASE: '#229954',
    GRASS_LIGHT: '#2ECC71',
    GRASS_DARK: '#1E8449',
    DIRT_BASE: '#8B4513',
    DIRT_LIGHT: '#A0522D',
    
    // Object colors
    WOOD_BASE: '#8B4513',
    WOOD_LIGHT: '#A0522D',
    WOOD_DARK: '#654321',
    METAL_BASE: '#7F8C8D',
    METAL_LIGHT: '#BDC3C7',
    FIRE_BASE: '#FF6B35',
    FIRE_BRIGHT: '#F1C40F',
    FIRE_ORANGE: '#E67E22',
    
    // UI colors
    WHITE: '#FFFFFF',
    BLACK: '#000000',
    SHADOW: 'rgba(0,0,0,0.3)',
    GLOW: 'rgba(0,0,0,0.1)'
};

// Particle System
class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    addParticle(x, y, type, color = '#FFD700') {
        const particle = {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2 - 1,
            life: 30 + Math.random() * 30,
            maxLife: 30 + Math.random() * 30,
            color: color,
            size: 1 + Math.random() * 2,
            type: type
        };
        this.particles.push(particle);
    }
    
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // gravity
            p.life--;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    draw() {
        this.particles.forEach(p => {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            
            if (p.type === 'spark') {
                drawPixelRect(p.x, p.y, p.size, p.size, p.color);
            } else if (p.type === 'smoke') {
                const size = (1 - alpha) * 4 + 1;
                drawPixelRect(p.x - size/2, p.y - size/2, size, size, `rgba(100,100,100,${alpha * 0.5})`);
            }
        });
        ctx.globalAlpha = 1;
    }
}

// Initialize particle system
const particles = new ParticleSystem();

// Enhanced Sprite System
class Sprite {
    constructor(frames = 1) {
        this.frames = frames;
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.frameDelay = 8;
    }
    
    animate() {
        this.frameTimer++;
        if (this.frameTimer >= this.frameDelay) {
            this.currentFrame = (this.currentFrame + 1) % this.frames;
            this.frameTimer = 0;
        }
    }
    
    reset() {
        this.currentFrame = 0;
        this.frameTimer = 0;
    }
}

// Game state
let days = 0;
let gameTime = 0;
let lastTime = 0;

// Enhanced Player object with sprite animations
const player = {
    x: 320,
    y: 240,
    width: 16,
    height: 16,
    speed: 2,
    direction: 'down',
    isMoving: false,
    idleTimer: 0,
    walkCycle: 0,
    shadowScale: 1.0,
    sprite: new Sprite(4),
    lastDirection: 'down'
};

// Input handling
const keys = {};

// Event listeners for keyboard input
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Touch controls
document.querySelectorAll('.touch-button').forEach(button => {
    button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const key = button.getAttribute('data-key');
        keys[key] = true;
    });
    
    button.addEventListener('touchend', (e) => {
        e.preventDefault();
        const key = button.getAttribute('data-key');
        keys[key] = false;
    });
    
    button.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const key = button.getAttribute('data-key');
        keys[key] = true;
    });
    
    button.addEventListener('mouseup', (e) => {
        e.preventDefault();
        const key = button.getAttribute('data-key');
        keys[key] = false;
    });
});

// Prevent scrolling on touch
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

// Canvas resize handling
function resizeCanvas() {
    const container = document.getElementById('gameContainer');
    const containerWidth = container.clientWidth - 40;
    const containerHeight = window.innerHeight * 0.6;
    
    const aspectRatio = 640 / 480;
    let newWidth = containerWidth;
    let newHeight = newWidth / aspectRatio;
    
    if (newHeight > containerHeight) {
        newHeight = containerHeight;
        newWidth = newHeight * aspectRatio;
    }
    
    canvas.style.width = newWidth + 'px';
    canvas.style.height = newHeight + 'px';
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 100);
});

resizeCanvas();

// Enhanced interactive objects with sprite animations
const objects = [
    {
        x: 100, y: 100, width: 32, height: 32,
        type: 'workbench',
        activity: 'Building a chair! +1 furniture point',
        sprite: new Sprite(1)
    },
    {
        x: 500, y: 150, width: 24, height: 24,
        type: 'fire',
        activity: 'Sitting by the warm fire... relaxing!',
        sprite: new Sprite(8),
        lastParticle: 0
    },
    {
        x: 50, y: 300, width: 20, height: 20,
        type: 'trash',
        activity: 'Throwing trash over the fence! Naughty!',
        sprite: new Sprite(1)
    },
    {
        x: 400, y: 350, width: 28, height: 28,
        type: 'garden',
        activity: 'Tending to the garden... peaceful!',
        sprite: new Sprite(3)
    },
    {
        x: 200, y: 400, width: 40, height: 16,
        type: 'fence',
        activity: 'Checking the fence... seems sturdy!',
        sprite: new Sprite(1)
    },
    {
        x: 550, y: 50, width: 16, height: 16,
        type: 'shed',
        activity: 'Rummaging through the shed...',
        sprite: new Sprite(1)
    }
];

// Utility function for pixel-perfect rendering
function drawPixelRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(width), Math.floor(height));
}

// Enhanced player drawing with detailed SNES-style sprites
function drawPlayer() {
    const x = Math.floor(player.x);
    const y = Math.floor(player.y);
    
    // Update sprite animation
    if (player.isMoving) {
        player.sprite.animate();
    } else {
        player.sprite.reset();
    }
    
    // Walking animation effects
    const walkOffset = player.isMoving ? Math.sin(player.walkCycle * 0.3) * 1 : 0;
    const bobOffset = player.isMoving ? Math.sin(player.walkCycle * 0.6) * 0.5 : 0;
    
    // Enhanced shadow with animation
    const shadowWidth = 12 + Math.sin(player.walkCycle * 0.3) * 2;
    const shadowAlpha = 0.3 + Math.sin(player.walkCycle * 0.2) * 0.1;
    drawPixelRect(x + 2, y + 14, shadowWidth, 2, `rgba(0,0,0,${shadowAlpha})`);
    
    // Movement glow effect
    if (player.isMoving) {
        const glowSize = 2 + Math.sin(player.walkCycle * 0.4);
        ctx.globalAlpha = 0.1;
        drawPixelRect(x - glowSize, y - glowSize, 16 + glowSize * 2, 16 + glowSize * 2, SNES_COLORS.HAT_BLUE);
        ctx.globalAlpha = 1;
    }
    
    // Body with enhanced shading
    const bodyY = y + 8 + bobOffset;
    drawPixelRect(x, bodyY, 16, 8, SNES_COLORS.SHIRT_RED);
    drawPixelRect(x + 1, bodyY, 14, 6, SNES_COLORS.SHIRT_DARK);
    drawPixelRect(x + 2, bodyY + 1, 12, 4, SNES_COLORS.SHIRT_RED);
    
    // Body highlights for 3D effect
    drawPixelRect(x + 1, bodyY, 2, 6, SNES_COLORS.SHIRT_LIGHT);
    drawPixelRect(x + 2, bodyY + 1, 1, 4, SNES_COLORS.SHIRT_BRIGHT);
    
    // Head with enhanced skin tone
    const headY = y + bobOffset;
    drawPixelRect(x + 4, headY, 8, 8, SNES_COLORS.SKIN_BASE);
    drawPixelRect(x + 5, headY + 1, 6, 6, SNES_COLORS.SKIN_SHADE);
    drawPixelRect(x + 6, headY + 2, 4, 4, SNES_COLORS.SKIN_HIGHLIGHT);
    
    // Cheek blush
    drawPixelRect(x + 4, headY + 3, 1, 1, SNES_COLORS.SKIN_BLUSH);
    drawPixelRect(x + 11, headY + 3, 1, 1, SNES_COLORS.SKIN_BLUSH);
    
    // Enhanced hair/hat with detail and shine
    drawPixelRect(x + 2, headY - 2, 12, 4, SNES_COLORS.HAT_BLUE);
    drawPixelRect(x + 3, headY - 1, 10, 2, SNES_COLORS.HAT_LIGHT);
    drawPixelRect(x + 1, headY - 1, 2, 1, SNES_COLORS.HAT_DARK);
    drawPixelRect(x + 13, headY - 1, 2, 1, SNES_COLORS.HAT_DARK);
    
    // Hat shine effect
    drawPixelRect(x + 4, headY - 2, 3, 1, SNES_COLORS.HAT_SHINE);
    drawPixelRect(x + 5, headY - 1, 2, 1, '#A8DAFF');
    
    // Animated eyes with blinking
    const eyeState = Math.floor(player.idleTimer / 60) % 180 < 5 ? 1 : 0;
    if (eyeState === 0) {
        // Open eyes
        drawPixelRect(x + 5, headY + 2, 2, 2, SNES_COLORS.BLACK);
        drawPixelRect(x + 9, headY + 2, 2, 2, SNES_COLORS.BLACK);
        drawPixelRect(x + 5, headY + 2, 1, 1, SNES_COLORS.WHITE);
        drawPixelRect(x + 9, headY + 2, 1, 1, SNES_COLORS.WHITE);
        
        // Eye pupils that follow movement direction
        const pupilOffset = player.direction === 'left' ? 0 : player.direction === 'right' ? 1 : 0;
        drawPixelRect(x + 5 + pupilOffset, headY + 3, 1, 1, '#2C3E50');
        drawPixelRect(x + 9 + pupilOffset, headY + 3, 1, 1, '#2C3E50');
    } else {
        // Closed eyes (blinking)
        drawPixelRect(x + 5, headY + 3, 2, 1, SNES_COLORS.BLACK);
        drawPixelRect(x + 9, headY + 3, 2, 1, SNES_COLORS.BLACK);
    }
    
    // Enhanced nose with shading
    drawPixelRect(x + 7, headY + 4, 2, 1, '#E8A085');
    drawPixelRect(x + 7, headY + 5, 1, 1, '#DDA085');
    
    // Dynamic mouth expressions
    if (player.isMoving) {
        drawPixelRect(x + 7, headY + 6, 2, 1, SNES_COLORS.SHIRT_DARK);
    } else {
        drawPixelRect(x + 7, headY + 6, 2, 1, '#E8A085');
    }
    
    // Enhanced shirt with detail
    drawPixelRect(x + 6, bodyY + 2, 4, 2, SNES_COLORS.WHITE);
    drawPixelRect(x + 7, bodyY + 3, 2, 1, '#ECF0F1');
    drawPixelRect(x + 6, bodyY + 2, 1, 1, '#F8F9FA');
    
    // Shirt buttons
    drawPixelRect(x + 8, bodyY + 1, 1, 1, SNES_COLORS.PANTS_LIGHT);
    drawPixelRect(x + 8, bodyY + 4, 1, 1, SNES_COLORS.PANTS_LIGHT);
    
    // Animated arms with walking motion
    const leftArmOffset = player.isMoving ? Math.sin(player.walkCycle * 0.3) * 2 : 0;
    const rightArmOffset = player.isMoving ? Math.sin(player.walkCycle * 0.3 + Math.PI) * 2 : 0;
    
    // Left arm
    drawPixelRect(x - 2, bodyY + 1 + leftArmOffset, 4, 6, SNES_COLORS.SKIN_BASE);
    drawPixelRect(x - 1, bodyY + 2 + leftArmOffset, 2, 4, SNES_COLORS.SKIN_SHADE);
    drawPixelRect(x - 2, bodyY + 5 + leftArmOffset, 3, 3, SNES_COLORS.SKIN_BASE);
    
    // Right arm
    drawPixelRect(x + 14, bodyY + 1 + rightArmOffset, 4, 6, SNES_COLORS.SKIN_BASE);
    drawPixelRect(x + 15, bodyY + 2 + rightArmOffset, 2, 4, SNES_COLORS.SKIN_SHADE);
    drawPixelRect(x + 15, bodyY + 5 + rightArmOffset, 3, 3, SNES_COLORS.SKIN_BASE);
    
    // Enhanced legs with walking animation
    const leftLegOffset = player.isMoving ? Math.sin(player.walkCycle * 0.4) * 1.5 : 0;
    const rightLegOffset = player.isMoving ? Math.sin(player.walkCycle * 0.4 + Math.PI) * 1.5 : 0;
    
    // Pants
    drawPixelRect(x + 2, bodyY + 6, 5, 4, SNES_COLORS.PANTS_DARK);
    drawPixelRect(x + 9, bodyY + 6, 5, 4, SNES_COLORS.PANTS_DARK);
    drawPixelRect(x + 3, bodyY + 7, 3, 2, SNES_COLORS.PANTS_LIGHT);
    drawPixelRect(x + 10, bodyY + 7, 3, 2, SNES_COLORS.PANTS_LIGHT);
    
    // Shoes with animation
    drawPixelRect(x + 1 + leftLegOffset, y + 14, 6, 2, SNES_COLORS.SHOES_BROWN);
    drawPixelRect(x + 9 + rightLegOffset, y + 14, 6, 2, SNES_COLORS.SHOES_BROWN);
    drawPixelRect(x + 2 + leftLegOffset, y + 15, 4, 1, SNES_COLORS.SHOES_LIGHT);
    drawPixelRect(x + 10 + rightLegOffset, y + 15, 4, 1, SNES_COLORS.SHOES_LIGHT);
}

// Enhanced object drawing with improved sprites and effects
function drawObjects() {
    objects.forEach(obj => {
        const x = Math.floor(obj.x);
        const y = Math.floor(obj.y);
        
        // Update sprite animations
        obj.sprite.animate();
        
        switch(obj.type) {
            case 'fire':
                // Enhanced fire with particles
                if (Date.now() - (obj.lastParticle || 0) > 100) {
                    particles.addParticle(x + 12, y - 5, 'spark', SNES_COLORS.FIRE_BRIGHT);
                    if (Math.random() > 0.7) {
                        particles.addParticle(x + 8, y - 10, 'smoke', '#666666');
                    }
                    obj.lastParticle = Date.now();
                }
                
                // Base fire
                drawPixelRect(x, y, obj.width, obj.height, SNES_COLORS.FIRE_BASE);
                drawPixelRect(x + 2, y + 2, obj.width - 4, obj.height - 4, '#FF4757');
                
                // Animated flames with improved movement
                const flameTime = Date.now() * 0.01;
                const flameOffset1 = Math.sin(flameTime) * 2;
                const flameOffset2 = Math.sin(flameTime + 1) * 1.5;
                const flameOffset3 = Math.sin(flameTime + 2) * 1;
                
                drawPixelRect(x + 4 + flameOffset1, y - 8, 4, 8, SNES_COLORS.FIRE_BRIGHT);
                drawPixelRect(x + 8 + flameOffset2, y - 12, 4, 12, SNES_COLORS.FIRE_ORANGE);
                drawPixelRect(x + 12 + flameOffset3, y - 6, 4, 6, '#F39C12');
                drawPixelRect(x + 16 + flameOffset1, y - 4, 2, 4, SNES_COLORS.FIRE_BASE);
                
                // Enhanced sparks
                drawPixelRect(x + 6 + Math.sin(flameTime * 2) * 3, y - 14, 1, 1, '#FFD700');
                drawPixelRect(x + 18 + Math.cos(flameTime * 1.5) * 2, y - 10, 1, 1, '#FFD700');
                drawPixelRect(x + 10 + Math.sin(flameTime * 3) * 2, y - 16, 1, 1, '#FFA500');
                break;
                
            case 'workbench':
                // Enhanced workbench with more detail
                drawPixelRect(x, y, obj.width, obj.height, SNES_COLORS.WOOD_BASE);
                drawPixelRect(x + 2, y + 2, obj.width - 4, obj.height - 4, SNES_COLORS.WOOD_LIGHT);
                drawPixelRect(x + 4, y + 4, obj.width - 8, obj.height - 8, SNES_COLORS.WOOD_BASE);
                
                // Tools with enhanced detail
                drawPixelRect(x + 6, y + 6, 4, 4, SNES_COLORS.METAL_BASE);
                drawPixelRect(x + 7, y + 7, 2, 2, SNES_COLORS.METAL_LIGHT);
                drawPixelRect(x + 18, y + 8, 8, 4, '#F39C12');
                drawPixelRect(x + 19, y + 9, 6, 2, '#FFD700');
                
                // Hammer with detail
                drawPixelRect(x + 12, y + 2, 2, 8, SNES_COLORS.WOOD_BASE);
                drawPixelRect(x + 10, y + 2, 6, 3, SNES_COLORS.METAL_BASE);
                drawPixelRect(x + 11, y + 2, 4, 1, SNES_COLORS.METAL_LIGHT);
                
                // Wood shavings
                drawPixelRect(x + 24, y + 16, 2, 1, SNES_COLORS.WOOD_LIGHT);
                drawPixelRect(x + 22, y + 18, 3, 1, SNES_COLORS.WOOD_LIGHT);
                break;
                
            case 'garden':
                // Enhanced garden with animated plants
                drawPixelRect(x, y, obj.width, obj.height, SNES_COLORS.GRASS_LIGHT);
                drawPixelRect(x + 2, y + 2, obj.width - 4, obj.height - 4, '#229954');
                
                // Soil bed
                drawPixelRect(x + 4, y + 20, obj.width - 8, 8, SNES_COLORS.DIRT_BASE);
                drawPixelRect(x + 5, y + 21, obj.width - 10, 6, SNES_COLORS.DIRT_LIGHT);
                
                // Animated plants with sway
                const plantSway = Math.sin(Date.now() * 0.002) * 0.5;
                
                // Plant 1
                drawPixelRect(x + 4 + plantSway, y - 4, 4, 12, SNES_COLORS.GRASS_LIGHT);
                drawPixelRect(x + 5 + plantSway, y - 3, 2, 10, SNES_COLORS.GRASS_BASE);
                drawPixelRect(x + 6 + plantSway, y - 6, 2, 2, '#E74C3C');
                
                // Plant 2
                drawPixelRect(x + 12 - plantSway, y - 6, 4, 14, SNES_COLORS.GRASS_LIGHT);
                drawPixelRect(x + 13 - plantSway, y - 5, 2, 12, SNES_COLORS.GRASS_BASE);
                drawPixelRect(x + 14 - plantSway, y - 8, 2, 2, '#F1C40F');
                
                // Plant 3
                drawPixelRect(x + 20 + plantSway * 0.5, y - 2, 4, 10, SNES_COLORS.GRASS_LIGHT);
                drawPixelRect(x + 21 + plantSway * 0.5, y - 1, 2, 8, SNES_COLORS.GRASS_BASE);
                drawPixelRect(x + 22 + plantSway * 0.5, y - 4, 2, 2, '#9B59B6');
                break;
                
            case 'trash':
                // Enhanced trash can
                drawPixelRect(x, y, obj.width, obj.height, SNES_COLORS.METAL_BASE);
                drawPixelRect(x + 2, y + 2, obj.width - 4, obj.height - 4, '#95A5A6');
                drawPixelRect(x + 1, y - 2, obj.width - 2, 3, '#7F8C8D');
                drawPixelRect(x + 8, y - 4, 4, 2, '#95A5A6');
                
                // Trash can details
                drawPixelRect(x + 1, y + 1, 1, obj.height - 2, SNES_COLORS.METAL_LIGHT);
                drawPixelRect(x + obj.width - 2, y + 1, 1, obj.height - 2, '#5D6D7E');
                break;
                
            case 'fence':
                // Enhanced fence with posts
                drawPixelRect(x, y, obj.width, obj.height, SNES_COLORS.WOOD_DARK);
                drawPixelRect(x + 2, y + 2, obj.width - 4, obj.height - 4, '#5D4E75');
                
                // Fence posts with detail
                for (let i = 0; i < obj.width; i += 8) {
                    drawPixelRect(x + i, y - 4, 2, obj.height + 8, SNES_COLORS.WOOD_BASE);
                    drawPixelRect(x + i + 1, y - 3, 1, obj.height + 6, SNES_COLORS.WOOD_LIGHT);
                    drawPixelRect(x + i, y - 4, 1, 1, SNES_COLORS.WOOD_LIGHT);
                }
                break;
                
            case 'shed':
                // Enhanced shed
                drawPixelRect(x, y, obj.width, obj.height, '#F39C12');
                drawPixelRect(x + 1, y + 1, obj.width - 2, obj.height - 2, '#FFD700');
                
                // Roof with detail
                drawPixelRect(x - 2, y - 4, obj.width + 4, 4, SNES_COLORS.WOOD_BASE);
                drawPixelRect(x - 1, y - 3, obj.width + 2, 2, SNES_COLORS.WOOD_LIGHT);
                drawPixelRect(x, y - 4, obj.width, 1, SNES_COLORS.WOOD_LIGHT);
                
                // Door with handle
                drawPixelRect(x + 6, y + 4, 4, 8, SNES_COLORS.WOOD_DARK);
                drawPixelRect(x + 8, y + 7, 1, 1, '#FFD700');
                drawPixelRect(x + 7, y + 5, 2, 6, '#8B4513');
                break;
        }
    });
}

// Collision detection for interactions
function checkCollisions() {
    if (keys['Space']) {
        objects.forEach(obj => {
            if (player.x < obj.x + obj.width &&
                player.x + player.width > obj.x &&
                player.y < obj.y + obj.height &&
                player.y + player.height > obj.y) {
                
                showActivity(obj.activity);
                
                // Add particles for interaction feedback
                particles.addParticle(obj.x + obj.width/2, obj.y, 'spark', '#FFD700');
                particles.addParticle(obj.x + obj.width/2 + 5, obj.y - 5, 'spark', '#FFA500');
            }
        });
    }
}

// Enhanced activity message display
function showActivity(message) {
    activityMessage.textContent = message;
    activityMessage.style.display = 'block';
    activityMessage.classList.add('activity-show');
    
    setTimeout(() => {
        activityMessage.style.display = 'none';
        activityMessage.classList.remove('activity-show');
    }, 2500);
}

// Enhanced player update with smoother movement
function updatePlayer() {
    let newX = player.x;
    let newY = player.y;
    let moving = false;
    
    // Diagonal movement normalization
    let moveX = 0, moveY = 0;
    
    if (keys['KeyW'] || keys['ArrowUp']) {
        moveY = -1;
        player.direction = 'up';
        moving = true;
    }
    if (keys['KeyS'] || keys['ArrowDown']) {
        moveY = 1;
        player.direction = 'down';
        moving = true;
    }
    if (keys['KeyA'] || keys['ArrowLeft']) {
        moveX = -1;
        player.direction = 'left';
        moving = true;
    }
    if (keys['KeyD'] || keys['ArrowRight']) {
        moveX = 1;
        player.direction = 'right';
        moving = true;
    }
    
    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
        moveX *= 0.707; // sqrt(2)/2 for proper diagonal speed
        moveY *= 0.707;
    }
    
    newX += moveX * player.speed;
    newY += moveY * player.speed;
    
    // Update movement state and animations
    player.isMoving = moving;
    if (moving) {
        player.walkCycle += 1;
        player.idleTimer = 0;
        player.lastDirection = player.direction;
    } else {
        player.idleTimer += 1;
        player.walkCycle = 0;
    }
    
    // Keep player within bounds
    if (newX >= 12 && newX <= canvas.width - player.width - 12) {
        player.x = newX;
    }
    if (newY >= 12 && newY <= canvas.height - player.height - 12) {
        player.y = newY;
    }
}

// Enhanced time system
function updateTime(currentTime) {
    gameTime += currentTime - lastTime;
    lastTime = currentTime;
    
    // Day progression every 15 seconds for better gameplay
    if (gameTime > 15000) {
        days++;
        dayCounter.textContent = days;
        gameTime = 0;
        
        // Day change particle effect
        for (let i = 0; i < 10; i++) {
            particles.addParticle(
                Math.random() * canvas.width,
                -10,
                'spark',
                '#FFD700'
            );
        }
    }
}

// Enhanced SNES-style background
function drawBackground() {
    // Base grass layer
    ctx.fillStyle = SNES_COLORS.GRASS_BASE;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grass texture pattern with SNES colors
    ctx.fillStyle = SNES_COLORS.GRASS_LIGHT;
    for (let y = 0; y < canvas.height; y += 8) {
        for (let x = 0; x < canvas.width; x += 16) {
            if ((x + y) % 32 === 0) {
                ctx.fillRect(x, y, 8, 8);
            }
        }
    }
    
    // Detailed grass texture
    ctx.fillStyle = SNES_COLORS.GRASS_DARK;
    for (let i = 0; i < 150; i++) {
        const x = (i * 73 + 17) % canvas.width;
        const y = (i * 41 + 23) % canvas.height;
        ctx.fillRect(x, y, 2, 2);
        ctx.fillRect(x + 1, y + 2, 2, 2);
        if (i % 3 === 0) {
            ctx.fillRect(x + 2, y + 1, 1, 3);
        }
    }
    
    // Enhanced dirt patches
    drawPixelRect(150, 200, 32, 16, SNES_COLORS.DIRT_BASE);
    drawPixelRect(152, 202, 28, 12, SNES_COLORS.DIRT_LIGHT);
    drawPixelRect(154, 204, 24, 8, '#CD853F');
    
    drawPixelRect(480, 300, 24, 20, SNES_COLORS.DIRT_BASE);
    drawPixelRect(482, 302, 20, 16, SNES_COLORS.DIRT_LIGHT);
    drawPixelRect(484, 304, 16, 12, '#CD853F');
    
    // Enhanced scattered flowers
    const flowerColors = ['#E74C3C', '#F1C40F', '#9B59B6', '#E67E22', '#FFFFFF'];
    for (let i = 0; i < 20; i++) {
        const x = (i * 61 + 31) % (canvas.width - 20);
        const y = (i * 37 + 47) % (canvas.height - 20);
        const color = flowerColors[i % flowerColors.length];
        
        // Flower petals
        drawPixelRect(x, y, 2, 2, color);
        drawPixelRect(x + 2, y + 1, 2, 2, color);
        drawPixelRect(x + 1, y - 1, 2, 2, color);
        drawPixelRect(x - 1, y + 1, 2, 2, color);
        
        // Flower center
        drawPixelRect(x + 1, y + 1, 1, 1, '#FFD700');
        
        // Stem
        drawPixelRect(x + 1, y + 2, 2, 4, SNES_COLORS.GRASS_LIGHT);
    }
    
    // Enhanced border fence
    const fenceHeight = 12;
    
    // Top fence
    drawPixelRect(0, 0, canvas.width, fenceHeight, SNES_COLORS.WOOD_BASE);
    drawPixelRect(2, 2, canvas.width - 4, fenceHeight - 4, SNES_COLORS.WOOD_LIGHT);
    drawPixelRect(4, 4, canvas.width - 8, fenceHeight - 8, SNES_COLORS.WOOD_BASE);
    
    // Bottom fence
    drawPixelRect(0, canvas.height - fenceHeight, canvas.width, fenceHeight, SNES_COLORS.WOOD_BASE);
    drawPixelRect(2, canvas.height - fenceHeight + 2, canvas.width - 4, fenceHeight - 4, SNES_COLORS.WOOD_LIGHT);
    drawPixelRect(4, canvas.height - fenceHeight + 4, canvas.width - 8, fenceHeight - 8, SNES_COLORS.WOOD_BASE);
    
    // Left fence
    drawPixelRect(0, 0, fenceHeight, canvas.height, SNES_COLORS.WOOD_BASE);
    drawPixelRect(2, 2, fenceHeight - 4, canvas.height - 4, SNES_COLORS.WOOD_LIGHT);
    drawPixelRect(4, 4, fenceHeight - 8, canvas.height - 8, SNES_COLORS.WOOD_BASE);
    
    // Right fence
    drawPixelRect(canvas.width - fenceHeight, 0, fenceHeight, canvas.height, SNES_COLORS.WOOD_BASE);
    drawPixelRect(canvas.width - fenceHeight + 2, 2, fenceHeight - 4, canvas.height - 4, SNES_COLORS.WOOD_LIGHT);
    drawPixelRect(canvas.width - fenceHeight + 4, 4, fenceHeight - 8, canvas.height - 8, SNES_COLORS.WOOD_BASE);
    
    // Enhanced fence posts
    ctx.fillStyle = SNES_COLORS.WOOD_DARK;
    for (let x = 32; x < canvas.width - 32; x += 64) {
        drawPixelRect(x, 0, 6, fenceHeight + 4, SNES_COLORS.WOOD_DARK);
        drawPixelRect(x + 1, 1, 4, fenceHeight + 2, SNES_COLORS.WOOD_BASE);
        drawPixelRect(x, canvas.height - fenceHeight - 4, 6, fenceHeight + 4, SNES_COLORS.WOOD_DARK);
        drawPixelRect(x + 1, canvas.height - fenceHeight - 3, 4, fenceHeight + 2, SNES_COLORS.WOOD_BASE);
    }
    
    for (let y = 32; y < canvas.height - 32; y += 64) {
        drawPixelRect(0, y, fenceHeight + 4, 6, SNES_COLORS.WOOD_DARK);
        drawPixelRect(1, y + 1, fenceHeight + 2, 4, SNES_COLORS.WOOD_BASE);
        drawPixelRect(canvas.width - fenceHeight - 4, y, fenceHeight + 4, 6, SNES_COLORS.WOOD_DARK);
        drawPixelRect(canvas.width - fenceHeight - 3, y + 1, fenceHeight + 2, 4, SNES_COLORS.WOOD_BASE);
    }
    
    // Enhanced corner decorations
    const cornerSize = 16;
    drawPixelRect(fenceHeight, fenceHeight, cornerSize, cornerSize, '#F39C12');
    drawPixelRect(fenceHeight + 2, fenceHeight + 2, cornerSize - 4, cornerSize - 4, '#FFD700');
    drawPixelRect(fenceHeight + 4, fenceHeight + 4, cornerSize - 8, cornerSize - 8, '#FFA500');
    
    drawPixelRect(canvas.width - fenceHeight - cornerSize, fenceHeight, cornerSize, cornerSize, '#F39C12');
    drawPixelRect(canvas.width - fenceHeight - cornerSize + 2, fenceHeight + 2, cornerSize - 4, cornerSize - 4, '#FFD700');
    drawPixelRect(canvas.width - fenceHeight - cornerSize + 4, fenceHeight + 4, cornerSize - 8, cornerSize - 8, '#FFA500');
    
    drawPixelRect(fenceHeight, canvas.height - fenceHeight - cornerSize, cornerSize, cornerSize, '#F39C12');
    drawPixelRect(fenceHeight + 2, canvas.height - fenceHeight - cornerSize + 2, cornerSize - 4, cornerSize - 4, '#FFD700');
    drawPixelRect(fenceHeight + 4, canvas.height - fenceHeight - cornerSize + 4, cornerSize - 8, cornerSize - 8, '#FFA500');
    
    drawPixelRect(canvas.width - fenceHeight - cornerSize, canvas.height - fenceHeight - cornerSize, cornerSize, cornerSize, '#F39C12');
    drawPixelRect(canvas.width - fenceHeight - cornerSize + 2, canvas.height - fenceHeight - cornerSize + 2, cornerSize - 4, cornerSize - 4, '#FFD700');
    drawPixelRect(canvas.width - fenceHeight - cornerSize + 4, canvas.height - fenceHeight - cornerSize + 4, cornerSize - 8, cornerSize - 8, '#FFA500');
}

// Main game loop with enhanced performance
function gameLoop(currentTime) {
    if (!lastTime) lastTime = currentTime;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update systems
    updateTime(currentTime);
    updatePlayer();
    checkCollisions();
    particles.update();
    
    // Render layers
    drawBackground();
    drawObjects();
    drawPlayer();
    particles.draw();
    
    requestAnimationFrame(gameLoop);
}

// Initialize and start the game
console.log('🎮 Backyard Life - Enhanced SNES Edition Starting...');
requestAnimationFrame(gameLoop);
// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameRunning = true;
let score = 0;
let lives = 3;
let keys = {};

// Player object
const player = {
    x: 50,
    y: canvas.height - 80,
    width: 40,
    height: 40,
    speed: 5,
    color: '#ff6b35',
    bullets: [],
    shootCooldown: 0
};

// Enemies array
let enemies = [];
let enemySpawnTimer = 0;

// Bullet class
class Bullet {
    constructor(x, y, direction = 1) {
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 4;
        this.speed = 8 * direction;
        this.color = direction > 0 ? '#ffff00' : '#ff0000';
    }

    update() {
        this.x += this.speed;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Enemy class
class Enemy {
    constructor() {
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - 100) + 50;
        this.width = 35;
        this.height = 35;
        this.speed = 2 + Math.random() * 2;
        this.color = '#8B0000';
        this.health = 1;
        this.shootTimer = Math.random() * 60;
        this.bullets = [];
    }

    update() {
        this.x -= this.speed;
        
        // Enemy shooting
        this.shootTimer--;
        if (this.shootTimer <= 0 && Math.random() < 0.02) {
            this.bullets.push(new Bullet(this.x, this.y + this.height/2, -1));
            this.shootTimer = 30 + Math.random() * 30;
        }

        // Update enemy bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update();
            if (this.bullets[i].x < 0) {
                this.bullets.splice(i, 1);
            }
        }
    }

    draw() {
        // Draw enemy body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw enemy details
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 5, this.y + 5, 8, 8); // Head
        ctx.fillRect(this.x + 20, this.y + 5, 8, 8); // Head
        
        // Draw enemy bullets
        this.bullets.forEach(bullet => bullet.draw());
    }
}

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Game functions
function updatePlayer() {
    // Player movement
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    if (keys['ArrowUp'] && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }

    // Player shooting
    if (keys['Space'] && player.shootCooldown <= 0) {
        player.bullets.push(new Bullet(player.x + player.width, player.y + player.height/2));
        player.shootCooldown = 10;
    }
    
    if (player.shootCooldown > 0) {
        player.shootCooldown--;
    }

    // Update player bullets
    for (let i = player.bullets.length - 1; i >= 0; i--) {
        player.bullets[i].update();
        if (player.bullets[i].x > canvas.width) {
            player.bullets.splice(i, 1);
        }
    }
}

function drawPlayer() {
    // Draw player body
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw player details (simple soldier)
    ctx.fillStyle = '#000';
    ctx.fillRect(player.x + 5, player.y + 5, 10, 10); // Head
    ctx.fillStyle = '#654321';
    ctx.fillRect(player.x + 20, player.y + 15, 15, 5); // Gun
    
    // Draw player bullets
    player.bullets.forEach(bullet => bullet.draw());
}

function spawnEnemies() {
    enemySpawnTimer++;
    if (enemySpawnTimer > 60) { // Spawn every 60 frames (1 second at 60fps)
        enemies.push(new Enemy());
        enemySpawnTimer = 0;
    }
}

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].update();
        
        // Remove enemies that are off screen
        if (enemies[i].x < -enemies[i].width) {
            enemies.splice(i, 1);
        }
    }
}

function checkCollisions() {
    // Player bullets vs enemies
    for (let i = player.bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (collision(player.bullets[i], enemies[j])) {
                player.bullets.splice(i, 1);
                enemies.splice(j, 1);
                score += 100;
                updateScore();
                break;
            }
        }
    }

    // Enemy bullets vs player
    for (let i = enemies.length - 1; i >= 0; i--) {
        for (let j = enemies[i].bullets.length - 1; j >= 0; j--) {
            if (collision(enemies[i].bullets[j], player)) {
                enemies[i].bullets.splice(j, 1);
                lives--;
                updateLives();
                if (lives <= 0) {
                    gameOver();
                }
                break;
            }
        }
    }

    // Player vs enemies (collision damage)
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (collision(player, enemies[i])) {
            enemies.splice(i, 1);
            lives--;
            updateLives();
            if (lives <= 0) {
                gameOver();
            }
        }
    }
}

function collision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

function updateLives() {
    document.getElementById('lives').textContent = lives;
}

function gameOver() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
}

function restartGame() {
    // Reset game state
    gameRunning = true;
    score = 0;
    lives = 3;
    player.x = 50;
    player.y = canvas.height - 80;
    player.bullets = [];
    enemies = [];
    enemySpawnTimer = 0;
    
    // Update UI
    updateScore();
    updateLives();
    document.getElementById('gameOver').classList.add('hidden');
    
    // Restart game loop
    gameLoop();
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background elements
    drawBackground();
    
    // Draw game objects
    drawPlayer();
    enemies.forEach(enemy => enemy.draw());
}

function drawBackground() {
    // Draw simple ground
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    
    // Draw some clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 3; i++) {
        let x = (i * 300 + Date.now() * 0.02) % (canvas.width + 100) - 50;
        drawCloud(x, 50 + i * 30);
    }
}

function drawCloud(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
    ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 25, y - 15, 15, 0, Math.PI * 2);
    ctx.fill();
}

function gameLoop() {
    if (!gameRunning) return;
    
    updatePlayer();
    spawnEnemies();
    updateEnemies();
    checkCollisions();
    draw();
    
    requestAnimationFrame(gameLoop);
}

// Initialize game
updateScore();
updateLives();
gameLoop();

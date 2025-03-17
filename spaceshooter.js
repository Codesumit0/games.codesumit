const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 50,
    height: 50,
    speed: 5,
    color: '#7B1FA2',
    bullets: [],
    powerUp: null,
    powerUpTimer: 0
};

const enemies = [];
const powerUps = [];
const bulletSpeed = 7;
const enemySpeed = 2;
const powerUpTypes = ['rapidFire', 'shield', 'multiShot'];

let score = 0;
let lives = 3;
let highScore = parseInt(localStorage.getItem('spaceShooterHighScore')) || 0;
let gameLoop;
let isPaused = false;
let isGameOver = false;
let lastShot = 0;
let shootingDelay = 500; // milliseconds between shots

// Key states
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false,
    Space: false
};

function createEnemy() {
    return {
        x: Math.random() * (canvas.width - 30),
        y: -30,
        width: 30,
        height: 30,
        speed: enemySpeed + Math.random() * 2
    };
}

function createPowerUp() {
    return {
        x: Math.random() * (canvas.width - 20),
        y: -20,
        width: 20,
        height: 20,
        type: powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)],
        speed: 2
    };
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();

    if (player.powerUp === 'shield') {
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 
                player.width / 1.5, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function drawBullets() {
    ctx.fillStyle = '#E91E63';
    player.bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, 4, 10);
    });
}

function drawEnemies() {
    ctx.fillStyle = '#f44336';
    enemies.forEach(enemy => {
        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.width / 2, enemy.y);
        ctx.lineTo(enemy.x, enemy.y + enemy.height);
        ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height);
        ctx.closePath();
        ctx.fill();
    });
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        ctx.fillStyle = powerUp.type === 'rapidFire' ? '#FFD700' :
                       powerUp.type === 'shield' ? '#4CAF50' : '#2196F3';
        ctx.beginPath();
        ctx.arc(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2,
                powerUp.width / 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateBullets() {
    for (let i = player.bullets.length - 1; i >= 0; i--) {
        player.bullets[i].y -= bulletSpeed;
        if (player.bullets[i].y < 0) {
            player.bullets.splice(i, 1);
        }
    }
}

function updateEnemies() {
    if (Math.random() < 0.02) {
        enemies.push(createEnemy());
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemies[i].speed;

        // Check collision with bullets
        for (let j = player.bullets.length - 1; j >= 0; j--) {
            if (checkCollision(player.bullets[j], enemies[i])) {
                score += 10;
                document.getElementById('score').textContent = score;
                enemies.splice(i, 1);
                player.bullets.splice(j, 1);
                break;
            }
        }

        // Check collision with player
        if (enemies[i] && checkCollision(player, enemies[i])) {
            if (player.powerUp === 'shield') {
                player.powerUp = null;
                enemies.splice(i, 1);
            } else {
                lives--;
                document.getElementById('lives').textContent = lives;
                enemies.splice(i, 1);
                if (lives <= 0) {
                    gameOver();
                }
            }
        }

        // Remove off-screen enemies
        if (enemies[i] && enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
        }
    }
}

function updatePowerUps() {
    if (Math.random() < 0.001) {
        powerUps.push(createPowerUp());
    }

    for (let i = powerUps.length - 1; i >= 0; i--) {
        powerUps[i].y += powerUps[i].speed;

        // Check collision with player
        if (checkCollision(player, powerUps[i])) {
            activatePowerUp(powerUps[i].type);
            powerUps.splice(i, 1);
        }

        // Remove off-screen power-ups
        if (powerUps[i] && powerUps[i].y > canvas.height) {
            powerUps.splice(i, 1);
        }
    }

    // Update power-up timer
    if (player.powerUp && player.powerUpTimer > 0) {
        player.powerUpTimer--;
        if (player.powerUpTimer <= 0) {
            player.powerUp = null;
            shootingDelay = 500;
        }
    }
}

function activatePowerUp(type) {
    player.powerUp = type;
    player.powerUpTimer = 300; // 5 seconds at 60fps

    const powerUpElement = document.getElementById('powerUp');
    const powerUpText = document.getElementById('powerUpText');
    
    switch (type) {
        case 'rapidFire':
            shootingDelay = 150;
            powerUpText.textContent = 'Rapid Fire!';
            break;
        case 'shield':
            powerUpText.textContent = 'Shield Active!';
            break;
        case 'multiShot':
            powerUpText.textContent = 'Multi Shot!';
            break;
    }

    powerUpElement.style.display = 'block';
    setTimeout(() => {
        powerUpElement.style.display = 'none';
    }, 2000);
}

function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function shoot() {
    const now = Date.now();
    if (now - lastShot >= shootingDelay) {
        if (player.powerUp === 'multiShot') {
            player.bullets.push(
                { x: player.x + player.width / 2 - 2, y: player.y, width: 4, height: 10 },
                { x: player.x + player.width / 2 - 12, y: player.y, width: 4, height: 10 },
                { x: player.x + player.width / 2 + 8, y: player.y, width: 4, height: 10 }
            );
        } else {
            player.bullets.push({
                x: player.x + player.width / 2 - 2,
                y: player.y,
                width: 4,
                height: 10
            });
        }
        lastShot = now;
    }
}

function updateGame() {
    if (isPaused || isGameOver) return;

    // Move player
    if (keys.ArrowLeft) player.x = Math.max(0, player.x - player.speed);
    if (keys.ArrowRight) player.x = Math.min(canvas.width - player.width, player.x + player.speed);
    if (keys.ArrowUp) player.y = Math.max(0, player.y - player.speed);
    if (keys.ArrowDown) player.y = Math.min(canvas.height - player.height, player.y + player.speed);
    if (keys.Space) shoot();

    updateBullets();
    updateEnemies();
    updatePowerUps();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawPowerUps();
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameLoop);
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('spaceShooterHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
}

function startGame() {
    // Reset game state
    player.x = canvas.width / 2;
    player.y = canvas.height - 50;
    player.bullets = [];
    player.powerUp = null;
    player.powerUpTimer = 0;
    enemies.length = 0;
    powerUps.length = 0;
    score = 0;
    lives = 3;
    isPaused = false;
    isGameOver = false;
    shootingDelay = 500;
    
    document.getElementById('score').textContent = '0';
    document.getElementById('lives').textContent = '3';
    document.getElementById('highScore').textContent = highScore;
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('powerUp').style.display = 'none';
    
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(() => {
        updateGame();
        draw();
    }, 1000 / 60);
}

function togglePause() {
    isPaused = !isPaused;
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') keys.ArrowLeft = true;
    if (e.code === 'ArrowRight') keys.ArrowRight = true;
    if (e.code === 'ArrowUp') keys.ArrowUp = true;
    if (e.code === 'ArrowDown') keys.ArrowDown = true;
    if (e.code === 'Space') {
        e.preventDefault();
        keys.Space = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') keys.ArrowLeft = false;
    if (e.code === 'ArrowRight') keys.ArrowRight = false;
    if (e.code === 'ArrowUp') keys.ArrowUp = false;
    if (e.code === 'ArrowDown') keys.ArrowDown = false;
    if (e.code === 'Space') keys.Space = false;
});

// Start the game
startGame(); 
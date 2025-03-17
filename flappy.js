const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const bird = {
    x: canvas.width / 4,
    y: canvas.height / 2,
    width: 40,
    height: 30,
    gravity: 0.5,
    velocity: 0,
    jumpForce: -10
};

const pipes = [];
const pipeWidth = 60;
const pipeGap = 150;
const pipeSpawnInterval = 1500;

let score = 0;
let highScore = localStorage.getItem('flappyHighScore') || 0;
let gameLoop;
let lastPipeSpawn = 0;
let isGameOver = false;

// Bird sprite
const birdImg = new Image();
birdImg.src = 'data:image/svg+xml,' + encodeURIComponent(`
    <svg width="40" height="30" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="20" cy="15" rx="18" ry="13" fill="#FFD700"/>
        <circle cx="28" cy="12" r="3" fill="black"/>
        <path d="M 32,15 L 38,12 L 32,18" fill="#FFA500"/>
        <path d="M 15,18 L 25,18 L 20,22 Z" fill="#FFA500"/>
    </svg>
`);

function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const height = Math.random() * (maxHeight - minHeight) + minHeight;
    
    pipes.push({
        x: canvas.width,
        y: 0,
        width: pipeWidth,
        height: height,
        passed: false
    });
    
    pipes.push({
        x: canvas.width,
        y: height + pipeGap,
        width: pipeWidth,
        height: canvas.height - height - pipeGap
    });
}

function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(Math.min(Math.max(bird.velocity * 0.04, -0.5), 0.5));
    ctx.drawImage(birdImg, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
    ctx.restore();
}

function drawPipes() {
    pipes.forEach(pipe => {
        ctx.fillStyle = '#2ECC71';
        ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
        ctx.strokeStyle = '#27AE60';
        ctx.strokeRect(pipe.x, pipe.y, pipe.width, pipe.height);
    });
}

function drawBackground() {
    // Sky
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    
    // Grass
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 10);
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    const scoreText = score.toString();
    ctx.strokeText(scoreText, canvas.width / 2, 50);
    ctx.fillText(scoreText, canvas.width / 2, 50);
}

function checkCollision(pipe) {
    return bird.x < pipe.x + pipe.width &&
           bird.x + bird.width > pipe.x &&
           bird.y < pipe.y + pipe.height &&
           bird.y + bird.height > pipe.y;
}

function updateGame() {
    if (isGameOver) return;

    // Bird physics
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Create new pipes
    if (Date.now() - lastPipeSpawn > pipeSpawnInterval) {
        createPipe();
        lastPipeSpawn = Date.now();
    }

    // Update pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 3;

        // Remove off-screen pipes
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
            continue;
        }

        // Check for scoring
        if (!pipes[i].passed && pipes[i].x + pipeWidth < bird.x) {
            pipes[i].passed = true;
            if (i % 2 === 0) { // Only count score once per pipe pair
                score++;
                document.getElementById('score').textContent = score;
            }
        }

        // Check for collisions
        if (checkCollision(pipes[i])) {
            gameOver();
            return;
        }
    }

    // Check for ground/ceiling collision
    if (bird.y + bird.height > canvas.height - 50 || bird.y < 0) {
        gameOver();
        return;
    }
}

function draw() {
    drawBackground();
    drawPipes();
    drawBird();
    drawScore();
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameLoop);
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('flappyHighScore', highScore);
    }
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('highScore').textContent = highScore;
    document.getElementById('gameOver').style.display = 'block';
}

function startGame() {
    // Reset game state
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    document.getElementById('score').textContent = '0';
    document.getElementById('gameOver').style.display = 'none';
    lastPipeSpawn = Date.now();
    isGameOver = false;

    // Start game loop
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(() => {
        updateGame();
        draw();
    }, 1000 / 60);
}

function jump() {
    if (!isGameOver) {
        bird.velocity = bird.jumpForce;
    }
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        jump();
        if (isGameOver) startGame();
    }
});

canvas.addEventListener('click', () => {
    jump();
    if (isGameOver) startGame();
});

// Start the game when the image is loaded
birdImg.onload = startGame; 
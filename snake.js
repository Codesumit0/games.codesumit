const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 20;
const GRID_COUNT = canvas.width / GRID_SIZE;

let snake = [];
let food = {};
let direction = 'right';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop;
let isPaused = false;
let gameSpeed = 100;

document.getElementById('highScore').textContent = highScore;

function startGame() {
    // Reset game state
    snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 }
    ];
    direction = 'right';
    score = 0;
    document.getElementById('score').textContent = score;
    document.getElementById('gameOver').style.display = 'none';
    isPaused = false;
    
    // Generate initial food
    generateFood();
    
    // Clear previous game loop if exists
    if (gameLoop) clearInterval(gameLoop);
    
    // Start game loop
    gameLoop = setInterval(update, gameSpeed);
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * GRID_COUNT),
        y: Math.floor(Math.random() * GRID_COUNT)
    };
    
    // Make sure food doesn't spawn on snake
    while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        food = {
            x: Math.floor(Math.random() * GRID_COUNT),
            y: Math.floor(Math.random() * GRID_COUNT)
        };
    }
}

function update() {
    if (isPaused) return;
    
    // Move snake
    const head = { ...snake[0] };
    
    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }
    
    // Check for collisions
    if (head.x < 0 || head.x >= GRID_COUNT || 
        head.y < 0 || head.y >= GRID_COUNT ||
        snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    // Add new head
    snake.unshift(head);
    
    // Check if food is eaten
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('score').textContent = score;
        generateFood();
        
        // Increase speed every 50 points
        if (score % 50 === 0) {
            clearInterval(gameLoop);
            gameSpeed = Math.max(50, gameSpeed - 10);
            gameLoop = setInterval(update, gameSpeed);
        }
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
    
    // Draw everything
    draw();
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#4CAF50' : '#388E3C';
        ctx.fillRect(
            segment.x * GRID_SIZE,
            segment.y * GRID_SIZE,
            GRID_SIZE - 1,
            GRID_SIZE - 1
        );
    });
    
    // Draw food
    ctx.fillStyle = '#f44336';
    ctx.fillRect(
        food.x * GRID_SIZE,
        food.y * GRID_SIZE,
        GRID_SIZE - 1,
        GRID_SIZE - 1
    );
}

function gameOver() {
    clearInterval(gameLoop);
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
}

function togglePause() {
    isPaused = !isPaused;
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            if (direction !== 'down') direction = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') direction = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') direction = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') direction = 'right';
            break;
        case ' ':
            togglePause();
            break;
    }
});

// Touch controls for mobile
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
});

canvas.addEventListener('touchmove', (e) => {
    if (!touchStartX || !touchStartY) return;

    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0 && direction !== 'left') direction = 'right';
        else if (deltaX < 0 && direction !== 'right') direction = 'left';
    } else {
        if (deltaY > 0 && direction !== 'up') direction = 'down';
        else if (deltaY < 0 && direction !== 'down') direction = 'up';
    }

    touchStartX = touchEndX;
    touchStartY = touchEndY;
    e.preventDefault();
});

// Start game when page loads
startGame(); 
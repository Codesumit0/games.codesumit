const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const ball = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    dx: 5,
    dy: -5,
    radius: 10,
    color: '#ffffff'
};

const paddle = {
    width: 100,
    height: 10,
    x: canvas.width / 2 - 50,
    y: canvas.height - 20,
    dx: 8,
    color: '#2196F3'
};

const brickRowCount = 5;
const brickColumnCount = 9;
const brickWidth = 80;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 60;
const brickOffsetLeft = 35;

const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

let score = 0;
let lives = 3;
let gameLoop;
let isPaused = false;
let isGameStarted = false;

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.fillStyle = paddle.color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                
                ctx.fillStyle = `hsl(${(c * r * 10) % 360}, 70%, 50%)`;
                ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
                ctx.strokeStyle = '#000';
                ctx.strokeRect(brickX, brickY, brickWidth, brickHeight);
            }
        }
    }
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (ball.x > b.x && 
                    ball.x < b.x + brickWidth && 
                    ball.y > b.y && 
                    ball.y < b.y + brickHeight) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score += 10;
                    document.getElementById('score').textContent = score;
                    
                    if (score === brickRowCount * brickColumnCount * 10) {
                        gameWon();
                    }
                }
            }
        }
    }
}

function movePaddle() {
    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += paddle.dx;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= paddle.dx;
    }
}

function moveBall() {
    if (!isGameStarted) {
        ball.x = paddle.x + paddle.width / 2;
        ball.y = canvas.height - 30;
        return;
    }

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    // Paddle collision
    if (ball.y + ball.radius > canvas.height - paddle.height) {
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            // Calculate angle of reflection based on where ball hits paddle
            const hitPoint = (ball.x - (paddle.x + paddle.width/2)) / (paddle.width/2);
            ball.dx = hitPoint * 8;
            ball.dy = -ball.dy;
        } else if (ball.y + ball.radius > canvas.height) {
            lives--;
            document.getElementById('lives').textContent = lives;
            if (lives === 0) {
                gameOver();
            } else {
                isGameStarted = false;
                ball.dx = 5;
                ball.dy = -5;
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
}

function update() {
    if (!isPaused) {
        movePaddle();
        moveBall();
        collisionDetection();
        draw();
    }
}

function gameOver() {
    clearInterval(gameLoop);
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
}

function gameWon() {
    clearInterval(gameLoop);
    document.getElementById('gameOver').querySelector('h2').textContent = 'Congratulations!';
    document.getElementById('gameOver').style.display = 'block';
}

function startGame() {
    // Reset game state
    score = 0;
    lives = 3;
    isGameStarted = false;
    document.getElementById('score').textContent = '0';
    document.getElementById('lives').textContent = '3';
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('gameOver').querySelector('h2').textContent = 'Game Over!';
    
    // Reset ball and paddle
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 30;
    ball.dx = 5;
    ball.dy = -5;
    paddle.x = canvas.width / 2 - paddle.width / 2;
    
    // Reset bricks
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r].status = 1;
        }
    }
    
    isPaused = false;
    
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, 1000/60);
}

function togglePause() {
    isPaused = !isPaused;
}

// Keyboard controls
let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (e.key === ' ' && !isGameStarted) {
        isGameStarted = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
});

// Mouse/Touch controls
canvas.addEventListener('mousemove', (e) => {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;
    }
});

canvas.addEventListener('touchmove', (e) => {
    const relativeX = e.touches[0].clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;
    }
    e.preventDefault();
});

canvas.addEventListener('click', () => {
    if (!isGameStarted) {
        isGameStarted = true;
    }
});

// Start game
startGame(); 
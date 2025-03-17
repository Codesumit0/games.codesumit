const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speed: 7,
    dx: 5,
    dy: 5,
    color: '#ffffff'
};

const paddleHeight = 100;
const paddleWidth = 10;
const paddle1 = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 8,
    color: '#2196F3'
};

const paddle2 = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 8,
    color: '#2196F3'
};

let player1Score = 0;
let player2Score = 0;
let isPaused = false;
let gameLoop;

// Key states
const keys = {
    w: false,
    s: false,
    ArrowUp: false,
    ArrowDown: false
};

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

function drawPaddle(paddle) {
    ctx.fillStyle = paddle.color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawScore() {
    ctx.font = '48px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(player1Score, canvas.width / 4, 50);
    ctx.fillText(player2Score, 3 * canvas.width / 4, 50);
}

function drawCenterLine() {
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.setLineDash([]);
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = -ball.dx;
    ball.dy = Math.random() * 10 - 5;
}

function movePaddles() {
    // Paddle 1 (W/S keys)
    if (keys.w && paddle1.y > 0) {
        paddle1.y -= paddle1.dy;
    }
    if (keys.s && paddle1.y + paddle1.height < canvas.height) {
        paddle1.y += paddle1.dy;
    }

    // Paddle 2 (Arrow keys)
    if (keys.ArrowUp && paddle2.y > 0) {
        paddle2.y -= paddle2.dy;
    }
    if (keys.ArrowDown && paddle2.y + paddle2.height < canvas.height) {
        paddle2.y += paddle2.dy;
    }
}

function checkCollision(paddle) {
    return ball.y + ball.radius > paddle.y &&
           ball.y - ball.radius < paddle.y + paddle.height &&
           ball.x + ball.radius > paddle.x &&
           ball.x - ball.radius < paddle.x + paddle.width;
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top and bottom collision
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    // Paddle collision
    if (checkCollision(paddle1)) {
        ball.dx = Math.abs(ball.dx) * 1.1; // Increase speed
        ball.dy = (ball.y - (paddle1.y + paddle1.height / 2)) * 0.2;
    }
    if (checkCollision(paddle2)) {
        ball.dx = -Math.abs(ball.dx) * 1.1; // Increase speed
        ball.dy = (ball.y - (paddle2.y + paddle2.height / 2)) * 0.2;
    }

    // Scoring
    if (ball.x + ball.radius > canvas.width) {
        player1Score++;
        document.getElementById('player1Score').textContent = player1Score;
        if (player1Score >= 5) gameOver('Player 1');
        resetBall();
    }
    if (ball.x - ball.radius < 0) {
        player2Score++;
        document.getElementById('player2Score').textContent = player2Score;
        if (player2Score >= 5) gameOver('Player 2');
        resetBall();
    }
}

function gameOver(winner) {
    clearInterval(gameLoop);
    document.getElementById('winner').textContent = `${winner} wins!`;
    document.getElementById('gameOver').style.display = 'block';
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawCenterLine();
    drawBall();
    drawPaddle(paddle1);
    drawPaddle(paddle2);
    drawScore();
}

function update() {
    if (!isPaused) {
        movePaddles();
        moveBall();
        draw();
    }
}

function startGame() {
    // Reset game state
    player1Score = 0;
    player2Score = 0;
    document.getElementById('player1Score').textContent = '0';
    document.getElementById('player2Score').textContent = '0';
    document.getElementById('gameOver').style.display = 'none';
    
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 5;
    ball.dy = 5;
    
    paddle1.y = canvas.height / 2 - paddleHeight / 2;
    paddle2.y = canvas.height / 2 - paddleHeight / 2;
    
    isPaused = false;
    
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, 1000/60);
}

function togglePause() {
    isPaused = !isPaused;
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.key in keys) {
        keys[e.key] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key in keys) {
        keys[e.key] = false;
    }
});

// Start game when page loads
startGame(); 
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');

const BLOCK_SIZE = 30;
const ROWS = 20;
const COLS = 10;
const COLORS = [
    null,
    '#FF0D72', // I
    '#0DC2FF', // J
    '#0DFF72', // L
    '#F538FF', // O
    '#FF8E0D', // S
    '#FFE138', // T
    '#FF0D72'  // Z
];

const SHAPES = [
    [],
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
    [[2, 0, 0], [2, 2, 2], [0, 0, 0]], // J
    [[0, 0, 3], [3, 3, 3], [0, 0, 0]], // L
    [[4, 4], [4, 4]], // O
    [[0, 5, 5], [5, 5, 0], [0, 0, 0]], // S
    [[0, 6, 0], [6, 6, 6], [0, 0, 0]], // T
    [[7, 7, 0], [0, 7, 7], [0, 0, 0]] // Z
];

let board = createBoard();
let piece = null;
let nextPiece = null;
let score = 0;
let lines = 0;
let level = 1;
let gameLoop;
let isPaused = false;

function createBoard() {
    return Array(ROWS).fill().map(() => Array(COLS).fill(0));
}

function drawBlock(x, y, color, ctx = canvas.getContext('2d'), size = BLOCK_SIZE) {
    ctx.fillStyle = color;
    ctx.fillRect(x * size, y * size, size, size);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(x * size, y * size, size, size);
}

function drawBoard() {
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value > 0) {
                drawBlock(x, y, COLORS[value]);
            }
        });
    });
}

function drawPiece(piece, offset = {x: 0, y: 0}, ctx = canvas.getContext('2d'), size = BLOCK_SIZE) {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value > 0) {
                drawBlock(x + piece.pos.x + offset.x, y + piece.pos.y + offset.y, COLORS[value], ctx, size);
            }
        });
    });
}

function createPiece(type) {
    return {
        shape: SHAPES[type],
        pos: {
            x: Math.floor(COLS / 2) - Math.floor(SHAPES[type][0].length / 2),
            y: 0
        }
    };
}

function collide(board, piece) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x] !== 0 &&
                (board[y + piece.pos.y] &&
                board[y + piece.pos.y][x + piece.pos.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(board, piece) {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[y + piece.pos.y][x + piece.pos.x] = value;
            }
        });
    });
}

function rotate(piece) {
    const newShape = piece.shape[0].map((_, i) =>
        piece.shape.map(row => row[i]).reverse()
    );
    const previousShape = piece.shape;
    piece.shape = newShape;
    if (collide(board, piece)) {
        piece.shape = previousShape;
    }
}

function moveDown() {
    piece.pos.y++;
    if (collide(board, piece)) {
        piece.pos.y--;
        merge(board, piece);
        clearLines();
        piece = nextPiece;
        nextPiece = createPiece(Math.floor(Math.random() * 7) + 1);
        if (collide(board, piece)) {
            gameOver();
        }
        updateScore(10);
    }
}

function moveHorizontally(dir) {
    piece.pos.x += dir;
    if (collide(board, piece)) {
        piece.pos.x -= dir;
    }
}

function hardDrop() {
    while (!collide(board, piece)) {
        piece.pos.y++;
    }
    piece.pos.y--;
    merge(board, piece);
    clearLines();
    piece = nextPiece;
    nextPiece = createPiece(Math.floor(Math.random() * 7) + 1);
    if (collide(board, piece)) {
        gameOver();
    }
    updateScore(50);
}

function clearLines() {
    let linesCleared = 0;
    outer: for (let y = board.length - 1; y >= 0; y--) {
        for (let x = 0; x < board[y].length; x++) {
            if (board[y][x] === 0) {
                continue outer;
            }
        }
        const row = board.splice(y, 1)[0].fill(0);
        board.unshift(row);
        linesCleared++;
        y++;
    }
    if (linesCleared > 0) {
        lines += linesCleared;
        document.getElementById('lines').textContent = lines;
        level = Math.floor(lines / 10) + 1;
        document.getElementById('level').textContent = level;
        updateScore(linesCleared * 100 * level);
        clearInterval(gameLoop);
        gameLoop = setInterval(update, 1000 - (level * 50));
    }
}

function updateScore(points) {
    score += points;
    document.getElementById('score').textContent = score;
}

function drawNext() {
    nextCtx.fillStyle = '#1a1a1a';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    const size = 30;
    const offset = {
        x: Math.floor((nextCanvas.width / size - nextPiece.shape[0].length) / 2),
        y: Math.floor((nextCanvas.height / size - nextPiece.shape.length) / 2)
    };
    drawPiece(nextPiece, offset, nextCtx, size);
}

function draw() {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawPiece(piece);
    drawNext();
}

function update() {
    if (!isPaused) {
        moveDown();
        draw();
    }
}

function gameOver() {
    clearInterval(gameLoop);
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
}

function startGame() {
    board = createBoard();
    score = 0;
    lines = 0;
    level = 1;
    document.getElementById('score').textContent = '0';
    document.getElementById('lines').textContent = '0';
    document.getElementById('level').textContent = '1';
    document.getElementById('gameOver').style.display = 'none';
    piece = createPiece(Math.floor(Math.random() * 7) + 1);
    nextPiece = createPiece(Math.floor(Math.random() * 7) + 1);
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, 1000);
    isPaused = false;
    draw();
}

function togglePause() {
    isPaused = !isPaused;
}

document.addEventListener('keydown', event => {
    if (!isPaused) {
        switch (event.keyCode) {
            case 37: // Left
                moveHorizontally(-1);
                break;
            case 39: // Right
                moveHorizontally(1);
                break;
            case 40: // Down
                moveDown();
                break;
            case 38: // Up
                rotate(piece);
                break;
            case 32: // Space
                hardDrop();
                break;
        }
        draw();
    }
});

startGame(); 
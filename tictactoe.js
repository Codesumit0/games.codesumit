const board = document.getElementById('board');
const cells = document.querySelectorAll('[data-cell]');
const status = document.getElementById('status');
const scoreX = document.getElementById('scoreX');
const scoreO = document.getElementById('scoreO');
const scoreTie = document.getElementById('scoreTie');

let currentPlayer = 'x';
let gameActive = true;
let gameState = ['', '', '', '', '', '', '', '', ''];
let scores = {
    x: parseInt(localStorage.getItem('tictactoeScoreX')) || 0,
    o: parseInt(localStorage.getItem('tictactoeScoreO')) || 0,
    tie: parseInt(localStorage.getItem('tictactoeScoreTie')) || 0
};

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

updateScores();

function handleCellClick(e) {
    const cell = e.target;
    const cellIndex = Array.from(cells).indexOf(cell);

    if (gameState[cellIndex] !== '' || !gameActive) return;

    gameState[cellIndex] = currentPlayer;
    cell.textContent = currentPlayer.toUpperCase();
    cell.classList.add(currentPlayer);

    if (checkWin()) {
        gameActive = false;
        status.textContent = `${currentPlayer.toUpperCase()} wins!`;
        scores[currentPlayer]++;
        localStorage.setItem(`tictactoeScore${currentPlayer.toUpperCase()}`, scores[currentPlayer]);
        updateScores();
        animateWin();
        return;
    }

    if (checkDraw()) {
        gameActive = false;
        status.textContent = 'Draw!';
        scores.tie++;
        localStorage.setItem('tictactoeScoreTie', scores.tie);
        updateScores();
        return;
    }

    currentPlayer = currentPlayer === 'x' ? 'o' : 'x';
    status.textContent = `${currentPlayer.toUpperCase()}'s turn`;
}

function checkWin() {
    return winningConditions.some(condition => {
        return condition.every(index => {
            return gameState[index] === currentPlayer;
        });
    });
}

function checkDraw() {
    return gameState.every(cell => cell !== '');
}

function resetGame() {
    currentPlayer = 'x';
    gameActive = true;
    gameState = ['', '', '', '', '', '', '', '', ''];
    status.textContent = `${currentPlayer.toUpperCase()}'s turn`;
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'win');
    });
}

function resetScores() {
    scores = { x: 0, o: 0, tie: 0 };
    localStorage.setItem('tictactoeScoreX', 0);
    localStorage.setItem('tictactoeScoreO', 0);
    localStorage.setItem('tictactoeScoreTie', 0);
    updateScores();
}

function updateScores() {
    scoreX.textContent = scores.x;
    scoreO.textContent = scores.o;
    scoreTie.textContent = scores.tie;
}

function animateWin() {
    const winningCombination = winningConditions.find(condition => {
        return condition.every(index => gameState[index] === currentPlayer);
    });

    if (winningCombination) {
        winningCombination.forEach(index => {
            cells[index].classList.add('win');
        });
    }
}

// Add hover effect
function handleCellHover(e) {
    const cell = e.target;
    if (cell.textContent === '' && gameActive) {
        cell.textContent = currentPlayer.toUpperCase();
        cell.style.opacity = '0.5';
    }
}

function handleCellLeave(e) {
    const cell = e.target;
    if (cell.style.opacity === '0.5') {
        cell.textContent = '';
        cell.style.opacity = '1';
    }
}

// Event listeners
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
    cell.addEventListener('mouseenter', handleCellHover);
    cell.addEventListener('mouseleave', handleCellLeave);
}); 
const targetColorDiv = document.getElementById('targetColor');
const optionsDiv = document.getElementById('options');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const timerElement = document.getElementById('timer');
const progressElement = document.getElementById('progress');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

let score = 0;
let highScore = parseInt(localStorage.getItem('colorMatchHighScore')) || 0;
let timeLeft = 5.0;
let gameLoop;
let timerLoop;

const colors = [
    { name: 'Red', base: '#ff0000' },
    { name: 'Blue', base: '#0000ff' },
    { name: 'Green', base: '#00ff00' },
    { name: 'Yellow', base: '#ffff00' },
    { name: 'Purple', base: '#800080' },
    { name: 'Orange', base: '#ffa500' },
    { name: 'Pink', base: '#ff69b4' },
    { name: 'Cyan', base: '#00ffff' }
];

function generateColor() {
    const baseColor = colors[Math.floor(Math.random() * colors.length)];
    const variation = Math.random() * 30 - 15;
    const r = Math.min(255, Math.max(0, parseInt(baseColor.base.slice(1, 3), 16) + variation));
    const g = Math.min(255, Math.max(0, parseInt(baseColor.base.slice(3, 5), 16) + variation));
    const b = Math.min(255, Math.max(0, parseInt(baseColor.base.slice(5, 7), 16) + variation));
    return `rgb(${r}, ${g}, ${b})`;
}

function createOptions() {
    const targetColor = generateColor();
    targetColorDiv.style.backgroundColor = targetColor;
    
    const options = [targetColor];
    while (options.length < 4) {
        const newColor = generateColor();
        if (!options.includes(newColor)) {
            options.push(newColor);
        }
    }
    
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    
    optionsDiv.innerHTML = '';
    options.forEach(color => {
        const button = document.createElement('button');
        button.className = 'color-option';
        button.style.backgroundColor = color;
        button.onclick = () => checkAnswer(color, targetColor);
        optionsDiv.appendChild(button);
    });
}

function checkAnswer(selected, target) {
    if (selected === target) {
        score++;
        scoreElement.textContent = score;
        timeLeft = Math.min(timeLeft + 1, 5.0);
        createOptions();
    } else {
        gameOver();
    }
}

function updateTimer() {
    timeLeft = Math.max(0, timeLeft - 0.1);
    timerElement.textContent = timeLeft.toFixed(1);
    progressElement.style.width = `${(timeLeft / 5) * 100}%`;
    
    if (timeLeft <= 0) {
        gameOver();
    }
}

function gameOver() {
    clearInterval(gameLoop);
    clearInterval(timerLoop);
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('colorMatchHighScore', highScore);
        highScoreElement.textContent = highScore;
    }
    
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
}

function startGame() {
    score = 0;
    timeLeft = 5.0;
    scoreElement.textContent = '0';
    highScoreElement.textContent = highScore;
    gameOverElement.style.display = 'none';
    
    createOptions();
    
    if (gameLoop) clearInterval(gameLoop);
    if (timerLoop) clearInterval(timerLoop);
    
    gameLoop = setInterval(updateTimer, 100);
}

// Initialize game
startGame(); 
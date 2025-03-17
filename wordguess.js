const wordDisplay = document.getElementById('wordDisplay');
const keyboard = document.getElementById('keyboard');
const guessesElement = document.getElementById('guesses');
const winsElement = document.getElementById('wins');
const gameOverElement = document.getElementById('gameOver');
const solutionElement = document.getElementById('solution');
const categoryElement = document.getElementById('category');
const canvas = document.getElementById('hangman');
const ctx = canvas.getContext('2d');

const categories = {
    Animals: ['ELEPHANT', 'GIRAFFE', 'PENGUIN', 'DOLPHIN', 'KANGAROO', 'ZEBRA', 'LION', 'TIGER', 'MONKEY', 'PANDA'],
    Countries: ['JAPAN', 'BRAZIL', 'FRANCE', 'INDIA', 'CANADA', 'ITALY', 'SPAIN', 'EGYPT', 'CHINA', 'MEXICO'],
    Foods: ['PIZZA', 'BURGER', 'SUSHI', 'PASTA', 'TACO', 'SALAD', 'COOKIE', 'BREAD', 'CURRY', 'STEAK'],
    Sports: ['SOCCER', 'TENNIS', 'HOCKEY', 'BOXING', 'RUGBY', 'GOLF', 'CRICKET', 'SKIING', 'SURFING', 'CYCLING']
};

let currentWord = '';
let currentCategory = 'Animals';
let guessedLetters = new Set();
let remainingGuesses = 6;
let wins = parseInt(localStorage.getItem('wordGuessWins')) || 0;

function createKeyboard() {
    keyboard.innerHTML = '';
    for (let i = 65; i <= 90; i++) {
        const letter = String.fromCharCode(i);
        const button = document.createElement('button');
        button.textContent = letter;
        button.className = 'key';
        button.addEventListener('click', () => handleGuess(letter));
        keyboard.appendChild(button);
    }
}

function drawHangman() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    const parts = [
        // Base
        () => {
            ctx.beginPath();
            ctx.moveTo(40, 180);
            ctx.lineTo(160, 180);
            ctx.stroke();
        },
        // Vertical pole
        () => {
            ctx.beginPath();
            ctx.moveTo(100, 180);
            ctx.lineTo(100, 20);
            ctx.stroke();
        },
        // Horizontal beam
        () => {
            ctx.beginPath();
            ctx.moveTo(100, 20);
            ctx.lineTo(140, 20);
            ctx.stroke();
        },
        // Rope
        () => {
            ctx.beginPath();
            ctx.moveTo(140, 20);
            ctx.lineTo(140, 40);
            ctx.stroke();
        },
        // Head
        () => {
            ctx.beginPath();
            ctx.arc(140, 55, 15, 0, Math.PI * 2);
            ctx.stroke();
        },
        // Body
        () => {
            ctx.beginPath();
            ctx.moveTo(140, 70);
            ctx.lineTo(140, 120);
            ctx.stroke();
        },
        // Left arm
        () => {
            ctx.beginPath();
            ctx.moveTo(140, 80);
            ctx.lineTo(120, 100);
            ctx.stroke();
        },
        // Right arm
        () => {
            ctx.beginPath();
            ctx.moveTo(140, 80);
            ctx.lineTo(160, 100);
            ctx.stroke();
        },
        // Left leg
        () => {
            ctx.beginPath();
            ctx.moveTo(140, 120);
            ctx.lineTo(120, 150);
            ctx.stroke();
        },
        // Right leg
        () => {
            ctx.beginPath();
            ctx.moveTo(140, 120);
            ctx.lineTo(160, 150);
            ctx.stroke();
        }
    ];

    const partsToShow = 10 - remainingGuesses;
    for (let i = 0; i < partsToShow; i++) {
        if (parts[i]) parts[i]();
    }
}

function updateDisplay() {
    const display = currentWord
        .split('')
        .map(letter => guessedLetters.has(letter) ? letter : '_')
        .join(' ');
    wordDisplay.textContent = display;
    guessesElement.textContent = remainingGuesses;
    drawHangman();
}

function handleGuess(letter) {
    if (guessedLetters.has(letter)) return;

    const button = Array.from(keyboard.children).find(btn => btn.textContent === letter);
    guessedLetters.add(letter);
    
    if (currentWord.includes(letter)) {
        button.classList.add('correct');
        if (hasWon()) {
            wins++;
            localStorage.setItem('wordGuessWins', wins);
            winsElement.textContent = wins;
            gameOverElement.querySelector('h2').textContent = 'You Won!';
            gameOverElement.querySelector('h2').style.color = '#4CAF50';
            solutionElement.textContent = currentWord;
            gameOverElement.style.display = 'block';
        }
    } else {
        button.classList.add('wrong');
        remainingGuesses--;
        if (remainingGuesses === 0) {
            gameOverElement.querySelector('h2').textContent = 'Game Over!';
            gameOverElement.querySelector('h2').style.color = '#f44336';
            solutionElement.textContent = currentWord;
            gameOverElement.style.display = 'block';
        }
    }
    
    updateDisplay();
}

function hasWon() {
    return currentWord.split('').every(letter => guessedLetters.has(letter));
}

function changeCategory() {
    const categories = Object.keys(window.categories);
    const currentIndex = categories.indexOf(currentCategory);
    currentCategory = categories[(currentIndex + 1) % categories.length];
    categoryElement.textContent = `Category: ${currentCategory}`;
    startGame();
}

function startGame() {
    const words = categories[currentCategory];
    currentWord = words[Math.floor(Math.random() * words.length)];
    guessedLetters.clear();
    remainingGuesses = 6;
    gameOverElement.style.display = 'none';
    createKeyboard();
    updateDisplay();
    winsElement.textContent = wins;
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    const letter = e.key.toUpperCase();
    if (/^[A-Z]$/.test(letter)) {
        handleGuess(letter);
    }
});

// Initialize game
createKeyboard();
startGame(); 
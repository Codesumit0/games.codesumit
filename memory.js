const emojis = ['🎮', '🎲', '🎯', '🎨', '🎭', '🎪', '🎫', '🎬'];
const gameGrid = document.getElementById('memoryGrid');
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let gameStarted = false;
let gameTimer;
let seconds = 0;

// Create and shuffle cards
function createCards() {
    const cardPairs = [...emojis, ...emojis];
    return shuffle(cardPairs);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createCardElement(emoji, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = index;
    
    const front = document.createElement('div');
    front.className = 'card-front';
    front.innerHTML = '?';
    
    const back = document.createElement('div');
    back.className = 'card-back';
    back.innerHTML = emoji;
    
    card.appendChild(front);
    card.appendChild(back);
    
    card.addEventListener('click', () => flipCard(card, emoji));
    return card;
}

function flipCard(card, emoji) {
    if (flippedCards.length === 2 || card.classList.contains('flipped') || 
        card.classList.contains('matched')) return;

    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }

    card.classList.add('flipped');
    flippedCards.push({ card, emoji });

    if (flippedCards.length === 2) {
        moves++;
        document.getElementById('moves').textContent = moves;
        checkMatch();
    }
}

function checkMatch() {
    const [first, second] = flippedCards;
    const match = first.emoji === second.emoji;

    if (match) {
        first.card.classList.add('matched');
        second.card.classList.add('matched');
        matchedPairs++;

        if (matchedPairs === emojis.length) {
            gameOver();
        }
    } else {
        setTimeout(() => {
            first.card.classList.remove('flipped');
            second.card.classList.remove('flipped');
        }, 1000);
    }

    setTimeout(() => {
        flippedCards = [];
    }, 1000);
}

function startTimer() {
    gameTimer = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        document.getElementById('time').textContent = 
            `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function gameOver() {
    clearInterval(gameTimer);
    const finalTime = document.getElementById('time').textContent;
    document.getElementById('finalMoves').textContent = moves;
    document.getElementById('finalTime').textContent = finalTime;
    document.getElementById('gameOver').style.display = 'block';
}

function startGame() {
    // Reset game state
    gameGrid.innerHTML = '';
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    seconds = 0;
    gameStarted = false;
    document.getElementById('moves').textContent = '0';
    document.getElementById('time').textContent = '0:00';
    document.getElementById('gameOver').style.display = 'none';
    
    if (gameTimer) {
        clearInterval(gameTimer);
    }

    // Create and shuffle cards
    cards = createCards();
    
    // Add cards to grid
    cards.forEach((emoji, index) => {
        const card = createCardElement(emoji, index);
        gameGrid.appendChild(card);
    });
}

// Initialize game
startGame(); 
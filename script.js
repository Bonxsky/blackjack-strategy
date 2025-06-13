// Strategy data for 8-deck blackjack
const strategyData = {
    hard: {
        '8':  ['H','H','H','H','H','H','H','H','H','H'],
        '9':  ['H','D','D','D','D','H','H','H','H','H'],
        '10': ['D','D','D','D','D','D','D','D','H','H'],
        '11': ['D','D','D','D','D','D','D','D','D','D'],
        '12': ['H','H','S','S','S','H','H','H','H','H'],
        '13': ['S','S','S','S','S','H','H','H','H','H'],
        '14': ['S','S','S','S','S','H','H','H','H','H'],
        '15': ['S','S','S','S','S','H','H','H','H','H'],
        '16': ['S','S','S','S','S','H','H','H','H','H'],
        '17': ['S','S','S','S','S','S','S','S','S','S']
    },
    soft: {
        'A2': ['H','H','H','D','D','H','H','H','H','H'],
        'A3': ['H','H','H','D','D','H','H','H','H','H'],
        'A4': ['H','H','D','D','D','H','H','H','H','H'],
        'A5': ['H','H','D','D','D','H','H','H','H','H'],
        'A6': ['H','D','D','D','D','H','H','H','H','H'],
        'A7': ['S','Ds','Ds','Ds','Ds','S','S','H','H','H'],
        'A8': ['S','S','S','S','S','S','S','S','S','S'],
        'A9': ['S','S','S','S','S','S','S','S','S','S']
    },
    pairs: {
        '22': ['P','P','P','P','P','P','H','H','H','H'],
        '33': ['P','P','P','P','P','P','H','H','H','H'],
        '44': ['H','H','H','P','P','H','H','H','H','H'],
        '55': ['D','D','D','D','D','D','D','D','H','H'],
        '66': ['P','P','P','P','P','H','H','H','H','H'],
        '77': ['P','P','P','P','P','P','H','H','H','H'],
        '88': ['P','P','P','P','P','P','P','P','P','P'],
        '99': ['P','P','P','P','P','S','P','P','S','S'],
        'TT': ['S','S','S','S','S','S','S','S','S','S'],
        'AA': ['P','P','P','P','P','P','P','P','P','P']
    }
};

// Card values mapping
const cardValues = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, 
    '7': 7, '8': 8, '9': 9, '10': 10, 
    'J': 10, 'Q': 10, 'K': 10, 'A': 11
};

// Dealer card index mapping
const dealerIndex = {
    '2': 0, '3': 1, '4': 2, '5': 3, '6': 4,
    '7': 5, '8': 6, '9': 7, '10': 8, 'A': 9
};

// DOM elements
const dealerCardsContainer = document.getElementById('dealer-cards');
const playerCardsContainer = document.getElementById('player-cards');
const dealerCardDisplay = document.getElementById('selected-dealer-card');
const playerCard1Display = document.getElementById('player-card-1');
const playerCard2Display = document.getElementById('player-card-2');
const adviceResult = document.getElementById('advice-result');
const specialAdvice = document.getElementById('special-advice');
const actionDetails = document.getElementById('action-details');
const getAdviceBtn = document.getElementById('get-advice-btn');
const resetBtn = document.getElementById('reset-btn');

// Application state
let selectedDealerCard = null;
let selectedPlayerCards = [];

// Function to create card elements
function createCardElement(value, isDealer = false) {
    const card = document.createElement('div');
    card.className = 'card-option';
    card.textContent = value;
    card.dataset.value = value;
    
    // Randomize card color (red for hearts/diamonds, black for spades/clubs)
    const isRed = Math.random() > 0.5;
    if (isRed) {
        card.classList.add('red');
    }
    
    // Add event listener
    card.addEventListener('click', () => {
        if (isDealer) {
            // For dealer cards
            document.querySelectorAll('#dealer-cards .card-option').forEach(c => {
                c.classList.remove('selected');
            });
            card.classList.add('selected');
            selectedDealerCard = value;
            dealerCardDisplay.textContent = value;
        } else {
            // For player cards - allow duplicate selection
            if (selectedPlayerCards.length < 2) {
                // Add card to array
                selectedPlayerCards.push(value);
                
                // Update player card display
                if (selectedPlayerCards.length === 1) {
                    playerCard1Display.textContent = value;
                    playerCard1Display.className = `player-card-display ${isRed ? 'red' : ''}`;
                } else if (selectedPlayerCards.length === 2) {
                    playerCard2Display.textContent = value;
                    playerCard2Display.className = `player-card-display ${isRed ? 'red' : ''}`;
                }
            }
        }
    });
    
    return card;
}

// Initialize cards
function initializeCards() {
    // Dealer cards
    const dealerCards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];
    dealerCards.forEach(card => {
        dealerCardsContainer.appendChild(createCardElement(card, true));
    });
    
    // Player cards
    const playerCards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    playerCards.forEach(card => {
        playerCardsContainer.appendChild(createCardElement(card));
    });
}

// Get strategy advice
function getStrategyAdvice() {
    if (!selectedDealerCard) {
        adviceResult.textContent = "Select dealer card";
        adviceResult.className = "advice";
        specialAdvice.textContent = "";
        actionDetails.textContent = "Please select the dealer's visible card";
        return;
    }
    
    if (selectedPlayerCards.length !== 2) {
        adviceResult.textContent = "Select 2 cards";
        adviceResult.className = "advice";
        specialAdvice.textContent = "";
        actionDetails.textContent = "Please select your two starting cards";
        return;
    }

    const card1 = selectedPlayerCards[0];
    const card2 = selectedPlayerCards[1];
    const dealerCard = selectedDealerCard;
    const dealerIdx = dealerIndex[dealerCard];
    
    // Check for pair
    if (card1 === card2 || (cardValues[card1] === cardValues[card2] && card1 !== 'A')) {
        const pairKey = (card1 === '10' || card1 === 'J' || card1 === 'Q' || card1 === 'K') ? 'TT' : card1 + card2;
        if (strategyData.pairs[pairKey]) {
            const action = strategyData.pairs[pairKey][dealerIdx];
            displayAdvice(action, card1, card2, true);
            return;
        }
    }
    
    // Check for soft hand
    if (card1 === 'A' || card2 === 'A') {
        const nonAce = card1 === 'A' ? card2 : card1;
        const softKey = 'A' + (nonAce === '10' ? 'T' : nonAce);
        if (strategyData.soft[softKey]) {
            const action = strategyData.soft[softKey][dealerIdx];
            displayAdvice(action, card1, card2, false, true);
            return;
        }
    }
    
    // Hard hand
    const total = cardValues[card1] + cardValues[card2];
    let hardKey;
    
    if (total <= 8) hardKey = '8';
    else if (total >= 17) hardKey = '17';
    else hardKey = total.toString();
    
    if (strategyData.hard[hardKey]) {
        const action = strategyData.hard[hardKey][dealerIdx];
        displayAdvice(action, card1, card2);
    }
}

// Display advice
function displayAdvice(action, card1, card2, isPair = false, isSoft = false) {
    let adviceText = "";
    let adviceClass = "";
    let specialText = "";
    let details = "";
    
    switch(action) {
        case 'H':
            adviceText = "HIT";
            adviceClass = "hit";
            specialText = "Take another card";
            details = "Your hand value is still low or dealer has a strong card. Take another card to improve your hand.";
            break;
        case 'S':
            adviceText = "STAND";
            adviceClass = "stand";
            specialText = "Keep your current hand";
            details = "Your hand value is sufficient. Stand and let the dealer take the risk.";
            break;
        case 'D':
            adviceText = "DOUBLE";
            adviceClass = "double";
            specialText = "Double your bet";
            details = "You have a strong starting hand and dealer shows weakness. Double your bet to maximize potential gain.";
            break;
        case 'Ds':
            adviceText = "DOUBLE";
            adviceClass = "double";
            specialText = "Double if allowed, otherwise STAND";
            details = "If the rules allow, double your bet. If not, stand with your current hand.";
            break;
        case 'P':
            adviceText = "SPLIT";
            adviceClass = "split";
            specialText = "Split into two hands";
            details = "You have a pair with strong potential. Split to play two separate hands.";
            break;
    }
    
    adviceResult.textContent = adviceText;
    adviceResult.className = `advice ${adviceClass}`;
    
    // Additional advice for special situations
    if (isPair && action !== 'P') {
        specialText = "Do not split";
        details = "Although you have a pair, it's better not to split as the combined value is more advantageous.";
    } else if (isSoft && action === 'S') {
        specialText = "Soft hand - Stand with current value";
        details = "You have a soft hand (Ace counted as 11) with sufficient value. Stand to avoid bust risk.";
    }
    
    specialAdvice.textContent = specialText;
    actionDetails.textContent = details;
}

// Reset selection
function resetSelection() {
    // Reset dealer card
    document.querySelectorAll('#dealer-cards .card-option').forEach(card => {
        card.classList.remove('selected');
    });
    selectedDealerCard = null;
    dealerCardDisplay.textContent = "Not selected";
    
    // Reset player cards
    selectedPlayerCards = [];
    playerCard1Display.textContent = "?";
    playerCard1Display.className = "player-card-display";
    playerCard2Display.textContent = "?";
    playerCard2Display.className = "player-card-display";
    
    // Reset advice display
    adviceResult.textContent = "Select your cards";
    adviceResult.className = "advice";
    specialAdvice.textContent = "";
    actionDetails.textContent = "Select dealer's card and your cards to get strategy advice";
}

// Event listeners
getAdviceBtn.addEventListener('click', getStrategyAdvice);
resetBtn.addEventListener('click', resetSelection);

// Remove player cards on click
playerCard1Display.addEventListener('click', () => {
    if (selectedPlayerCards.length > 0) {
        selectedPlayerCards.shift();
        playerCard1Display.textContent = "?";
        playerCard1Display.className = "player-card-display";
        
        if (selectedPlayerCards.length === 1) {
            playerCard2Display.textContent = "?";
            playerCard2Display.className = "player-card-display";
        }
    }
});

playerCard2Display.addEventListener('click', () => {
    if (selectedPlayerCards.length > 1) {
        selectedPlayerCards.pop();
        playerCard2Display.textContent = "?";
        playerCard2Display.className = "player-card-display";
    }
});

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeCards();
    
    // Set example cards after a delay
    setTimeout(() => {
        // Select dealer example card (6)
        const dealerCards = document.querySelectorAll('#dealer-cards .card-option');
        if (dealerCards.length > 4) dealerCards[4].click(); // Index 4 is card 6
        
        // Select player example cards (10 and A)
        const playerCards = document.querySelectorAll('#player-cards .card-option');
        if (playerCards.length > 8) playerCards[8].click(); // 10
        if (playerCards.length > 12) playerCards[12].click(); // A
        
        // Show advice
        setTimeout(getStrategyAdvice, 500);
    }, 800);
});
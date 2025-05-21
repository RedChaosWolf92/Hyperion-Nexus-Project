/* Hyperion Nexus Text-Based Game Logic                                     */
/*                                                                          */
/* This script manages the UI, questions, choices, and game progression     */
/* for the Hyperion Nexus game.                                             */
/****************************************************************************/

// Import game state and core logic from gameState.js module
import { gameState, initializeGame, handleChoice, getTopCulturalPathways, downloadChoiceHistoryCSV } from './gameState.js';

// Import phase management functions from phaseManager.js module
import { 
    showSpeciesCreationQuestion,
    showSpeciesSummary,
    showStarshipCreationQuestion,
    showStarshipSummary,
    showRoleSelectionInitial,
    showKScaleEvent,
    showRoleChangeDecision,
    showGameEnd
} from './phaseManager.js';

// Import game data structures from gameData.js module
import {
    playerRoles,
    speciesCreationQuestions,
    starshipCreationQuestions,
    kScaleEvents
} from './gameData.js';

// Import UI management functions from uiManager.js module
import {
    clearGameUI,
    displayCurrentState,
    updateStatusBar,
    setupUIEventListeners,
    handleSavedGameRestoration
} from './uiManager.js';

// Log that the main game module is loading
console.log("Hyperion Nexus Game module loading");

// Make core functions available to the global scope for HTML event handlers
window.initializeGame = initializeGame;
window.handleChoice = handleChoice;
window.downloadChoiceHistoryCSV = downloadChoiceHistoryCSV;
window.getTopCulturalPathways = getTopCulturalPathways;

// Make phase management functions available to the global scope
window.showSpeciesCreationQuestion = showSpeciesCreationQuestion;
window.showSpeciesSummary = showSpeciesSummary;
window.showStarshipCreationQuestion = showStarshipCreationQuestion;
window.showStarshipSummary = showStarshipSummary;
window.showRoleSelectionInitial = showRoleSelectionInitial;
window.showKScaleEvent = showKScaleEvent;
window.showRoleChangeDecision = showRoleChangeDecision;
window.showGameEnd = showGameEnd;

// Make data structures available to the gameState module
window.playerRoles = playerRoles;
window.speciesCreationQuestions = speciesCreationQuestions;
window.starshipCreationQuestions = starshipCreationQuestions;
window.kScaleEvents = kScaleEvents;

// Make UI utility functions available to other modules
window.clearGameUI = clearGameUI;
window.displayCurrentState = () => displayCurrentState(window.gameState || gameState);
window.updateStatusBar = () => updateStatusBar(window.gameState || gameState, window.getTopCulturalPathways || getTopCulturalPathways);

// Make gameState available globally
window.gameState = gameState;

// Function to explicitly set up restart button
function setupRestartButton() {
    console.log("Setting up restart button");
    const restartButton = document.getElementById('restart-button');
    if (restartButton) {
        console.log("Restart button found, attaching direct handler");
        restartButton.onclick = function() {
            console.log("Restart button clicked (direct handler)");
            if (confirm("Are you sure you want to restart the game? All progress will be lost.")) {
                localStorage.removeItem('hyperionNexusGameState');
                window.initializeGame();
            }
        };
    } else {
        console.warn("Restart button not found for direct handler");
    }
}

// Initialize the game when the document is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded, initializing game");
    
    // Check for all required DOM elements
    const requiredElements = [
        'game-output', 'storyArea', 'choice-area', 'game-content', 
        'game-choices', 'restart-button', 'status-bar', 'results-area'
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    if (missingElements.length > 0) {
        console.error("Missing required DOM elements:", missingElements);
    } else {
        console.log("All required DOM elements found");
    }
    
    // Set up UI event listeners
    setupUIEventListeners(window.initializeGame || initializeGame);
    
    // Explicitly set up restart button
    setupRestartButton();
    
    // Check for saved game state in localStorage
    const gameRestored = handleSavedGameRestoration(
        window.gameState || gameState, 
        window.initializeGame || initializeGame, 
        window.showSpeciesCreationQuestion || showSpeciesCreationQuestion, 
        window.showSpeciesSummary || showSpeciesSummary, 
        window.showStarshipCreationQuestion || showStarshipCreationQuestion, 
        window.showStarshipSummary || showStarshipSummary, 
        window.showRoleSelectionInitial || showRoleSelectionInitial, 
        window.showKScaleEvent || showKScaleEvent, 
        window.showRoleChangeDecision || showRoleChangeDecision, 
        window.showGameEnd || showGameEnd
    );
    
    // Initialize new game if no saved game or user declined to restore
    if (!gameRestored) {
        console.log("No saved game restored, initializing new game");
        window.initializeGame();
    }
});

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log("DOM already loaded, initializing game with fallback");
    setTimeout(() => {
        // Check if game already initialized
        const gameOutput = document.getElementById("game-output");
        if (gameOutput && gameOutput.innerHTML.trim() === '') {
            console.log("Game not initialized, calling initializeGame via fallback");
            
            // Explicitly set up restart button
            setupRestartButton();
            
            // Set up UI event listeners if not already done
            if (typeof window.setupUIEventListeners === 'function') {
                window.setupUIEventListeners(window.initializeGame);
            } else {
                console.error("setupUIEventListeners not available in fallback");
            }
            
            // Initialize the game
            if (typeof window.initializeGame === 'function') {
                window.initializeGame();
            } else {
                console.error("initializeGame not available in fallback");
            }
        }
    }, 100);
}

console.log("Hyperion Nexus Game module loaded, global objects available:", {
    gameState: typeof window.gameState,
    initializeGame: typeof window.initializeGame,
    showSpeciesCreationQuestion: typeof window.showSpeciesCreationQuestion,
    displayCurrentState: typeof window.displayCurrentState
});

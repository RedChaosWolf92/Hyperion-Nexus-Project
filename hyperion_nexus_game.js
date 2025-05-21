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
window.displayCurrentState = () => displayCurrentState(gameState);
window.updateStatusBar = () => updateStatusBar(gameState, getTopCulturalPathways);

// Initialize the game when the document is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set up UI event listeners
    setupUIEventListeners(initializeGame);
    
    // Check for saved game state in localStorage
    const gameRestored = handleSavedGameRestoration(
        gameState, 
        initializeGame, 
        showSpeciesCreationQuestion, 
        showSpeciesSummary, 
        showStarshipCreationQuestion, 
        showStarshipSummary, 
        showRoleSelectionInitial, 
        showKScaleEvent, 
        showRoleChangeDecision, 
        showGameEnd
    );
    
    // Initialize new game if no saved game or user declined to restore
    if (!gameRestored) {
        initializeGame();
    }
});

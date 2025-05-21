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

// Initialize the game when the document is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check for saved game state in localStorage
    const savedState = localStorage.getItem('hyperionNexusGameState');
    if (savedState) {
        const restoreGame = confirm("A saved game was found. Would you like to restore your previous session?");
        if (restoreGame) {
            try {
                const parsedState = JSON.parse(savedState);
                Object.assign(gameState, parsedState);
                console.log("DEBUG: Game state restored from localStorage");
                
                // Update UI based on restored state
                document.getElementById('status-bar').textContent = `Year: ${gameState.gameYear} | K-Scale: ${gameState.kScale} | Role: ${gameState.playerRole}`;
                
                // Determine which phase to show based on restored state
                if (gameState.phase === 'species_creation') {
                    showSpeciesCreationQuestion(gameState.questionIndex);
                } else if (gameState.phase === 'species_summary') {
                    showSpeciesSummary();
                } else if (gameState.phase === 'starship_creation') {
                    showStarshipCreationQuestion(gameState.questionIndex);
                } else if (gameState.phase === 'starship_summary') {
                    showStarshipSummary();
                } else if (gameState.phase === 'role_selection') {
                    showRoleSelectionInitial();
                } else if (gameState.phase === 'k_scale_event') {
                    showKScaleEvent();
                } else if (gameState.phase === 'role_change_decision') {
                    showRoleChangeDecision();
                } else if (gameState.phase === 'game_end') {
                    showGameEnd();
                } else {
                    // Fallback to initialization if phase is unknown
                    initializeGame();
                }
                return;
            } catch (error) {
                console.error("Error restoring saved game:", error);
                alert("There was an error restoring your saved game. Starting a new game.");
            }
        } else {
            localStorage.removeItem('hyperionNexusGameState');
        }
    }
    
    // Initialize new game if no saved game or user declined to restore
    initializeGame();
});

// Add event listener for the restart button
document.addEventListener('click', (event) => {
    if (event.target.id === 'restart-button' || 
        (event.target.tagName === 'BUTTON' && event.target.textContent.includes('Restart Game'))) {
        if (confirm("Are you sure you want to restart the game? All progress will be lost.")) {
            localStorage.removeItem('hyperionNexusGameState');
            initializeGame();
        }
    }
});

// Function to clear the game UI
function clearGameUI() {
    document.getElementById('game-content').innerHTML = '';
    document.getElementById('game-choices').innerHTML = '';
}

// Function to display the current state in the debug console
function displayCurrentState() {
    console.log("DEBUG: Game State:", gameState);
    console.log(`DEBUG: Phase: ${gameState.phase}, QuestionIndex: ${gameState.questionIndex}, EventCounter: ${gameState.eventCounter}`);
}

// Function to update the status bar
function updateStatusBar() {
    const topPathways = getTopCulturalPathways();
    let pathwayText = topPathways.map(p => `${p.name} (${p.value})`).join(', ');
    document.getElementById('status-bar').textContent = `Year: ${gameState.gameYear} | K-Scale: ${gameState.kScale} | Role: ${gameState.playerRole} | Top Cultural Pathways: ${pathwayText}`;
}

// Make UI utility functions available to other modules
window.clearGameUI = clearGameUI;
window.displayCurrentState = displayCurrentState;
window.updateStatusBar = updateStatusBar;

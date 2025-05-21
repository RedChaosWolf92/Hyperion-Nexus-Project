/**
 * Hyperion Nexus UI Manager Module
 * 
 * This module contains all UI-related functions for managing the game interface,
 * including clearing UI elements, updating status displays, and handling DOM interactions.
 */

// Function to clear the game UI
export function clearGameUI() {
    document.getElementById('game-content').innerHTML = '';
    document.getElementById('game-choices').innerHTML = '';
}

// Function to display the current state in the debug console
export function displayCurrentState(gameState) {
    console.log("DEBUG: Game State:", gameState);
    console.log(`DEBUG: Phase: ${gameState.phase}, QuestionIndex: ${gameState.questionIndex}, EventCounter: ${gameState.eventCounter}`);
}

// Function to update the status bar
export function updateStatusBar(gameState, getTopCulturalPathways) {
    const topPathways = getTopCulturalPathways();
    let pathwayText = topPathways.map(p => `${p.name} (${p.value})`).join(', ');
    document.getElementById('status-bar').textContent = `Year: ${gameState.gameYear} | K-Scale: ${gameState.kScale} | Role: ${gameState.playerRole} | Top Cultural Pathways: ${pathwayText}`;
}

// Function to set up event listeners for UI interactions
export function setupUIEventListeners(initializeGame) {
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
}

// Function to handle saved game restoration
export function handleSavedGameRestoration(gameState, initializeGame, showSpeciesCreationQuestion, 
    showSpeciesSummary, showStarshipCreationQuestion, showStarshipSummary, 
    showRoleSelectionInitial, showKScaleEvent, showRoleChangeDecision, showGameEnd) {
    
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
                return true;
            } catch (error) {
                console.error("Error restoring saved game:", error);
                alert("There was an error restoring your saved game. Starting a new game.");
            }
        } else {
            localStorage.removeItem('hyperionNexusGameState');
        }
    }
    return false;
}

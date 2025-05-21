/**
 * Hyperion Nexus UI Manager Module
 * 
 * This module contains all UI-related functions for managing the game interface,
 * including clearing UI elements, updating status displays, and handling DOM interactions.
 */

// Function to clear the game UI
export function clearGameUI() {
    try {
        document.getElementById('game-content').innerHTML = '';
        document.getElementById('game-choices').innerHTML = '';
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'clearGameUI' });
            window.HyperionErrorHandling.displayErrorToUser("Error clearing game UI.", null, false);
        } else {
            console.error("Error in clearGameUI:", error);
        }
    }
}

// Function to display the current state in the debug console
export function displayCurrentState(gameState) {
    try {
        if (!gameState) {
            throw new Error("Game state is undefined or null");
        }
        console.log("DEBUG: Game State:", gameState);
        console.log(`DEBUG: Phase: ${gameState.gamePhase}, QuestionIndex: ${gameState.currentQuestionIndex}, EventCounter: ${gameState.eventCounter}`);
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'displayCurrentState' });
        } else {
            console.error("Error in displayCurrentState:", error);
        }
    }
}

// Function to update the status bar
export function updateStatusBar(gameState, getTopCulturalPathways) {
    try {
        if (!gameState || !getTopCulturalPathways) {
            throw new Error("Missing required parameters for updateStatusBar");
        }
        const topPathways = getTopCulturalPathways();
        let pathwayText = topPathways.map(p => `${p.name} (${p.value})`).join(', ');
        document.getElementById('status-bar').textContent = `Year: ${gameState.gameYear} | K-Scale: ${gameState.currentKScale} | Role: ${gameState.playerRole} | Top Cultural Pathways: ${pathwayText}`;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'updateStatusBar' });
            window.HyperionErrorHandling.displayErrorToUser("Error updating status bar.", null, false);
        } else {
            console.error("Error in updateStatusBar:", error);
        }
    }
}

// Function to set up event listeners for UI interactions
export function setupUIEventListeners(initializeGame) {
    try {
        if (!initializeGame) {
            throw new Error("Initialize game function is required");
        }
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
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'setupUIEventListeners' });
            window.HyperionErrorHandling.displayErrorToUser("Error setting up UI event listeners.", null, true);
        } else {
            console.error("Error in setupUIEventListeners:", error);
        }
    }
}

// Function to handle saved game restoration
export function handleSavedGameRestoration(gameState, initializeGame, showSpeciesCreationQuestion, 
    showSpeciesSummary, showStarshipCreationQuestion, showStarshipSummary, 
    showRoleSelectionInitial, showKScaleEvent, showRoleChangeDecision, showGameEnd) {
    
    try {
        if (!gameState || !initializeGame) {
            throw new Error("Required parameters missing for handleSavedGameRestoration");
        }
        
        const savedState = localStorage.getItem('hyperionNexusGameState');
        if (savedState) {
            const restoreGame = confirm("A saved game was found. Would you like to restore your previous session?");
            if (restoreGame) {
                try {
                    const parsedState = JSON.parse(savedState);
                    Object.assign(gameState, parsedState);
                    console.log("DEBUG: Game state restored from localStorage");
                    
                    // Update UI based on restored state
                    document.getElementById('status-bar').textContent = `Year: ${gameState.gameYear} | K-Scale: ${gameState.currentKScale} | Role: ${gameState.playerRole}`;
                    
                    // Determine which phase to show based on restored state
                    if (gameState.gamePhase === 'species_creation') {
                        showSpeciesCreationQuestion(gameState.currentQuestionIndex);
                    } else if (gameState.gamePhase === 'species_summary') {
                        showSpeciesSummary();
                    } else if (gameState.gamePhase === 'starship_creation') {
                        showStarshipCreationQuestion(gameState.currentQuestionIndex);
                    } else if (gameState.gamePhase === 'starship_summary') {
                        showStarshipSummary();
                    } else if (gameState.gamePhase === 'role_selection') {
                        showRoleSelectionInitial();
                    } else if (gameState.gamePhase === 'k_scale_event') {
                        showKScaleEvent();
                    } else if (gameState.gamePhase === 'role_change_decision') {
                        showRoleChangeDecision();
                    } else if (gameState.gamePhase === 'game_end') {
                        showGameEnd();
                    } else {
                        // Fallback to initialization if phase is unknown
                        initializeGame();
                    }
                    return true;
                } catch (error) {
                    if (window.HyperionErrorHandling) {
                        window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.DATA, { action: 'handleSavedGameRestoration_parse' });
                        window.HyperionErrorHandling.displayErrorToUser("Error restoring saved game. Starting a new game.", null, true);
                    } else {
                        console.error("Error restoring saved game:", error);
                        alert("There was an error restoring your saved game. Starting a new game.");
                    }
                }
            } else {
                localStorage.removeItem('hyperionNexusGameState');
            }
        }
        return false;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'handleSavedGameRestoration' });
            window.HyperionErrorHandling.displayErrorToUser("Error handling saved game restoration.", null, true);
        } else {
            console.error("Error in handleSavedGameRestoration:", error);
        }
        return false;
    }
}

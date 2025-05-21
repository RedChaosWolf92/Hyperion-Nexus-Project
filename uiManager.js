/**
 * Hyperion Nexus UI Manager Module
 * 
 * This module contains all UI-related functions for managing the game interface,
 * including clearing UI elements, updating status displays, and handling DOM interactions.
 */

// Function to clear the game UI
export function clearGameUI() {
    try {
        console.log("clearGameUI called");
        const gameContent = document.getElementById('game-content');
        const gameChoices = document.getElementById('game-choices');
        
        console.log("DOM elements:", {
            gameContent: gameContent,
            gameChoices: gameChoices
        });
        
        if (gameContent) gameContent.innerHTML = '';
        if (gameChoices) gameChoices.innerHTML = '';
        
        console.log("Game UI cleared successfully");
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
        console.log("displayCurrentState called");
        
        if (!gameState) {
            throw new Error("Game state is undefined or null");
        }
        console.log("DEBUG: Game State:", gameState);
        console.log(`DEBUG: Phase: ${gameState.gamePhase}, QuestionIndex: ${gameState.currentQuestionIndex}, EventCounter: ${gameState.eventCounter}`);
        
        // After displaying state, show the appropriate phase content
        if (typeof window.showSpeciesCreationQuestion === 'function' && gameState.gamePhase === 'species_creation') {
            console.log("Calling showSpeciesCreationQuestion from displayCurrentState");
            window.showSpeciesCreationQuestion();
        } else if (typeof window.showSpeciesSummary === 'function' && gameState.gamePhase === 'species_summary') {
            console.log("Calling showSpeciesSummary from displayCurrentState");
            window.showSpeciesSummary();
        } else if (typeof window.showStarshipCreationQuestion === 'function' && gameState.gamePhase === 'starship_creation') {
            console.log("Calling showStarshipCreationQuestion from displayCurrentState");
            window.showStarshipCreationQuestion();
        } else if (typeof window.showStarshipSummary === 'function' && gameState.gamePhase === 'starship_summary') {
            console.log("Calling showStarshipSummary from displayCurrentState");
            window.showStarshipSummary();
        } else if (typeof window.showRoleSelectionInitial === 'function' && gameState.gamePhase === 'role_selection_initial') {
            console.log("Calling showRoleSelectionInitial from displayCurrentState");
            window.showRoleSelectionInitial();
        } else if (typeof window.showKScaleEvent === 'function' && gameState.gamePhase === 'k_scale_progression' && gameState.subPhase === 'event') {
            console.log("Calling showKScaleEvent from displayCurrentState");
            window.showKScaleEvent();
        } else if (typeof window.showRoleChangeDecision === 'function' && gameState.gamePhase === 'k_scale_progression' && gameState.subPhase === 'role_change_decision') {
            console.log("Calling showRoleChangeDecision from displayCurrentState");
            window.showRoleChangeDecision();
        } else if (typeof window.showGameEnd === 'function' && gameState.gamePhase === 'game_end') {
            console.log("Calling showGameEnd from displayCurrentState");
            window.showGameEnd();
        } else {
            console.log("No matching phase handler found for:", gameState.gamePhase, gameState.subPhase);
        }
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
        console.log("updateStatusBar called");
        
        if (!gameState || !getTopCulturalPathways) {
            throw new Error("Missing required parameters for updateStatusBar");
        }
        
        const statusBar = document.getElementById('status-bar');
        if (!statusBar) {
            throw new Error("Status bar element not found");
        }
        
        const topPathways = getTopCulturalPathways();
        let pathwayText = topPathways.map(p => `${p.name} (${p.value})`).join(', ');
        statusBar.textContent = `Year: ${gameState.gameYear} | K-Scale: ${gameState.currentKScale} | Role: ${gameState.playerRole} | Top Cultural Pathways: ${pathwayText}`;
        
        console.log("Status bar updated successfully");
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
        console.log("setupUIEventListeners called");
        
        if (!initializeGame) {
            throw new Error("Initialize game function is required");
        }
        
        // Direct event handler for restart button
        const restartButton = document.getElementById('restart-button');
        if (restartButton) {
            console.log("Restart button found, attaching direct handler");
            restartButton.onclick = function() {
                console.log("Restart button clicked (direct handler)");
                if (confirm("Are you sure you want to restart the game? All progress will be lost.")) {
                    localStorage.removeItem('hyperionNexusGameState');
                    initializeGame();
                }
            };
        } else {
            console.warn("Restart button not found for direct handler");
        }
        
        // For backward compatibility, keep the event delegation approach
        document.addEventListener('click', (event) => {
            if (event.target.id === 'restart-button' || 
                (event.target.tagName === 'BUTTON' && event.target.textContent.includes('Restart Game'))) {
                console.log("Restart button clicked (delegation handler)");
                if (confirm("Are you sure you want to restart the game? All progress will be lost.")) {
                    localStorage.removeItem('hyperionNexusGameState');
                    initializeGame();
                }
            }
        });
        
        console.log("UI event listeners set up successfully");
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
        console.log("handleSavedGameRestoration called");
        
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
                    console.log("DEBUG: Game state restored from localStorage", gameState);
                    
                    // Update UI based on restored state
                    const statusBar = document.getElementById('status-bar');
                    if (statusBar) {
                        statusBar.textContent = `Year: ${gameState.gameYear} | K-Scale: ${gameState.currentKScale} | Role: ${gameState.playerRole}`;
                    }
                    
                    // Determine which phase to show based on restored state
                    if (gameState.gamePhase === 'species_creation') {
                        showSpeciesCreationQuestion(gameState.currentQuestionIndex);
                    } else if (gameState.gamePhase === 'species_summary') {
                        showSpeciesSummary();
                    } else if (gameState.gamePhase === 'starship_creation') {
                        showStarshipCreationQuestion(gameState.currentQuestionIndex);
                    } else if (gameState.gamePhase === 'starship_summary') {
                        showStarshipSummary();
                    } else if (gameState.gamePhase === 'role_selection_initial') {
                        showRoleSelectionInitial();
                    } else if (gameState.gamePhase === 'k_scale_progression' && gameState.subPhase === 'event') {
                        showKScaleEvent();
                    } else if (gameState.gamePhase === 'k_scale_progression' && gameState.subPhase === 'role_change_decision') {
                        showRoleChangeDecision();
                    } else if (gameState.gamePhase === 'game_end') {
                        showGameEnd();
                    } else {
                        // Fallback to initialization if phase is unknown
                        console.warn("Unknown game phase in saved state, initializing new game");
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

// Explicitly assign all exports to window object for global access
window.clearGameUI = clearGameUI;
window.displayCurrentState = displayCurrentState;
window.updateStatusBar = updateStatusBar;
window.setupUIEventListeners = setupUIEventListeners;
window.handleSavedGameRestoration = handleSavedGameRestoration;

// Log that uiManager module has been loaded
console.log("uiManager module loaded, functions available:", {
    clearGameUI: typeof window.clearGameUI,
    displayCurrentState: typeof window.displayCurrentState,
    updateStatusBar: typeof window.updateStatusBar,
    setupUIEventListeners: typeof window.setupUIEventListeners,
    handleSavedGameRestoration: typeof window.handleSavedGameRestoration
});

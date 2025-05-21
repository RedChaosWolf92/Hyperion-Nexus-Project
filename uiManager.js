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
        
        // First ensure all container elements exist
        const gameContainer = document.getElementById('game-container');
        const gameContent = document.getElementById('game-content');
        const gameChoices = document.getElementById('game-choices');
        
        if (!gameContent || !gameChoices) {
            console.error("Critical game containers missing");
            // Attempt to recreate the structure if possible
            if (gameContainer) {
                if (!gameContent) {
                    const newGameContent = document.createElement('div');
                    newGameContent.id = 'game-content';
                    gameContainer.appendChild(newGameContent);
                    console.log("Recreated game-content container");
                }
                
                if (!gameChoices) {
                    const newGameChoices = document.createElement('div');
                    newGameChoices.id = 'game-choices';
                    gameContainer.appendChild(newGameChoices);
                    console.log("Recreated game-choices container");
                }
            }
        }
        
        // Now ensure storyArea and choiceArea exist
        let storyArea = document.getElementById('storyArea');
        let choiceArea = document.getElementById('choice-area');
        
        console.log("DOM elements before clearing:", {
            gameContent: gameContent,
            gameChoices: gameChoices,
            storyArea: storyArea,
            choiceArea: choiceArea
        });
        
        // If storyArea doesn't exist, create it inside game-content
        if (!storyArea && gameContent) {
            storyArea = document.createElement('div');
            storyArea.id = 'storyArea';
            gameContent.innerHTML = '';
            gameContent.appendChild(storyArea);
            console.log("Created storyArea element");
        } else if (storyArea) {
            // Only clear the storyArea content, not the container
            storyArea.innerHTML = '';
        }
        
        // If choiceArea doesn't exist, create it inside game-choices
        if (!choiceArea && gameChoices) {
            choiceArea = document.createElement('div');
            choiceArea.id = 'choice-area';
            gameChoices.innerHTML = '';
            gameChoices.appendChild(choiceArea);
            console.log("Created choice-area element");
        } else if (choiceArea) {
            // Only clear the choiceArea content, not the container
            choiceArea.innerHTML = '';
        }
        
        console.log("DOM elements after clearing:", {
            storyArea: document.getElementById('storyArea'),
            choiceArea: document.getElementById('choice-area')
        });
        
        console.log("Game UI cleared successfully");
    } catch (error) {
        console.error("Error in clearGameUI:", error);
        // More robust error handling
        try {
            // Last resort attempt to reset the UI
            const gameContent = document.getElementById('game-content');
            const gameChoices = document.getElementById('game-choices');
            
            if (gameContent) gameContent.innerHTML = '<div id="storyArea"></div>';
            if (gameChoices) gameChoices.innerHTML = '<div id="choice-area"></div>';
            
            console.log("Emergency UI reset attempted");
        } catch (secondError) {
            console.error("Emergency UI reset failed:", secondError);
        }
        
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'clearGameUI' });
            window.HyperionErrorHandling.displayErrorToUser("Error clearing game UI.", null, false);
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
        
        // First check for out-of-bounds indices and fix them
        if (gameState.gamePhase === "species_creation" && 
            gameState.currentQuestionIndex >= window.speciesCreationQuestions.length) {
            console.log("Question index out of bounds for species creation, transitioning to summary");
            window.transitionGamePhase("species_summary");
            return;
        }
        
        if (gameState.gamePhase === "starship_creation" && 
            gameState.currentQuestionIndex >= window.starshipCreationQuestions.length) {
            console.log("Question index out of bounds for starship creation, transitioning to summary");
            window.transitionGamePhase("starship_summary");
            return;
        }
        
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
            console.warn("No matching phase handler found for:", gameState.gamePhase, gameState.subPhase);
            
            // Attempt recovery by showing debug info
            const storyArea = document.getElementById("storyArea");
            const choiceArea = document.getElementById("choice-area");
            
            if (storyArea) {
                storyArea.innerHTML = `<h3>Phase Error</h3><p>The game encountered an error with phase: ${gameState.gamePhase}</p>`;
            }
            
            if (choiceArea) {
                choiceArea.innerHTML = "";
                const restartButton = document.createElement("button");
                restartButton.className = "choice-button";
                restartButton.textContent = "Restart Game";
                restartButton.onclick = function() {
                    if (confirm("The game encountered an error. Would you like to restart?")) {
                        localStorage.removeItem('hyperionNexusGameState');
                        window.initializeGame();
                    }
                };
                choiceArea.appendChild(restartButton);
            }
        }
    } catch (error) {
        console.error("Error in displayCurrentState:", error);
        // Attempt recovery
        try {
            const storyArea = document.getElementById("storyArea");
            const choiceArea = document.getElementById("choice-area");
            
            if (storyArea) {
                storyArea.innerHTML = `<h3>Display Error</h3><p>The game encountered an error displaying the current state.</p>`;
            }
            
            if (choiceArea) {
                choiceArea.innerHTML = "";
                const restartButton = document.createElement("button");
                restartButton.className = "choice-button";
                restartButton.textContent = "Restart Game";
                restartButton.onclick = function() {
                    if (confirm("The game encountered an error. Would you like to restart?")) {
                        localStorage.removeItem('hyperionNexusGameState');
                        window.initializeGame();
                    }
                };
                choiceArea.appendChild(restartButton);
            }
        } catch (secondaryError) {
            console.error("Failed to recover from displayCurrentState error:", secondaryError);
        }
        
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'displayCurrentState' });
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
        statusBar.textContent = `Year: ${gameState.gameYear} | K-Scale: ${gameState.currentKScale} | Role: ${gameState.playerRole || 'Undecided'} | Top Cultural Pathways: ${pathwayText}`;
        
        console.log("Status bar updated successfully");
    } catch (error) {
        console.error("Error in updateStatusBar:", error);
        
        // Try to create status bar if missing
        try {
            const gameContainer = document.getElementById('game-container');
            if (gameContainer && !document.getElementById('status-bar')) {
                const newStatusBar = document.createElement('div');
                newStatusBar.id = 'status-bar';
                newStatusBar.textContent = 'Year: 0 | K-Scale: 0.9 | Role: Undecided';
                gameContainer.appendChild(newStatusBar);
                console.log("Created missing status bar");
            }
        } catch (secondaryError) {
            console.error("Failed to create status bar:", secondaryError);
        }
        
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'updateStatusBar' });
            window.HyperionErrorHandling.displayErrorToUser("Error updating status bar.", null, false);
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
                    try {
                        console.log("Restarting game...");
                        localStorage.removeItem('hyperionNexusGameState');
                        
                        // Reset critical game elements first
                        const gameOutput = document.getElementById("game-output");
                        if (gameOutput) gameOutput.innerHTML = "";
                        
                        // Ensure DOM structure is intact
                        if (typeof window.ensureDOMStructure === 'function') {
                            window.ensureDOMStructure();
                        } else {
                            console.warn("ensureDOMStructure function not available");
                            // Basic DOM check
                            const gameContent = document.getElementById('game-content');
                            const gameChoices = document.getElementById('game-choices');
                            
                            if (!gameContent || !gameChoices) {
                                // Critical error - recreate basic structure
                                const gameContainer = document.getElementById('game-container');
                                if (gameContainer) {
                                    gameContainer.innerHTML = `
                                        <div id="game-content"><div id="storyArea"></div></div>
                                        <div id="game-choices"><div id="choice-area"></div></div>
                                    `;
                                    console.log("Emergency DOM structure reset performed");
                                }
                            }
                        }
                        
                        // Now initialize the game
                        initializeGame();
                    } catch (error) {
                        console.error("Error during restart:", error);
                        alert("Error restarting game. Please refresh the page to start over.");
                    }
                }
            };
        } else {
            console.warn("Restart button not found for direct handler");
            // Create restart button if missing
            if (typeof window.createRestartButton === 'function') {
                window.createRestartButton();
            }
        }
        
        // For backward compatibility, keep the event delegation approach
        document.addEventListener('click', (event) => {
            if (event.target.id === 'restart-button' || 
                (event.target.tagName === 'BUTTON' && event.target.textContent.includes('Restart Game'))) {
                console.log("Restart button clicked (delegation handler)");
                if (confirm("Are you sure you want to restart the game? All progress will be lost.")) {
                    try {
                        localStorage.removeItem('hyperionNexusGameState');
                        
                        // Ensure DOM structure before initializing
                        if (typeof window.ensureDOMStructure === 'function') {
                            window.ensureDOMStructure();
                        }
                        
                        initializeGame();
                    } catch (error) {
                        console.error("Error during restart (delegation):", error);
                        alert("Error restarting game. Please refresh the page to start over.");
                    }
                }
            }
        });
        
        console.log("UI event listeners set up successfully");
    } catch (error) {
        console.error("Error in setupUIEventListeners:", error);
        
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'setupUIEventListeners' });
            window.HyperionErrorHandling.displayErrorToUser("Error setting up UI event listeners.", null, true);
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
                    
                    // Ensure DOM structure is intact before displaying
                    if (typeof window.ensureDOMStructure === 'function') {
                        window.ensureDOMStructure();
                    }
                    
                    // Update UI based on restored state
                    const statusBar = document.getElementById('status-bar');
                    if (statusBar) {
                        statusBar.textContent = `Year: ${gameState.gameYear} | K-Scale: ${gameState.currentKScale} | Role: ${gameState.playerRole || 'Undecided'}`;
                    }
                    
                    // Use displayCurrentState to show the appropriate phase
                    if (typeof window.displayCurrentState === 'function') {
                        window.displayCurrentState(gameState);
                        return true;
                    } else {
                        // Fallback to direct phase handling if displayCurrentState is not available
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
                    }
                } catch (error) {
                    console.error("Error restoring saved game:", error);
                    
                    if (window.HyperionErrorHandling) {
                        window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.DATA, { action: 'handleSavedGameRestoration_parse' });
                        window.HyperionErrorHandling.displayErrorToUser("Error restoring saved game. Starting a new game.", null, true);
                    } else {
                        alert("There was an error restoring your saved game. Starting a new game.");
                    }
                }
            } else {
                localStorage.removeItem('hyperionNexusGameState');
            }
        }
        return false;
    } catch (error) {
        console.error("Error in handleSavedGameRestoration:", error);
        
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'handleSavedGameRestoration' });
            window.HyperionErrorHandling.displayErrorToUser("Error handling saved game restoration.", null, true);
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

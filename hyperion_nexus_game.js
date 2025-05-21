/* Hyperion Nexus Text-Based Game Logic                                     */
/*                                                                          */
/* This script manages the UI, questions, choices, and game progression     */
/* for the Hyperion Nexus game.                                             */
/****************************************************************************/

// Import game state and core logic from gameState.js module
import { gameState, initializeGame, handleChoice, getTopCulturalPathways, downloadChoiceHistoryCSV, transitionGamePhase, ensureDOMStructure, createRestartButton } from './gameState.js';

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
window.transitionGamePhase = transitionGamePhase;
window.ensureDOMStructure = ensureDOMStructure;
window.createRestartButton = createRestartButton;

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

/**
 * Function to end the game and display final results
 * @param {string} reason - The reason for game end
 * @returns {boolean} Whether the game end was processed successfully
 */
window.endGame = function(reason) {
    try {
        console.log("endGame called with reason:", reason);
        
        // Ensure DOM structure is intact
        if (typeof window.ensureDOMStructure === 'function') {
            window.ensureDOMStructure();
        }
        
        const storyArea = document.getElementById("storyArea");
        const choiceArea = document.getElementById("choice-area");
        const resultsArea = document.getElementById("results-area");
        const gameOutput = document.getElementById("game-output");
        const downloadLogButton = document.getElementById("download-log-button");
        
        if (!storyArea || !choiceArea || !resultsArea || !gameOutput) {
            throw new Error("UI elements missing for game end");
        }
        
        // Update game state
        gameState.gamePhase = "game_end";
        
        // Display end game message
        storyArea.innerHTML = `<h2>Journey Complete</h2>
            <p>${reason}</p>
            <p>Your civilization has reached a K-Scale of ${gameState.currentKScale.toFixed(1)}, 
            spanning ${gameState.gameYear} years of development.</p>`;
        
        // Clear choice area
        choiceArea.innerHTML = "";
        
        // Show download log button
        if (downloadLogButton) {
            downloadLogButton.style.display = 'inline-block';
        }
        
        // Display results
        if (resultsArea) {
            resultsArea.style.display = 'block';
            
            // Generate civilization summary
            const topPathways = getTopCulturalPathways();
            let civilizationSummary = "";
            
            if (topPathways.length > 0) {
                const dominantPath = topPathways[0].name;
                
                if (dominantPath === "science") {
                    civilizationSummary = "Your civilization has become known for its scientific achievements and technological innovations.";
                } else if (dominantPath === "military") {
                    civilizationSummary = "Your civilization has developed into a formidable military power with strong defensive capabilities.";
                } else if (dominantPath === "ecological") {
                    civilizationSummary = "Your civilization has pioneered sustainable development and harmonious integration with space environments.";
                } else if (dominantPath === "subversive") {
                    civilizationSummary = "Your civilization has mastered unconventional approaches and adaptive strategies for survival.";
                } else if (dominantPath === "psychic") {
                    civilizationSummary = "Your civilization has developed unique mental abilities and consciousness-based technologies.";
                }
            }
            
            resultsArea.innerHTML = `<h3>Civilization Summary</h3>
                <p>${civilizationSummary}</p>
                <h3>Cultural Pathway Development</h3>
                <ul>
                    <li>Science: ${gameState.culturalPathways.science}</li>
                    <li>Military: ${gameState.culturalPathways.military}</li>
                    <li>Ecological: ${gameState.culturalPathways.ecological}</li>
                    <li>Subversive: ${gameState.culturalPathways.subversive}</li>
                    <li>Psychic: ${gameState.culturalPathways.psychic}</li>
                </ul>
                <h3>Key Decisions</h3>
                <p>Total decisions made: ${gameState.choiceHistory.length}</p>`;
            
            // Add restart button to results
            const restartButton = document.createElement("button");
            restartButton.className = "choice-button";
            restartButton.textContent = "Start New Game";
            restartButton.onclick = function() {
                if (confirm("Are you sure you want to start a new game? All progress will be lost.")) {
                    localStorage.removeItem('hyperionNexusGameState');
                    window.initializeGame();
                }
            };
            resultsArea.appendChild(restartButton);
        }
        
        // Add final message to game output
        if (gameOutput) {
            gameOutput.innerHTML += `<br><b>Game complete!</b> Your civilization's journey has concluded after ${gameState.gameYear} years.<br>`;
        }
        
        console.log("Game end processed successfully");
        return true;
    } catch (error) {
        console.error("Error in endGame:", error);
        
        // Attempt recovery
        try {
            const gameOutput = document.getElementById("game-output");
            if (gameOutput) {
                gameOutput.innerHTML += "<br><span style='color:red;'>Error displaying game end. Your game has concluded, but results could not be displayed properly.</span><br>";
            }
            
            // Create emergency restart button
            const gameContainer = document.getElementById("game-container");
            if (gameContainer) {
                const emergencyButton = document.createElement("button");
                emergencyButton.textContent = "Start New Game";
                emergencyButton.style.margin = "20px";
                emergencyButton.style.padding = "10px";
                emergencyButton.onclick = function() {
                    localStorage.removeItem('hyperionNexusGameState');
                    window.initializeGame();
                };
                gameContainer.appendChild(emergencyButton);
            }
        } catch (secondaryError) {
            console.error("Failed to recover from endGame error:", secondaryError);
        }
        
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.GAME_STATE, { action: 'endGame' });
            window.HyperionErrorHandling.displayErrorToUser("Error ending game. Please refresh the page to start a new game.", null, true);
        }
        return false;
    }
};

// Function to explicitly set up restart button
function setupRestartButton() {
    console.log("Setting up restart button");
    const restartButton = document.getElementById('restart-button');
    if (restartButton) {
        console.log("Restart button found, attaching direct handler");
        restartButton.onclick = function() {
            console.log("Restart button clicked (direct handler)");
            if (confirm("Are you sure you want to restart the game? All progress will be lost.")) {
                try {
                    console.log("Restarting game...");
                    localStorage.removeItem('hyperionNexusGameState');
                    
                    // Ensure DOM structure is intact before initializing
                    if (typeof window.ensureDOMStructure === 'function') {
                        window.ensureDOMStructure();
                    }
                    
                    // Reset critical game elements
                    const gameOutput = document.getElementById("game-output");
                    if (gameOutput) gameOutput.innerHTML = "";
                    
                    // Initialize the game
                    window.initializeGame();
                } catch (error) {
                    console.error("Error during restart:", error);
                    alert("Error restarting game. Please refresh the page to start over.");
                    // Last resort - reload the page
                    window.location.reload();
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
}

// Function to check and recover game state if needed
function checkGameState() {
    console.log("Checking game state integrity");
    
    try {
        // Check if gameState exists and has required properties
        if (!window.gameState || typeof window.gameState !== 'object') {
            console.error("Game state missing or invalid");
            return false;
        }
        
        // Check for required properties
        const requiredProps = ['gamePhase', 'currentQuestionIndex', 'culturalPathways'];
        const missingProps = requiredProps.filter(prop => !(prop in window.gameState));
        
        if (missingProps.length > 0) {
            console.error("Game state missing required properties:", missingProps);
            return false;
        }
        
        // Check for valid phase
        const validPhases = [
            "species_creation", "species_summary", 
            "starship_creation", "starship_summary", 
            "role_selection_initial", "k_scale_progression", 
            "game_end"
        ];
        
        if (!validPhases.includes(window.gameState.gamePhase)) {
            console.error("Invalid game phase:", window.gameState.gamePhase);
            return false;
        }
        
        console.log("Game state integrity check passed");
        return true;
    } catch (error) {
        console.error("Error checking game state:", error);
        return false;
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
        
        // Attempt to recreate critical elements
        if (typeof window.ensureDOMStructure === 'function') {
            window.ensureDOMStructure();
            console.log("Attempted to recreate missing DOM elements");
        }
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
    } else {
        // Verify restored game state integrity
        if (!checkGameState()) {
            console.error("Restored game state failed integrity check, initializing new game");
            window.initializeGame();
        }
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
            
            // Ensure DOM structure is intact
            if (typeof window.ensureDOMStructure === 'function') {
                window.ensureDOMStructure();
            }
            
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
                
                // Last resort - reload the page
                alert("Critical game functions missing. The page will reload to recover.");
                window.location.reload();
            }
        } else {
            // Game appears to be initialized, verify state integrity
            if (!checkGameState()) {
                console.error("Game state failed integrity check during fallback, attempting recovery");
                
                // Attempt to recover by reinitializing
                if (typeof window.initializeGame === 'function') {
                    if (confirm("The game appears to be in an invalid state. Would you like to restart?")) {
                        localStorage.removeItem('hyperionNexusGameState');
                        window.initializeGame();
                    }
                }
            }
        }
    }, 100);
}

console.log("Hyperion Nexus Game module loaded, global objects available:", {
    gameState: typeof window.gameState,
    initializeGame: typeof window.initializeGame,
    showSpeciesCreationQuestion: typeof window.showSpeciesCreationQuestion,
    displayCurrentState: typeof window.displayCurrentState,
    transitionGamePhase: typeof window.transitionGamePhase,
    ensureDOMStructure: typeof window.ensureDOMStructure
});

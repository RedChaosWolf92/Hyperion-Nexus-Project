/* Hyperion Nexus Text-Based Game Logic                                     */
/*                                                                          */
/* This script manages the UI, questions, choices, and game progression     */
/* for the Hyperion Nexus game.                                             */
/****************************************************************************/

// Log that the main game module is loading
console.log("Hyperion Nexus Game module loading");

// Define global variables to store imported values
let gameState, initializeGame, handleChoice, getTopCulturalPathways, downloadChoiceHistoryCSV, 
    transitionGamePhase, ensureDOMStructure, createRestartButton;
let showSpeciesCreationQuestion, showSpeciesSummary, showStarshipCreationQuestion, 
    showStarshipSummary, showRoleSelectionInitial, showKScaleEvent, 
    showRoleChangeDecision, showGameEnd;
let playerRoles, speciesCreationQuestions, starshipCreationQuestions, kScaleEvents;
let clearGameUI, displayCurrentState, updateStatusBar, setupUIEventListeners, handleSavedGameRestoration;

// Function to initialize global variables from imported modules
function initializeGlobals() {
    try {
        console.log("Initializing global variables");
        
        // Check if modules are loaded and assign their exports to global variables
        if (typeof window.gameStateModule !== 'undefined') {
            gameState = window.gameStateModule.gameState;
            initializeGame = window.gameStateModule.initializeGame;
            handleChoice = window.gameStateModule.handleChoice;
            getTopCulturalPathways = window.gameStateModule.getTopCulturalPathways;
            downloadChoiceHistoryCSV = window.gameStateModule.downloadChoiceHistoryCSV;
            transitionGamePhase = window.gameStateModule.transitionGamePhase;
            ensureDOMStructure = window.gameStateModule.ensureDOMStructure;
            createRestartButton = window.gameStateModule.createRestartButton;
        }
        
        if (typeof window.phaseManagerModule !== 'undefined') {
            showSpeciesCreationQuestion = window.phaseManagerModule.showSpeciesCreationQuestion;
            showSpeciesSummary = window.phaseManagerModule.showSpeciesSummary;
            showStarshipCreationQuestion = window.phaseManagerModule.showStarshipCreationQuestion;
            showStarshipSummary = window.phaseManagerModule.showStarshipSummary;
            showRoleSelectionInitial = window.phaseManagerModule.showRoleSelectionInitial;
            showKScaleEvent = window.phaseManagerModule.showKScaleEvent;
            showRoleChangeDecision = window.phaseManagerModule.showRoleChangeDecision;
            showGameEnd = window.phaseManagerModule.showGameEnd;
        }
        
        if (typeof window.gameDataModule !== 'undefined') {
            playerRoles = window.gameDataModule.playerRoles;
            speciesCreationQuestions = window.gameDataModule.speciesCreationQuestions;
            starshipCreationQuestions = window.gameDataModule.starshipCreationQuestions;
            kScaleEvents = window.gameDataModule.kScaleEvents;
        }
        
        if (typeof window.uiManagerModule !== 'undefined') {
            clearGameUI = window.uiManagerModule.clearGameUI;
            displayCurrentState = window.uiManagerModule.displayCurrentState;
            updateStatusBar = window.uiManagerModule.updateStatusBar;
            setupUIEventListeners = window.uiManagerModule.setupUIEventListeners;
            handleSavedGameRestoration = window.uiManagerModule.handleSavedGameRestoration;
        }
        
        // Make core functions available to the global scope for HTML event handlers
        window.initializeGame = initializeGame || window.initializeGame;
        window.handleChoice = handleChoice || window.handleChoice;
        window.downloadChoiceHistoryCSV = downloadChoiceHistoryCSV || window.downloadChoiceHistoryCSV;
        window.getTopCulturalPathways = getTopCulturalPathways || window.getTopCulturalPathways;
        window.transitionGamePhase = transitionGamePhase || window.transitionGamePhase;
        window.ensureDOMStructure = ensureDOMStructure || window.ensureDOMStructure;
        window.createRestartButton = createRestartButton || window.createRestartButton;
        
        // Make phase management functions available to the global scope
        window.showSpeciesCreationQuestion = showSpeciesCreationQuestion || window.showSpeciesCreationQuestion;
        window.showSpeciesSummary = showSpeciesSummary || window.showSpeciesSummary;
        window.showStarshipCreationQuestion = showStarshipCreationQuestion || window.showStarshipCreationQuestion;
        window.showStarshipSummary = showStarshipSummary || window.showStarshipSummary;
        window.showRoleSelectionInitial = showRoleSelectionInitial || window.showRoleSelectionInitial;
        window.showKScaleEvent = showKScaleEvent || window.showKScaleEvent;
        window.showRoleChangeDecision = showRoleChangeDecision || window.showRoleChangeDecision;
        window.showGameEnd = showGameEnd || window.showGameEnd;
        
        // Make data structures available to the gameState module
        window.playerRoles = playerRoles || window.playerRoles;
        window.speciesCreationQuestions = speciesCreationQuestions || window.speciesCreationQuestions;
        window.starshipCreationQuestions = starshipCreationQuestions || window.starshipCreationQuestions;
        window.kScaleEvents = kScaleEvents || window.kScaleEvents;
        
        // Make UI utility functions available to other modules
        window.clearGameUI = clearGameUI || window.clearGameUI;
        window.displayCurrentState = displayCurrentState || window.displayCurrentState || 
            (() => { if (typeof window.displayCurrentState === 'function') window.displayCurrentState(window.gameState); });
        window.updateStatusBar = updateStatusBar || window.updateStatusBar || 
            (() => { if (typeof window.updateStatusBar === 'function') window.updateStatusBar(window.gameState); });
        
        // Make gameState available globally
        window.gameState = gameState || window.gameState;
        
        console.log("Global variables initialized successfully");
        return true;
    } catch (error) {
        console.error("Error initializing global variables:", error);
        return false;
    }
}

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
        if (window.gameState) {
            window.gameState.gamePhase = "game_end";
        }
        
        // Display end game message
        storyArea.innerHTML = `<h2>Journey Complete</h2>
            <p>${reason}</p>
            <p>Your civilization has reached a K-Scale of ${window.gameState ? window.gameState.currentKScale.toFixed(1) : '0.0'}, 
            spanning ${window.gameState ? window.gameState.gameYear : '0'} years of development.</p>`;
        
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
            let civilizationSummary = "Your civilization has completed its journey through the stars.";
            
            if (typeof window.getTopCulturalPathways === 'function') {
                const topPathways = window.getTopCulturalPathways();
                
                if (topPathways && topPathways.length > 0) {
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
            }
            
            resultsArea.innerHTML = `<h3>Civilization Summary</h3>
                <p>${civilizationSummary}</p>
                <h3>Cultural Pathway Development</h3>
                <ul>
                    <li>Science: ${window.gameState ? window.gameState.culturalPathways.science : '0'}</li>
                    <li>Military: ${window.gameState ? window.gameState.culturalPathways.military : '0'}</li>
                    <li>Ecological: ${window.gameState ? window.gameState.culturalPathways.ecological : '0'}</li>
                    <li>Subversive: ${window.gameState ? window.gameState.culturalPathways.subversive : '0'}</li>
                    <li>Psychic: ${window.gameState ? window.gameState.culturalPathways.psychic : '0'}</li>
                </ul>
                <h3>Key Decisions</h3>
                <p>Total decisions made: ${window.gameState && window.gameState.choiceHistory ? window.gameState.choiceHistory.length : '0'}</p>`;
            
            // Add restart button to results
            const restartButton = document.createElement("button");
            restartButton.className = "choice-button";
            restartButton.textContent = "Start New Game";
            restartButton.onclick = function() {
                if (confirm("Are you sure you want to start a new game? All progress will be lost.")) {
                    localStorage.removeItem('hyperionNexusGameState');
                    if (typeof window.initializeGame === 'function') {
                        window.initializeGame();
                    } else {
                        window.location.reload();
                    }
                }
            };
            resultsArea.appendChild(restartButton);
        }
        
        // Add final message to game output
        if (gameOutput) {
            gameOutput.innerHTML += `<br><b>Game complete!</b> Your civilization's journey has concluded after ${window.gameState ? window.gameState.gameYear : '0'} years.<br>`;
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
                    if (typeof window.initializeGame === 'function') {
                        window.initializeGame();
                    } else {
                        window.location.reload();
                    }
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
                    if (typeof window.initializeGame === 'function') {
                        window.initializeGame();
                    } else {
                        console.error("initializeGame not available for restart");
                        window.location.reload();
                    }
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

// Function to set up the start button
function setupStartButton() {
    console.log("Setting up start button");
    const startButton = document.getElementById('start-button');
    if (startButton) {
        console.log("Start button found, attaching direct handler");
        startButton.onclick = function() {
            console.log("Start button clicked (direct handler)");
            try {
                // Initialize globals first
                initializeGlobals();
                
                // Then try to initialize game
                if (typeof window.initializeGame === 'function') {
                    window.initializeGame();
                } else {
                    console.error("initializeGame function not available");
                    alert("Game initialization failed. Please refresh the page and try again.");
                }
            } catch (error) {
                console.error("Error during game initialization:", error);
                alert("Error starting game. Please refresh the page and try again.");
            }
        };
    } else {
        console.warn("Start button not found for direct handler");
    }
}

// Initialize the game when the document is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded, initializing game");
    
    // Initialize global variables
    initializeGlobals();
    
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
    
    // Set up start button
    setupStartButton();
    
    // Set up UI event listeners
    if (typeof window.setupUIEventListeners === 'function') {
        window.setupUIEventListeners(window.initializeGame);
    }
    
    // Explicitly set up restart button
    setupRestartButton();
    
    // Check for saved game state in localStorage
    let gameRestored = false;
    if (typeof window.handleSavedGameRestoration === 'function') {
        gameRestored = window.handleSavedGameRestoration(
            window.gameState, 
            window.initializeGame, 
            window.showSpeciesCreationQuestion, 
            window.showSpeciesSummary, 
            window.showStarshipCreationQuestion, 
            window.showStarshipSummary, 
            window.showRoleSelectionInitial, 
            window.showKScaleEvent, 
            window.showRoleChangeDecision, 
            window.showGameEnd
        );
    }
    
    // Initialize new game if no saved game or user declined to restore
    if (!gameRestored) {
        console.log("No saved game restored, waiting for user to click 'Begin Your Journey'");
        // Game will be initialized when user clicks the start button
    } else {
        // Verify restored game state integrity
        if (!checkGameState()) {
            console.error("Restored game state failed integrity check, waiting for user to start new game");
            // Game will be initialized when user clicks the start button
        }
    }
});

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log("DOM already loaded, initializing with fallback");
    setTimeout(() => {
        // Initialize global variables
        initializeGlobals();
        
        // Set up start button
        setupStartButton();
        
        // Explicitly set up restart button
        setupRestartButton();
        
        // Set up UI event listeners if not already done
        if (typeof window.setupUIEventListeners === 'function') {
            window.setupUIEventListeners(window.initializeGame);
        } else {
            console.error("setupUIEventListeners not available in fallback");
        }
        
        console.log("Fallback initialization complete, waiting for user to click 'Begin Your Journey'");
    }, 100);
}

// Log available global functions for debugging
console.log("Hyperion Nexus Game module loaded, global objects available:", {
    gameState: typeof window.gameState,
    initializeGame: typeof window.initializeGame,
    showSpeciesCreationQuestion: typeof window.showSpeciesCreationQuestion,
    displayCurrentState: typeof window.displayCurrentState
});

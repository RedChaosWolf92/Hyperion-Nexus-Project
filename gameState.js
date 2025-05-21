/**
 * Hyperion Nexus Game State Module
 * 
 * This module manages the game state and core game mechanics for the Hyperion Nexus game.
 * It handles state initialization, choice processing, and data export functionality.
 */

// --- Game State Variables ---
export let gameState = {
    playerName: "Player", 
    currentKScale: 0.9, 
    maxKScale: 1.5, // Target K-Scale to reach for game end consideration
    gameYear: 0,
    starshipName: "ISS Pioneer", // Default starship name
    culturalPathways: {
        science: 0,    
        military: 0,   
        ecological: 0, 
        subversive: 0, 
        psychic: 0     
    },
    playerRole: null, 
    choiceHistory: [], 
    currentQuestionIndex: 0, // Used for species/starship questions
    gamePhase: "species_creation", // Phases: species_creation, species_summary, starship_creation, starship_summary, role_selection_initial, k_scale_progression, game_end
    subPhase: null, // Used for multi-step phases like k_scale_progression (e.g., event vs role_change_decision)
    eventCounter: 0 // Counts events within a K-Scale milestone
};

/**
 * Unified phase transition system for managing all game phase changes
 * @param {string} nextPhase - The phase to transition to
 * @param {string} nextSubPhase - Optional subphase to set
 * @param {boolean} resetIndex - Whether to reset question/event indices
 * @returns {boolean} Whether the transition was successful
 */
export function transitionGamePhase(nextPhase, nextSubPhase = null, resetIndex = true) {
    try {
        console.log(`Transitioning from ${gameState.gamePhase} to ${nextPhase}`);
        
        // Validate the requested phase is valid
        const validPhases = [
            "species_creation", "species_summary", 
            "starship_creation", "starship_summary", 
            "role_selection_initial", "k_scale_progression", 
            "game_end"
        ];
        
        if (!validPhases.includes(nextPhase)) {
            throw new Error(`Invalid game phase: ${nextPhase}`);
        }
        
        // Store previous phase for potential rollback
        const previousPhase = gameState.gamePhase;
        const previousSubPhase = gameState.subPhase;
        const previousIndex = gameState.currentQuestionIndex;
        
        // Update game state
        gameState.gamePhase = nextPhase;
        gameState.subPhase = nextSubPhase;
        
        // Reset indices if requested
        if (resetIndex) {
            gameState.currentQuestionIndex = 0;
            if (nextPhase === "k_scale_progression") {
                gameState.eventCounter = 0;
            }
        }
        
        // Phase-specific initialization
        if (nextPhase === "species_summary") {
            // Any specific setup for species summary
            console.log("Initializing species summary phase");
        } else if (nextPhase === "starship_creation") {
            // Any specific setup for starship creation
            console.log("Initializing starship creation phase");
        } else if (nextPhase === "k_scale_progression") {
            // Ensure K-Scale events exist for current K-Scale
            const kEvents = window.kScaleEvents[gameState.currentKScale.toFixed(1)];
            if (!kEvents) {
                throw new Error(`No events found for K-Scale: ${gameState.currentKScale.toFixed(1)}`);
            }
        }
        
        // Update UI to reflect new phase
        window.displayCurrentState();
        window.updateStatusBar();
        
        console.log(`Successfully transitioned to ${nextPhase}`);
        return true;
    } catch (error) {
        console.error(`Error in phase transition: ${error.message}`);
        
        // Attempt recovery by displaying appropriate error and continuing
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.GAME_STATE, {
                action: 'transitionGamePhase',
                targetPhase: nextPhase,
                currentPhase: gameState.gamePhase
            });
            window.HyperionErrorHandling.displayErrorToUser(
                "Error transitioning game phase. Attempting recovery...", null, false
            );
        }
        
        // Try to recover by displaying current state
        try {
            window.displayCurrentState();
        } catch (secondaryError) {
            console.error("Failed to recover from phase transition error:", secondaryError);
        }
        
        return false;
    }
}

/**
 * Calculates the top cultural pathways based on current scores
 * @returns {Array} Array of top two pathways with their names and values
 */
export function getTopCulturalPathways() {
    try {
        const pathways = gameState.culturalPathways;
        if (!pathways) {
            throw new Error("Cultural pathways not found in game state");
        }
        
        const sortedPaths = Object.entries(pathways).sort((a, b) => b[1] - a[1]);
        return sortedPaths.slice(0, 2).map(entry => ({ name: entry[0], value: entry[1] }));
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.DATA, { action: 'getTopCulturalPathways' });
            window.HyperionErrorHandling.displayErrorToUser("Error calculating cultural pathways.", null, false);
        } else {
            console.error("Error in getTopCulturalPathways:", error);
        }
        // Return default values in case of error
        return [{ name: "science", value: 0 }, { name: "military", value: 0 }];
    }
}

/**
 * Processes a player choice and updates game state accordingly
 * @param {string} choiceId - The unique identifier of the selected choice
 * @returns {boolean} Whether the choice was processed successfully
 */
export function handleChoice(choiceId) {
    try {
        // Input validation
        if (!choiceId) {
            throw new Error("Invalid choice ID: " + choiceId);
        }
        
        const gameOutput = document.getElementById("game-output");
        const debugLog = document.getElementById("debugLog");
        if (debugLog) debugLog.innerHTML += `DEBUG: handleChoice - Phase: ${gameState.gamePhase}, QIndex: ${gameState.currentQuestionIndex}, EventCounter: ${gameState.eventCounter}, Choice: ${choiceId}<br>`;

        let questionSet, choiceMade, questionTextForLog;

        if (gameState.gamePhase === "species_creation") {
            questionSet = window.speciesCreationQuestions;
            if (gameState.currentQuestionIndex >= questionSet.length) {
                throw new Error("Invalid question index for species creation: " + gameState.currentQuestionIndex);
            }
            choiceMade = questionSet[gameState.currentQuestionIndex].choices.find(c => c.id === choiceId);
            if (!choiceMade) {
                throw new Error(`Choice ${choiceId} not found in species creation question ${gameState.currentQuestionIndex}`);
            }
            questionTextForLog = questionSet[gameState.currentQuestionIndex].text;
        } else if (gameState.gamePhase === "starship_creation") {
            questionSet = window.starshipCreationQuestions;
            if (gameState.currentQuestionIndex >= questionSet.length) {
                throw new Error("Invalid question index for starship creation: " + gameState.currentQuestionIndex);
            }
            choiceMade = questionSet[gameState.currentQuestionIndex].choices.find(c => c.id === choiceId);
            if (!choiceMade) {
                throw new Error(`Choice ${choiceId} not found in starship creation question ${gameState.currentQuestionIndex}`);
            }
            questionTextForLog = questionSet[gameState.currentQuestionIndex].text;
        } else if (gameState.gamePhase === "role_selection_initial") {
            if (choiceId === "captain") gameState.playerRole = "Captain";
            else if (choiceId === "civ_leader") gameState.playerRole = "Civilization Leader";
            else throw new Error("Invalid role selection choice: " + choiceId);
            
            choiceMade = { text: `Chosen role: ${gameState.playerRole}`, effects: {} }; 
            questionTextForLog = "Initial Role Selection";
            gameState.gamePhase = "k_scale_progression";
            gameState.subPhase = "event"; 
            gameState.currentQuestionIndex = 0; 
            gameState.eventCounter = 0; 
            gameState.gameYear += 0; 
        } else if (gameState.gamePhase === "k_scale_progression") {
            const kEvents = window.kScaleEvents[gameState.currentKScale.toFixed(1)];
            if (!kEvents) {
                throw new Error("No events found for K-Scale: " + gameState.currentKScale.toFixed(1));
            }
            
            if (gameState.subPhase === "event" && kEvents && gameState.eventCounter < kEvents.length) {
                choiceMade = kEvents[gameState.eventCounter].choices.find(c => c.id === choiceId);
                if (!choiceMade) {
                    throw new Error(`Choice ${choiceId} not found in K-Scale event ${gameState.eventCounter}`);
                }
                questionTextForLog = kEvents[gameState.eventCounter].text_template;
            } else if (gameState.subPhase === "role_change_decision") {
                if (choiceId === "continue_role") { /* No change */ }
                else if (choiceId === "change_to_captain") gameState.playerRole = "Captain";
                else if (choiceId === "change_to_civ_leader") gameState.playerRole = "Civilization Leader";
                else throw new Error("Invalid role change choice: " + choiceId);
                
                choiceMade = { text: `Role decision: ${choiceId}, New Role: ${gameState.playerRole}`, effects: {} };
                questionTextForLog = "K-Scale Milestone Role Decision";
                
                gameState.currentKScale = parseFloat((gameState.currentKScale + 0.2).toFixed(1));
                gameState.gameYear += 20; 
                if(gameOutput) gameOutput.innerHTML += `<br><b>Technological Leap! Your starship capabilities have been upgraded reflecting advancements over the last 20 years!</b><br>`;

                gameState.subPhase = "event";
                gameState.eventCounter = 0; 
                
                // Check for game end *after* K-Scale update and *before* next displayCurrentState for this new K-Scale
                if (gameState.currentKScale > gameState.maxKScale) {
                    window.endGame("K-Scale limit reached. Civilization journey complete!");
                    return; // Important to return here to prevent further processing
                }
            }
        }

        if (choiceMade) {
            gameState.choiceHistory.push({
                year: gameState.gameYear,
                kScale: gameState.currentKScale.toFixed(1),
                phase: gameState.gamePhase,
                subPhase: gameState.subPhase,
                role: gameState.playerRole,
                question: questionTextForLog ? questionTextForLog.replace('{starshipName}', gameState.starshipName).replace('{gameYear}', gameState.gameYear) : "N/A",
                choiceText: choiceMade.text,
                effects: JSON.parse(JSON.stringify(choiceMade.effects)), 
                pathwaysBefore: JSON.parse(JSON.stringify(gameState.culturalPathways)) 
            });

            for (const path in choiceMade.effects) {
                if (gameState.culturalPathways.hasOwnProperty(path)) {
                    gameState.culturalPathways[path] += choiceMade.effects[path];
                }
            }
            gameState.choiceHistory[gameState.choiceHistory.length-1].pathwaysAfter = JSON.parse(JSON.stringify(gameState.culturalPathways));

            if (debugLog) debugLog.innerHTML += `DEBUG: Cultural Pathways Updated: ${JSON.stringify(gameState.culturalPathways)}<br>`;
            if (gameOutput && choiceMade.text) gameOutput.innerHTML += `> ${choiceMade.text}<br>`;
            if (gameOutput) gameOutput.scrollTop = gameOutput.scrollHeight;
        }

        // Handle phase transitions and index increments
        if (gameState.gamePhase === "species_creation") {
            gameState.currentQuestionIndex++;
            
            // Check if we've reached the end of questions
            if (gameState.currentQuestionIndex >= window.speciesCreationQuestions.length) {
                console.log("End of species creation questions reached, transitioning to summary");
                transitionGamePhase("species_summary");
                return true; // Important to return here to prevent further processing
            }
        } else if (gameState.gamePhase === "starship_creation") {
            gameState.currentQuestionIndex++;
            
            // Check if we've reached the end of questions
            if (gameState.currentQuestionIndex >= window.starshipCreationQuestions.length) {
                console.log("End of starship creation questions reached, transitioning to summary");
                transitionGamePhase("starship_summary");
                return true; // Important to return here to prevent further processing
            }
        } else if (gameState.gamePhase === "k_scale_progression" && gameState.subPhase === "event") {
            gameState.eventCounter++; 
            const currentKEvents = window.kScaleEvents[gameState.currentKScale.toFixed(1)];
            
            // Check if we need to transition to role_change_decision
            if (!currentKEvents || gameState.eventCounter >= currentKEvents.length || gameState.eventCounter >= 6) { 
                console.log(`K-Scale events complete (${gameState.eventCounter}/${currentKEvents ? currentKEvents.length : 0}), transitioning to role change decision`);
                gameState.subPhase = "role_change_decision";
            }
            
            // Increment game year for each event in k_scale_progression
            gameState.gameYear += 3; // Approximately 20 years over 6 events
        }

        // Save game state after successful choice handling
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.saveGameState(gameState);
        }

        window.displayCurrentState();
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.GAME_STATE, { 
                action: 'handleChoice',
                choiceId: choiceId,
                gamePhase: gameState.gamePhase,
                subPhase: gameState.subPhase,
                questionIndex: gameState.currentQuestionIndex,
                eventCounter: gameState.eventCounter
            });
            window.HyperionErrorHandling.displayErrorToUser("Error processing your choice. Please try again or refresh the page.", null, true);
        } else {
            console.error("Error in handleChoice:", error);
            const gameOutput = document.getElementById("game-output");
            if(gameOutput) gameOutput.innerHTML += "<span style='color:red;'>Error processing your choice. Please try again or refresh the page.</span><br>";
        }
        return false;
    }
}

/**
 * Ensures all required DOM elements exist and are properly structured
 * @returns {boolean} Whether the DOM structure is intact
 */
export function ensureDOMStructure() {
    console.log("Ensuring DOM structure integrity");
    
    try {
        // Check for game container
        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) {
            console.error("Critical error: game-container missing");
            throw new Error("Game container missing");
        }
        
        // Check and recreate critical elements
        const requiredElements = [
            { id: 'game-content', parent: 'game-container', html: '<div id="storyArea"></div>' },
            { id: 'game-choices', parent: 'game-container', html: '<div id="choice-area"></div>' },
            { id: 'game-output', parent: 'game-container', html: '' },
            { id: 'status-bar', parent: 'game-container', html: 'Year: 0 | K-Scale: 0.9 | Role: Undecided' }
        ];
        
        for (const element of requiredElements) {
            const el = document.getElementById(element.id);
            if (!el) {
                console.warn(`Missing required element: ${element.id}, recreating`);
                const parent = document.getElementById(element.parent);
                if (parent) {
                    const newElement = document.createElement('div');
                    newElement.id = element.id;
                    newElement.innerHTML = element.html;
                    parent.appendChild(newElement);
                    console.log(`Recreated ${element.id}`);
                }
            }
        }
        
        // Ensure restart button exists
        createRestartButton();
        
        console.log("DOM structure verification complete");
        return true;
    } catch (error) {
        console.error("Error ensuring DOM structure:", error);
        return false;
    }
}

/**
 * Creates a restart button if it doesn't exist
 * @returns {boolean} Whether the button was created successfully
 */
export function createRestartButton() {
    try {
        const restartButton = document.getElementById('restart-button');
        if (!restartButton) {
            console.log("Creating missing restart button");
            
            const controlButtons = document.getElementById('control-buttons');
            if (controlButtons) {
                const newRestartButton = document.createElement('button');
                newRestartButton.id = 'restart-button';
                newRestartButton.textContent = 'Restart Game';
                newRestartButton.style.display = 'inline-block';
                controlButtons.appendChild(newRestartButton);
                
                // Attach event handler
                newRestartButton.onclick = function() {
                    if (confirm("Are you sure you want to restart the game? All progress will be lost.")) {
                        localStorage.removeItem('hyperionNexusGameState');
                        window.initializeGame();
                    }
                };
                
                console.log("Restart button created and handler attached");
                return true;
            } else {
                console.warn("control-buttons container not found, cannot create restart button");
                return false;
            }
        }
        return true;
    } catch (error) {
        console.error("Error creating restart button:", error);
        return false;
    }
}

/**
 * Initializes or resets the game state
 * @returns {boolean} Whether initialization was successful
 */
export function initializeGame() {
    try {
        const debugLog = document.getElementById("debugLog");
        if (debugLog) debugLog.innerHTML = "DEBUG: initializeGame called.<br>";
        
        console.log("Initializing game...");
        
        // First ensure DOM structure is intact
        if (typeof window.ensureDOMStructure === 'function') {
            window.ensureDOMStructure();
        } else {
            console.warn("ensureDOMStructure function not available");
            // Basic DOM check
            const criticalElements = ['game-output', 'storyArea', 'choice-area'];
            const missingElements = criticalElements.filter(id => !document.getElementById(id));
            if (missingElements.length > 0) {
                console.error("Missing critical DOM elements:", missingElements);
            }
        }
        
        // Get references to UI elements
        const gameOutput = document.getElementById("game-output");
        const storyArea = document.getElementById("storyArea");
        const resultsArea = document.getElementById("results-area");
        const restartButton = document.getElementById("restart-button");
        const downloadLogButton = document.getElementById("download-log-button");
        
        // Check for saved game state
        let loadedState = null;
        if (window.HyperionErrorHandling && window.HyperionErrorHandling.canRecoverGameState()) {
            loadedState = window.HyperionErrorHandling.loadGameState();
            if (loadedState) {
                const confirmRestore = confirm("A saved game was found. Would you like to continue from where you left off?");
                if (confirmRestore) {
                    Object.assign(gameState, loadedState);
                    if(gameOutput) gameOutput.innerHTML += "<br><span style='color:green;'>Game state restored successfully.</span><br>";
                    window.displayCurrentState();
                    return true;
                }
            }
        }
        
        // Initialize new game state
        gameState.gamePhase = "species_creation";
        gameState.currentQuestionIndex = 0;
        gameState.eventCounter = 0;
        gameState.culturalPathways = { science: 0, military: 0, ecological: 0, subversive: 0, psychic: 0 };
        gameState.playerRole = null;
        gameState.gameYear = 0;
        gameState.currentKScale = 0.9;
        gameState.choiceHistory = [];
        gameState.subPhase = null;
        
        // Clear UI
        if (typeof window.clearGameUI === 'function') {
            window.clearGameUI();
        } else {
            console.warn("clearGameUI function not available");
            // Basic UI clearing
            if (storyArea) storyArea.innerHTML = '';
            const choiceArea = document.getElementById("choice-area");
            if (choiceArea) choiceArea.innerHTML = '';
        }
        
        // Set up initial UI state
        if(gameOutput) gameOutput.innerHTML = "Welcome! Let's begin creating your species.<br>";
        if(storyArea) storyArea.innerHTML = "The journey of a thousand stars begins with a single choice.";
        
        // Show/hide appropriate buttons
        if (restartButton) restartButton.style.display = 'inline-block';
        if (downloadLogButton) downloadLogButton.style.display = 'none';
        if (resultsArea) resultsArea.style.display = 'none';
        if (debugLog) debugLog.style.display = 'block';
        
        if (debugLog) debugLog.innerHTML += "DEBUG: Game state reset. Starting species creation.<br>";
        
        // Update UI
        if (typeof window.displayCurrentState === 'function') {
            window.displayCurrentState();
        } else {
            console.error("displayCurrentState function not available");
            throw new Error("Critical game function missing: displayCurrentState");
        }
        
        if (typeof window.updateStatusBar === 'function') {
            window.updateStatusBar();
        } else {
            console.warn("updateStatusBar function not available");
        }
        
        // After initialization, explicitly call showSpeciesCreationQuestion
        if (typeof window.showSpeciesCreationQuestion === 'function') {
            console.log("Calling showSpeciesCreationQuestion after initialization");
            window.showSpeciesCreationQuestion();
        } else {
            console.error("showSpeciesCreationQuestion function not available");
            throw new Error("Critical game function missing: showSpeciesCreationQuestion");
        }
        
        if (debugLog) debugLog.innerHTML += "DEBUG: Game initialization complete. First question should be visible.<br>";
        
        console.log("Game initialization complete");
        return true;
    } catch (error) {
        console.error("Error in initializeGame:", error);
        
        // Attempt recovery
        try {
            const gameOutput = document.getElementById("game-output");
            if(gameOutput) {
                gameOutput.innerHTML += "<span style='color:red;'>Error initializing game. Please refresh the page and try again.</span><br>";
            }
            
            // Last resort - create a minimal UI with restart option
            const gameContainer = document.getElementById("game-container");
            if (gameContainer) {
                gameContainer.innerHTML += `
                    <div style="margin-top: 20px; padding: 10px; background-color: #ffeeee; border: 1px solid #ff0000; border-radius: 5px;">
                        <h3>Game Initialization Error</h3>
                        <p>The game encountered an error during initialization. Please try refreshing the page.</p>
                        <button onclick="window.location.reload()">Refresh Page</button>
                    </div>
                `;
            }
        } catch (secondaryError) {
            console.error("Failed to recover from initialization error:", secondaryError);
            alert("Critical error initializing game. Please refresh the page.");
        }
        
        return false;
    }
}

/**
 * Exports the game choice history as a CSV file
 * @returns {boolean} Whether the download was initiated successfully
 */
export function downloadChoiceHistoryCSV() {
    try {
        if (gameState.choiceHistory.length === 0) {
            const gameOutput = document.getElementById("game-output");
            if(gameOutput) gameOutput.innerHTML += "<br><span style='color:orange;'>No history to download.</span>";
            return false;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        const headers = ["Year", "KScale", "GamePhase", "SubPhase", "PlayerRole", "Question/Event", "ChoiceMade", "Effect_Science", "Effect_Military", "Effect_Ecological", "Effect_Subversive", "Effect_Psychic", "Path_Sci_Before", "Path_Mil_Before", "Path_Eco_Before", "Path_Sub_Before", "Path_Psy_Before", "Path_Sci_After", "Path_Mil_After", "Path_Eco_After", "Path_Sub_After", "Path_Psy_After"];
        csvContent += headers.join(",") + "\r\n";

        gameState.choiceHistory.forEach(entry => {
            const effects = entry.effects || {};
            const pathBefore = entry.pathwaysBefore || {};
            const pathAfter = entry.pathwaysAfter || {};
            
            const row = [
                entry.year,
                entry.kScale,
                entry.phase,
                entry.subPhase || "",
                entry.role || "",
                (entry.question || "").replace(/,/g, ";"),
                (entry.choiceText || "").replace(/,/g, ";"),
                effects.science || 0,
                effects.military || 0,
                effects.ecological || 0,
                effects.subversive || 0,
                effects.psychic || 0,
                pathBefore.science || 0,
                pathBefore.military || 0,
                pathBefore.ecological || 0,
                pathBefore.subversive || 0,
                pathBefore.psychic || 0,
                pathAfter.science || 0,
                pathAfter.military || 0,
                pathAfter.ecological || 0,
                pathAfter.subversive || 0,
                pathAfter.psychic || 0
            ];
            
            csvContent += row.join(",") + "\r\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `hyperion_nexus_history_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        const gameOutput = document.getElementById("game-output");
        if(gameOutput) gameOutput.innerHTML += "<br><span style='color:green;'>History downloaded successfully.</span>";
        
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.DATA, { action: 'downloadChoiceHistoryCSV' });
            window.HyperionErrorHandling.displayErrorToUser("Error downloading history.", null, false);
        } else {
            console.error("Error in downloadChoiceHistoryCSV:", error);
            const gameOutput = document.getElementById("game-output");
            if(gameOutput) gameOutput.innerHTML += "<span style='color:red;'>Error downloading history.</span><br>";
        }
        return false;
    }
}

// Make functions available globally
window.gameState = gameState;
window.getTopCulturalPathways = getTopCulturalPathways;
window.handleChoice = handleChoice;
window.initializeGame = initializeGame;
window.downloadChoiceHistoryCSV = downloadChoiceHistoryCSV;
window.transitionGamePhase = transitionGamePhase;
window.ensureDOMStructure = ensureDOMStructure;
window.createRestartButton = createRestartButton;

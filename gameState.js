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

        if (gameState.gamePhase === "species_creation" || gameState.gamePhase === "starship_creation") {
            gameState.currentQuestionIndex++;
        } else if (gameState.gamePhase === "k_scale_progression" && gameState.subPhase === "event") {
            gameState.eventCounter++; 
            const currentKEvents = window.kScaleEvents[gameState.currentKScale.toFixed(1)];
            if (!currentKEvents || gameState.eventCounter >= 6) { 
                gameState.subPhase = "role_change_decision";
            }
        }

        // Increment game year for each event in k_scale_progression
        if (gameState.gamePhase === "k_scale_progression" && gameState.subPhase === "event") {
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
 * Initializes or resets the game state
 * @returns {boolean} Whether initialization was successful
 */
export function initializeGame() {
    try {
        const gameOutput = document.getElementById("game-output");
        const storyArea = document.getElementById("storyArea");
        const debugLog = document.getElementById("debugLog");
        const resultsArea = document.getElementById("results-area");
        const startButton = document.getElementById("start-button");
        const restartButton = document.getElementById("restart-button");
        const downloadLogButton = document.getElementById("download-log-button");

        if (!gameOutput || !storyArea || !resultsArea || !startButton || !restartButton || !downloadLogButton) {
            throw new Error("One or more UI elements missing for game initialization");
        }

        if (debugLog) debugLog.innerHTML = "DEBUG: initializeGame called.<br>";

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

        // Initialize new game if no saved state or user declined to restore
        gameState.gamePhase = "species_creation";
        gameState.currentQuestionIndex = 0;
        gameState.eventCounter = 0;
        gameState.culturalPathways = { science: 0, military: 0, ecological: 0, subversive: 0, psychic: 0 };
        gameState.playerRole = null;
        gameState.gameYear = 0;
        gameState.currentKScale = 0.9;
        gameState.choiceHistory = [];
        gameState.subPhase = null;

        window.clearGameUI(); 
        if(gameOutput) gameOutput.innerHTML = "Welcome! Let's begin creating your species.<br>";
        if(storyArea) storyArea.innerHTML = "The journey of a thousand stars begins with a single choice.";
        
        if (startButton) startButton.style.display = 'none';
        if (restartButton) restartButton.style.display = 'inline-block';
        if (downloadLogButton) downloadLogButton.style.display = 'none';
        if (resultsArea) resultsArea.style.display = 'none';
        if (debugLog) debugLog.style.display = 'block'; 

        if (debugLog) debugLog.innerHTML += "DEBUG: Game state reset. Starting species creation.<br>";
        
        window.displayCurrentState();
        window.updateStatusBar();
        
        // After initialization, explicitly call showSpeciesCreationQuestion
        if (typeof window.showSpeciesCreationQuestion === 'function') {
            console.log("Calling showSpeciesCreationQuestion after initialization");
            window.showSpeciesCreationQuestion();
        } else {
            console.error("showSpeciesCreationQuestion function not available");
        }
        
        if (debugLog) debugLog.innerHTML += "DEBUG: Game initialization complete. First question should be visible.<br>";
        
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.GAME_STATE, { action: 'initializeGame' });
            window.HyperionErrorHandling.displayErrorToUser("Error initializing game. Please refresh the page and try again.", null, true);
        } else {
            console.error("Error in initializeGame:", error);
            const gameOutput = document.getElementById("game-output");
            if(gameOutput) gameOutput.innerHTML += "<span style='color:red;'>Error initializing game. Please refresh the page and try again.</span><br>";
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
            const pathwaysBefore = entry.pathwaysBefore || {};
            const pathwaysAfter = entry.pathwaysAfter || {};
            
            const row = [
                entry.year,
                entry.kScale,
                entry.phase,
                entry.subPhase || "N/A",
                entry.role || "N/A",
                `"${(entry.question || "N/A").replace(/"/g, "\"\"")}"`,
                `"${(entry.choiceText || "N/A").replace(/"/g, "\"\"")}"`,
                effects.science || 0,
                effects.military || 0,
                effects.ecological || 0,
                effects.subversive || 0,
                effects.psychic || 0,
                pathwaysBefore.science || 0,
                pathwaysBefore.military || 0,
                pathwaysBefore.ecological || 0,
                pathwaysBefore.subversive || 0,
                pathwaysBefore.psychic || 0,
                pathwaysAfter.science || 0,
                pathwaysAfter.military || 0,
                pathwaysAfter.ecological || 0,
                pathwaysAfter.subversive || 0,
                pathwaysAfter.psychic || 0
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
            window.HyperionErrorHandling.displayErrorToUser("Error downloading history. Please try again.", null, false);
        } else {
            console.error("Error in downloadChoiceHistoryCSV:", error);
            const gameOutput = document.getElementById("game-output");
            if(gameOutput) gameOutput.innerHTML += "<span style='color:red;'>Error downloading history. Please try again.</span><br>";
        }
        return false;
    }
}

/**
 * Ends the game and displays final results
 * @param {string} reason - The reason for game end
 */
export function endGame(reason) {
    try {
        const gameOutput = document.getElementById("game-output");
        const resultsArea = document.getElementById("results-area");
        const resultsVisualization = document.getElementById("results-visualization");
        const downloadLogButton = document.getElementById("download-log-button");
        
        if (!gameOutput || !resultsArea || !resultsVisualization || !downloadLogButton) {
            throw new Error("One or more UI elements missing for game end");
        }
        
        gameState.gamePhase = "game_end";
        
        if(gameOutput) gameOutput.innerHTML += `<br><b>Game End: ${reason}</b><br>`;
        
        // Display results
        if(resultsArea) resultsArea.style.display = 'block';
        if(downloadLogButton) downloadLogButton.style.display = 'inline-block';
        
        // Create a simple visualization of cultural pathways
        if(resultsVisualization) {
            let html = "<h4>Final Cultural Pathway Values:</h4>";
            html += "<div style='display: flex; flex-wrap: wrap; gap: 10px;'>";
            
            for (const [pathway, value] of Object.entries(gameState.culturalPathways)) {
                const percentage = Math.min(100, Math.max(0, value)) / 100;
                const width = Math.max(50, percentage * 200);
                
                html += `
                <div style="flex: 1; min-width: 200px;">
                    <div style="font-weight: bold; text-transform: capitalize;">${pathway}: ${value}</div>
                    <div style="background-color: #eee; height: 20px; width: 200px; margin: 5px 0;">
                        <div style="background-color: #4a90e2; height: 100%; width: ${width}px;"></div>
                    </div>
                </div>`;
            }
            
            html += "</div>";
            
            // Add choice history summary
            html += "<h4>Journey Summary:</h4>";
            html += "<ul>";
            gameState.choiceHistory.forEach(entry => {
                html += `<li>Year ${entry.year}: ${entry.choiceText}</li>`;
            });
            html += "</ul>";
            
            resultsVisualization.innerHTML = html;
        }
        
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.GAME_STATE, { action: 'endGame' });
            window.HyperionErrorHandling.displayErrorToUser("Error displaying game results.", null, true);
        } else {
            console.error("Error in endGame:", error);
            const gameOutput = document.getElementById("game-output");
            if(gameOutput) gameOutput.innerHTML += "<span style='color:red;'>Error displaying game results.</span><br>";
        }
        return false;
    }
}

// Explicitly assign all exports to window object for global access
window.gameState = gameState;
window.getTopCulturalPathways = getTopCulturalPathways;
window.handleChoice = handleChoice;
window.initializeGame = initializeGame;
window.downloadChoiceHistoryCSV = downloadChoiceHistoryCSV;
window.endGame = endGame;

// Log that gameState module has been loaded
console.log("gameState module loaded, gameState object:", window.gameState);

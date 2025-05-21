/**
 * Hyperion Nexus Phase Manager Module
 * 
 * This module manages the different game phases and their display for the Hyperion Nexus game.
 * It handles the UI presentation for each game phase, from species creation to game end.
 */

// Import game state from gameState.js module
import { gameState, getTopCulturalPathways } from './gameState.js';

/**
 * Displays the current species creation question
 * @returns {boolean} Whether the display was successful
 */
export function showSpeciesCreationQuestion() {
    try {
        console.log("showSpeciesCreationQuestion called");
        
        // First ensure DOM elements exist
        const choiceArea = document.getElementById("choice-area");
        const storyArea = document.getElementById("storyArea");
        
        console.log("DOM elements:", {
            choiceArea: choiceArea,
            storyArea: storyArea
        });
        
        if (!choiceArea || !storyArea) {
            console.error("UI elements missing for species creation question");
            
            // Attempt to recreate missing elements
            if (!storyArea) {
                const gameContent = document.getElementById("game-content");
                if (gameContent) {
                    const newStoryArea = document.createElement("div");
                    newStoryArea.id = "storyArea";
                    gameContent.appendChild(newStoryArea);
                    console.log("Recreated storyArea element");
                }
            }
            
            if (!choiceArea) {
                const gameChoices = document.getElementById("game-choices");
                if (gameChoices) {
                    const newChoiceArea = document.createElement("div");
                    newChoiceArea.id = "choice-area";
                    gameChoices.appendChild(newChoiceArea);
                    console.log("Recreated choice-area element");
                }
            }
            
            // Try again with recreated elements
            const retryChoiceArea = document.getElementById("choice-area");
            const retryStoryArea = document.getElementById("storyArea");
            
            if (!retryChoiceArea || !retryStoryArea) {
                throw new Error("Failed to recreate UI elements for species creation question");
            }
        }
        
        const speciesCreationQuestions = window.speciesCreationQuestions;
        if (!speciesCreationQuestions) {
            throw new Error("Species creation questions not found");
        }
        
        // Check for out-of-bounds index and handle appropriately
        if (gameState.currentQuestionIndex >= speciesCreationQuestions.length) {
            console.log("Question index out of bounds, transitioning to species summary");
            if (typeof window.transitionGamePhase === 'function') {
                window.transitionGamePhase("species_summary");
                return true;
            } else {
                gameState.gamePhase = "species_summary";
                gameState.currentQuestionIndex = 0;
                window.displayCurrentState(gameState);
                return true;
            }
        }
        
        const currentQuestion = speciesCreationQuestions[gameState.currentQuestionIndex];
        storyArea.innerHTML = `<h3>Species Creation: ${gameState.currentQuestionIndex + 1}/${speciesCreationQuestions.length}</h3>
            <p>${currentQuestion.text}</p>`;
        
        choiceArea.innerHTML = "";
        currentQuestion.choices.forEach(choice => {
            const button = document.createElement("button");
            button.className = "choice-button";
            button.textContent = choice.text;
            button.onclick = function() { window.handleChoice(choice.id); };
            choiceArea.appendChild(button);
        });
        
        console.log("Species creation question displayed successfully");
        return true;
    } catch (error) {
        console.error("Error in showSpeciesCreationQuestion:", error);
        
        // Attempt recovery
        try {
            const storyArea = document.getElementById("storyArea");
            const choiceArea = document.getElementById("choice-area");
            
            if (storyArea) {
                storyArea.innerHTML = `<h3>Error Displaying Question</h3>
                    <p>There was an error displaying the current question. Please try again or restart the game.</p>`;
            }
            
            if (choiceArea) {
                choiceArea.innerHTML = "";
                const restartButton = document.createElement("button");
                restartButton.className = "choice-button";
                restartButton.textContent = "Restart Game";
                restartButton.onclick = function() {
                    if (confirm("Would you like to restart the game?")) {
                        localStorage.removeItem('hyperionNexusGameState');
                        window.initializeGame();
                    }
                };
                choiceArea.appendChild(restartButton);
            }
        } catch (secondaryError) {
            console.error("Failed to recover from showSpeciesCreationQuestion error:", secondaryError);
        }
        
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { 
                action: 'showSpeciesCreationQuestion',
                questionIndex: gameState.currentQuestionIndex
            });
            window.HyperionErrorHandling.displayErrorToUser("Error displaying species creation question.", null, true);
        }
        return false;
    }
}

/**
 * Displays the species creation summary
 * @returns {boolean} Whether the display was successful
 */
export function showSpeciesSummary() {
    try {
        console.log("showSpeciesSummary called");
        
        // First ensure DOM elements exist
        const choiceArea = document.getElementById("choice-area");
        const storyArea = document.getElementById("storyArea");
        const gameOutput = document.getElementById("game-output");
        
        console.log("DOM elements:", {
            choiceArea: choiceArea,
            storyArea: storyArea,
            gameOutput: gameOutput
        });
        
        if (!choiceArea || !storyArea || !gameOutput) {
            console.error("UI elements missing for species summary");
            
            // Attempt to recreate missing elements
            if (typeof window.ensureDOMStructure === 'function') {
                window.ensureDOMStructure();
            }
            
            // Try again with recreated elements
            const retryChoiceArea = document.getElementById("choice-area");
            const retryStoryArea = document.getElementById("storyArea");
            const retryGameOutput = document.getElementById("game-output");
            
            if (!retryChoiceArea || !retryStoryArea || !retryGameOutput) {
                throw new Error("Failed to recreate UI elements for species summary");
            }
        }
        
        const topPathways = getTopCulturalPathways();
        let speciesDescription = "Your species has been shaped by your choices. ";
        
        if (topPathways.length > 0) {
            const dominantPath = topPathways[0].name;
            
            if (dominantPath === "science") {
                speciesDescription += "They are naturally curious and analytical, with a strong drive to understand the universe through observation and experimentation.";
            } else if (dominantPath === "military") {
                speciesDescription += "They possess a strong sense of discipline and hierarchy, with natural aptitudes for strategy and coordination in challenging situations.";
            } else if (dominantPath === "ecological") {
                speciesDescription += "They have a deep connection to their environment, with intuitive understanding of natural systems and cycles.";
            } else if (dominantPath === "subversive") {
                speciesDescription += "They are adaptable and independent, with natural talents for finding unconventional solutions and operating autonomously.";
            } else if (dominantPath === "psychic") {
                speciesDescription += "They possess unusual mental abilities, with natural sensitivity to consciousness and the subtle connections between minds.";
            }
        }
        
        storyArea.innerHTML = `<h3>Species Creation Complete</h3>
            <p>${speciesDescription}</p>
            <p>Now it's time to design your first warp-capable starship that will carry your civilization to the stars.</p>`;
        
        gameOutput.innerHTML += "<br>Species creation complete. Moving to starship design.<br>";
        
        choiceArea.innerHTML = "";
        const button = document.createElement("button");
        button.className = "choice-button";
        button.textContent = "Begin Starship Design";
        button.onclick = function() {
            if (typeof window.transitionGamePhase === 'function') {
                window.transitionGamePhase("starship_creation", null, true);
            } else {
                gameState.gamePhase = "starship_creation";
                gameState.currentQuestionIndex = 0;
                window.displayCurrentState(gameState);
            }
        };
        choiceArea.appendChild(button);
        
        console.log("Species summary displayed successfully");
        return true;
    } catch (error) {
        console.error("Error in showSpeciesSummary:", error);
        
        // Attempt recovery
        try {
            const storyArea = document.getElementById("storyArea");
            const choiceArea = document.getElementById("choice-area");
            
            if (storyArea) {
                storyArea.innerHTML = `<h3>Error Displaying Species Summary</h3>
                    <p>There was an error displaying the species summary. Please try again or restart the game.</p>`;
            }
            
            if (choiceArea) {
                choiceArea.innerHTML = "";
                const continueButton = document.createElement("button");
                continueButton.className = "choice-button";
                continueButton.textContent = "Continue to Starship Design";
                continueButton.onclick = function() {
                    if (typeof window.transitionGamePhase === 'function') {
                        window.transitionGamePhase("starship_creation", null, true);
                    } else {
                        gameState.gamePhase = "starship_creation";
                        gameState.currentQuestionIndex = 0;
                        window.displayCurrentState(gameState);
                    }
                };
                choiceArea.appendChild(continueButton);
                
                const restartButton = document.createElement("button");
                restartButton.className = "choice-button";
                restartButton.textContent = "Restart Game";
                restartButton.onclick = function() {
                    if (confirm("Would you like to restart the game?")) {
                        localStorage.removeItem('hyperionNexusGameState');
                        window.initializeGame();
                    }
                };
                choiceArea.appendChild(restartButton);
            }
        } catch (secondaryError) {
            console.error("Failed to recover from showSpeciesSummary error:", secondaryError);
        }
        
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'showSpeciesSummary' });
            window.HyperionErrorHandling.displayErrorToUser("Error displaying species summary.", null, true);
        }
        return false;
    }
}

/**
 * Displays the current starship creation question
 * @returns {boolean} Whether the display was successful
 */
export function showStarshipCreationQuestion() {
    try {
        console.log("showStarshipCreationQuestion called");
        
        // First ensure DOM elements exist
        const choiceArea = document.getElementById("choice-area");
        const storyArea = document.getElementById("storyArea");
        
        console.log("DOM elements:", {
            choiceArea: choiceArea,
            storyArea: storyArea
        });
        
        if (!choiceArea || !storyArea) {
            console.error("UI elements missing for starship creation question");
            
            // Attempt to recreate missing elements
            if (typeof window.ensureDOMStructure === 'function') {
                window.ensureDOMStructure();
            }
            
            // Try again with recreated elements
            const retryChoiceArea = document.getElementById("choice-area");
            const retryStoryArea = document.getElementById("storyArea");
            
            if (!retryChoiceArea || !retryStoryArea) {
                throw new Error("Failed to recreate UI elements for starship creation question");
            }
        }
        
        const starshipCreationQuestions = window.starshipCreationQuestions;
        if (!starshipCreationQuestions) {
            throw new Error("Starship creation questions not found");
        }
        
        // Check for out-of-bounds index and handle appropriately
        if (gameState.currentQuestionIndex >= starshipCreationQuestions.length) {
            console.log("Question index out of bounds, transitioning to starship summary");
            if (typeof window.transitionGamePhase === 'function') {
                window.transitionGamePhase("starship_summary");
                return true;
            } else {
                gameState.gamePhase = "starship_summary";
                gameState.currentQuestionIndex = 0;
                window.displayCurrentState(gameState);
                return true;
            }
        }
        
        // For the first question, allow starship naming
        if (gameState.currentQuestionIndex === 0) {
            storyArea.innerHTML = `<h3>Starship Creation: ${gameState.currentQuestionIndex + 1}/${starshipCreationQuestions.length}</h3>
                <p>Before we begin designing your starship, what name will you give to this historic vessel?</p>
                <input type="text" id="starship-name" value="${gameState.starshipName}" placeholder="Enter starship name">`;
            
            choiceArea.innerHTML = "";
            const nameButton = document.createElement("button");
            nameButton.className = "choice-button";
            nameButton.textContent = "Confirm Name";
            nameButton.onclick = function() {
                const nameInput = document.getElementById("starship-name");
                if (nameInput && nameInput.value.trim() !== "") {
                    gameState.starshipName = nameInput.value.trim();
                }
                showCurrentStarshipQuestion();
            };
            choiceArea.appendChild(nameButton);
        } else {
            showCurrentStarshipQuestion();
        }
        
        function showCurrentStarshipQuestion() {
            const currentQuestion = starshipCreationQuestions[gameState.currentQuestionIndex];
            storyArea.innerHTML = `<h3>Starship Creation: ${gameState.currentQuestionIndex + 1}/${starshipCreationQuestions.length}</h3>
                <p>${currentQuestion.text.replace('{starshipName}', gameState.starshipName)}</p>`;
            
            choiceArea.innerHTML = "";
            currentQuestion.choices.forEach(choice => {
                const button = document.createElement("button");
                button.className = "choice-button";
                button.textContent = choice.text;
                button.onclick = function() { window.handleChoice(choice.id); };
                choiceArea.appendChild(button);
            });
        }
        
        console.log("Starship creation question displayed successfully");
        return true;
    } catch (error) {
        console.error("Error in showStarshipCreationQuestion:", error);
        
        // Attempt recovery
        try {
            const storyArea = document.getElementById("storyArea");
            const choiceArea = document.getElementById("choice-area");
            
            if (storyArea) {
                storyArea.innerHTML = `<h3>Error Displaying Question</h3>
                    <p>There was an error displaying the current starship question. Please try again or restart the game.</p>`;
            }
            
            if (choiceArea) {
                choiceArea.innerHTML = "";
                const restartButton = document.createElement("button");
                restartButton.className = "choice-button";
                restartButton.textContent = "Restart Game";
                restartButton.onclick = function() {
                    if (confirm("Would you like to restart the game?")) {
                        localStorage.removeItem('hyperionNexusGameState');
                        window.initializeGame();
                    }
                };
                choiceArea.appendChild(restartButton);
            }
        } catch (secondaryError) {
            console.error("Failed to recover from showStarshipCreationQuestion error:", secondaryError);
        }
        
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { 
                action: 'showStarshipCreationQuestion',
                questionIndex: gameState.currentQuestionIndex
            });
            window.HyperionErrorHandling.displayErrorToUser("Error displaying starship creation question.", null, true);
        }
        return false;
    }
}

/**
 * Displays the starship creation summary
 * @returns {boolean} Whether the display was successful
 */
export function showStarshipSummary() {
    try {
        console.log("showStarshipSummary called");
        
        // First ensure DOM elements exist
        const choiceArea = document.getElementById("choice-area");
        const storyArea = document.getElementById("storyArea");
        const gameOutput = document.getElementById("game-output");
        
        console.log("DOM elements:", {
            choiceArea: choiceArea,
            storyArea: storyArea,
            gameOutput: gameOutput
        });
        
        if (!choiceArea || !storyArea || !gameOutput) {
            console.error("UI elements missing for starship summary");
            
            // Attempt to recreate missing elements
            if (typeof window.ensureDOMStructure === 'function') {
                window.ensureDOMStructure();
            }
            
            // Try again with recreated elements
            const retryChoiceArea = document.getElementById("choice-area");
            const retryStoryArea = document.getElementById("storyArea");
            const retryGameOutput = document.getElementById("game-output");
            
            if (!retryChoiceArea || !retryStoryArea || !retryGameOutput) {
                throw new Error("Failed to recreate UI elements for starship summary");
            }
        }
        
        const topPathways = getTopCulturalPathways();
        let starshipDescription = `The ${gameState.starshipName} has been designed according to your specifications. `;
        
        if (topPathways.length > 0) {
            const dominantPath = topPathways[0].name;
            
            if (dominantPath === "science") {
                starshipDescription += "It features advanced sensor arrays and research facilities, optimized for exploration and discovery.";
            } else if (dominantPath === "military") {
                starshipDescription += "It is equipped with powerful defensive systems and tactical capabilities, ready to protect your civilization's interests.";
            } else if (dominantPath === "ecological") {
                starshipDescription += "It incorporates sustainable systems and environmental monitoring technology, designed to minimize impact on space ecosystems.";
            } else if (dominantPath === "subversive") {
                starshipDescription += "It includes stealth capabilities and adaptable systems, perfect for independent operations and unconventional missions.";
            } else if (dominantPath === "psychic") {
                starshipDescription += "It contains unique chambers and technologies designed to amplify and focus consciousness, enabling new forms of perception and communication.";
            }
        }
        
        storyArea.innerHTML = `<h3>Starship Design Complete</h3>
            <p>${starshipDescription}</p>
            <p>With your species defined and your starship ready, it's time to choose your role in this new era of interstellar exploration.</p>`;
        
        gameOutput.innerHTML += `<br>Starship design complete. The ${gameState.starshipName} stands ready.<br>`;
        
        choiceArea.innerHTML = "";
        const button = document.createElement("button");
        button.className = "choice-button";
        button.textContent = "Choose Your Role";
        button.onclick = function() {
            if (typeof window.transitionGamePhase === 'function') {
                window.transitionGamePhase("role_selection_initial");
            } else {
                gameState.gamePhase = "role_selection_initial";
                window.displayCurrentState(gameState);
            }
        };
        choiceArea.appendChild(button);
        
        console.log("Starship summary displayed successfully");
        return true;
    } catch (error) {
        console.error("Error in showStarshipSummary:", error);
        
        // Attempt recovery
        try {
            const storyArea = document.getElementById("storyArea");
            const choiceArea = document.getElementById("choice-area");
            
            if (storyArea) {
                storyArea.innerHTML = `<h3>Error Displaying Starship Summary</h3>
                    <p>There was an error displaying the starship summary. Please try again or restart the game.</p>`;
            }
            
            if (choiceArea) {
                choiceArea.innerHTML = "";
                const continueButton = document.createElement("button");
                continueButton.className = "choice-button";
                continueButton.textContent = "Continue to Role Selection";
                continueButton.onclick = function() {
                    if (typeof window.transitionGamePhase === 'function') {
                        window.transitionGamePhase("role_selection_initial");
                    } else {
                        gameState.gamePhase = "role_selection_initial";
                        window.displayCurrentState(gameState);
                    }
                };
                choiceArea.appendChild(continueButton);
                
                const restartButton = document.createElement("button");
                restartButton.className = "choice-button";
                restartButton.textContent = "Restart Game";
                restartButton.onclick = function() {
                    if (confirm("Would you like to restart the game?")) {
                        localStorage.removeItem('hyperionNexusGameState');
                        window.initializeGame();
                    }
                };
                choiceArea.appendChild(restartButton);
            }
        } catch (secondaryError) {
            console.error("Failed to recover from showStarshipSummary error:", secondaryError);
        }
        
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'showStarshipSummary' });
            window.HyperionErrorHandling.displayErrorToUser("Error displaying starship summary.", null, true);
        }
        return false;
    }
}

/**
 * Displays the initial role selection screen
 * @returns {boolean} Whether the display was successful
 */
export function showRoleSelectionInitial() {
    try {
        console.log("showRoleSelectionInitial called");
        
        // First ensure DOM elements exist
        const choiceArea = document.getElementById("choice-area");
        const storyArea = document.getElementById("storyArea");
        
        console.log("DOM elements:", {
            choiceArea: choiceArea,
            storyArea: storyArea
        });
        
        if (!choiceArea || !storyArea) {
            console.error("UI elements missing for role selection");
            
            // Attempt to recreate missing elements
            if (typeof window.ensureDOMStructure === 'function') {
                window.ensureDOMStructure();
            }
            
            // Try again with recreated elements
            const retryChoiceArea = document.getElementById("choice-area");
            const retryStoryArea = document.getElementById("storyArea");
            
            if (!retryChoiceArea || !retryStoryArea) {
                throw new Error("Failed to recreate UI elements for role selection");
            }
        }
        
        storyArea.innerHTML = `<h3>Choose Your Role</h3>
            <p>As your civilization ventures into the stars, you must decide what role you will play in this grand journey.</p>
            <div class="role-cards">
                <div class="role-card">
                    <h4>Starship Captain</h4>
                    <p>Command the ${gameState.starshipName} directly, making tactical decisions and leading from the front lines of exploration.</p>
                    <p>Focus: Individual missions, crew management, direct encounters</p>
                </div>
                <div class="role-card">
                    <h4>Civilization Leader</h4>
                    <p>Guide your entire civilization's development, making strategic decisions about research, expansion, and diplomacy.</p>
                    <p>Focus: Long-term planning, resource allocation, interspecies relations</p>
                </div>
            </div>`;
        
        choiceArea.innerHTML = "";
        
        const captainButton = document.createElement("button");
        captainButton.className = "choice-button";
        captainButton.textContent = "Become Captain";
        captainButton.onclick = function() { window.handleChoice("captain"); };
        choiceArea.appendChild(captainButton);
        
        const leaderButton = document.createElement("button");
        leaderButton.className = "choice-button";
        leaderButton.textContent = "Become Civilization Leader";
        leaderButton.onclick = function() { window.handleChoice("civ_leader"); };
        choiceArea.appendChild(leaderButton);
        
        console.log("Role selection displayed successfully");
        return true;
    } catch (error) {
        console.error("Error in showRoleSelectionInitial:", error);
        
        // Attempt recovery
        try {
            const storyArea = document.getElementById("storyArea");
            const choiceArea = document.getElementById("choice-area");
            
            if (storyArea) {
                storyArea.innerHTML = `<h3>Error Displaying Role Selection</h3>
                    <p>There was an error displaying the role selection screen. Please try again or restart the game.</p>`;
            }
            
            if (choiceArea) {
                choiceArea.innerHTML = "";
                const captainButton = document.createElement("button");
                captainButton.className = "choice-button";
                captainButton.textContent = "Become Captain";
                captainButton.onclick = function() { window.handleChoice("captain"); };
                choiceArea.appendChild(captainButton);
                
                const leaderButton = document.createElement("button");
                leaderButton.className = "choice-button";
                leaderButton.textContent = "Become Civilization Leader";
                leaderButton.onclick = function() { window.handleChoice("civ_leader"); };
                choiceArea.appendChild(leaderButton);
                
                const restartButton = document.createElement("button");
                restartButton.className = "choice-button";
                restartButton.textContent = "Restart Game";
                restartButton.onclick = function() {
                    if (confirm("Would you like to restart the game?")) {
                        localStorage.removeItem('hyperionNexusGameState');
                        window.initializeGame();
                    }
                };
                choiceArea.appendChild(restartButton);
            }
        } catch (secondaryError) {
            console.error("Failed to recover from showRoleSelectionInitial error:", secondaryError);
        }
        
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'showRoleSelectionInitial' });
            window.HyperionErrorHandling.displayErrorToUser("Error displaying role selection.", null, true);
        }
        return false;
    }
}

// Make functions available globally
window.showSpeciesCreationQuestion = showSpeciesCreationQuestion;
window.showSpeciesSummary = showSpeciesSummary;
window.showStarshipCreationQuestion = showStarshipCreationQuestion;
window.showStarshipSummary = showStarshipSummary;
window.showRoleSelectionInitial = showRoleSelectionInitial;

// Log that phaseManager module has been loaded
console.log("phaseManager module loaded, functions available:", {
    showSpeciesCreationQuestion: typeof window.showSpeciesCreationQuestion,
    showSpeciesSummary: typeof window.showSpeciesSummary,
    showStarshipCreationQuestion: typeof window.showStarshipCreationQuestion,
    showStarshipSummary: typeof window.showStarshipSummary,
    showRoleSelectionInitial: typeof window.showRoleSelectionInitial
});

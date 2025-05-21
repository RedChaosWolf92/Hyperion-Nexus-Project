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
        
        const choiceArea = document.getElementById("choice-area");
        const storyArea = document.getElementById("storyArea");
        
        console.log("DOM elements:", {
            choiceArea: choiceArea,
            storyArea: storyArea
        });
        
        if (!choiceArea || !storyArea) {
            throw new Error("UI elements missing for species creation question");
        }
        
        const speciesCreationQuestions = window.speciesCreationQuestions;
        if (!speciesCreationQuestions) {
            throw new Error("Species creation questions not found");
        }
        
        if (gameState.currentQuestionIndex >= speciesCreationQuestions.length) {
            throw new Error("Invalid question index for species creation: " + gameState.currentQuestionIndex);
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
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { 
                action: 'showSpeciesCreationQuestion',
                questionIndex: gameState.currentQuestionIndex
            });
            window.HyperionErrorHandling.displayErrorToUser("Error displaying species creation question.", null, true);
        } else {
            console.error("Error in showSpeciesCreationQuestion:", error);
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
        
        const choiceArea = document.getElementById("choice-area");
        const storyArea = document.getElementById("storyArea");
        const gameOutput = document.getElementById("game-output");
        
        console.log("DOM elements:", {
            choiceArea: choiceArea,
            storyArea: storyArea,
            gameOutput: gameOutput
        });
        
        if (!choiceArea || !storyArea || !gameOutput) {
            throw new Error("UI elements missing for species summary");
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
        
        const button = document.createElement("button");
        button.className = "choice-button";
        button.textContent = "Begin Starship Design";
        button.onclick = function() {
            gameState.gamePhase = "starship_creation";
            gameState.currentQuestionIndex = 0;
            window.displayCurrentState();
        };
        choiceArea.appendChild(button);
        
        console.log("Species summary displayed successfully");
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'showSpeciesSummary' });
            window.HyperionErrorHandling.displayErrorToUser("Error displaying species summary.", null, true);
        } else {
            console.error("Error in showSpeciesSummary:", error);
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
        
        const choiceArea = document.getElementById("choice-area");
        const storyArea = document.getElementById("storyArea");
        
        console.log("DOM elements:", {
            choiceArea: choiceArea,
            storyArea: storyArea
        });
        
        if (!choiceArea || !storyArea) {
            throw new Error("UI elements missing for starship creation question");
        }
        
        const starshipCreationQuestions = window.starshipCreationQuestions;
        if (!starshipCreationQuestions) {
            throw new Error("Starship creation questions not found");
        }
        
        if (gameState.currentQuestionIndex >= starshipCreationQuestions.length) {
            throw new Error("Invalid question index for starship creation: " + gameState.currentQuestionIndex);
        }
        
        // For the first question, allow starship naming
        if (gameState.currentQuestionIndex === 0) {
            storyArea.innerHTML = `<h3>Starship Creation: ${gameState.currentQuestionIndex + 1}/${starshipCreationQuestions.length}</h3>
                <p>Before we begin designing your starship, what name will you give to this historic vessel?</p>
                <input type="text" id="starship-name" value="${gameState.starshipName}" placeholder="Enter starship name">`;
            
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
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { 
                action: 'showStarshipCreationQuestion',
                questionIndex: gameState.currentQuestionIndex
            });
            window.HyperionErrorHandling.displayErrorToUser("Error displaying starship creation question.", null, true);
        } else {
            console.error("Error in showStarshipCreationQuestion:", error);
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
        
        const choiceArea = document.getElementById("choice-area");
        const storyArea = document.getElementById("storyArea");
        const gameOutput = document.getElementById("game-output");
        
        console.log("DOM elements:", {
            choiceArea: choiceArea,
            storyArea: storyArea,
            gameOutput: gameOutput
        });
        
        if (!choiceArea || !storyArea || !gameOutput) {
            throw new Error("UI elements missing for starship summary");
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
        
        const button = document.createElement("button");
        button.className = "choice-button";
        button.textContent = "Choose Your Role";
        button.onclick = function() {
            gameState.gamePhase = "role_selection_initial";
            window.displayCurrentState();
        };
        choiceArea.appendChild(button);
        
        console.log("Starship summary displayed successfully");
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'showStarshipSummary' });
            window.HyperionErrorHandling.displayErrorToUser("Error displaying starship summary.", null, true);
        } else {
            console.error("Error in showStarshipSummary:", error);
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
        
        const choiceArea = document.getElementById("choice-area");
        const storyArea = document.getElementById("storyArea");
        
        console.log("DOM elements:", {
            choiceArea: choiceArea,
            storyArea: storyArea
        });
        
        if (!choiceArea || !storyArea) {
            throw new Error("UI elements missing for role selection");
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
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'showRoleSelectionInitial' });
            window.HyperionErrorHandling.displayErrorToUser("Error displaying role selection.", null, true);
        } else {
            console.error("Error in showRoleSelectionInitial:", error);
        }
        return false;
    }
}

/**
 * Displays the current K-Scale event
 * @returns {boolean} Whether the display was successful
 */
export function showKScaleEvent() {
    try {
        console.log("showKScaleEvent called");
        
        const choiceArea = document.getElementById("choice-area");
        const storyArea = document.getElementById("storyArea");
        
        console.log("DOM elements:", {
            choiceArea: choiceArea,
            storyArea: storyArea
        });
        
        if (!choiceArea || !storyArea) {
            throw new Error("UI elements missing for K-Scale event");
        }
        
        const kScaleEvents = window.kScaleEvents;
        if (!kScaleEvents) {
            throw new Error("K-Scale events not found");
        }
        
        const currentKScaleEvents = kScaleEvents[gameState.currentKScale.toFixed(1)];
        if (!currentKScaleEvents || gameState.eventCounter >= currentKScaleEvents.length) {
            throw new Error(`No events found for K-Scale ${gameState.currentKScale.toFixed(1)} at counter ${gameState.eventCounter}`);
        }
        
        const currentEvent = currentKScaleEvents[gameState.eventCounter];
        const eventText = currentEvent.text_template
            .replace('{starshipName}', gameState.starshipName)
            .replace('{gameYear}', gameState.gameYear);
        
        let roleSpecificIntro = "";
        if (gameState.playerRole === "Captain") {
            roleSpecificIntro = `<p>As Captain of the ${gameState.starshipName}, you must decide:</p>`;
        } else if (gameState.playerRole === "Civilization Leader") {
            roleSpecificIntro = "<p>As leader of your civilization, you must decide:</p>";
        }
        
        storyArea.innerHTML = `<h3>Year ${gameState.gameYear} - K-Scale ${gameState.currentKScale.toFixed(1)}</h3>
            <p>${eventText}</p>
            ${roleSpecificIntro}`;
        
        choiceArea.innerHTML = "";
        currentEvent.choices.forEach(choice => {
            const button = document.createElement("button");
            button.className = "choice-button";
            button.textContent = choice.text;
            button.onclick = function() { window.handleChoice(choice.id); };
            choiceArea.appendChild(button);
        });
        
        console.log("K-Scale event displayed successfully");
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { 
                action: 'showKScaleEvent',
                kScale: gameState.currentKScale,
                eventCounter: gameState.eventCounter
            });
            window.HyperionErrorHandling.displayErrorToUser("Error displaying K-Scale event.", null, true);
        } else {
            console.error("Error in showKScaleEvent:", error);
        }
        return false;
    }
}

/**
 * Displays the role change decision at K-Scale milestones
 * @returns {boolean} Whether the display was successful
 */
export function showRoleChangeDecision() {
    try {
        console.log("showRoleChangeDecision called");
        
        const choiceArea = document.getElementById("choice-area");
        const storyArea = document.getElementById("storyArea");
        
        console.log("DOM elements:", {
            choiceArea: choiceArea,
            storyArea: storyArea
        });
        
        if (!choiceArea || !storyArea) {
            throw new Error("UI elements missing for role change decision");
        }
        
        const nextKScale = (gameState.currentKScale + 0.2).toFixed(1);
        
        storyArea.innerHTML = `<h3>K-Scale Milestone: ${gameState.currentKScale.toFixed(1)} → ${nextKScale}</h3>
            <p>Your civilization has reached a significant technological milestone. As capabilities expand, leadership roles may shift.</p>
            <p>Currently, you serve as: <strong>${gameState.playerRole}</strong></p>
            <p>Would you like to continue in this role, or transition to a different position?</p>`;
        
        choiceArea.innerHTML = "";
        
        const continueButton = document.createElement("button");
        continueButton.className = "choice-button";
        continueButton.textContent = `Continue as ${gameState.playerRole}`;
        continueButton.onclick = function() { window.handleChoice("continue_role"); };
        choiceArea.appendChild(continueButton);
        
        if (gameState.playerRole === "Captain") {
            const changeButton = document.createElement("button");
            changeButton.className = "choice-button";
            changeButton.textContent = "Transition to Civilization Leader";
            changeButton.onclick = function() { window.handleChoice("change_to_civ_leader"); };
            choiceArea.appendChild(changeButton);
        } else if (gameState.playerRole === "Civilization Leader") {
            const changeButton = document.createElement("button");
            changeButton.className = "choice-button";
            changeButton.textContent = "Transition to Starship Captain";
            changeButton.onclick = function() { window.handleChoice("change_to_captain"); };
            choiceArea.appendChild(changeButton);
        }
        
        console.log("Role change decision displayed successfully");
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'showRoleChangeDecision' });
            window.HyperionErrorHandling.displayErrorToUser("Error displaying role change decision.", null, true);
        } else {
            console.error("Error in showRoleChangeDecision:", error);
        }
        return false;
    }
}

/**
 * Displays the game end screen
 * @param {string} reason - The reason for game end
 * @returns {boolean} Whether the display was successful
 */
export function showGameEnd(reason) {
    try {
        console.log("showGameEnd called");
        
        const choiceArea = document.getElementById("choice-area");
        const storyArea = document.getElementById("storyArea");
        
        console.log("DOM elements:", {
            choiceArea: choiceArea,
            storyArea: storyArea
        });
        
        if (!choiceArea || !storyArea) {
            throw new Error("UI elements missing for game end");
        }
        
        const topPathways = getTopCulturalPathways();
        let civilizationDescription = "Your civilization has been shaped by your choices. ";
        
        if (topPathways.length > 0) {
            const dominantPath = topPathways[0].name;
            
            if (dominantPath === "science") {
                civilizationDescription += "It has become known throughout the galaxy for its scientific achievements and contributions to knowledge.";
            } else if (dominantPath === "military") {
                civilizationDescription += "It has established itself as a formidable power, respected and sometimes feared for its military capabilities.";
            } else if (dominantPath === "ecological") {
                civilizationDescription += "It has pioneered sustainable approaches to interstellar expansion, preserving and enhancing the environments it encounters.";
            } else if (dominantPath === "subversive") {
                civilizationDescription += "It has developed a reputation for unconventional approaches and adaptability in the face of challenges.";
            } else if (dominantPath === "psychic") {
                civilizationDescription += "It has unlocked new dimensions of consciousness, exploring the universe through both technology and mind.";
            }
        }
        
        storyArea.innerHTML = `<h3>Journey Complete</h3>
            <p>${reason}</p>
            <p>${civilizationDescription}</p>
            <p>Thank you for playing Hyperion Nexus. Your choices have created a unique story of interstellar exploration and development.</p>`;
        
        choiceArea.innerHTML = "";
        
        const restartButton = document.createElement("button");
        restartButton.className = "choice-button";
        restartButton.textContent = "Start New Game";
        restartButton.onclick = function() { 
            if (confirm("Are you sure you want to start a new game? All progress will be lost.")) {
                localStorage.removeItem('hyperionNexusGameState');
                window.initializeGame();
            }
        };
        choiceArea.appendChild(restartButton);
        
        const downloadButton = document.createElement("button");
        downloadButton.className = "choice-button";
        downloadButton.textContent = "Download Journey Log";
        downloadButton.onclick = function() { window.downloadChoiceHistoryCSV(); };
        choiceArea.appendChild(downloadButton);
        
        console.log("Game end displayed successfully");
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'showGameEnd' });
            window.HyperionErrorHandling.displayErrorToUser("Error displaying game end screen.", null, true);
        } else {
            console.error("Error in showGameEnd:", error);
        }
        return false;
    }
}

// Explicitly assign all exports to window object for global access
window.showSpeciesCreationQuestion = showSpeciesCreationQuestion;
window.showSpeciesSummary = showSpeciesSummary;
window.showStarshipCreationQuestion = showStarshipCreationQuestion;
window.showStarshipSummary = showStarshipSummary;
window.showRoleSelectionInitial = showRoleSelectionInitial;
window.showKScaleEvent = showKScaleEvent;
window.showRoleChangeDecision = showRoleChangeDecision;
window.showGameEnd = showGameEnd;

// Log that phaseManager module has been loaded
console.log("phaseManager module loaded, functions available:", {
    showSpeciesCreationQuestion: typeof window.showSpeciesCreationQuestion,
    showSpeciesSummary: typeof window.showSpeciesSummary,
    showStarshipCreationQuestion: typeof window.showStarshipCreationQuestion,
    showStarshipSummary: typeof window.showStarshipSummary,
    showRoleSelectionInitial: typeof window.showRoleSelectionInitial,
    showKScaleEvent: typeof window.showKScaleEvent,
    showRoleChangeDecision: typeof window.showRoleChangeDecision,
    showGameEnd: typeof window.showGameEnd
});

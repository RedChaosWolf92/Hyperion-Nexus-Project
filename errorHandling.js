/**
 * Hyperion Nexus Error Handling Module
 * 
 * This module provides centralized error handling functionality for the Hyperion Nexus game.
 * It includes utilities for logging, displaying, and recovering from errors.
 */

// Error types enum for categorizing different errors
const ErrorType = {
    UI: 'UI_ERROR',
    GAME_STATE: 'GAME_STATE_ERROR',
    DATA: 'DATA_ERROR',
    NETWORK: 'NETWORK_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    UNKNOWN: 'UNKNOWN_ERROR'
};

/**
 * Central error logger that handles different types of errors
 * @param {Error|string} error - The error object or message
 * @param {string} type - The type of error from ErrorType enum
 * @param {Object} context - Additional context information about where the error occurred
 * @returns {string} - Error ID for reference
 */
function logError(error, type = ErrorType.UNKNOWN, context = {}) {
    const errorId = generateErrorId();
    const timestamp = new Date().toISOString();
    const errorObj = {
        id: errorId,
        timestamp,
        type,
        message: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : null,
        context
    };
    
    // Log to console
    console.error(`[${timestamp}][${type}][${errorId}] ${errorObj.message}`);
    if (errorObj.stack) {
        console.error(errorObj.stack);
    }
    
    // Store in session for potential reporting
    storeErrorInSession(errorObj);
    
    // Log to debug console if available
    const debugLog = document.getElementById("debugLog");
    if (debugLog && debugLog.style.display !== 'none') {
        debugLog.innerHTML += `DEBUG: Error logged [${type}]: ${errorObj.message}<br>`;
    }
    
    return errorId;
}

/**
 * Displays an error message to the user in the game UI
 * @param {string} message - User-friendly error message
 * @param {string} errorId - Reference ID from logError
 * @param {boolean} isCritical - Whether this is a critical error that affects gameplay
 */
function displayErrorToUser(message, errorId = null, isCritical = false) {
    const gameOutput = document.getElementById("game-output");
    const debugLog = document.getElementById("debugLog");
    
    if (gameOutput) {
        const errorMessage = `<span style="color:${isCritical ? 'red' : 'orange'};">${message}${errorId ? ` (Ref: ${errorId})` : ''}</span><br>`;
        gameOutput.innerHTML += errorMessage;
        gameOutput.scrollTop = gameOutput.scrollHeight;
    }
    
    if (debugLog && debugLog.style.display !== 'none') {
        debugLog.innerHTML += `DEBUG: Error displayed to user: ${message} ${errorId ? `(Ref: ${errorId})` : ''}<br>`;
    }
    
    // For critical errors, also provide a recovery option
    if (isCritical) {
        try {
            // Add a recovery button to the game output
            const recoveryDiv = document.createElement('div');
            recoveryDiv.className = 'error-recovery';
            recoveryDiv.style.margin = '10px 0';
            recoveryDiv.style.padding = '10px';
            recoveryDiv.style.backgroundColor = '#ffeeee';
            recoveryDiv.style.border = '1px solid #ff0000';
            recoveryDiv.style.borderRadius = '5px';
            
            recoveryDiv.innerHTML = `
                <p><strong>Recovery Options:</strong></p>
                <button id="error-continue-btn" style="margin-right: 10px;">Try to Continue</button>
                <button id="error-restart-btn">Restart Game</button>
            `;
            
            if (gameOutput) {
                gameOutput.appendChild(recoveryDiv);
                gameOutput.scrollTop = gameOutput.scrollHeight;
                
                // Add event listeners to recovery buttons
                document.getElementById('error-continue-btn').addEventListener('click', function() {
                    recoveryDiv.remove();
                    attemptErrorRecovery();
                });
                
                document.getElementById('error-restart-btn').addEventListener('click', function() {
                    if (confirm("Are you sure you want to restart the game? All progress will be lost.")) {
                        localStorage.removeItem('hyperionNexusGameState');
                        if (typeof window.initializeGame === 'function') {
                            window.initializeGame();
                        } else {
                            window.location.reload();
                        }
                    }
                });
            }
        } catch (recoveryError) {
            console.error("Failed to create error recovery UI:", recoveryError);
        }
    }
}

/**
 * Attempts to recover from errors by checking and fixing game state
 * @returns {boolean} Whether recovery was successful
 */
function attemptErrorRecovery() {
    console.log("Attempting error recovery");
    
    try {
        // Check if game state exists and is valid
        if (!window.gameState || typeof window.gameState !== 'object') {
            console.error("Game state missing or invalid during recovery");
            return false;
        }
        
        // Ensure DOM structure is intact
        if (typeof window.ensureDOMStructure === 'function') {
            window.ensureDOMStructure();
        }
        
        // Check for valid phase
        const validPhases = [
            "species_creation", "species_summary", 
            "starship_creation", "starship_summary", 
            "role_selection_initial", "k_scale_progression", 
            "game_end"
        ];
        
        if (!validPhases.includes(window.gameState.gamePhase)) {
            console.error("Invalid game phase during recovery:", window.gameState.gamePhase);
            window.gameState.gamePhase = "species_creation";
            window.gameState.currentQuestionIndex = 0;
        }
        
        // Check for out-of-bounds indices
        if (window.gameState.gamePhase === "species_creation" && 
            window.speciesCreationQuestions && 
            window.gameState.currentQuestionIndex >= window.speciesCreationQuestions.length) {
            
            window.gameState.currentQuestionIndex = 0;
        }
        
        if (window.gameState.gamePhase === "starship_creation" && 
            window.starshipCreationQuestions && 
            window.gameState.currentQuestionIndex >= window.starshipCreationQuestions.length) {
            
            window.gameState.currentQuestionIndex = 0;
        }
        
        // Ensure cultural pathways exist
        if (!window.gameState.culturalPathways || typeof window.gameState.culturalPathways !== 'object') {
            window.gameState.culturalPathways = { 
                science: 0, 
                military: 0, 
                ecological: 0, 
                subversive: 0, 
                psychic: 0 
            };
        }
        
        // Update UI to reflect recovered state
        if (typeof window.displayCurrentState === 'function') {
            window.displayCurrentState(window.gameState);
        }
        
        // Add recovery message to game output
        const gameOutput = document.getElementById("game-output");
        if (gameOutput) {
            gameOutput.innerHTML += "<span style='color:green;'>Recovery successful. You may continue playing.</span><br>";
            gameOutput.scrollTop = gameOutput.scrollHeight;
        }
        
        console.log("Error recovery completed successfully");
        return true;
    } catch (error) {
        console.error("Error recovery failed:", error);
        
        // Last resort - offer to restart
        if (confirm("Unable to recover from error. Would you like to restart the game?")) {
            localStorage.removeItem('hyperionNexusGameState');
            if (typeof window.initializeGame === 'function') {
                window.initializeGame();
            } else {
                window.location.reload();
            }
        }
        
        return false;
    }
}

/**
 * Validates input parameters against expected types and constraints
 * @param {Object} params - Parameters to validate
 * @param {Object} schema - Validation schema defining expected types and constraints
 * @returns {Object} - Validation result with isValid flag and errors array
 */
function validateInput(params, schema) {
    const result = {
        isValid: true,
        errors: []
    };
    
    for (const [key, rules] of Object.entries(schema)) {
        // Check required parameters
        if (rules.required && (params[key] === undefined || params[key] === null)) {
            result.errors.push(`Missing required parameter: ${key}`);
            result.isValid = false;
            continue;
        }
        
        // Skip validation for optional parameters that aren't provided
        if (params[key] === undefined || params[key] === null) {
            continue;
        }
        
        // Type checking
        if (rules.type && typeof params[key] !== rules.type) {
            result.errors.push(`Parameter ${key} should be of type ${rules.type}, got ${typeof params[key]}`);
            result.isValid = false;
        }
        
        // Range checking for numbers
        if (rules.type === 'number' && (
            (rules.min !== undefined && params[key] < rules.min) || 
            (rules.max !== undefined && params[key] > rules.max)
        )) {
            result.errors.push(`Parameter ${key} should be between ${rules.min || '-∞'} and ${rules.max || '∞'}`);
            result.isValid = false;
        }
        
        // Length checking for strings and arrays
        if ((rules.type === 'string' || Array.isArray(params[key])) && (
            (rules.minLength !== undefined && params[key].length < rules.minLength) || 
            (rules.maxLength !== undefined && params[key].length > rules.maxLength)
        )) {
            result.errors.push(`Parameter ${key} length should be between ${rules.minLength || 0} and ${rules.maxLength || '∞'}`);
            result.isValid = false;
        }
        
        // Pattern matching for strings
        if (rules.type === 'string' && rules.pattern && !rules.pattern.test(params[key])) {
            result.errors.push(`Parameter ${key} does not match required pattern`);
            result.isValid = false;
        }
        
        // Custom validation function
        if (rules.validate && typeof rules.validate === 'function') {
            const customValidation = rules.validate(params[key]);
            if (customValidation !== true) {
                result.errors.push(customValidation || `Parameter ${key} failed custom validation`);
                result.isValid = false;
            }
        }
    }
    
    return result;
}

/**
 * Saves the current game state to localStorage for recovery
 * @param {Object} gameState - The current game state to save
 * @returns {boolean} - Whether the save was successful
 */
function saveGameState(gameState) {
    try {
        const serializedState = JSON.stringify(gameState);
        localStorage.setItem('hyperionNexusGameState', serializedState);
        localStorage.setItem('hyperionNexusGameStateTimestamp', new Date().toISOString());
        
        // Log to debug console if available
        const debugLog = document.getElementById("debugLog");
        if (debugLog && debugLog.style.display !== 'none') {
            debugLog.innerHTML += `DEBUG: Game state saved to localStorage<br>`;
        }
        
        return true;
    } catch (error) {
        logError(error, ErrorType.DATA, { action: 'saveGameState' });
        return false;
    }
}

/**
 * Loads the saved game state from localStorage
 * @returns {Object|null} - The loaded game state or null if not found/invalid
 */
function loadGameState() {
    try {
        const serializedState = localStorage.getItem('hyperionNexusGameState');
        if (!serializedState) return null;
        
        const parsedState = JSON.parse(serializedState);
        
        // Validate critical properties
        if (!parsedState.gamePhase || !parsedState.culturalPathways) {
            console.error("Loaded game state missing critical properties");
            return null;
        }
        
        // Log to debug console if available
        const debugLog = document.getElementById("debugLog");
        if (debugLog && debugLog.style.display !== 'none') {
            debugLog.innerHTML += `DEBUG: Game state loaded from localStorage<br>`;
        }
        
        return parsedState;
    } catch (error) {
        logError(error, ErrorType.DATA, { action: 'loadGameState' });
        return null;
    }
}

/**
 * Checks if there's a saved game state and if it's recent enough to recover
 * @param {number} maxAgeMinutes - Maximum age in minutes for valid recovery
 * @returns {boolean} - Whether a valid saved state exists for recovery
 */
function canRecoverGameState(maxAgeMinutes = 60) {
    try {
        const timestamp = localStorage.getItem('hyperionNexusGameStateTimestamp');
        if (!timestamp) return false;
        
        const savedTime = new Date(timestamp).getTime();
        const currentTime = new Date().getTime();
        const ageMinutes = (currentTime - savedTime) / (1000 * 60);
        
        return ageMinutes <= maxAgeMinutes;
    } catch (error) {
        logError(error, ErrorType.DATA, { action: 'canRecoverGameState' });
        return false;
    }
}

/**
 * Wraps a function with error handling
 * @param {Function} fn - The function to wrap
 * @param {Object} options - Error handling options
 * @returns {Function} - The wrapped function with error handling
 */
function withErrorHandling(fn, options = {}) {
    const {
        errorType = ErrorType.UNKNOWN,
        displayError = true,
        rethrow = false,
        context = {}
    } = options;
    
    return function(...args) {
        try {
            return fn.apply(this, args);
        } catch (error) {
            const errorId = logError(error, errorType, { 
                ...context,
                functionName: fn.name,
                arguments: args
            });
            
            if (displayError) {
                displayErrorToUser(
                    options.errorMessage || 'An error occurred. Please try again.',
                    errorId,
                    options.isCritical
                );
            }
            
            if (rethrow) {
                throw error;
            }
            
            return options.defaultReturn;
        }
    };
}

/**
 * Performs a health check on the game system
 * @returns {Object} Health status with details about any issues
 */
function performHealthCheck() {
    console.log("Performing game health check");
    
    const status = {
        healthy: true,
        issues: [],
        details: {}
    };
    
    // Check DOM structure
    const requiredElements = [
        'game-output', 'storyArea', 'choice-area', 'game-content', 
        'game-choices', 'restart-button', 'status-bar'
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    if (missingElements.length > 0) {
        status.healthy = false;
        status.issues.push('missing_dom_elements');
        status.details.missingElements = missingElements;
    }
    
    // Check game state
    if (!window.gameState || typeof window.gameState !== 'object') {
        status.healthy = false;
        status.issues.push('invalid_game_state');
    } else {
        // Check for required properties
        const requiredProps = ['gamePhase', 'currentQuestionIndex', 'culturalPathways'];
        const missingProps = requiredProps.filter(prop => !(prop in window.gameState));
        
        if (missingProps.length > 0) {
            status.healthy = false;
            status.issues.push('incomplete_game_state');
            status.details.missingProps = missingProps;
        }
        
        // Check for valid phase
        const validPhases = [
            "species_creation", "species_summary", 
            "starship_creation", "starship_summary", 
            "role_selection_initial", "k_scale_progression", 
            "game_end"
        ];
        
        if (!validPhases.includes(window.gameState.gamePhase)) {
            status.healthy = false;
            status.issues.push('invalid_game_phase');
            status.details.currentPhase = window.gameState.gamePhase;
        }
    }
    
    // Check required functions
    const requiredFunctions = [
        'initializeGame', 'handleChoice', 'displayCurrentState', 
        'showSpeciesCreationQuestion', 'clearGameUI'
    ];
    
    const missingFunctions = requiredFunctions.filter(fn => typeof window[fn] !== 'function');
    if (missingFunctions.length > 0) {
        status.healthy = false;
        status.issues.push('missing_functions');
        status.details.missingFunctions = missingFunctions;
    }
    
    // Check data structures
    if (!window.speciesCreationQuestions || !Array.isArray(window.speciesCreationQuestions)) {
        status.healthy = false;
        status.issues.push('missing_species_questions');
    }
    
    if (!window.starshipCreationQuestions || !Array.isArray(window.starshipCreationQuestions)) {
        status.healthy = false;
        status.issues.push('missing_starship_questions');
    }
    
    if (!window.kScaleEvents || typeof window.kScaleEvents !== 'object') {
        status.healthy = false;
        status.issues.push('missing_kscale_events');
    }
    
    console.log("Health check complete:", status);
    return status;
}

// Private helper functions
function generateErrorId() {
    return Math.random().toString(36).substring(2, 10);
}

function storeErrorInSession(errorObj) {
    try {
        const errors = JSON.parse(sessionStorage.getItem('hyperionNexusErrors') || '[]');
        errors.push(errorObj);
        // Keep only the last 50 errors to avoid excessive storage use
        if (errors.length > 50) {
            errors.shift();
        }
        sessionStorage.setItem('hyperionNexusErrors', JSON.stringify(errors));
    } catch (e) {
        console.error('Failed to store error in session:', e);
    }
}

// Export the public API
window.HyperionErrorHandling = {
    ErrorType,
    logError,
    displayErrorToUser,
    validateInput,
    saveGameState,
    loadGameState,
    canRecoverGameState,
    withErrorHandling,
    attemptErrorRecovery,
    performHealthCheck
};

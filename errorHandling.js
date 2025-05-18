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
        
        return JSON.parse(serializedState);
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
    withErrorHandling
};

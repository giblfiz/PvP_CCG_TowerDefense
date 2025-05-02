/**
 * StandardMook class - represents a standard enemy unit
 */
// Get Mook reference - try to handle both Node.js and browser environments
let Mook;
try {
    // For Node.js
    if (typeof window === 'undefined') {
        Mook = require('./Mook');
    } else {
        // For browser
        Mook = window.Mook;
    }
} catch(e) {
    // Fallback for browser
    Mook = window.Mook;
}

class StandardMook extends Mook {
    /**
     * Create a standard mook
     * @param {Object} config - Mook configuration
     */
    constructor(config) {
        const standardConfig = {
            ...config,
            type: Mook.MOOK_STANDARD
        };
        
        super(standardConfig);
    }
    
    /**
     * Override type properties for standard mook
     * @param {Object} config - Initial configuration
     */
    setTypeProperties(config) {
        super.setTypeProperties(config);
        
        // Standard mook specific properties can be set here if needed
        // Currently using base class defaults
    }
}

// Export for Node.js vs Browser
try {
    if (typeof window === 'undefined') {
        // Node.js environment
        module.exports = StandardMook;
    } else {
        // Browser environment
        window.StandardMook = StandardMook;
    }
} catch(e) {
    // Fallback for browser
    window.StandardMook = StandardMook;
}
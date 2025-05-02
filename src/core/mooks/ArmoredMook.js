/**
 * ArmoredMook class - represents an armored enemy unit with damage reduction
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

class ArmoredMook extends Mook {
    /**
     * Create an armored mook
     * @param {Object} config - Mook configuration
     */
    constructor(config) {
        const armoredConfig = {
            ...config,
            type: Mook.MOOK_ARMORED
        };
        
        super(armoredConfig);
    }
    
    /**
     * Override type properties for armored mook
     * @param {Object} config - Initial configuration
     */
    setTypeProperties(config) {
        super.setTypeProperties(config);
        
        // We can override specific properties here if needed
        // but they're already set in the base class based on type
    }
}

// Export for Node.js vs Browser
try {
    if (typeof window === 'undefined') {
        // Node.js environment
        module.exports = ArmoredMook;
    } else {
        // Browser environment
        window.ArmoredMook = ArmoredMook;
    }
} catch(e) {
    // Fallback for browser
    window.ArmoredMook = ArmoredMook;
}
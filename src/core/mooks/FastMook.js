/**
 * FastMook class - represents a fast enemy unit that moves quicker but has less health
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

class FastMook extends Mook {
    /**
     * Create a fast mook
     * @param {Object} config - Mook configuration
     */
    constructor(config) {
        const fastConfig = {
            ...config,
            type: Mook.MOOK_FAST
        };
        
        super(fastConfig);
    }
    
    /**
     * Override type properties for fast mook
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
        module.exports = FastMook;
    } else {
        // Browser environment
        window.FastMook = FastMook;
    }
} catch(e) {
    // Fallback for browser
    window.FastMook = FastMook;
}
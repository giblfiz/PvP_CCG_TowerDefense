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
    constructor(config = {}) {
        const standardConfig = {
            ...config,
            type: Mook.MOOK_STANDARD
        };
        
        super(standardConfig);
    }
    
    /**
     * Initialize stats for standard mook type
     * @param {Object} config - Optional config to override default values
     */
    initializeStats(config = {}) {
        // Standard mook stats - same as base Mook class
        this.maxHealth = config.health || 100;
        this.health = config.health || 100;
        this.speed = config.speed !== undefined ? config.speed : 1.0;
        this.reward = config.reward !== undefined ? config.reward : 10;
        this.damage = config.damage || 2;
        this.armor = 0; // No damage reduction
        this.emoji = '👾';
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
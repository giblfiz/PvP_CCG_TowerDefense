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
    constructor(config = {}) {
        const fastConfig = {
            ...config,
            type: Mook.MOOK_FAST
        };
        
        super(fastConfig);
    }
    
    /**
     * Initialize stats for fast mook type
     * @param {Object} config - Optional config to override default values
     */
    initializeStats(config = {}) {
        // Fast mook stats
        this.maxHealth = config.health || 80;
        this.health = config.health || 80;
        this.speed = config.speed !== undefined ? config.speed : 1.5;
        this.reward = config.reward !== undefined ? config.reward : 8;
        this.damage = config.damage || 2;
        this.armor = -0.1; // Takes 10% more damage
        this.emoji = '🚀';
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
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
    constructor(config = {}) {
        const armoredConfig = {
            ...config,
            type: Mook.MOOK_ARMORED
        };
        
        super(armoredConfig);
    }
    
    /**
     * Initialize stats for armored mook type
     * @param {Object} config - Optional config to override default values
     */
    initializeStats(config = {}) {
        // Armored mook stats
        this.maxHealth = config.health || 150;
        this.health = config.health || 150;
        this.speed = config.speed !== undefined ? config.speed : 0.9;
        this.reward = config.reward !== undefined ? config.reward : 15;
        this.damage = config.damage || 2;
        this.armor = 0.3; // 30% damage reduction
        this.emoji = '🛡️';
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
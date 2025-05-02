/**
 * Mook class definition
 * Represents an enemy unit that follows a path in the game
 */
class Mook {
    static MOOK_STANDARD = 'standard';
    static MOOK_FAST = 'fast';
    static MOOK_ARMORED = 'armored';
    static MOOK_TANK = 'tank';
    
    constructor(config = {}) {
        // Handle legacy constructor call (type, path)
        let path;
        let type;

        if (typeof config === 'string') {
            // Legacy constructor: (type, path)
            type = config;
            path = arguments[1] || [];
        } else {
            // Object config constructor
            type = config.type || Mook.MOOK_STANDARD;
            path = config.path || [];
        }

        this.type = type;
        this.path = [...path];
        this.currentPathIndex = 0;
        this.position = config.position || (path.length > 0 ? { ...path[0] } : { x: 0, y: 0 });
        this.progress = 0;
        this.active = true;
        this.reachedEnd = false;
        this.markedForRemoval = false;
        this.sprite = null;     // Initialize sprite reference to null
        this.healthBar = null;  // Initialize healthBar reference to null
        
        // Set default stats for standard mook
        this.initializeStats(config);
    }
    
    /**
     * Initialize stats for this mook type
     * Override this method in subclasses to define type-specific stats
     * @param {Object} config - Optional config to override default values
     */
    initializeStats(config = {}) {
        // Default stats for standard mook
        this.maxHealth = config.health || 100;
        this.health = config.health || 100;
        this.speed = config.speed || 1.0;
        this.reward = config.reward || 10;
        this.damage = config.damage || 2;
        this.emoji = '👾';
    }
    
    update(deltaTime) {
        if (!this.active || this.reachedEnd) return false;
        
        // Calculate progress along current path segment
        this.progress += this.speed * deltaTime;
        
        // Check if we've reached the next path point
        if (this.currentPathIndex < this.path.length - 1) {
            const nextPoint = this.path[this.currentPathIndex + 1];
            const currentPoint = this.path[this.currentPathIndex];
            
            // Calculate distance between points (Manhattan distance since we move on a grid)
            const distance = Math.abs(nextPoint.x - currentPoint.x) + Math.abs(nextPoint.y - currentPoint.y);
            
            // If progress exceeds distance, move to next path segment
            if (this.progress >= distance) {
                this.currentPathIndex++;
                this.progress = 0;
                
                // If we reached the last point, mark as reached end
                if (this.currentPathIndex >= this.path.length - 1) {
                    this.reachedEnd = true;
                    return true; // Reached the end
                }
            }
        }
        
        // Update position based on progress
        const currentPoint = this.path[this.currentPathIndex];
        const nextPoint = this.path[this.currentPathIndex + 1];
        
        if (nextPoint) {
            // Interpolate position between current and next point
            const progress = Math.min(1, this.progress);
            
            if (nextPoint.x !== currentPoint.x) {
                // Moving horizontally
                const direction = nextPoint.x > currentPoint.x ? 1 : -1;
                this.position.x = currentPoint.x + direction * progress;
                this.position.y = currentPoint.y;
            } else {
                // Moving vertically
                const direction = nextPoint.y > currentPoint.y ? 1 : -1;
                this.position.x = currentPoint.x;
                this.position.y = currentPoint.y + direction * progress;
            }
        }
        
        return false; // Not reached the end yet
    }
    
    takeDamage(amount) {
        // Apply armor if defined
        let modifiedAmount = amount;
        if (this.armor !== undefined) {
            // Negative armor means more damage, positive means less
            const armorMultiplier = 1 - this.armor;
            modifiedAmount = Math.floor(amount * armorMultiplier);
        }
        
        this.health -= modifiedAmount;
        if (this.health <= 0) {
            this.health = 0;
            this.active = false;
            return true; // Died
        }
        return false; // Still alive
    }
    
    getHealthPercent() {
        return Math.max(0, Math.min(1, this.health / this.maxHealth));
    }
}

// Export the Mook class for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Mook;
} else {
    // For browser use
    window.Mook = Mook;
}
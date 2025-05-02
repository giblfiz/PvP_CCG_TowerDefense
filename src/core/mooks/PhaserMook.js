/**
 * PhaserMook class definition
 * Represents an enemy unit that follows a path in the Phaser implementation
 */
class PhaserMook {
    static MOOK_STANDARD = 'standard';
    static MOOK_FAST = 'fast';
    static MOOK_ARMORED = 'armored';
    static MOOK_TANK = 'tank';
    
    constructor(type, path) {
        this.type = type;
        this.path = [...path];
        this.currentPathIndex = 0;
        this.position = { ...this.path[0] };
        this.progress = 0;
        this.active = true;
        this.reachedEnd = false;
        this.markedForRemoval = false;
        this.sprite = null;     // Initialize sprite reference to null
        this.healthBar = null;  // Initialize healthBar reference to null
        
        // Set stats based on mook type
        switch(type) {
            case PhaserMook.MOOK_FAST:
                this.maxHealth = 80;
                this.health = 80;
                this.speed = 1.5;
                this.reward = 8; // Reduced from 10
                this.damage = 2; // Increased from 1
                this.emoji = '🚀';
                break;
            case PhaserMook.MOOK_ARMORED:
                this.maxHealth = 150;
                this.health = 150;
                this.speed = 0.9;
                this.reward = 15; // Reduced from 20
                this.damage = 2; // Increased from 1
                this.emoji = '🛡️';
                break;
            case PhaserMook.MOOK_TANK:
                this.maxHealth = 300;
                this.health = 300;
                this.speed = 0.7;
                this.reward = 20; // Reduced from 30
                this.damage = 3; // Increased from 2
                this.emoji = '🦖';
                break;
            default: // Standard
                this.maxHealth = 100;
                this.health = 100;
                this.speed = 1.0;
                this.reward = 10; // Reduced from 15
                this.damage = 2; // Increased from 1
                this.emoji = '👾';
        }
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
        this.health -= amount;
        if (this.health <= 0) {
            this.active = false;
            return true; // Died
        }
        return false; // Still alive
    }
    
    getHealthPercent() {
        return Math.max(0, Math.min(1, this.health / this.maxHealth));
    }
}

// Export the PhaserMook class for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhaserMook;
} else {
    // For browser use
    window.PhaserMook = PhaserMook;
}
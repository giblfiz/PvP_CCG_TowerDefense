/**
 * Tower class for tower defense game
 * Handles tower functionality, targeting, and attacking
 */
class Tower {
    static TOWER_BASIC = 'basic';
    static TOWER_SNIPER = 'sniper';
    static TOWER_SPLASH = 'splash';
    
    /**
     * Create a new tower
     * @param {string} type - Tower type (basic, sniper, splash)
     * @param {number} gridX - X position on grid
     * @param {number} gridY - Y position on grid
     */
    constructor(type, gridX, gridY) {
        this.type = type;
        this.gridX = gridX;
        this.gridY = gridY;
        this.level = 1;
        this.target = null;
        
        // Set stats based on tower type
        switch(type) {
            case Tower.TOWER_BASIC:
                this.damage = 20;
                this.range = 3;
                this.fireRate = 1;
                this.cost = 50;
                this.upgradeCost = 40;
                this.emoji = '🗼';
                this.splashRadius = 0;
                break;
            case Tower.TOWER_SNIPER:
                this.damage = 50;
                this.range = 6;
                this.fireRate = 0.5;
                this.cost = 100;
                this.upgradeCost = 80;
                this.emoji = '🏯';
                this.splashRadius = 0;
                break;
            case Tower.TOWER_SPLASH:
                this.damage = 15;
                this.range = 2;
                this.fireRate = 0.8;
                this.cost = 150;
                this.upgradeCost = 120;
                this.emoji = '🏰';
                this.splashRadius = 1; // Splash radius in grid cells
                break;
            default:
                this.damage = 10;
                this.range = 2;
                this.fireRate = 1;
                this.cost = 50;
                this.upgradeCost = 40;
                this.emoji = '🗼';
                this.splashRadius = 0;
        }
        
        this.lastFired = 0;
    }
    
    /**
     * Upgrade the tower
     * Increases damage, range, and fire rate
     */
    upgrade() {
        this.level++;
        this.damage *= 1.5;
        this.range += 0.5;
        this.fireRate *= 1.2;
        this.upgradeCost = Math.floor(this.upgradeCost * 1.5);
    }
    
    /**
     * Check if tower can fire
     * @param {number} time - Current game time
     * @returns {boolean} Whether tower can fire
     */
    canFire(time) {
        return time - this.lastFired >= 1000 / this.fireRate;
    }
    
    /**
     * Fire the tower
     * @param {number} time - Current game time
     * @returns {number} Damage inflicted
     */
    fire(time) {
        this.lastFired = time;
        return this.damage;
    }
    
    /**
     * Check if mook is in range of tower
     * @param {Object} mook - Mook to check
     * @param {number} cellSize - Size of each grid cell
     * @returns {boolean} Whether mook is in range
     */
    isInRange(mook, cellSize) {
        const towerX = this.gridX * cellSize + cellSize/2;
        const towerY = this.gridY * cellSize + cellSize/2;
        const mookX = mook.position.x * cellSize + cellSize/2;
        const mookY = mook.position.y * cellSize + cellSize/2;
        
        const distance = Phaser.Math.Distance.Between(towerX, towerY, mookX, mookY);
        return distance <= this.range * cellSize;
    }
    
    /**
     * Find a target for the tower
     * @param {Array} mooks - Array of mooks
     * @param {number} cellSize - Size of each grid cell
     * @returns {Object|null} Selected target mook or null
     */
    findTarget(mooks, cellSize) {
        // Find all mooks in range
        const inRangeMooks = mooks.filter(mook => 
            mook.active && !mook.reachedEnd && this.isInRange(mook, cellSize)
        );
        
        if (inRangeMooks.length === 0) {
            this.target = null;
            return null;
        }
        
        // Different target selection based on tower type
        switch(this.type) {
            case Tower.TOWER_SNIPER:
                // Sniper targets the one with the most health
                this.target = inRangeMooks.reduce((prev, current) => 
                    (prev.health > current.health) ? prev : current
                );
                break;
                
            case Tower.TOWER_SPLASH:
                // Splash tower targets the one with most neighbors 
                // for maximum splash damage
                let maxNeighbors = 0;
                let bestTarget = inRangeMooks[0];
                
                for (const mook of inRangeMooks) {
                    const neighbors = inRangeMooks.filter(other => {
                        if (other === mook) return false;
                        
                        const dx = Math.abs(other.position.x - mook.position.x);
                        const dy = Math.abs(other.position.y - mook.position.y);
                        return dx <= this.splashRadius && dy <= this.splashRadius;
                    }).length;
                    
                    if (neighbors > maxNeighbors) {
                        maxNeighbors = neighbors;
                        bestTarget = mook;
                    }
                }
                
                this.target = bestTarget;
                break;
                
            default: // Basic tower and others
                // Target the furthest along the path
                this.target = inRangeMooks.reduce((prev, current) => 
                    (current.currentPathIndex > prev.currentPathIndex || 
                    (current.currentPathIndex === prev.currentPathIndex && 
                    current.progress > prev.progress)) ? current : prev
                );
        }
        
        return this.target;
    }
    
    /**
     * Attack a target
     * @param {number} time - Current game time
     * @param {Array} mooks - Array of mooks
     * @param {number} cellSize - Size of each grid cell
     * @returns {Array|null} Attack results or null if no target
     */
    attackTarget(time, mooks, cellSize) {
        if (!this.canFire(time)) return null;
        
        const target = this.findTarget(mooks, cellSize);
        if (!target) return null;
        
        // Fire the tower
        const damage = this.fire(time);
        
        // Handle splash damage
        if (this.splashRadius > 0) {
            // Get all mooks in splash radius
            const splashedMooks = mooks.filter(mook => {
                if (!mook.active || mook.reachedEnd) return false;
                if (mook === target) return true; // Direct target always gets hit
                
                const dx = Math.abs(mook.position.x - target.position.x);
                const dy = Math.abs(mook.position.y - target.position.y);
                return dx <= this.splashRadius && dy <= this.splashRadius;
            });
            
            // Apply damage to all mooks in splash radius
            const results = [];
            for (const mook of splashedMooks) {
                const distanceRatio = mook === target ? 1 : 0.5; // Reduced damage for splash
                const isDead = mook.takeDamage(damage * distanceRatio);
                if (isDead) {
                    results.push({
                        mook,
                        isDead: true
                    });
                } else {
                    results.push({
                        mook,
                        isDead: false
                    });
                }
            }
            return results;
        } else {
            // Direct damage to single target
            const isDead = target.takeDamage(damage);
            return [{
                mook: target,
                isDead
            }];
        }
    }
}

// Export Tower for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Tower;
} else {
    // For browser use
    window.Tower = Tower;
}
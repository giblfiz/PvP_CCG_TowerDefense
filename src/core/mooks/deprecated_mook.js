/**
 * Represents a hostile unit (mook) in the game
 */
class Mook {
  /**
   * Create a mook
   * @param {Object} config - Mook configuration
   * @param {Object} config.position - Mook position {x, y}
   * @param {number} [config.health=100] - Mook health points
   * @param {number} [config.speed=1] - Mook movement speed
   * @param {number} [config.reward=10] - Reward for defeating mook
   * @param {Array} [config.path=[]] - Path for the mook to follow, array of {x, y} points
   * @param {string} [config.type='standard'] - Type of mook (standard, armored, fast)
   */
  constructor(config) {
    this.position = config.position;
    this.health = config.health || 100;
    this.type = config.type || 'standard';
    this.path = config.path || [];
    this.pathIndex = 0;
    this.isDead = false;
    
    // Set properties based on mook type
    this.setTypeProperties(config);
  }

  /**
   * Set properties based on mook type
   * @param {Object} config - Initial configuration
   */
  setTypeProperties(config) {
    // Directly use config values if provided
    this.speed = config.speed !== undefined ? config.speed : 1;
    this.reward = config.reward !== undefined ? config.reward : 10;
    this.armor = 0;
    
    // Only apply type modifiers if no custom values were provided
    if (config.speed === undefined || config.reward === undefined) {
      // Override based on type
      switch (this.type) {
      case 'armored':
        this.armor = 0.3; // 30% damage reduction
        if (config.speed === undefined) {
          this.speed = this.speed * 0.8; // Slower movement
        }
        if (config.reward === undefined) {
          this.reward = this.reward * 1.5; // Higher reward
        }
        break;
      case 'fast':
        this.armor = -0.1; // Takes 10% more damage
        if (config.speed === undefined) {
          this.speed = this.speed * 1.5; // Faster movement
        }
        if (config.reward === undefined) {
          this.reward = this.reward * 1.2; // Slightly higher reward
        }
        break;
      case 'standard':
      default:
        // Standard type uses default values
        break;
      }
    }
  }

  /**
   * Take damage from an attack
   * @param {number} damage - Amount of damage to take
   * @returns {number} - Actual damage dealt
   */
  takeDamage(damage) {
    // Apply armor - negative armor means more damage taken
    const armorMultiplier = 1 - this.armor;
    const modifiedDamage = Math.floor(damage * armorMultiplier);
    
    // Calculate actual damage (can't go below zero health)
    const actualDamage = Math.min(this.health, modifiedDamage);
    this.health -= actualDamage;
    
    if (this.health <= 0) {
      this.isDead = true;
    }
    
    return actualDamage;
  }

  /**
   * Move the mook along its path
   * @param {number} deltaTime - Time elapsed since last update in milliseconds
   */
  move(deltaTime) {
    // If dead or no path or reached end of path, don't move
    if (this.isDead || this.path.length === 0 || this.pathIndex >= this.path.length) {
      return;
    }
    
    // Calculate distance to move
    const distanceToMove = (this.speed * deltaTime) / 1000; // Convert to seconds
    
    // Get current target point on path
    const targetPoint = this.path[this.pathIndex];
    
    // Calculate direction vector to target
    const dx = targetPoint.x - this.position.x;
    const dy = targetPoint.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // If we reached the target point (or close enough), move to next point on path
    if (distance <= distanceToMove) {
      this.position = { ...targetPoint };
      this.pathIndex++;
      
      // If we have more path to travel, recursively move with remaining distance
      if (this.pathIndex < this.path.length) {
        const remainingTime = deltaTime * (distanceToMove - distance) / distanceToMove;
        if (remainingTime > 0) {
          this.move(remainingTime);
        }
      }
      return;
    }
    
    // Normalize direction and move
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;
    
    this.position.x += normalizedDx * distanceToMove;
    this.position.y += normalizedDy * distanceToMove;
  }
}

module.exports = Mook;
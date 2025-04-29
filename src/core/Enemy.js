/**
 * Represents an enemy in the game
 */
class Enemy {
  /**
   * Create an enemy
   * @param {Object} config - Enemy configuration
   * @param {Object} config.position - Enemy position {x, y}
   * @param {number} [config.health=100] - Enemy health points
   * @param {number} [config.speed=1] - Enemy movement speed
   * @param {number} [config.reward=10] - Reward for defeating enemy
   */
  constructor(config) {
    this.position = config.position;
    this.health = config.health || 100;
    this.speed = config.speed || 1;
    this.reward = config.reward || 10;
    this.path = config.path || [];
    this.pathIndex = 0;
    this.isDead = false;
  }

  /**
   * Take damage from an attack
   * @param {number} damage - Amount of damage to take
   * @returns {number} - Actual damage dealt
   */
  takeDamage(damage) {
    const actualDamage = Math.min(this.health, damage);
    this.health -= actualDamage;
    
    if (this.health <= 0) {
      this.isDead = true;
    }
    
    return actualDamage;
  }

  /**
   * Move the enemy along its path
   * @param {number} deltaTime - Time elapsed since last update in milliseconds
   */
  move(deltaTime) {
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
    
    // If we reached the target point, move to next point on path
    if (distance <= distanceToMove) {
      this.position = { ...targetPoint };
      this.pathIndex++;
      return;
    }
    
    // Normalize direction and move
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;
    
    this.position.x += normalizedDx * distanceToMove;
    this.position.y += normalizedDy * distanceToMove;
  }
}

module.exports = Enemy;
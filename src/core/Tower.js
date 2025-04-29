/**
 * Represents a defensive tower in the game
 */
class Tower {
  /**
   * Create a tower
   * @param {Object} config - Tower configuration
   * @param {Object} config.position - Tower position {x, y}
   * @param {number} [config.level=1] - Tower level
   * @param {number} [config.damage=10] - Tower attack damage
   * @param {number} [config.range=100] - Tower attack range
   * @param {number} [config.attackSpeed=1] - Attacks per second
   * @param {number} [config.cost=100] - Tower cost in game currency
   */
  constructor(config) {
    this.position = config.position;
    this.level = config.level || 1;
    this.damage = config.damage || 10;
    this.range = config.range || 100;
    this.attackSpeed = config.attackSpeed || 1;
    this.cost = config.cost || 100;
    this.lastAttackTime = 0;
  }

  /**
   * Upgrade the tower to the next level
   * Increases damage and potentially other stats
   */
  upgrade() {
    this.level += 1;
    
    // Damage increases by 25% per level
    this.damage = Math.floor(this.damage * 1.25);
    
    // Range increases slightly
    this.range = Math.floor(this.range * 1.1);
    
    // Attack speed increases slightly
    this.attackSpeed = this.attackSpeed * 1.1;
  }

  /**
   * Find a target from a list of enemies
   * @param {Array} enemies - List of enemies to target
   * @returns {Object|null} - The target enemy or null if none in range
   */
  findTarget(enemies) {
    if (!enemies || enemies.length === 0) {
      return null;
    }
    
    // Filter to enemies in range
    const inRangeEnemies = enemies.filter(enemy => this.isInRange(enemy));
    
    if (inRangeEnemies.length === 0) {
      return null;
    }
    
    // Find closest enemy in range
    return inRangeEnemies.reduce((closest, current) => {
      const closestDistance = this.distanceToTarget(closest);
      const currentDistance = this.distanceToTarget(current);
      
      return currentDistance < closestDistance ? current : closest;
    }, inRangeEnemies[0]);
  }

  /**
   * Attack an enemy
   * @param {Object} enemy - The enemy to attack
   * @param {number} currentTime - Current game time in milliseconds
   * @returns {number} - Damage dealt (0 if on cooldown)
   */
  attack(enemy, currentTime) {
    // Check if attack is on cooldown
    const cooldownTime = 1000 / this.attackSpeed; // Convert attacks/sec to milliseconds
    
    if (currentTime - this.lastAttackTime < cooldownTime) {
      return 0; // Still on cooldown
    }
    
    // Update last attack time
    this.lastAttackTime = currentTime;
    
    // Make sure enemy is in range
    if (!this.isInRange(enemy)) {
      return 0;
    }
    
    // Deal damage to enemy (return damage value even if takeDamage method doesn't exist)
    return enemy.takeDamage ? enemy.takeDamage(this.damage) : this.damage;
  }

  /**
   * Calculate the distance to a target
   * @param {Object} target - Target with a position {x, y}
   * @returns {number} - Distance to target
   */
  distanceToTarget(target) {
    const dx = target.position.x - this.position.x;
    const dy = target.position.y - this.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Check if a target is within the tower's range
   * @param {Object} target - Target with a position {x, y}
   * @returns {boolean} - Whether target is in range
   */
  isInRange(target) {
    const distance = this.distanceToTarget(target);
    return distance <= this.range;
  }
}

module.exports = Tower;
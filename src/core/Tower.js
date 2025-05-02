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
   * @param {number} [config.ammo=40] - Tower ammo (shots available)
   */
  constructor(config) {
    this.position = config.position;
    this.level = config.level || 1;
    this.damage = config.damage || 10;
    this.range = config.range || 100;
    this.attackSpeed = config.attackSpeed || 1;
    this.cost = config.cost || 100;
    this.lastAttackTime = 0;
    this.ammo = config.ammo || 40; // Default to 40 ammo
  }

  /**
   * Upgrade the tower to the next level
   * Increases damage and potentially other stats, and restores some ammo
   */
  upgrade() {
    this.level += 1;
    
    // Damage increases by 25% per level
    this.damage = Math.floor(this.damage * 1.25);
    
    // Range increases slightly
    this.range = Math.floor(this.range * 1.1);
    
    // Attack speed increases slightly
    this.attackSpeed = this.attackSpeed * 1.1;
    
    // Restore some ammo (20 shots)
    this.ammo = Math.min(40, this.ammo + 20);
  }

  /**
   * Find a target from a list of potential targets
   * @param {Array} targets - List of targets (enemies/mooks) to select from
   * @returns {Object|null} - The selected target or null if none in range
   */
  findTarget(targets) {
    if (!targets || targets.length === 0) {
      return null;
    }
    
    // Filter to targets in range
    const inRangeTargets = targets.filter(target => this.isInRange(target));
    
    if (inRangeTargets.length === 0) {
      return null;
    }
    
    // Find closest target in range
    return inRangeTargets.reduce((closest, current) => {
      const closestDistance = this.distanceToTarget(closest);
      const currentDistance = this.distanceToTarget(current);
      
      return currentDistance < closestDistance ? current : closest;
    }, inRangeTargets[0]);
  }

  /**
   * Attack a target (enemy/mook)
   * @param {Object} target - The target to attack
   * @param {number} currentTime - Current game time in milliseconds
   * @returns {number} - Damage dealt (0 if on cooldown or out of ammo)
   */
  attack(target, currentTime) {
    // Check if attack is on cooldown or out of ammo
    const cooldownTime = 1000 / this.attackSpeed; // Convert attacks/sec to milliseconds
    
    if (currentTime - this.lastAttackTime < cooldownTime || this.ammo <= 0) {
      return 0; // Still on cooldown or out of ammo
    }
    
    // Update last attack time
    this.lastAttackTime = currentTime;
    
    // Make sure target is in range
    if (!this.isInRange(target)) {
      return 0;
    }
    
    // Use ammo
    this.ammo--;
    
    // Deal damage to target using takeDamage method if available
    if (target.takeDamage) {
      return target.takeDamage(this.damage);
    } else {
      // For backward compatibility with targets that don't have takeDamage
      return this.damage;
    }
  }
  
  /**
   * Get ammo percentage for visual indicator
   * @returns {number} - Percentage of ammo remaining (0-1)
   */
  getAmmoPercent() {
    return this.ammo / 40; // Initial ammo is 40
  }
  
  /**
   * Check if tower is out of ammo
   * @returns {boolean} - Whether tower is out of ammo
   */
  isOutOfAmmo() {
    return this.ammo <= 0;
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
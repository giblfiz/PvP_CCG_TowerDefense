const Mook = require('./Mook');

/**
 * Represents a tank mook in the game - higher HP and slightly faster than standard mooks
 */
class TankMook extends Mook {
  /**
   * Create a tank mook
   * @param {Object} config - Mook configuration
   * @param {Object} config.position - Mook position {x, y}
   * @param {number} [config.health=200] - Mook health points (higher than standard)
   * @param {number} [config.speed=1.2] - Mook movement speed (faster than standard)
   * @param {number} [config.reward=30] - Reward for defeating mook (higher than standard)
   * @param {Array} [config.path=[]] - Path for the mook to follow, array of {x, y} points
   */
  constructor(config = {}) {
    // Ensure tank type
    const tankConfig = {
      ...config,
      type: Mook.MOOK_TANK
    };
    
    // Call parent constructor
    super(tankConfig);
  }
  
  /**
   * Initialize stats for tank mook type
   * @param {Object} config - Optional config to override default values
   */
  initializeStats(config = {}) {
    // Tank mook stats
    this.maxHealth = config.health || 300;
    this.health = config.health || 300;
    this.speed = config.speed !== undefined ? config.speed : 0.7;
    this.reward = config.reward !== undefined ? config.reward : 20;
    this.damage = config.damage || 3;
    this.armor = 0.4; // 40% damage reduction (higher than armored)
    this.emoji = '🦖';
  }
}

module.exports = TankMook;
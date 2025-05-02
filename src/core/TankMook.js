const Mook = require('./mooks/Mook');

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
  constructor(config) {
    // Set default higher health
    const tankConfig = {
      ...config,
      health: config.health || 200,
      type: 'tank'
    };
    
    // Call parent constructor
    super(tankConfig);
    
    // Override setTypeProperties to handle tank type
    this.setTypeProperties(tankConfig);
  }
  
  /**
   * Set properties based on tank mook type
   * @param {Object} config - Initial configuration
   */
  setTypeProperties(config) {
    // Start with base properties
    this.speed = config.speed !== undefined ? config.speed : 1.2;
    this.reward = config.reward !== undefined ? config.reward : 30;
    this.armor = 0.4; // 40% damage reduction (higher than armored)
  }
}

module.exports = TankMook;
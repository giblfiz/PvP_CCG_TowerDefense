/**
 * Manages the overall game state
 */
class GameState {
  /**
   * Create a new game state
   * @param {Object} [config] - Game configuration
   */
  constructor(config = {}) {
    this.towers = [];
    this.enemies = []; // For backward compatibility
    this.mooks = []; // New terminology for "enemies"
    this.playerResources = config.startingResources || 100;
    this.playerLives = config.playerLives || 20;
    this.waveNumber = 0;
    this.score = 0;
  }

  /**
   * Add a tower to the game
   * @param {Object} tower - The tower to add
   * @returns {boolean} - Whether the tower was added
   */
  addTower(tower) {
    if (tower.cost <= this.playerResources) {
      this.towers.push(tower);
      this.playerResources -= tower.cost;
      return true;
    }
    return false;
  }

  /**
   * Add an enemy to the game (legacy method)
   * @param {Object} enemy - The enemy to add
   */
  addEnemy(enemy) {
    this.enemies.push(enemy);
    // Also add to mooks for unified processing
    this.mooks.push(enemy);
  }

  /**
   * Add a mook to the game
   * @param {Object} mook - The mook to add
   */
  addMook(mook) {
    this.mooks.push(mook);
    // Also add to enemies for backward compatibility
    this.enemies.push(mook);
  }

  /**
   * Remove an enemy from the game (legacy method)
   * @param {Object} enemy - The enemy to remove
   */
  removeEnemy(enemy) {
    const enemyIndex = this.enemies.indexOf(enemy);
    if (enemyIndex !== -1) {
      this.enemies.splice(enemyIndex, 1);
    }
    
    const mookIndex = this.mooks.indexOf(enemy);
    if (mookIndex !== -1) {
      this.mooks.splice(mookIndex, 1);
    }
  }

  /**
   * Remove a mook from the game
   * @param {Object} mook - The mook to remove
   */
  removeMook(mook) {
    const mookIndex = this.mooks.indexOf(mook);
    if (mookIndex !== -1) {
      this.mooks.splice(mookIndex, 1);
    }
    
    const enemyIndex = this.enemies.indexOf(mook);
    if (enemyIndex !== -1) {
      this.enemies.splice(enemyIndex, 1);
    }
  }

  /**
   * Update the game state
   * @param {number} currentTime - Current game time in milliseconds
   * @param {number} [deltaTime=16] - Time elapsed since last update in milliseconds
   */
  update(currentTime, deltaTime = 16) {
    // Process towers attacking mooks
    this.towers.forEach(tower => {
      // Find target from mooks list (contains all enemies/mooks)
      const target = tower.findTarget(this.mooks);
      if (target) {
        const damageDealt = tower.attack(target, currentTime);
        
        if (damageDealt > 0 && !target.takeDamage) {
          // For backward compatibility with targets that don't have takeDamage
          target.health -= damageDealt;
          if (target.health <= 0) {
            target.isDead = true;
          }
        }
      }
    });
    
    // Process mook movement and remove dead mooks
    this.mooks = this.mooks.filter(mook => {
      // Move mook along path
      if (mook.move) {
        mook.move(deltaTime);
      }
      
      // Check if mook is dead
      if (mook.isDead) {
        this.score += mook.reward || 0;
        this.playerResources += mook.reward || 0;
        return false;
      }
      
      // Check if mook reached the end
      if (mook.pathIndex >= (mook.path || []).length) {
        this.playerLives--;
        return false;
      }
      
      return true;
    });
    
    // Update enemies list to match mooks (for backward compatibility)
    this.enemies = [...this.mooks];
  }

  /**
   * Check if the game is over
   * @returns {boolean} - Whether the game is over
   */
  isGameOver() {
    return this.playerLives <= 0;
  }

  /**
   * Start a new wave of mooks
   * @param {Array} mooks - Mooks to add in this wave
   */
  startWave(mooks) {
    this.waveNumber++;
    mooks.forEach(mook => this.addMook(mook));
  }
}

module.exports = GameState;
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
    this.map = config.map || null;
  }

  /**
   * Add a tower to the game
   * @param {Object} tower - The tower to add
   * @returns {boolean} - Whether the tower was added
   */
  addTower(tower) {
    // Check if we have enough resources
    if (tower.cost > this.playerResources) {
      return false;
    }
    
    // If we have a map, check if the tower can be placed
    if (this.map) {
      const { x, y } = tower.position;
      if (!this.map.canPlaceTower(x, y)) {
        return false;
      }
      
      // Mark the tower's position on the map
      this.map.placeTower(x, y);
    }
    
    // Add the tower and deduct resources
    this.towers.push(tower);
    this.playerResources -= tower.cost;
    return true;
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
   * Spawn a new mook at a spawn point
   * @param {Object} config - Mook configuration
   * @param {string} [config.type='standard'] - Type of mook
   * @param {number} [config.pathIndex=0] - Index of path to follow
   * @param {number} [config.health] - Health points
   * @param {number} [config.speed] - Movement speed
   * @returns {Object} - The spawned mook
   */
  spawnMook(config = {}) {
    // If no map, can't spawn at spawn point
    if (!this.map) {
      // Fallback to regular mook creation
      const mook = new (require('./Mook'))({
        position: { x: 0, y: 0 },
        ...config
      });
      this.addMook(mook);
      return mook;
    }
    
    // Get path and spawn point
    const pathIndex = config.pathIndex || 0;
    if (pathIndex >= this.map.paths.length) {
      return null; // Invalid path index
    }
    
    const path = this.map.getPath(pathIndex);
    const spawnPoint = path[0];
    
    // Create mook with spawn point position and path
    const mook = new (require('./Mook'))({
      position: { ...spawnPoint },
      path: [...path],
      ...config
    });
    
    this.addMook(mook);
    return mook;
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
   * Remove a tower from the game
   * @param {Object} tower - The tower to remove
   * @param {boolean} [refund=false] - Whether to refund the tower cost
   * @returns {boolean} - Whether the tower was removed
   */
  removeTower(tower, refund = false) {
    const index = this.towers.indexOf(tower);
    if (index === -1) {
      return false;
    }
    
    // Remove from array
    this.towers.splice(index, 1);
    
    // If we have a map, update it
    if (this.map) {
      const { x, y } = tower.position;
      this.map.removeTower(x, y);
    }
    
    // Refund cost if requested
    if (refund) {
      this.playerResources += tower.cost;
    }
    
    return true;
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
    const mooksToRemove = [];
    
    // First pass: process movement and identify mooks to remove
    for (let i = 0; i < this.mooks.length; i++) {
      const mook = this.mooks[i];
      
      // Move mook along path
      if (mook.move) {
        mook.move(deltaTime);
      }
      
      // Check if mook is dead
      if (mook.isDead) {
        this.score += mook.reward || 0;
        this.playerResources += mook.reward || 0;
        mooksToRemove.push(i);
        continue;
      }
      
      // Check if mook reached or is at the end of path
      if (mook.pathIndex >= (mook.path || []).length - 1) {
        if (this.map) {
          // Check if mook is at exit point or the last point is an exit
          const { x, y } = mook.position;
          const lastPathPoint = mook.path && mook.path.length > 0 ? 
            mook.path[mook.path.length - 1] : null;
            
          if (this.map.isExitPoint(x, y) || 
              (lastPathPoint && this.map.isExitPoint(lastPathPoint.x, lastPathPoint.y))) {
            this.playerLives--;
            mooksToRemove.push(i);
            continue;
          }
        } else if (mook.pathIndex >= (mook.path || []).length) {
          // Legacy behavior
          this.playerLives--;
          mooksToRemove.push(i);
          continue;
        }
      }
    }
    
    // Remove mooks in reverse order (to avoid index shifting)
    for (let i = mooksToRemove.length - 1; i >= 0; i--) {
      this.mooks.splice(mooksToRemove[i], 1);
    }
    
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
   * @param {Object} [config] - Wave configuration
   * @param {number} [config.count=10] - Number of mooks to spawn
   * @param {string} [config.type='standard'] - Type of mooks
   * @param {number} [config.delay=500] - Delay between spawns in milliseconds
   */
  startWave(config = {}) {
    this.waveNumber++;
    
    const count = config.count || 10;
    const type = config.type || 'standard';
    
    // Spawn the first mook immediately
    this.spawnMook({ type, pathIndex: 0 });
    
    // Schedule the rest
    if (config.spawnImmediately) {
      // Spawn all mooks at once for testing
      for (let i = 1; i < count; i++) {
        this.spawnMook({ type, pathIndex: i % (this.map?.paths.length || 1) });
      }
    } else {
      // In a real game, you would set up delayed spawning here
      // This would typically use setTimeout or a custom timer system
    }
  }
}

module.exports = GameState;
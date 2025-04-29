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
    this.enemies = [];
    this.playerResources = config.startingResources || 100;
    this.playerLives = config.playerLives || 20;
    this.waveNumber = 0;
    this.score = 0;
  }

  /**
   * Add a tower to the game
   * @param {Object} tower - The tower to add
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
   * Add an enemy to the game
   * @param {Object} enemy - The enemy to add
   */
  addEnemy(enemy) {
    this.enemies.push(enemy);
  }

  /**
   * Remove an enemy from the game
   * @param {Object} enemy - The enemy to remove
   */
  removeEnemy(enemy) {
    const index = this.enemies.indexOf(enemy);
    if (index !== -1) {
      this.enemies.splice(index, 1);
    }
  }

  /**
   * Update the game state
   * @param {number} currentTime - Current game time in milliseconds
   * @param {number} [deltaTime=16] - Time elapsed since last update in milliseconds
   */
  update(currentTime, deltaTime = 16) {
    // Process towers attacking enemies
    this.towers.forEach(tower => {
      const target = tower.findTarget(this.enemies);
      if (target) {
        const damageDealt = tower.attack(target, currentTime);
        
        if (damageDealt > 0) {
          target.health -= damageDealt;
          if (target.health <= 0) {
            target.isDead = true;
          }
        }
      }
    });
    
    // Process enemy movement and remove dead enemies
    this.enemies = this.enemies.filter(enemy => {
      // Move enemy along path
      enemy.move(deltaTime);
      
      // Check if enemy is dead
      if (enemy.isDead) {
        this.score += enemy.reward;
        this.playerResources += enemy.reward;
        return false;
      }
      
      // Check if enemy reached the end
      if (enemy.pathIndex >= enemy.path.length) {
        this.playerLives--;
        return false;
      }
      
      return true;
    });
  }

  /**
   * Check if the game is over
   * @returns {boolean} - Whether the game is over
   */
  isGameOver() {
    return this.playerLives <= 0;
  }

  /**
   * Start a new wave of enemies
   * @param {Array} enemies - Enemies to add in this wave
   */
  startWave(enemies) {
    this.waveNumber++;
    enemies.forEach(enemy => this.addEnemy(enemy));
  }
}

module.exports = GameState;
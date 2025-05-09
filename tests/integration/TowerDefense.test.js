const Tower = require('../../src/core/Tower');
const Mook = require('../../src/core/mooks/Mook');
const GameState = require('../../src/core/GameState');

describe('Tower Defense Integration', () => {
  // Test tower attacking enemies in game loop
  test('towers should attack enemies during game update', () => {
    // Create game state
    const gameState = new GameState();
    
    // Add a tower
    const tower = new Tower({ 
      position: { x: 100, y: 100 },
      damage: 20,
      range: 50
    });
    gameState.addTower(tower);
    
    // Add mooks (previously enemies)
    const mook1 = new Mook({
      position: { x: 120, y: 120 }, // In range
      health: 100,
      speed: 1
    });
    
    const mook2 = new Mook({
      position: { x: 200, y: 200 }, // Out of range
      health: 100,
      speed: 1
    });
    
    gameState.addMook(mook1);
    gameState.addMook(mook2);
    
    // Update game (at time 1000ms)
    gameState.update(1000);
    
    // Mook 1 should have taken damage
    expect(mook1.health).toBeLessThan(100);
    
    // Mook 2 should not have taken damage
    expect(mook2.health).toBe(100);
  });
  
  test('towers should attack closest enemy when multiple enemies are in range', () => {
    // Create game state
    const gameState = new GameState();
    
    // Add a tower
    const tower = new Tower({ 
      position: { x: 100, y: 100 },
      damage: 20,
      range: 100
    });
    gameState.addTower(tower);
    
    // Add mooks
    const mook1 = new Mook({
      position: { x: 150, y: 150 }, // Distance ~70.7
      health: 100,
      speed: 1
    });
    
    const mook2 = new Mook({
      position: { x: 120, y: 120 }, // Distance ~28.3 (closer)
      health: 100,
      speed: 1
    });
    
    gameState.addMook(mook1);
    gameState.addMook(mook2);
    
    // Mock attack method to track which enemy was attacked
    const originalAttack = tower.attack;
    let attackedEnemy = null;
    tower.attack = jest.fn((enemy, time) => {
      attackedEnemy = enemy;
      return originalAttack.call(tower, enemy, time);
    });
    
    // Update game
    gameState.update(1000);
    
    // Closer enemy (mook2) should have been attacked
    expect(attackedEnemy).toBe(mook2);
  });
  
  test('upgrading tower should increase its effectiveness against enemies', () => {
    // Create a tower directly without using GameState
    const tower = new Tower({ 
      position: { x: 100, y: 100 },
      damage: 20,
      range: 50
    });
    
    // Create a mock enemy
    const enemy = {
      position: { x: 120, y: 120 },
      health: 100,
      takeDamage: jest.fn().mockImplementation(damage => damage)
    };
    
    // Record damage before upgrade
    const damageBeforeUpgrade = tower.damage;
    
    // Attack the enemy
    tower.attack(enemy, 1000);
    const attackDamageBeforeUpgrade = enemy.takeDamage.mock.calls[0][0];
    
    // Verify that the damage passed to takeDamage matches tower.damage
    expect(attackDamageBeforeUpgrade).toBe(damageBeforeUpgrade);
    
    // Upgrade the tower
    tower.upgrade();
    
    // Verify damage increased
    expect(tower.damage).toBeGreaterThan(damageBeforeUpgrade);
    
    // Reset mock
    enemy.takeDamage.mockClear();
    
    // Attack again with upgraded tower
    tower.attack(enemy, 2000); // New timestamp to bypass cooldown
    const attackDamageAfterUpgrade = enemy.takeDamage.mock.calls[0][0];
    
    // Verify that upgraded attack does more damage
    expect(attackDamageAfterUpgrade).toBeGreaterThan(attackDamageBeforeUpgrade);
  });
});
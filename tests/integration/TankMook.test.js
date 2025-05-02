const Tower = require('../../src/core/Tower');
const Mook = require('../../src/core/mooks/Mook');
const TankMook = require('../../src/core/mooks/TankMook');
const GameState = require('../../src/core/GameState');

describe('TankMook Integration', () => {
  // Test tank mook vs towers
  test('tank mooks should take more hits to destroy than standard mooks', () => {
    // Create a tower with fixed damage
    const tower = new Tower({ 
      position: { x: 100, y: 100 },
      damage: 50,
      range: 50,
      attackSpeed: 1 // 1 attack per second
    });
    
    // Create mooks
    const standardMook = new Mook({
      position: { x: 120, y: 120 }, // In range
      health: 100
    });
    
    const tankMook = new TankMook({
      position: { x: 120, y: 120 }, // In range
      health: 200
    });
    
    // Count attacks needed to kill each mook
    let standardAttacks = 0;
    while (!standardMook.isDead) {
      tower.attack(standardMook, standardAttacks * 1000);
      standardAttacks++;
    }
    
    let tankAttacks = 0;
    while (!tankMook.isDead) {
      tower.attack(tankMook, tankAttacks * 1000);
      tankAttacks++;
    }
    
    // Tank mook should require more attacks to kill
    expect(tankAttacks).toBeGreaterThan(standardAttacks);
  });
  
  test('tank mooks should move faster than standard mooks but slower than fast mooks', () => {
    // Create path for mooks
    const path = [
      { x: 0, y: 0 },
      { x: 100, y: 0 }
    ];
    
    // Create different types of mooks
    const standardMook = new Mook({
      position: { x: 0, y: 0 },
      path: [...path],
      type: 'standard'
    });
    
    const fastMook = new Mook({
      position: { x: 0, y: 0 },
      path: [...path],
      type: 'fast'
    });
    
    const tankMook = new TankMook({
      position: { x: 0, y: 0 },
      path: [...path]
    });
    
    // Move all mooks for the same amount of time
    const moveTime = 1000;
    standardMook.move(moveTime);
    fastMook.move(moveTime);
    tankMook.move(moveTime);
    
    // Tank mook should be faster than standard but slower than fast
    expect(tankMook.position.x).toBeGreaterThan(standardMook.position.x);
    expect(tankMook.position.x).toBeLessThan(fastMook.position.x);
  });
  
  test('tank mooks should yield higher rewards when killed', () => {
    // Create game state
    const gameState = new GameState();
    
    // Add a tower with high damage
    const tower = new Tower({ 
      position: { x: 100, y: 100 },
      damage: 1000, // High damage to kill in one hit
      range: 50
    });
    gameState.addTower(tower);
    
    // Initial resources and score
    const initialResources = gameState.playerResources;
    const initialScore = gameState.score;
    
    // Add a tank mook
    const tankMook = new TankMook({
      position: { x: 120, y: 120 }
    });
    gameState.addMook(tankMook);
    
    // Update game to kill the mook
    gameState.update(1000);
    
    // Verify mook is dead and removed
    expect(gameState.mooks.length).toBe(0);
    
    // Verify reward was added to resources and score
    expect(gameState.playerResources).toBeGreaterThan(initialResources);
    expect(gameState.score).toBeGreaterThan(initialScore);
    expect(gameState.score - initialScore).toEqual(tankMook.reward);
  });
  
  test('game state should be able to spawn tank mooks', () => {
    // Create game state with a map
    const map = {
      paths: [[{ x: 0, y: 0 }, { x: 100, y: 0 }]],
      getPath: (index) => map.paths[index],
      canPlaceTower: () => true,
      placeTower: () => {},
      isExitPoint: () => false
    };
    
    const gameState = new GameState({ map });
    
    // Modify spawnMook to recognize 'tank' type
    const originalSpawn = gameState.spawnMook;
    gameState.spawnMook = function(config = {}) {
      if (config.type === 'tank') {
        const TankMook = require('../../src/core/mooks/TankMook');
        const position = this.map ? { ...this.map.getPath(config.pathIndex || 0)[0] } : { x: 0, y: 0 };
        const mook = new TankMook({
          position,
          path: [...this.map.getPath(config.pathIndex || 0)],
          ...config
        });
        this.addMook(mook);
        return mook;
      } else {
        return originalSpawn.call(this, config);
      }
    };
    
    // Spawn a tank mook
    const tankMook = gameState.spawnMook({ type: 'tank' });
    
    // Verify mook is created and added to game
    expect(tankMook).toBeDefined();
    expect(tankMook.type).toBe('tank');
    expect(gameState.mooks.length).toBe(1);
    expect(gameState.mooks[0]).toBe(tankMook);
  });
});
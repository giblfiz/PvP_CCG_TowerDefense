const Tower = require('../../src/core/Tower');

describe('Tower', () => {
  // Test tower initialization
  test('should initialize with correct default properties', () => {
    const position = { x: 10, y: 20 };
    const tower = new Tower({ position });
    
    expect(tower.position).toEqual(position);
    expect(tower.level).toBe(1);
    expect(tower.damage).toBeGreaterThan(0);
    expect(tower.range).toBeGreaterThan(0);
    expect(tower.attackSpeed).toBeGreaterThan(0);
    expect(tower.cost).toBeGreaterThan(0);
    expect(tower.lastAttackTime).toBe(0);
  });

  // Test custom initialization
  test('should initialize with custom properties', () => {
    const position = { x: 30, y: 40 };
    const customProps = {
      position,
      level: 2,
      damage: 15,
      range: 150,
      attackSpeed: 2,
      cost: 200
    };
    
    const tower = new Tower(customProps);
    
    expect(tower.position).toEqual(position);
    expect(tower.level).toBe(2);
    expect(tower.damage).toBe(15);
    expect(tower.range).toBe(150);
    expect(tower.attackSpeed).toBe(2);
    expect(tower.cost).toBe(200);
  });

  // Test upgrading
  test('should upgrade tower correctly', () => {
    const tower = new Tower({ position: { x: 10, y: 10 } });
    const initialLevel = tower.level;
    const initialDamage = tower.damage;
    
    tower.upgrade();
    
    expect(tower.level).toBe(initialLevel + 1);
    expect(tower.damage).toBeGreaterThan(initialDamage);
  });

  // Test target acquisition
  test('should target enemies within range', () => {
    const tower = new Tower({ 
      position: { x: 100, y: 100 },
      range: 50
    });
    
    const enemies = [
      { position: { x: 120, y: 120 }, health: 100 }, // In range
      { position: { x: 200, y: 200 }, health: 100 }, // Out of range
    ];
    
    const target = tower.findTarget(enemies);
    expect(target).toBe(enemies[0]);
  });
  
  test('should return null if no enemies in range', () => {
    const tower = new Tower({ 
      position: { x: 100, y: 100 },
      range: 50
    });
    
    const enemies = [
      { position: { x: 200, y: 200 }, health: 100 }, // Out of range
      { position: { x: 300, y: 300 }, health: 100 }, // Out of range
    ];
    
    const target = tower.findTarget(enemies);
    expect(target).toBeNull();
  });

  // Test attacking
  test('should attack enemy and return damage dealt', () => {
    const tower = new Tower({ 
      position: { x: 100, y: 100 },
      damage: 20,
      range: 50
    });
    
    const enemy = { 
      position: { x: 120, y: 120 }, 
      health: 100,
      takeDamage: jest.fn().mockReturnValue(20)
    };
    
    const damage = tower.attack(enemy, 1000);
    
    expect(damage).toBe(20);
    expect(enemy.takeDamage).toHaveBeenCalledWith(20);
  });
  
  test('should respect attack cooldown', () => {
    const tower = new Tower({ 
      position: { x: 100, y: 100 },
      damage: 20,
      attackSpeed: 1 // 1 attack per second
    });
    
    const enemy = { 
      position: { x: 120, y: 120 }, 
      health: 100,
      takeDamage: jest.fn().mockReturnValue(20)
    };
    
    // First attack (at time 1000ms)
    tower.attack(enemy, 1000);
    expect(enemy.takeDamage).toHaveBeenCalledTimes(1);
    
    // Attack too soon (at time 1500ms, only 500ms later)
    const damage = tower.attack(enemy, 1500);
    
    // Should not attack again as cooldown hasn't finished
    expect(damage).toBe(0);
    expect(enemy.takeDamage).toHaveBeenCalledTimes(1);
    
    // Attack after cooldown (at time 2100ms, 1100ms after first attack)
    const laterDamage = tower.attack(enemy, 2100);
    
    // Should attack again as cooldown has finished
    expect(laterDamage).toBe(20);
    expect(enemy.takeDamage).toHaveBeenCalledTimes(2);
  });

  // Test utility methods
  test('should calculate distance to target correctly', () => {
    const tower = new Tower({ position: { x: 0, y: 0 } });
    const target = { position: { x: 3, y: 4 } };
    
    // Pythagorean theorem: distance = sqrt(3² + 4²) = sqrt(25) = 5
    expect(tower.distanceToTarget(target)).toBe(5);
  });

  test('should determine if target is in range', () => {
    const tower = new Tower({ 
      position: { x: 100, y: 100 },
      range: 50
    });
    
    const inRangeTarget = { position: { x: 120, y: 120 } }; // Distance ~28.28
    const outOfRangeTarget = { position: { x: 200, y: 200 } }; // Distance ~141.42
    
    expect(tower.isInRange(inRangeTarget)).toBe(true);
    expect(tower.isInRange(outOfRangeTarget)).toBe(false);
  });
});
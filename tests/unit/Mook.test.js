const Mook = require('../../src/core/mooks/Mook');

describe('Mook', () => {
  // Test mook initialization
  test('should initialize with correct default properties', () => {
    const position = { x: 10, y: 20 };
    const mook = new Mook({ position });
    
    expect(mook.position).toEqual(position);
    expect(mook.health).toBeGreaterThan(0);
    expect(mook.speed).toBeGreaterThan(0);
    expect(mook.reward).toBeGreaterThan(0);
    expect(mook.isDead).toBe(false);
  });

  // Test custom initialization
  test('should initialize with custom properties', () => {
    const position = { x: 30, y: 40 };
    const customProps = {
      position,
      health: 150,
      speed: 2.5,
      reward: 25,
      type: 'armored'
    };
    
    const mook = new Mook(customProps);
    
    expect(mook.position).toEqual(position);
    expect(mook.health).toBe(150);
    expect(mook.speed).toBe(2.5);
    expect(mook.reward).toBe(25);
    expect(mook.type).toBe('armored');
  });

  // Test taking damage
  test('should take damage and reduce health', () => {
    const mook = new Mook({ 
      position: { x: 10, y: 10 },
      health: 100
    });
    
    const damageDealt = mook.takeDamage(30);
    
    expect(damageDealt).toBe(30);
    expect(mook.health).toBe(70);
    expect(mook.isDead).toBe(false);
  });

  test('should die when health reaches zero', () => {
    const mook = new Mook({ 
      position: { x: 10, y: 10 },
      health: 50
    });
    
    mook.takeDamage(50);
    
    expect(mook.health).toBe(0);
    expect(mook.isDead).toBe(true);
  });

  test('should die when health goes below zero', () => {
    const mook = new Mook({ 
      position: { x: 10, y: 10 },
      health: 30
    });
    
    const damageDealt = mook.takeDamage(50);
    
    expect(damageDealt).toBe(30); // Only deals damage equal to remaining health
    expect(mook.health).toBe(0);
    expect(mook.isDead).toBe(true);
  });

  // Test movement
  test('should move along a path', () => {
    const mook = new Mook({ 
      position: { x: 10, y: 10 },
      speed: 5,
      path: [
        { x: 20, y: 10 },
        { x: 20, y: 20 }
      ]
    });
    
    // Move for 1 second (speed is 5 units per second)
    mook.move(1000);
    
    // Should move 5 units along the path toward first waypoint
    expect(mook.position.x).toBe(15);
    expect(mook.position.y).toBe(10);
    expect(mook.pathIndex).toBe(0); // Still heading to first waypoint
  });

  test('should move to next waypoint when reaching current target', () => {
    const mook = new Mook({ 
      position: { x: 18, y: 10 },
      speed: 5,
      path: [
        { x: 20, y: 10 },
        { x: 20, y: 20 }
      ]
    });
    
    // Move for 1 second (speed is 5 units per second)
    // Should reach first waypoint and start moving to second
    mook.move(1000);
    
    // Should have reached first waypoint and started toward second
    expect(mook.position.x).toBe(20);
    expect(mook.position.y).toBeGreaterThan(10);
    expect(mook.pathIndex).toBe(1); // Now heading to second waypoint
  });

  test('should stop moving after reaching end of path', () => {
    const mook = new Mook({ 
      position: { x: 20, y: 18 },
      speed: 5,
      path: [
        { x: 20, y: 20 }
      ]
    });
    
    // Initial move to reach the end
    mook.move(1000);
    
    // Position should be at the final waypoint
    expect(mook.position.x).toBe(20);
    expect(mook.position.y).toBe(20);
    expect(mook.pathIndex).toBe(1); // Past the end of the path array
    
    // Try to move again
    const initialPosition = { ...mook.position };
    mook.move(1000);
    
    // Position should not change
    expect(mook.position).toEqual(initialPosition);
  });
  
  // Test different mook types
  test('should have different armor values based on type', () => {
    const standardMook = new Mook({ 
      position: { x: 10, y: 10 },
      health: 100,
      type: 'standard'
    });
    
    const armoredMook = new Mook({ 
      position: { x: 10, y: 10 },
      health: 100,
      type: 'armored'
    });
    
    const fastMook = new Mook({ 
      position: { x: 10, y: 10 },
      health: 100,
      type: 'fast'
    });
    
    // Inflict same damage to all
    standardMook.takeDamage(60);
    armoredMook.takeDamage(60);
    fastMook.takeDamage(60);
    
    // Armored mook should take less damage
    expect(standardMook.health).toBe(40);
    expect(armoredMook.health).toBeGreaterThan(40);
    expect(fastMook.health).toBeLessThanOrEqual(40);
    
    // Fast mook should be faster
    expect(fastMook.speed).toBeGreaterThan(standardMook.speed);
  });
});
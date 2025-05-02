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
    
    const wasDead = mook.takeDamage(30);
    
    expect(wasDead).toBe(false); // Should return false if not dead
    expect(mook.health).toBe(70);
    expect(mook.active).toBe(true);
  });

  test('should die when health reaches zero', () => {
    const mook = new Mook({ 
      position: { x: 10, y: 10 },
      health: 50
    });
    
    const wasDead = mook.takeDamage(50);
    
    expect(wasDead).toBe(true); // Should return true when killed
    expect(mook.health).toBe(0);
    expect(mook.active).toBe(false);
  });

  test('should die when health goes below zero', () => {
    const mook = new Mook({ 
      position: { x: 10, y: 10 },
      health: 30
    });
    
    const wasDead = mook.takeDamage(50);
    
    expect(wasDead).toBe(true); // Should return true when killed
    expect(mook.health).toBe(0); // Health should be clamped to 0
    expect(mook.active).toBe(false);
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
    mook.update(1);
    
    // Should move along the path toward first waypoint
    expect(mook.position.x).toBeGreaterThan(10);
    expect(mook.position.y).toBe(10);
    expect(mook.currentPathIndex).toBe(0); // Still heading to first waypoint
  });

  test('should move to next waypoint when reaching current target', () => {
    const mook = new Mook({ 
      position: { x: 10, y: 10 },
      speed: 10, 
      path: [
        { x: 20, y: 10 },
        { x: 20, y: 20 }
      ]
    });
    
    // Force progress to reach the waypoint
    mook.progress = 10; // Enough to reach first waypoint
    mook.update(1);
    
    // Should have moved to the next waypoint
    expect(mook.currentPathIndex).toBe(1); // Now heading to second waypoint
    expect(mook.position.x).toBe(20);
    expect(mook.position.y).toBeGreaterThan(10);
  });

  test('should stop moving after reaching end of path', () => {
    const mook = new Mook({ 
      position: { x: 20, y: 18 },
      speed: 5,
      path: [
        { x: 20, y: 20 }
      ]
    });
    
    // Set progress to reach endpoint
    mook.progress = 5;
    mook.update(1);
    
    // Position should be at the final waypoint and reached end flag set
    expect(mook.reachedEnd).toBe(true);
    
    // Remember the position
    const initialPosition = { ...mook.position };
    
    // Try to move again
    mook.update(1);
    
    // Position should not change when we've reached the end
    expect(mook.position).toEqual(initialPosition);
  });
  
  // Test armor values
  test('should apply armor when taking damage', () => {
    // Create a mook with 0.3 armor (30% damage reduction)
    const mook = new Mook({ 
      position: { x: 10, y: 10 },
      health: 100
    });
    
    // Add armor
    mook.armor = 0.3;
    
    // Take damage
    mook.takeDamage(100);
    
    // With 30% reduction, should only take 70 damage
    expect(mook.health).toBe(30);
  });
  
  test('should apply negative armor when taking damage', () => {
    // Create a mook with -0.2 armor (20% more damage)
    const mook = new Mook({ 
      position: { x: 10, y: 10 },
      health: 100
    });
    
    // Add negative armor
    mook.armor = -0.2;
    
    // Take damage
    mook.takeDamage(100);
    
    // With 20% increase, should take 120 damage (but capped at 100)
    expect(mook.health).toBe(0);
    expect(mook.active).toBe(false);
  });
});
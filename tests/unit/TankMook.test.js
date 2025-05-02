const TankMook = require('../../src/core/mooks/TankMook');
const Mook = require('../../src/core/mooks/Mook');

describe('TankMook', () => {
  // Test TankMook initialization
  test('should initialize with higher health than standard mook', () => {
    const position = { x: 10, y: 20 };
    const tankMook = new TankMook({ position });
    
    // Should have higher health than standard mook
    const standardMook = new Mook({ position });
    expect(tankMook.health).toBeGreaterThan(standardMook.health);
    
    // TankMook should have higher damage than standard mook
    expect(tankMook.damage).toBeGreaterThan(standardMook.damage);
    
    // Should have higher reward than standard mook
    expect(tankMook.reward).toBeGreaterThan(standardMook.reward);
  });

  // Test inheritance
  test('should inherit from Mook class', () => {
    const tankMook = new TankMook({ position: { x: 10, y: 10 } });
    expect(tankMook).toBeInstanceOf(Mook);
  });

  // Test armor
  test('should have significant armor value', () => {
    const tankMook = new TankMook({ position: { x: 10, y: 10 } });
    expect(tankMook.armor).toBeGreaterThan(0.3); // More armor than armored mook
  });

  // Test custom initialization
  test('should initialize with custom properties', () => {
    const position = { x: 30, y: 40 };
    const customProps = {
      position,
      health: 300,
      speed: 1.3,
      reward: 40
    };
    
    const tankMook = new TankMook(customProps);
    
    expect(tankMook.position).toEqual(position);
    expect(tankMook.health).toBe(300);
    expect(tankMook.speed).toBe(1.3);
    expect(tankMook.reward).toBe(40);
    expect(tankMook.type).toBe('tank');
  });

  // Test taking damage with armor
  test('should take reduced damage due to armor', () => {
    const tankMook = new TankMook({ 
      position: { x: 10, y: 10 },
      health: 200
    });
    
    const standardMook = new Mook({
      position: { x: 10, y: 10 },
      health: 200
    });
    
    // Apply same damage to both
    const damageAmount = 50;
    tankMook.takeDamage(damageAmount);
    standardMook.takeDamage(damageAmount);
    
    // Tank mook should take less damage due to armor
    expect(tankMook.health).toBeGreaterThan(standardMook.health);
  });
});
/**
 * Unit test for mook cleanup functionality
 */

// Mock Phaser objects and functions
const mockTweens = {
  add: jest.fn(),
};

const mockTime = {
  delayedCall: jest.fn((delay, callback) => {
    // Immediately execute the callback for testing
    callback();
    return { remove: jest.fn() };
  }),
  addEvent: jest.fn((config) => {
    // Execute the callback immediately for testing
    if (config.callback) {
      config.callback();
    }
    return { remove: jest.fn() };
  }),
};

const mockContainer = {
  destroy: jest.fn(),
};

// Mock Mook class
class Mook {
  constructor(type, path) {
    this.type = type;
    this.path = [...path];
    this.position = { ...path[0] };
    this.active = true;
    this.health = 100;
    this.maxHealth = 100;
    this.sprite = mockContainer;
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.active = false;
      return true; // Died
    }
    return false; // Still alive
  }

  getHealthPercent() {
    return Math.max(0, Math.min(1, this.health / this.maxHealth));
  }
}

// Mock GameState class
class GameState {
  constructor() {
    this.mooks = [];
    this.waveActive = true;
    this.mooksKilled = 0;
  }

  mookKilled(mook) {
    mook.active = false;
    this.mooksKilled++;
  }
}

// Mock Scene class for testing
class MockScene {
  constructor() {
    this.gameState = new GameState();
    this.tweens = mockTweens;
    this.time = mockTime;
    this.cellSize = 60;
    this.cleanupTimer = undefined;
  }

  updateMookSprites() {
    // Implementation from phaser-map.html
    for (const mook of this.gameState.mooks) {
      if (mook.sprite) {
        if (!mook.active) {
          if (!mook.markedForRemoval) {
            mook.markedForRemoval = true;
            
            // Use the time.delayedCall mock
            this.time.delayedCall(1000, () => {
              if (mook.sprite) {
                mook.sprite.destroy();
                mook.sprite = null;
              }
            });
          }
          
          if (mook.sprite) {
            mook.sprite.visible = false;
          }
        } else {
          // Update position for active mooks
          mook.sprite.setPosition = jest.fn();
          mook.sprite.setPosition(
              mook.position.x * this.cellSize + this.cellSize/2,
              mook.position.y * this.cellSize + this.cellSize/2
          );
          
          // Skip health bar updates for testing simplicity
        }
      }
    }
    
    // Clean up the mooks array periodically
    if (this.gameState.waveActive && this.cleanupTimer === undefined) {
      this.cleanupTimer = this.time.addEvent({
        delay: 2000,
        callback: () => {
          // Filter out inactive mooks that have had their sprites removed
          this.gameState.mooks = this.gameState.mooks.filter(
            mook => mook.active || !mook.markedForRemoval || mook.sprite
          );
        },
        loop: true
      });
    } else if (!this.gameState.waveActive && this.cleanupTimer !== undefined) {
      if (this.cleanupTimer) {
        this.cleanupTimer.remove();
        this.cleanupTimer = undefined;
      }
    }
  }

  // Helper to kill a mook for testing
  killMook(mook, damage = 100) {
    const isDead = mook.takeDamage(damage);
    if (isDead) {
      this.gameState.mookKilled(mook);
    }
    return isDead;
  }
}

describe('Mook Cleanup', () => {
  let scene;
  let mook1, mook2, mook3;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create scene and mooks
    scene = new MockScene();
    
    // Create test mooks with a simple path
    const testPath = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }];
    mook1 = new Mook('standard', testPath);
    mook2 = new Mook('standard', testPath);
    mook3 = new Mook('standard', testPath);
    
    // Add mooks to game state
    scene.gameState.mooks = [mook1, mook2, mook3];
  });
  
  test('Dead mooks should be marked for removal', () => {
    // Kill mook1
    scene.killMook(mook1);
    
    // Check initial state
    expect(mook1.active).toBe(false);
    expect(mook1.markedForRemoval).toBeUndefined();
    
    // Update sprites which should mark for removal
    scene.updateMookSprites();
    
    // Check if marked for removal
    expect(mook1.markedForRemoval).toBe(true);
    expect(mockTime.delayedCall).toHaveBeenCalled();
  });
  
  test('Mook sprites should be destroyed when killed', () => {
    // Kill mook1
    scene.killMook(mook1);
    
    // Update sprites
    scene.updateMookSprites();
    
    // Check if sprite was destroyed (our mock immediately executes the callback)
    expect(mockContainer.destroy).toHaveBeenCalled();
    expect(mook1.sprite).toBeNull();
  });
  
  test('Mooks should be removed from the game state after cleanup', () => {
    // Kill mook1 and mook2
    scene.killMook(mook1);
    scene.killMook(mook2);
    
    // Update sprites to mark for removal and destroy sprites
    scene.updateMookSprites();
    
    // The mooks array should be filtered
    expect(scene.gameState.mooks.length).toBe(1);
    expect(scene.gameState.mooks[0]).toBe(mook3);
  });
  
  test('Active mooks should not be removed', () => {
    // Kill only mook1
    scene.killMook(mook1);
    
    // Update sprites
    scene.updateMookSprites();
    
    // Check if only mook1 was removed
    expect(scene.gameState.mooks.length).toBe(2);
    expect(scene.gameState.mooks).toContain(mook2);
    expect(scene.gameState.mooks).toContain(mook3);
    expect(scene.gameState.mooks).not.toContain(mook1);
  });
  
  test('Cleanup timer should only run during active waves', () => {
    // First update with active wave
    scene.updateMookSprites();
    expect(mockTime.addEvent).toHaveBeenCalled();
    
    // Reset mock
    jest.clearAllMocks();
    
    // Set wave to inactive
    scene.gameState.waveActive = false;
    
    // Update again
    scene.updateMookSprites();
    
    // Cleanup timer should be removed
    expect(scene.cleanupTimer).toBeUndefined();
  });
});
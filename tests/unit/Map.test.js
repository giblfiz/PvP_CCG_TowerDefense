const Map = require('../../src/core/Map');

describe('Map', () => {
  // Test map initialization
  test('should initialize with correct default properties', () => {
    const map = new Map();
    
    expect(map.width).toBeGreaterThan(0);
    expect(map.height).toBeGreaterThan(0);
    expect(map.grid).toBeDefined();
    expect(map.paths).toBeDefined();
    expect(map.paths.length).toBeGreaterThan(0);
    expect(map.spawnPoints).toBeDefined();
    expect(map.spawnPoints.length).toBeGreaterThan(0);
    expect(map.exitPoints).toBeDefined();
    expect(map.exitPoints.length).toBeGreaterThan(0);
  });

  // Test custom initialization
  test('should initialize with custom dimensions', () => {
    const map = new Map({ width: 15, height: 10 });
    
    expect(map.width).toBe(15);
    expect(map.height).toBe(10);
    expect(map.grid.length).toBe(15); // Width
    expect(map.grid[0].length).toBe(10); // Height
  });

  // Test grid cell access
  test('should allow getting and setting grid cell values', () => {
    const map = new Map({ width: 10, height: 10 });
    
    // Default value should be empty
    expect(map.getCellValue(5, 5)).toBe(0);
    
    // Set a cell to a tower position
    map.setCellValue(5, 5, 1);
    expect(map.getCellValue(5, 5)).toBe(1);
    
    // Set a cell to a path position
    map.setCellValue(3, 4, 2);
    expect(map.getCellValue(3, 4)).toBe(2);
  });

  // Test boundary checking
  test('should validate coordinates within map boundaries', () => {
    const map = new Map({ width: 10, height: 8 });
    
    expect(map.isValidPosition(0, 0)).toBe(true);
    expect(map.isValidPosition(9, 7)).toBe(true);
    expect(map.isValidPosition(-1, 5)).toBe(false);
    expect(map.isValidPosition(5, -1)).toBe(false);
    expect(map.isValidPosition(10, 5)).toBe(false);
    expect(map.isValidPosition(5, 8)).toBe(false);
  });

  // Test path functionality
  test('should provide path for mooks to follow', () => {
    const map = new Map({ width: 10, height: 10 });
    
    // Get a path from the map
    const path = map.getPath(0); // Get first path
    
    // Path should be an array of points
    expect(Array.isArray(path)).toBe(true);
    expect(path.length).toBeGreaterThan(1);
    
    // Each point should have x and y coordinates
    path.forEach(point => {
      expect(point).toHaveProperty('x');
      expect(point).toHaveProperty('y');
      expect(map.isValidPosition(point.x, point.y)).toBe(true);
    });
    
    // Path should start at a spawn point and end at an exit point
    const startPoint = path[0];
    const endPoint = path[path.length - 1];
    
    expect(map.isSpawnPoint(startPoint.x, startPoint.y)).toBe(true);
    expect(map.isExitPoint(endPoint.x, endPoint.y)).toBe(true);
  });

  // Test tower placement
  test('should validate tower placement', () => {
    const map = new Map({ width: 10, height: 10 });
    
    // Should allow placing tower on empty cell
    expect(map.canPlaceTower(5, 5)).toBe(true);
    
    // Set a path cell
    map.setCellValue(3, 4, Map.CELL_PATH);
    expect(map.canPlaceTower(3, 4)).toBe(false);
    
    // Set a tower cell
    map.setCellValue(6, 6, Map.CELL_TOWER);
    expect(map.canPlaceTower(6, 6)).toBe(false);
    
    // Place a tower
    expect(map.placeTower(7, 7)).toBe(true);
    expect(map.getCellValue(7, 7)).toBe(Map.CELL_TOWER);
    expect(map.canPlaceTower(7, 7)).toBe(false);
    
    // Try placing tower outside map boundaries
    expect(map.placeTower(-1, 5)).toBe(false);
    expect(map.placeTower(10, 5)).toBe(false);
  });

  // Test map generation
  test('should generate a valid map layout', () => {
    const map = new Map({ width: 20, height: 15 });
    map.generateMap();
    
    // Map should have paths connecting spawn points to exit points
    expect(map.paths.length).toBeGreaterThan(0);
    
    // Every spawn point should connect to an exit point
    for (let i = 0; i < map.spawnPoints.length; i++) {
      const path = map.getPath(i);
      expect(path.length).toBeGreaterThan(1);
      
      // Path should be continuous (no jumps)
      for (let j = 1; j < path.length; j++) {
        const prev = path[j-1];
        const curr = path[j];
        const distance = Math.sqrt(Math.pow(prev.x - curr.x, 2) + Math.pow(prev.y - curr.y, 2));
        
        // Distance should be 1 or sqrt(2) for diagonal moves
        expect(distance).toBeLessThanOrEqual(Math.sqrt(2) + 0.001);
      }
    }
    
    // Check spawn and exit points are properly marked in the grid
    for (const spawn of map.spawnPoints) {
      expect(map.getCellValue(spawn.x, spawn.y)).toBe(Map.CELL_SPAWN);
    }
    
    for (const exit of map.exitPoints) {
      expect(map.getCellValue(exit.x, exit.y)).toBe(Map.CELL_EXIT);
    }
  });

  // Test building a custom map
  test('should allow building a custom map', () => {
    const map = new Map({ width: 10, height: 10 });
    
    // Add spawn point
    const spawnPoint = { x: 0, y: 5 };
    map.addSpawnPoint(spawnPoint.x, spawnPoint.y);
    expect(map.isSpawnPoint(spawnPoint.x, spawnPoint.y)).toBe(true);
    
    // Add exit point
    const exitPoint = { x: 9, y: 5 };
    map.addExitPoint(exitPoint.x, exitPoint.y);
    expect(map.isExitPoint(exitPoint.x, exitPoint.y)).toBe(true);
    
    // Create a path
    const path = [
      { x: 0, y: 5 },
      { x: 1, y: 5 },
      { x: 2, y: 5 },
      { x: 3, y: 5 },
      { x: 4, y: 5 },
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 7, y: 5 },
      { x: 8, y: 5 },
      { x: 9, y: 5 }
    ];
    
    // Add path to map
    map.addPath(path);
    
    // Verify path is in the grid (except for spawn and exit points)
    for (let i = 1; i < path.length - 1; i++) {
      const point = path[i];
      expect(map.getCellValue(point.x, point.y)).toBe(Map.CELL_PATH);
    }
    
    // Get the path back and verify it's correct
    const retrievedPath = map.getPath(map.paths.length - 1);
    expect(retrievedPath).toEqual(path);
  });

  // Test getting tower placement positions
  test('should provide valid tower placement positions', () => {
    const map = new Map({ width: 10, height: 10, custom: true }); // Use custom to prevent auto-generation
    
    // Add a simple path
    const path = [
      { x: 0, y: 5 }, // spawn
      { x: 1, y: 5 },
      { x: 2, y: 5 },
      { x: 3, y: 5 },
      { x: 4, y: 5 },
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 7, y: 5 },
      { x: 8, y: 5 },
      { x: 9, y: 5 }, // exit
    ];
    
    map.addSpawnPoint(0, 5);
    map.addExitPoint(9, 5);
    map.addPath(path);
    
    // Get valid tower positions
    const towerPositions = map.getValidTowerPositions();
    
    // We expect all cells minus the path to be available
    // (10*10 grid - 8 path cells - 1 spawn - 1 exit = 90 positions)
    expect(towerPositions.length).toBe(90);
    
    // None of the tower positions should be on the path
    for (const pos of towerPositions) {
      expect(map.getCellValue(pos.x, pos.y)).toBe(Map.CELL_EMPTY);
      
      // Make sure it's not on the path, spawn, or exit
      expect(map.canPlaceTower(pos.x, pos.y)).toBe(true);
    }
  });
});
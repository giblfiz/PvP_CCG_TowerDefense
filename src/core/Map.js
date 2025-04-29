/**
 * Represents the game map for tower defense
 */
class Map {
  /**
   * Cell type constants
   */
  static CELL_EMPTY = 0;
  static CELL_TOWER = 1;
  static CELL_PATH = 2;
  static CELL_SPAWN = 3;
  static CELL_EXIT = 4;

  /**
   * Create a map
   * @param {Object} config - Map configuration
   * @param {number} [config.width=20] - Map width
   * @param {number} [config.height=15] - Map height
   * @param {number} [config.numPaths=1] - Number of paths
   */
  constructor(config = {}) {
    this.width = config.width || 20;
    this.height = config.height || 15;
    this.numPaths = config.numPaths || 1;
    
    // Initialize grid
    this.grid = [];
    for (let x = 0; x < this.width; x++) {
      this.grid[x] = [];
      for (let y = 0; y < this.height; y++) {
        this.grid[x][y] = Map.CELL_EMPTY;
      }
    }
    
    // Initialize paths, spawn points, and exit points
    this.paths = [];
    this.spawnPoints = [];
    this.exitPoints = [];
    
    // Generate a default map if no custom config
    if (!config.custom) {
      this.generateMap();
    }
  }

  /**
   * Generate a map with paths
   */
  generateMap() {
    // Clear existing data
    this.paths = [];
    this.spawnPoints = [];
    this.exitPoints = [];
    
    // Reset grid to empty
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.grid[x][y] = Map.CELL_EMPTY;
      }
    }
    
    // Create paths based on numPaths
    for (let i = 0; i < this.numPaths; i++) {
      this.generatePath();
    }
  }

  /**
   * Generate a single path from spawn to exit
   */
  generatePath() {
    // Create a spawn point on the left edge
    const spawnY = Math.floor(Math.random() * this.height);
    const spawnPoint = { x: 0, y: spawnY };
    this.addSpawnPoint(spawnPoint.x, spawnPoint.y);
    
    // Create an exit point on the right edge
    const exitY = Math.floor(Math.random() * this.height);
    const exitPoint = { x: this.width - 1, y: exitY };
    this.addExitPoint(exitPoint.x, exitPoint.y);
    
    // Generate path from spawn to exit
    const path = this.findPath(spawnPoint, exitPoint);
    this.addPath(path);
    
    return path;
  }

  /**
   * Find a path between two points using A* algorithm
   * @param {Object} start - Start position {x, y}
   * @param {Object} end - End position {x, y}
   * @returns {Array} - Array of points forming the path
   */
  findPath(start, end) {
    // Implementation of A* algorithm
    // This is a simplified version for testing
    
    const path = [];
    let current = { ...start };
    path.push({ ...current });
    
    while (current.x !== end.x || current.y !== end.y) {
      // Move horizontally first
      if (current.x < end.x) {
        current.x += 1;
      } else if (current.x > end.x) {
        current.x -= 1;
      }
      // Then move vertically
      else if (current.y < end.y) {
        current.y += 1;
      } else if (current.y > end.y) {
        current.y -= 1;
      }
      
      path.push({ ...current });
    }
    
    return path;
  }

  /**
   * Add a spawn point to the map
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} - Whether the spawn point was added
   */
  addSpawnPoint(x, y) {
    if (!this.isValidPosition(x, y)) {
      return false;
    }
    
    this.spawnPoints.push({ x, y });
    this.setCellValue(x, y, Map.CELL_SPAWN);
    return true;
  }

  /**
   * Add an exit point to the map
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} - Whether the exit point was added
   */
  addExitPoint(x, y) {
    if (!this.isValidPosition(x, y)) {
      return false;
    }
    
    this.exitPoints.push({ x, y });
    this.setCellValue(x, y, Map.CELL_EXIT);
    return true;
  }

  /**
   * Add a path to the map
   * @param {Array} path - Array of points {x, y} forming the path
   * @returns {boolean} - Whether the path was added
   */
  addPath(path) {
    // Verify path
    if (!Array.isArray(path) || path.length < 2) {
      return false;
    }
    
    // Add path to map
    this.paths.push([...path]);
    
    // Mark all path cells in grid
    for (let i = 0; i < path.length; i++) {
      const { x, y } = path[i];
      if (this.isValidPosition(x, y)) {
        // Skip overwriting spawn and exit points
        if (this.grid[x][y] !== Map.CELL_SPAWN && this.grid[x][y] !== Map.CELL_EXIT) {
          this.setCellValue(x, y, Map.CELL_PATH);
        }
      }
    }
    
    return true;
  }

  /**
   * Get a specific path by index
   * @param {number} index - Path index
   * @returns {Array} - Array of points forming the path
   */
  getPath(index) {
    if (index < 0 || index >= this.paths.length) {
      return [];
    }
    
    return [...this.paths[index]];
  }

  /**
   * Get the value of a cell in the grid
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {number} - Cell value
   */
  getCellValue(x, y) {
    if (!this.isValidPosition(x, y)) {
      return -1;
    }
    
    return this.grid[x][y];
  }

  /**
   * Set the value of a cell in the grid
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} value - Cell value
   * @returns {boolean} - Whether the value was set
   */
  setCellValue(x, y, value) {
    if (!this.isValidPosition(x, y)) {
      return false;
    }
    
    this.grid[x][y] = value;
    return true;
  }

  /**
   * Check if a position is within map boundaries
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} - Whether the position is valid
   */
  isValidPosition(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  /**
   * Check if a tower can be placed at a position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} - Whether a tower can be placed
   */
  canPlaceTower(x, y) {
    if (!this.isValidPosition(x, y)) {
      return false;
    }
    
    // Can only place towers on empty cells
    return this.grid[x][y] === Map.CELL_EMPTY;
  }

  /**
   * Place a tower at a position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} - Whether the tower was placed
   */
  placeTower(x, y) {
    if (!this.canPlaceTower(x, y)) {
      return false;
    }
    
    this.setCellValue(x, y, Map.CELL_TOWER);
    return true;
  }

  /**
   * Check if a position is a spawn point
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} - Whether the position is a spawn point
   */
  isSpawnPoint(x, y) {
    return this.getCellValue(x, y) === Map.CELL_SPAWN;
  }

  /**
   * Check if a position is an exit point
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} - Whether the position is an exit point
   */
  isExitPoint(x, y) {
    return this.getCellValue(x, y) === Map.CELL_EXIT;
  }

  /**
   * Get all valid positions for tower placement
   * @returns {Array} - Array of valid tower positions {x, y}
   */
  getValidTowerPositions() {
    const positions = [];
    
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.canPlaceTower(x, y)) {
          positions.push({ x, y });
        }
      }
    }
    
    return positions;
  }

  /**
   * Remove a tower from a position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} - Whether the tower was removed
   */
  removeTower(x, y) {
    if (!this.isValidPosition(x, y)) {
      return false;
    }
    
    if (this.grid[x][y] === Map.CELL_TOWER) {
      this.setCellValue(x, y, Map.CELL_EMPTY);
      return true;
    }
    
    return false;
  }
}

module.exports = Map;
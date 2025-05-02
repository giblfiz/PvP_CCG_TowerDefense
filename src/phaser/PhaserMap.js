/**
 * Map definition for tower defense game
 */
class TDMap {
    static CELL_EMPTY = 0;
    static CELL_PATH = 1;
    static CELL_SPAWN = 2;
    static CELL_EXIT = 3;
    static CELL_TOWER = 4;
    
    /**
     * Create a new map
     * @param {number} width - Map width in cells
     * @param {number} height - Map height in cells
     */
    constructor(width = 20, height = 15) {
        this.width = width;
        this.height = height;
        this.numPaths = 3; // Number of paths to generate
        
        // Initialize grid
        this.grid = [];
        for (let x = 0; x < this.width; x++) {
            this.grid[x] = [];
            for (let y = 0; y < this.height; y++) {
                this.grid[x][y] = TDMap.CELL_EMPTY;
            }
        }
        
        // Initialize paths, spawn points, and exit points
        this.paths = [];
        this.spawnPoints = [];
        this.exitPoints = [];
        
        // Generate a default map
        this.generateMap();
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
                this.grid[x][y] = TDMap.CELL_EMPTY;
            }
        }
        
        // Generate multiple paths
        for (let i = 0; i < this.numPaths; i++) {
            this.generateSinglePath(i);
        }
    }
    
    /**
     * Generate a single path
     * @param {number} pathIndex - Index of path to generate
     * @returns {Array} Path of points
     */
    generateSinglePath(pathIndex) {
        // Calculate spawn and exit positions based on path index
        let spawnPoint, exitPoint;
        
        if (pathIndex === 0) {
            // Top path: spawn at left, exit at right
            const spawnY = Math.floor(this.height * 0.25);
            spawnPoint = { x: 0, y: spawnY };
            
            const exitY = Math.floor(this.height * 0.25);
            exitPoint = { x: this.width - 1, y: exitY };
        } 
        else if (pathIndex === 1) {
            // Middle path: spawn at left, exit at right
            const spawnY = Math.floor(this.height * 0.5);
            spawnPoint = { x: 0, y: spawnY };
            
            const exitY = Math.floor(this.height * 0.5);
            exitPoint = { x: this.width - 1, y: exitY };
        }
        else {
            // Bottom path: spawn at left, exit at right
            const spawnY = Math.floor(this.height * 0.75);
            spawnPoint = { x: 0, y: spawnY };
            
            const exitY = Math.floor(this.height * 0.75);
            exitPoint = { x: this.width - 1, y: exitY };
        }
        
        // Add spawn and exit points
        this.addSpawnPoint(spawnPoint.x, spawnPoint.y);
        this.addExitPoint(exitPoint.x, exitPoint.y);
        
        // Generate path from spawn to exit with some complexity
        const path = this.findComplexPath(spawnPoint, exitPoint, pathIndex);
        this.addPath(path);
        
        return path;
    }
    
    /**
     * Find a complex path between two points
     * @param {Object} start - Start position {x, y}
     * @param {Object} end - End position {x, y}
     * @param {number} pathIndex - Index of path for determining path pattern
     * @returns {Array} Array of points forming the path
     */
    findComplexPath(start, end, pathIndex) {
        // Create a more interesting path than just a straight line
        const path = [];
        path.push({ ...start });
        
        // Divide the width into segments for path complexity
        const segments = 4;
        const segmentWidth = this.width / segments;
        
        // Calculate waypoints based on path index
        const waypoints = [];
        
        if (pathIndex === 0) {
            // Top path: moves right, then down, then right, then up, then right
            waypoints.push({ x: Math.floor(segmentWidth), y: start.y });
            waypoints.push({ x: Math.floor(segmentWidth), y: Math.floor(this.height * 0.5) });
            waypoints.push({ x: Math.floor(segmentWidth * 2), y: Math.floor(this.height * 0.5) });
            waypoints.push({ x: Math.floor(segmentWidth * 2), y: Math.floor(this.height * 0.25) });
            waypoints.push({ x: Math.floor(segmentWidth * 3), y: Math.floor(this.height * 0.25) });
        } 
        else if (pathIndex === 1) {
            // Middle path: moves right, then up, then right, then down, then right
            waypoints.push({ x: Math.floor(segmentWidth), y: start.y });
            waypoints.push({ x: Math.floor(segmentWidth), y: Math.floor(this.height * 0.25) });
            waypoints.push({ x: Math.floor(segmentWidth * 2), y: Math.floor(this.height * 0.25) });
            waypoints.push({ x: Math.floor(segmentWidth * 2), y: Math.floor(this.height * 0.75) });
            waypoints.push({ x: Math.floor(segmentWidth * 3), y: Math.floor(this.height * 0.75) });
            waypoints.push({ x: Math.floor(segmentWidth * 3), y: Math.floor(this.height * 0.5) });
        }
        else {
            // Bottom path: moves right, then up, then right, then up, then right
            waypoints.push({ x: Math.floor(segmentWidth), y: start.y });
            waypoints.push({ x: Math.floor(segmentWidth), y: Math.floor(this.height * 0.5) });
            waypoints.push({ x: Math.floor(segmentWidth * 2), y: Math.floor(this.height * 0.5) });
            waypoints.push({ x: Math.floor(segmentWidth * 3), y: Math.floor(this.height * 0.5) });
            waypoints.push({ x: Math.floor(segmentWidth * 3), y: Math.floor(this.height * 0.75) });
        }
        
        // Add the end point
        waypoints.push(end);
        
        // Connect all waypoints with straight lines
        let current = { ...start };
        
        for (const waypoint of waypoints) {
            // Go to waypoint X first, then Y (no diagonals)
            while (current.x !== waypoint.x || current.y !== waypoint.y) {
                // Move horizontally first
                if (current.x < waypoint.x) {
                    current.x += 1;
                } else if (current.x > waypoint.x) {
                    current.x -= 1;
                }
                // Then move vertically
                else if (current.y < waypoint.y) {
                    current.y += 1;
                } else if (current.y > waypoint.y) {
                    current.y -= 1;
                }
                
                path.push({ ...current });
            }
        }
        
        return path;
    }
    
    /**
     * Find a simple path between two points
     * @param {Object} start - Start position {x, y}
     * @param {Object} end - End position {x, y}
     * @returns {Array} Array of points forming the path
     */
    findPath(start, end) {
        const path = [];
        let current = { ...start };
        path.push({ ...current });
        
        // Simple path algorithm - go horizontal first, then vertical
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
     * @returns {boolean} Whether the spawn point was added
     */
    addSpawnPoint(x, y) {
        if (!this.isValidPosition(x, y)) {
            return false;
        }
        
        this.spawnPoints.push({ x, y });
        this.grid[x][y] = TDMap.CELL_SPAWN;
        return true;
    }
    
    /**
     * Add an exit point to the map
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} Whether the exit point was added
     */
    addExitPoint(x, y) {
        if (!this.isValidPosition(x, y)) {
            return false;
        }
        
        this.exitPoints.push({ x, y });
        this.grid[x][y] = TDMap.CELL_EXIT;
        return true;
    }
    
    /**
     * Add a path to the map
     * @param {Array} path - Array of points {x, y} forming the path
     * @returns {boolean} Whether the path was added
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
                if (this.grid[x][y] !== TDMap.CELL_SPAWN && this.grid[x][y] !== TDMap.CELL_EXIT) {
                    this.grid[x][y] = TDMap.CELL_PATH;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Check if a position is valid
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} Whether the position is valid
     */
    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    
    /**
     * Get the value of a cell
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {number} Cell value (-1 if invalid position)
     */
    getCellValue(x, y) {
        if (!this.isValidPosition(x, y)) {
            return -1;
        }
        
        return this.grid[x][y];
    }
    
    /**
     * Check if a tower can be placed at a position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} Whether a tower can be placed
     */
    canPlaceTower(x, y) {
        if (!this.isValidPosition(x, y)) {
            return false;
        }
        
        // Can only place towers on empty cells
        return this.grid[x][y] === TDMap.CELL_EMPTY;
    }
    
    /**
     * Place a tower at a position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} Whether the tower was placed
     */
    placeTower(x, y) {
        if (!this.canPlaceTower(x, y)) {
            return false;
        }
        
        this.grid[x][y] = TDMap.CELL_TOWER;
        return true;
    }
    
    /**
     * Remove a tower from a position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} Whether the tower was removed
     */
    removeTower(x, y) {
        if (!this.isValidPosition(x, y)) {
            return false;
        }
        
        if (this.grid[x][y] === TDMap.CELL_TOWER) {
            this.grid[x][y] = TDMap.CELL_EMPTY;
            return true;
        }
        
        return false;
    }
}

// Export TDMap for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TDMap;
} else {
    // For browser use
    window.TDMap = TDMap;
}
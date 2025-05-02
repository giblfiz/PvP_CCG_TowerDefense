/**
 * Main game controller class
 */
class Game {
  /**
   * Initialize the game
   */
  constructor() {
    // Game configuration
    this.config = {
      mapWidth: 20,
      mapHeight: 15,
      cellSize: 40,
      startingLives: 20,
      startingMoney: 100
    };
    
    // Game state
    this.gameState = null;
    this.map = null;
    this.towerPlacementPreview = null;
    this.waveInProgress = false;
    this.selectedTower = null;
    
    // Tower types and costs
    this.towerTypes = {
      basic: {
        type: 'basic',
        cost: 20,
        damage: 15,
        range: 3,
        attackSpeed: 1
      },
      fast: {
        type: 'fast',
        cost: 50,
        damage: 10,
        range: 2,
        attackSpeed: 3
      },
      aoe: {
        type: 'aoe',
        cost: 75,
        damage: 25,
        range: 2,
        attackSpeed: 0.5
      }
    };
    
    // Current selected tower type
    this.selectedTowerType = 'basic';
  }

  /**
   * Initialize the game
   */
  init() {
    try {
      console.log("Game initialization started");
      
      // Get canvas container
      this.canvasContainer = document.getElementById('game-canvas');
      
      if (!this.canvasContainer) {
        throw new Error("Canvas container not found");
      }
      
      console.log("Canvas container found");
      
      // Create renderer
      try {
        this.renderer = new Renderer({
          canvasContainer: this.canvasContainer,
          cellSize: this.config.cellSize
        });
        console.log("Renderer initialized");
      } catch (rendererError) {
        console.error("Error initializing renderer:", rendererError);
        this.showErrorMessage("Failed to initialize renderer. See console for details.");
        throw rendererError;
      }
      
      // Create input handler
      try {
        this.inputHandler = new InputHandler({
          canvas: this.canvasContainer,
          cellSize: this.config.cellSize,
          onCellClick: this.handleCellClick.bind(this),
          onPan: this.handlePan.bind(this),
          onZoom: this.handleZoom.bind(this)
        });
        console.log("Input handler initialized");
      } catch (inputError) {
        console.error("Error initializing input handler:", inputError);
      }
      
      // Create UI handler
      try {
        this.ui = new GameUI({
          onStartWave: this.startWave.bind(this),
          onSelectTower: this.selectTowerType.bind(this)
        });
        console.log("UI handler initialized");
      } catch (uiError) {
        console.error("Error initializing UI handler:", uiError);
      }
      
      // Initialize game state
      this.createNewGame();
      
      // Start game loop
      this.lastUpdateTime = Date.now();
      requestAnimationFrame(this.gameLoop.bind(this));
      
      console.log("Game initialization completed");
    } catch (error) {
      console.error("Error during game initialization:", error);
      this.showErrorMessage("Game initialization failed. See console for details.");
    }
  }
  
  /**
   * Show an error message in the error container
   * @param {string} message - Error message to display
   */
  showErrorMessage(message) {
    console.error(message);
    
    // Use UI handler if available
    if (this.ui) {
      this.ui.showError(message);
    } else {
      // Fallback if UI not initialized yet
      const errorContainer = document.getElementById('error-container');
      if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
      }
    }
  }
  
  /**
   * Test function to trigger an error message
   * @param {string} message - Error message to display
   */
  testErrorMessage(message = 'This is a test error message') {
    this.showErrorMessage(message);
  }

  /**
   * Create a new game
   */
  createNewGame() {
    // Create map
    this.map = new Map({
      width: this.config.mapWidth,
      height: this.config.mapHeight,
      numPaths: 2
    });
    
    // Generate map with paths
    this.map.generateMap();
    
    // Create game state with map
    this.gameState = new GameState({
      map: this.map,
      startingResources: this.config.startingMoney,
      playerLives: this.config.startingLives
    });
    
    // Reset wave state
    this.waveInProgress = false;
    this.ui.setStartWaveEnabled(true);
    
    // Update UI with initial stats
    this.ui.updateStats({
      health: this.gameState.playerLives,
      money: this.gameState.playerResources,
      wave: this.gameState.waveNumber
    });
    
    // Render initial state
    this.render();
  }

  /**
   * Game loop
   */
  gameLoop() {
    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastUpdateTime;
    
    // Update game state
    this.update(currentTime, deltaTime);
    
    // Render
    this.render();
    
    // Continue loop
    this.lastUpdateTime = currentTime;
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Update game state
   * @param {number} currentTime - Current time in milliseconds
   * @param {number} deltaTime - Time since last update in milliseconds
   */
  update(currentTime, deltaTime) {
    // Update game state
    if (this.gameState) {
      const prevLives = this.gameState.playerLives;
      const prevMoney = this.gameState.playerResources;
      
      this.gameState.update(currentTime, deltaTime);
      
      // Check if stats changed
      if (prevLives !== this.gameState.playerLives || prevMoney !== this.gameState.playerResources) {
        this.ui.updateStats({
          health: this.gameState.playerLives,
          money: this.gameState.playerResources
        });
      }
      
      // Check if wave is over
      if (this.waveInProgress && this.gameState.mooks.length === 0) {
        this.waveInProgress = false;
        this.ui.setStartWaveEnabled(true);
        this.ui.showMessage('Wave completed!', 'info');
      }
      
      // Check if game is over
      if (this.gameState.isGameOver()) {
        this.ui.showMessage('Game Over! You ran out of lives.', 'error');
        this.createNewGame();
      }
    }
    
    // Update tower placement preview if any
    this.updateTowerPlacementPreview();
  }

  /**
   * Render the game
   */
  render() {
    if (!this.gameState || !this.map) return;
    
    // Render map
    this.renderer.renderMap(this.map);
    
    // Render towers
    this.renderer.renderTowers(this.gameState.towers);
    
    // Render mooks
    this.renderer.renderMooks(this.gameState.mooks);
    
    // Render tower placement preview
    if (this.towerPlacementPreview) {
      this.renderer.renderTowerPlacementPreview(
        this.towerPlacementPreview.position,
        this.towerPlacementPreview.isValid,
        this.selectedTowerType
      );
    }
  }

  /**
   * Handle cell click event
   * @param {Object} position - Grid position {x, y}
   */
  handleCellClick(position) {
    if (!this.gameState || !this.map) return;
    
    // Check if position is valid for tower
    const canPlaceTower = this.map.canPlaceTower(position.x, position.y);
    
    if (canPlaceTower) {
      // Get tower type
      const towerType = this.selectedTowerType;
      const towerConfig = this.towerTypes[towerType];
      
      // Create tower
      const tower = new Tower({
        position: { ...position },
        type: towerType,
        damage: towerConfig.damage,
        range: towerConfig.range,
        attackSpeed: towerConfig.attackSpeed,
        cost: towerConfig.cost
      });
      
      // Try to add tower to game state
      const success = this.gameState.addTower(tower);
      
      if (success) {
        // Tower added successfully
        this.ui.updateStats({
          money: this.gameState.playerResources
        });
        
        this.ui.showMessage(`Placed ${towerType} tower at (${position.x}, ${position.y})`, 'info');
      } else {
        // Couldn't add tower
        this.ui.showMessage(`Can't afford ${towerType} tower (${towerConfig.cost} cost)`, 'warning');
      }
    } else {
      this.ui.showMessage('Cannot place tower here', 'warning');
    }
  }

  /**
   * Handle map panning
   * @param {Object} viewport - New viewport position
   */
  handlePan(viewport) {
    this.renderer.updateViewport(viewport);
  }

  /**
   * Handle map zooming
   * @param {Object} viewport - New viewport state
   */
  handleZoom(viewport) {
    this.renderer.updateViewport(viewport);
  }

  /**
   * Update tower placement preview based on mouse position
   */
  updateTowerPlacementPreview() {
    // Get mouse position over canvas
    const canvas = this.canvasContainer;
    const rect = canvas.getBoundingClientRect();
    
    // If mouse is outside canvas, hide preview
    if (!this.mouseOverCanvas) {
      this.towerPlacementPreview = null;
      return;
    }
    
    // Calculate grid position
    const viewport = this.inputHandler.getViewport();
    const gridX = Math.floor((this.mouseX - viewport.x) / (this.config.cellSize * viewport.scale));
    const gridY = Math.floor((this.mouseY - viewport.y) / (this.config.cellSize * viewport.scale));
    
    // Check if position is valid
    const isValid = this.map && this.map.canPlaceTower(gridX, gridY);
    
    // Update preview
    this.towerPlacementPreview = {
      position: { x: gridX, y: gridY },
      isValid: isValid && this.gameState.playerResources >= this.towerTypes[this.selectedTowerType].cost
    };
  }

  /**
   * Select a tower type
   * @param {Object} towerInfo - Selected tower info
   */
  selectTowerType(towerInfo) {
    this.selectedTowerType = towerInfo.type;
  }

  /**
   * Start a new wave of mooks
   */
  startWave() {
    if (this.waveInProgress) return;
    
    this.waveInProgress = true;
    this.ui.setStartWaveEnabled(false);
    
    // Increase wave number
    this.gameState.waveNumber++;
    
    // Update UI
    this.ui.updateStats({
      wave: this.gameState.waveNumber
    });
    
    // Set up wave configuration
    const waveConfig = {
      count: 10 + (this.gameState.waveNumber * 2), // More mooks in later waves
      type: this.gameState.waveNumber % 4 === 0 ? 'tank' :
            this.gameState.waveNumber % 3 === 0 ? 'armored' : 
            this.gameState.waveNumber % 2 === 0 ? 'fast' : 'standard',
      spawnImmediately: false
    };
    
    // Show message
    this.ui.showMessage(`Starting Wave ${this.gameState.waveNumber}`, 'info');
    
    // Start wave
    this.gameState.startWave(waveConfig);
    
    // Set up timed spawning
    this.spawnWaveMooks(waveConfig);
  }

  /**
   * Spawn mooks for a wave over time
   * @param {Object} waveConfig - Wave configuration
   */
  spawnWaveMooks(waveConfig) {
    const count = waveConfig.count;
    const type = waveConfig.type;
    const interval = 1000; // 1 second between spawns
    
    // Spawn first mook immediately
    this.spawnMook(type);
    
    // Set up spawning for remaining mooks
    let spawnedCount = 1;
    
    const spawnTimer = setInterval(() => {
      if (spawnedCount >= count) {
        clearInterval(spawnTimer);
        return;
      }
      
      this.spawnMook(type);
      spawnedCount++;
      
      // If all mooks spawned, clear timer
      if (spawnedCount >= count) {
        clearInterval(spawnTimer);
      }
    }, interval);
  }

  /**
   * Spawn a single mook
   * @param {string} type - Type of mook to spawn ('standard', 'armored', 'fast', 'tank')
   */
  spawnMook(type) {
    // Pick a random path index
    const pathIndex = Math.floor(Math.random() * this.map.paths.length);
    
    // Determine health and speed based on type
    let health, speed;
    switch (type) {
      case 'tank':
        // Tank mooks have default values set in TankMook class,
        // but we can override them here if desired
        health = 200;  // Higher HP
        speed = 1.2;   // Slightly faster than standard
        break;
      case 'armored':
        health = 150;
        speed = 0.7;
        break;
      case 'fast':
        health = 80;
        speed = 2;
        break;
      case 'standard':
      default:
        health = 100;
        speed = 1;
        break;
    }
    
    // Spawn mook
    this.gameState.spawnMook({
      type,
      pathIndex,
      health,
      speed
    });
  }
}

// Track mouse position for tower placement preview
document.addEventListener('mousemove', (e) => {
  if (window.game) {
    const canvas = document.getElementById('game-canvas');
    const rect = canvas.getBoundingClientRect();
    
    window.game.mouseX = e.clientX - rect.left;
    window.game.mouseY = e.clientY - rect.top;
    window.game.mouseOverCanvas = 
      e.clientX >= rect.left && 
      e.clientX <= rect.right && 
      e.clientY >= rect.top && 
      e.clientY <= rect.bottom;
  }
});
/**
 * Handles rendering of the game using PixiJS
 */
class Renderer {
  /**
   * Initialize the renderer
   * @param {Object} config - Configuration options
   * @param {HTMLElement} config.canvasContainer - Container element for the canvas
   * @param {number} config.cellSize - Size of each grid cell in pixels
   */
  constructor(config) {
    this.canvasContainer = config.canvasContainer;
    this.cellSize = config.cellSize || 40;
    this.towerGraphics = {
      basic: '🗼',
      fast: '⚡',
      aoe: '💥'
    };
    this.mookGraphics = {
      standard: '👾',
      armored: '🛡️',
      fast: '🏃'
    };
    
    // Viewport state for panning/zooming
    this.viewport = {
      x: 0,
      y: 0,
      scale: 1
    };
    
    this.initPixi();
  }

  /**
   * Initialize the PixiJS application
   */
  initPixi() {
    // Create Pixi Application
    this.app = new PIXI.Application({
      width: this.canvasContainer.clientWidth,
      height: this.canvasContainer.clientHeight,
      backgroundColor: 0x1a1a2e,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true
    });
    
    // Add the Pixi canvas to DOM
    this.canvasContainer.appendChild(this.app.view);
    
    // Create containers for different game elements
    this.mapContainer = new PIXI.Container();
    this.mooksContainer = new PIXI.Container();
    this.towersContainer = new PIXI.Container();
    this.uiContainer = new PIXI.Container();
    
    // Add containers to stage in the correct order
    this.app.stage.addChild(this.mapContainer);
    this.app.stage.addChild(this.mooksContainer);
    this.app.stage.addChild(this.towersContainer);
    this.app.stage.addChild(this.uiContainer);
    
    // Handle window resize
    window.addEventListener('resize', this.onResize.bind(this));
  }

  /**
   * Handle window resize
   */
  onResize() {
    this.app.renderer.resize(
      this.canvasContainer.clientWidth,
      this.canvasContainer.clientHeight
    );
  }

  /**
   * Clear the renderer
   */
  clear() {
    this.mapContainer.removeChildren();
    this.mooksContainer.removeChildren();
    this.towersContainer.removeChildren();
    this.uiContainer.removeChildren();
  }

  /**
   * Render the game map
   * @param {Object} map - The map to render
   */
  renderMap(map) {
    // Clear previous map
    this.mapContainer.removeChildren();
    
    // Apply viewport transform
    this.mapContainer.position.set(this.viewport.x, this.viewport.y);
    this.mapContainer.scale.set(this.viewport.scale);
    
    // Create a grid of cells
    const mapGraphics = new PIXI.Graphics();
    
    // Draw each cell
    for (let x = 0; x < map.width; x++) {
      for (let y = 0; y < map.height; y++) {
        const cellValue = map.getCellValue(x, y);
        const cellX = x * this.cellSize;
        const cellY = y * this.cellSize;
        
        // Set cell fill color based on type
        mapGraphics.beginFill(this.getCellColor(cellValue));
        mapGraphics.drawRect(cellX, cellY, this.cellSize, this.cellSize);
        mapGraphics.endFill();
        
        // Draw cell border
        mapGraphics.lineStyle(1, 0x333333, 0.5);
        mapGraphics.drawRect(cellX, cellY, this.cellSize, this.cellSize);
      }
    }
    
    this.mapContainer.addChild(mapGraphics);
    
    // Draw spawn and exit points with emoji
    map.spawnPoints.forEach(spawnPoint => {
      const text = new PIXI.Text('🚪', { fontSize: this.cellSize * 0.8 });
      text.anchor.set(0.5);
      text.position.set(
        spawnPoint.x * this.cellSize + this.cellSize / 2,
        spawnPoint.y * this.cellSize + this.cellSize / 2
      );
      this.mapContainer.addChild(text);
    });
    
    map.exitPoints.forEach(exitPoint => {
      const text = new PIXI.Text('🏁', { fontSize: this.cellSize * 0.8 });
      text.anchor.set(0.5);
      text.position.set(
        exitPoint.x * this.cellSize + this.cellSize / 2,
        exitPoint.y * this.cellSize + this.cellSize / 2
      );
      this.mapContainer.addChild(text);
    });
  }

  /**
   * Get color for a cell type
   * @param {number} cellValue - Map cell value
   * @returns {number} - Color in Pixi format
   */
  getCellColor(cellValue) {
    switch (cellValue) {
      case Map.CELL_PATH:
        return 0xf7b731;
      case Map.CELL_SPAWN:
        return 0x20bf6b;
      case Map.CELL_EXIT:
        return 0xeb3b5a;
      case Map.CELL_TOWER:
        return 0x4b7bec;
      case Map.CELL_EMPTY:
      default:
        return 0x30475e;
    }
  }

  /**
   * Render towers
   * @param {Array} towers - Array of tower objects
   */
  renderTowers(towers) {
    // Clear previous towers
    this.towersContainer.removeChildren();
    
    // Apply viewport transform
    this.towersContainer.position.set(this.viewport.x, this.viewport.y);
    this.towersContainer.scale.set(this.viewport.scale);
    
    // Draw each tower
    towers.forEach(tower => {
      // Get tower type or use basic as default
      const towerType = tower.type || 'basic';
      const emoji = this.towerGraphics[towerType];
      
      // Create tower sprite (using emoji as text)
      const text = new PIXI.Text(emoji, { fontSize: this.cellSize * 0.8 });
      text.anchor.set(0.5);
      text.position.set(
        tower.position.x * this.cellSize + this.cellSize / 2,
        tower.position.y * this.cellSize + this.cellSize / 2
      );
      
      // Show tower range on hover or selection
      if (tower.selected) {
        const rangeCircle = new PIXI.Graphics();
        rangeCircle.lineStyle(2, 0xffffff, 0.5);
        rangeCircle.drawCircle(
          tower.position.x * this.cellSize + this.cellSize / 2,
          tower.position.y * this.cellSize + this.cellSize / 2,
          tower.range * this.cellSize
        );
        this.towersContainer.addChild(rangeCircle);
      }
      
      this.towersContainer.addChild(text);
    });
  }

  /**
   * Render mooks
   * @param {Array} mooks - Array of mook objects
   */
  renderMooks(mooks) {
    // Clear previous mooks
    this.mooksContainer.removeChildren();
    
    // Apply viewport transform
    this.mooksContainer.position.set(this.viewport.x, this.viewport.y);
    this.mooksContainer.scale.set(this.viewport.scale);
    
    // Draw each mook
    mooks.forEach(mook => {
      const mookType = mook.type || 'standard';
      const emoji = this.mookGraphics[mookType];
      
      // Create mook sprite (using emoji as text)
      const text = new PIXI.Text(emoji, { fontSize: this.cellSize * 0.8 });
      text.anchor.set(0.5);
      
      // Position at exact coordinates (not grid-aligned)
      text.position.set(
        mook.position.x * this.cellSize + this.cellSize / 2,
        mook.position.y * this.cellSize + this.cellSize / 2
      );
      
      // Add health bar
      if (mook.health < 100) {
        const healthBar = new PIXI.Graphics();
        const barWidth = this.cellSize * 0.8;
        const healthPercent = mook.health / 100;
        
        // Background (red)
        healthBar.beginFill(0xff0000);
        healthBar.drawRect(
          -barWidth / 2,
          this.cellSize * 0.4,
          barWidth,
          this.cellSize * 0.1
        );
        healthBar.endFill();
        
        // Foreground (green)
        healthBar.beginFill(0x00ff00);
        healthBar.drawRect(
          -barWidth / 2,
          this.cellSize * 0.4,
          barWidth * healthPercent,
          this.cellSize * 0.1
        );
        healthBar.endFill();
        
        text.addChild(healthBar);
      }
      
      this.mooksContainer.addChild(text);
    });
  }

  /**
   * Render tower placement preview
   * @param {Object} position - Grid position {x, y}
   * @param {boolean} isValid - Whether placement is valid
   * @param {string} towerType - Type of tower being placed
   */
  renderTowerPlacementPreview(position, isValid, towerType) {
    // Clear previous previews
    this.uiContainer.removeChildren();
    
    if (!position) return;
    
    // Apply viewport transform
    this.uiContainer.position.set(this.viewport.x, this.viewport.y);
    this.uiContainer.scale.set(this.viewport.scale);
    
    // Draw placement preview
    const preview = new PIXI.Graphics();
    const color = isValid ? 0x00ff00 : 0xff0000;
    const alpha = 0.5;
    
    preview.beginFill(color, alpha);
    preview.drawRect(
      position.x * this.cellSize,
      position.y * this.cellSize,
      this.cellSize,
      this.cellSize
    );
    preview.endFill();
    
    // Add tower graphic if valid
    if (isValid) {
      const emoji = this.towerGraphics[towerType] || this.towerGraphics.basic;
      const text = new PIXI.Text(emoji, { fontSize: this.cellSize * 0.8 });
      text.anchor.set(0.5);
      text.position.set(
        position.x * this.cellSize + this.cellSize / 2,
        position.y * this.cellSize + this.cellSize / 2
      );
      preview.addChild(text);
    }
    
    this.uiContainer.addChild(preview);
  }

  /**
   * Update the viewport (for panning/zooming)
   * @param {Object} viewport - New viewport state
   */
  updateViewport(viewport) {
    this.viewport = { ...this.viewport, ...viewport };
    
    // Update all containers with new viewport
    this.mapContainer.position.set(this.viewport.x, this.viewport.y);
    this.mapContainer.scale.set(this.viewport.scale);
    
    this.mooksContainer.position.set(this.viewport.x, this.viewport.y);
    this.mooksContainer.scale.set(this.viewport.scale);
    
    this.towersContainer.position.set(this.viewport.x, this.viewport.y);
    this.towersContainer.scale.set(this.viewport.scale);
    
    this.uiContainer.position.set(this.viewport.x, this.viewport.y);
    this.uiContainer.scale.set(this.viewport.scale);
  }
}
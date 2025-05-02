/**
 * MapScene class - Main Phaser scene for the tower defense game
 * Handles rendering, user interaction, and game effects
 */
class MapScene extends Phaser.Scene {
    constructor() {
        super('MapScene');
        
        // Camera and interaction state
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.pinchDistance = 0;
        this.currentZoom = 1;
        
        // Cell size in pixels
        this.cellSize = 60;
        
        // Tower placement
        this.selectedTowerType = null;
        this.placementPreview = null;
        
        // Projectiles
        this.projectiles = [];
        this.lastProjectileId = 0;
        
        // Game state
        this.gameState = new GameState();
    }
    
    preload() {
        // Initialize the renderer
        this.renderer = new PhaserRenderer(this, this.cellSize);
        
        // Create textures for map cells and towers
        this.renderer.createTextures();
        
        // Pre-initialize tower info panel elements
        this.towerInfoPanel = document.getElementById('tower-info');
        this.towerInfoType = document.getElementById('tower-info-type');
        this.towerLevelValue = document.getElementById('tower-level-value');
        this.towerDamageValue = document.getElementById('tower-damage-value');
        this.towerRangeValue = document.getElementById('tower-range-value');
        this.towerAmmoValue = document.getElementById('tower-ammo-value');
        this.sellValue = document.getElementById('sell-value');
        
        if (!this.towerInfoPanel) {
            console.error("Tower info panel not found in preload");
        } else {
            console.log("Tower info panel found in preload:", this.towerInfoPanel);
        }
    }
    
    create() {
        try {
            // Create the map
            this.tdMap = new TDMap(20, 15);
            
            // Set up world boundaries
            const worldWidth = this.tdMap.width * this.cellSize;
            const worldHeight = this.tdMap.height * this.cellSize;
            this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
            
            // Render the map
            this.renderMap();
            
            // Set up camera controls
            this.setupCameraControls();
            
            // Set up tower placement
            this.setupTowerPlacement();
            
            // Set up wave controls
            this.setupWaveControls();
            
            // Set up cell clicks for tower placement
            this.setupCellClicks();
            
            // Initialize cleanup timer as undefined
            this.cleanupTimer = undefined;
            
            // Setup force cleanup button
            this.setupCleanupButton();
            
            // Add debug info
            const infoPanel = document.getElementById('info-panel');
            infoPanel.textContent = `Tower Defense Map - Gold: ${this.gameState.gold} - Zoom: ${this.currentZoom.toFixed(2)}x`;
            
        } catch (error) {
            console.error("Error in create method:", error);
            displayError("Create method failed: " + error.message);
        }
    }
    
    renderMap() {
        // Create containers in the correct order for proper layering
        // (later containers appear on top)
        
        // Container for all map cells (bottom layer)
        this.mapContainer = this.add.container(0, 0);
        
        // Container for attack effects (middle layer)
        this.effectsContainer = this.add.container(0, 0);
        
        // Container for all towers (upper middle layer)
        this.towerContainer = this.add.container(0, 0);
        
        // Container for all mooks (top layer)
        this.mookContainer = this.add.container(0, 0);
        
        // Cells
        this.cellSprites = [];
        
        // Render grid
        for (let x = 0; x < this.tdMap.width; x++) {
            this.cellSprites[x] = [];
            for (let y = 0; y < this.tdMap.height; y++) {
                const cellValue = this.tdMap.getCellValue(x, y);
                let cellSprite;
                
                // Choose texture based on cell type
                switch (cellValue) {
                    case TDMap.CELL_PATH:
                        cellSprite = this.add.image(x * this.cellSize + this.cellSize/2, y * this.cellSize + this.cellSize/2, 'path-cell');
                        break;
                    case TDMap.CELL_SPAWN:
                        cellSprite = this.add.image(x * this.cellSize + this.cellSize/2, y * this.cellSize + this.cellSize/2, 'spawn-cell');
                        break;
                    case TDMap.CELL_EXIT:
                        cellSprite = this.add.image(x * this.cellSize + this.cellSize/2, y * this.cellSize + this.cellSize/2, 'exit-cell');
                        break;
                    default:
                        // For empty cells, check if tower can be placed there (using the pattern)
                        if (this.tdMap.canPlaceTower(x, y)) {
                            cellSprite = this.add.image(x * this.cellSize + this.cellSize/2, y * this.cellSize + this.cellSize/2, 'buildable-cell');
                        } else {
                            cellSprite = this.add.image(x * this.cellSize + this.cellSize/2, y * this.cellSize + this.cellSize/2, 'empty-cell');
                        }
                }
                
                cellSprite.setScale(this.cellSize/100); // Scale to cell size
                // Create a smaller hit area for the cell to avoid overlap with tower sprites
                cellSprite.setInteractive(new Phaser.Geom.Rectangle(
                    0, 0, this.cellSize, this.cellSize
                ), Phaser.Geom.Rectangle.Contains);
                
                cellSprite.setData('gridX', x);
                cellSprite.setData('gridY', y);
                cellSprite.setData('isCellSprite', true);
                
                this.cellSprites[x][y] = cellSprite;
                this.mapContainer.add(cellSprite);
                
                // Add grid coordinates for reference (only on some cells to avoid clutter)
                if (x % 5 === 0 && y % 5 === 0) {
                    const coordText = this.add.text(
                        x * this.cellSize + this.cellSize/2, 
                        y * this.cellSize + this.cellSize/2, 
                        `(${x},${y})`, 
                        {
                            fontSize: '10px',
                            color: '#ffffff',
                            stroke: '#000000',
                            strokeThickness: 2
                        }
                    );
                    coordText.setOrigin(0.5);
                    this.mapContainer.add(coordText);
                }
            }
        }
        
        // Render path(s) with arrows
        this.renderPaths();
        
        // Add placement preview
        this.placementPreview = this.add.container(0, 0);
        this.placementPreview.setVisible(false);
        
        // Preview range indicator
        this.rangeIndicator = this.add.image(0, 0, 'range-indicator');
        this.rangeIndicator.setOrigin(0.5, 0.5);
        this.rangeIndicator.setVisible(false);
        
        // Tower sprite for placement preview
        this.towerPreview = this.add.image(0, 0, 'basic-tower');
        this.towerPreview.setScale(this.cellSize/100 * 0.7);
        this.towerPreview.setVisible(false);
    }
    
    renderPaths() {
        // Draw path overlay with directional indicators
        if (this.tdMap.paths.length > 0) {
            const path = this.tdMap.paths[0]; // Just render the first path for now
            
            // Create graphics for path overlay
            const pathGraphics = this.add.graphics();
            pathGraphics.lineStyle(3, 0xffff00, 0.5);
            
            // Draw path line
            pathGraphics.beginPath();
            pathGraphics.moveTo(
                path[0].x * this.cellSize + this.cellSize/2,
                path[0].y * this.cellSize + this.cellSize/2
            );
            
            for (let i = 1; i < path.length; i++) {
                pathGraphics.lineTo(
                    path[i].x * this.cellSize + this.cellSize/2,
                    path[i].y * this.cellSize + this.cellSize/2
                );
            }
            
            pathGraphics.strokePath();
            
            // Add directional arrows at intervals
            for (let i = 1; i < path.length; i += 2) {
                const prev = path[i-1];
                const curr = path[i];
                
                // Calculate direction
                const angle = Phaser.Math.Angle.Between(
                    prev.x * this.cellSize + this.cellSize/2,
                    prev.y * this.cellSize + this.cellSize/2,
                    curr.x * this.cellSize + this.cellSize/2,
                    curr.y * this.cellSize + this.cellSize/2
                );
                
                // Create arrow sprite
                const arrow = this.add.text(
                    curr.x * this.cellSize + this.cellSize/2,
                    curr.y * this.cellSize + this.cellSize/2,
                    '➡️',
                    { fontSize: '20px' }
                );
                arrow.setOrigin(0.5);
                arrow.setRotation(angle);
                
                this.mapContainer.add(arrow);
            }
        }
    }
    
    setupTowerPlacement() {
        // Set up tower selection buttons
        const buttons = document.querySelectorAll('.tower-button');
        
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const towerType = button.getAttribute('data-type');
                const towerCost = parseInt(button.getAttribute('data-cost'));
                
                // If this tower type is already selected, cancel placement (toggle behavior)
                if (this.selectedTowerType === towerType) {
                    this.cancelTowerPlacement();
                    buttons.forEach(b => b.classList.remove('selected'));
                    return;
                }
                
                // Hide tower info if showing
                this.hideTowerInfo();
                
                // Check if user has enough gold
                if (this.gameState.gold < towerCost) {
                    displayError('Not enough gold to place this tower!');
                    // Still cancel any previous selection
                    this.cancelTowerPlacement();
                    buttons.forEach(b => b.classList.remove('selected'));
                    return;
                }
                
                // Select this tower type for placement
                this.selectTowerType(towerType);
                
                // Update UI
                buttons.forEach(b => b.classList.remove('selected'));
                button.classList.add('selected');
            });
        });
        
        // Listen for escape key to cancel placement
        this.input.keyboard.on('keydown-ESC', () => {
            this.cancelTowerPlacement();
            buttons.forEach(b => b.classList.remove('selected'));
        });
        
        // Store button references for easy access
        this.towerButtons = buttons;
    }
    
    setupWaveControls() {
        // Set up wave button
        const waveButton = document.getElementById('wave-button');
        
        waveButton.addEventListener('click', () => {
            if (!this.gameState.waveActive && !this.gameState.gameOver) {
                // Start the wave
                this.gameState.startWave();
                
                // Start spawning mooks
                this.startSpawningMooks();
            }
        });
    }
    
    setupCleanupButton() {
        // Set up cleanup button
        const cleanupButton = document.getElementById('cleanup-button');
        
        cleanupButton.addEventListener('click', () => {
            console.log('Force cleanup button clicked');
            
            // Log current mook state
            console.log(`BEFORE CLEANUP - Total mooks: ${this.gameState.mooks.length}, Active: ${this.gameState.mooks.filter(m => m.active).length}, Inactive: ${this.gameState.mooks.filter(m => !m.active).length}, With sprite: ${this.gameState.mooks.filter(m => m.sprite).length}`);
            console.log(`CONTAINER CHECK - Total sprites in container: ${this.mookContainer.list.length}`);
            
            // Force immediate cleanup of dead mooks
            const beforeCount = this.gameState.mooks.length;
            let destroyedCount = 0;
            
            // FIRST PASS: Check for any orphaned sprites - sprites in container with no mook reference
            const activeMookSprites = new Set();
            this.gameState.mooks.forEach(mook => {
                if (mook.sprite) {
                    activeMookSprites.add(mook.sprite);
                }
            });
            
            console.log(`Active mook sprites count: ${activeMookSprites.size}`);
            
            // Find orphaned sprites (in container but not referenced by any mook)
            const containerList = [...this.mookContainer.list];
            for (const sprite of containerList) {
                if (!activeMookSprites.has(sprite)) {
                    console.log(`Found orphaned sprite in container - removing it`);
                    try {
                        // Make sure the sprite is still valid before removing
                        if (sprite && !sprite.destroyed && sprite.parentContainer) {
                            this.mookContainer.remove(sprite);
                            sprite.destroy(true);
                            destroyedCount++;
                        }
                    } catch (e) {
                        console.error(`Error cleaning up orphaned sprite: ${e.message}`);
                    }
                }
            }
            
            // SECOND PASS: Process inactive mooks normally
            for (let i = this.gameState.mooks.length - 1; i >= 0; i--) {
                const mook = this.gameState.mooks[i];
                
                if (!mook.active) {
                    console.log(`Processing inactive mook: type=${mook.type}, index=${i}, hasSprite=${!!mook.sprite}`);
                    
                    // Only attempt to remove sprite if it exists
                    if (mook.sprite) {
                        try {
                            // Check if sprite is still valid and in container
                            const isValid = mook.sprite && !mook.sprite.destroyed;
                            const inContainer = isValid && this.mookContainer.list.includes(mook.sprite);
                            console.log(`Mook sprite valid? ${isValid}, in container? ${inContainer}`);
                            
                            // Remove from container first (this is critical)
                            if (isValid && inContainer && mook.sprite.parentContainer) {
                                this.mookContainer.remove(mook.sprite);
                            }
                            
                            // Then properly destroy the sprite and its children (if sprite is still valid)
                            if (isValid) {
                                mook.sprite.destroy(true);
                                destroyedCount++;
                            }
                            
                            // Clear references to allow garbage collection - ALWAYS do this
                            mook.sprite = null;
                            mook.healthBar = null;
                            
                            // Mark as fully processed
                            mook.markedForRemoval = true;
                        } catch (e) {
                            console.error(`Error destroying mook sprite: ${e.message}`);
                            // Still try to clear references
                            mook.sprite = null;
                            mook.healthBar = null;
                            mook.markedForRemoval = true;
                        }
                    } else {
                        // If sprite is already null, just mark for removal to be safe
                        mook.markedForRemoval = true;
                    }
                }
            }
            
            // Then remove ALL inactive mooks from the array completely
            const remainingMooks = this.gameState.mooks.filter(mook => mook.active);
            const removedCount = this.gameState.mooks.length - remainingMooks.length;
            this.gameState.mooks = remainingMooks;
            
            // FINAL CHECK: Emergency container cleanup if container still has sprites
            console.log(`FINAL CHECK - Container sprites: ${this.mookContainer.list.length}, Active mooks: ${this.gameState.mooks.length}`);
            
            if (this.mookContainer.list.length > this.gameState.mooks.length) {
                console.log("EMERGENCY CLEANUP - Container still has extra sprites");
                // Recreate the set of valid sprites
                const validSprites = new Set();
                this.gameState.mooks.forEach(mook => {
                    if (mook.sprite) validSprites.add(mook.sprite);
                });
                
                // Remove any sprites not referenced by active mooks
                const remainingList = [...this.mookContainer.list];
                for (const sprite of remainingList) {
                    if (!validSprites.has(sprite)) {
                        console.log("Removing extra sprite from container");
                        try {
                            // Make sure the sprite is still valid before removing
                            if (sprite && !sprite.destroyed && sprite.parentContainer) {
                                this.mookContainer.remove(sprite);
                                sprite.destroy(true);
                                destroyedCount++;
                            }
                        } catch (e) {
                            console.error(`Error removing extra sprite: ${e.message}`);
                            // If error occurs, try just nullifying it in the list
                            const index = this.mookContainer.list.indexOf(sprite);
                            if (index >= 0) {
                                console.log("Nullifying problematic sprite in container list");
                                this.mookContainer.list[index] = null;
                            }
                        }
                    }
                }
            }
            
            // Log detailed results
            console.log(`Force cleanup complete: Removed ${removedCount} mooks, destroyed ${destroyedCount} sprites`);
            console.log(`AFTER CLEANUP - Container size: ${this.mookContainer.list.length}, Active mooks: ${this.gameState.mooks.length}`);
            
            // Display to user
            displayError(`Cleanup complete: Removed ${removedCount} mooks, destroyed ${destroyedCount} sprites`);
        });
    }
    
    startSpawningMooks() {
        // Get all paths
        const paths = this.tdMap.paths;
        if (paths.length === 0) return;
        
        // Track which path to use next (for alternating spawns)
        this.currentPathIndex = 0;
        
        // Function to spawn a mook
        const spawnMook = () => {
            if (!this.gameState.waveActive) return;
            
            // Select path to spawn on (alternate between paths)
            const path = paths[this.currentPathIndex];
            this.currentPathIndex = (this.currentPathIndex + 1) % paths.length;
            
            // Spawn a mook
            const mook = this.gameState.spawnMook(path);
            
            if (mook) {
                // Create mook sprite
                this.createMookSprite(mook);
                
                // Create a random path color for this mook
                mook.pathColor = Phaser.Display.Color.HSVToRGB(
                    Math.random() * 360,
                    0.7,
                    1
                ).color;
                
                // Schedule next spawn if more mooks to spawn
                if (this.gameState.mooksSpawned < this.gameState.waveConfig.mooksPerWave) {
                    this.gameState.waveTimer = setTimeout(spawnMook, this.gameState.waveConfig.spawnDelay);
                }
            }
        };
        
        // Start spawning
        spawnMook();
    }
    
    createMookSprite(mook) {
        // Use the renderer to create mook sprite
        const container = this.renderer.createMookSprite(mook);
        
        // Add to scene
        this.mookContainer.add(container);
    }
    
    updateMookSprites() {
        // Log mooks count start occasionally
        if (Math.random() < 0.05) { // Only log occasionally to avoid spam
            console.log(`MOOK STATE - Total: ${this.gameState.mooks.length}, Active: ${this.gameState.mooks.filter(m => m.active).length}, Inactive: ${this.gameState.mooks.filter(m => !m.active).length}, With sprites: ${this.gameState.mooks.filter(m => m.sprite).length}`);
        }
        
        // Update positions of all mook sprites and clean up dead mooks
        for (const mook of this.gameState.mooks) {
            if (mook.sprite) {
                if (!mook.active) {
                    // If mook is inactive (dead or reached end), destroy its sprite after effects complete
                    if (!mook.markedForRemoval) {
                        mook.markedForRemoval = true;
                        console.log(`Marking mook for removal: ${mook.type}`);
                        
                        // Hide immediately
                        mook.sprite.visible = false;
                        
                        // Delay removal to allow death effects to play
                        this.time.delayedCall(1000, () => {
                            console.log(`Delayed call executing for mook: ${mook.type}, has sprite: ${!!mook.sprite}`);
                            
                            if (mook.sprite) {
                                try {
                                    // Remove from container first
                                    this.mookContainer.remove(mook.sprite);
                                    
                                    // Then destroy the sprite and its children
                                    mook.sprite.destroy(true);
                                    mook.sprite = null;
                                    mook.healthBar = null;
                                    
                                    console.log(`Successfully destroyed mook sprite: ${mook.type}`);
                                } catch (e) {
                                    console.error(`Error destroying mook sprite: ${e.message}`);
                                }
                            } else {
                                console.warn(`Cannot destroy sprite for mook ${mook.type}: sprite is null`);
                            }
                        });
                    } else {
                        // Keep sprite hidden if already marked
                        mook.sprite.visible = false;
                    }
                } else {
                    // Update position for active mooks
                    mook.sprite.setPosition(
                        mook.position.x * this.cellSize + this.cellSize/2,
                        mook.position.y * this.cellSize + this.cellSize/2
                    );
                    
                    // Update health bar - simplified to just shrink a red bar
                    if (mook.healthBar) {
                        const healthPercent = mook.getHealthPercent();
                        mook.healthBar.width = mook.barWidth * healthPercent;
                        // Keep bar anchored at left edge with fixed position
                        mook.healthBar.x = -mook.barWidth/2;
                        
                        // Always use red color
                        mook.healthBar.fillColor = 0xff3300;
                    }
                    
                    // Ensure visible
                    mook.sprite.visible = true;
                }
            }
        }
        
        // Clean up the mooks array periodically to remove those fully processed
        if (this.gameState.waveActive && this.cleanupTimer === undefined) {
            console.log('Setting up periodic cleanup timer');
            
            this.cleanupTimer = this.time.addEvent({
                delay: 2000,
                callback: () => {
                    // Log cleanup status
                    console.log(`PERIODIC CLEANUP - Total before: ${this.gameState.mooks.length}, Active: ${this.gameState.mooks.filter(m => m.active).length}, Inactive: ${this.gameState.mooks.filter(m => !m.active).length}, Container size: ${this.mookContainer.list.length}`);
                    
                    let destroyedCount = 0;
                    
                    // FIRST PASS: Check for orphaned sprites (similar to force cleanup button)
                    const activeMookSprites = new Set();
                    this.gameState.mooks.forEach(mook => {
                        if (mook.sprite) {
                            activeMookSprites.add(mook.sprite);
                        }
                    });
                    
                    // Find any sprites in container not referenced by mooks
                    const containerList = [...this.mookContainer.list];
                    for (const sprite of containerList) {
                        if (!activeMookSprites.has(sprite)) {
                            console.log("Periodic cleanup: Found orphaned sprite in container - removing it");
                            this.mookContainer.remove(sprite);
                            sprite.destroy(true);
                            destroyedCount++;
                        }
                    }
                    
                    // SECOND PASS: Process inactive mooks with sprites
                    for (let i = this.gameState.mooks.length - 1; i >= 0; i--) {
                        const mook = this.gameState.mooks[i];
                        if (!mook.active && mook.sprite) {
                            try {
                                if (!mook.markedForRemoval) {
                                    // Mark first time we see an inactive mook
                                    mook.markedForRemoval = true;
                                    console.log(`Periodic cleanup: marking mook ${mook.type} for removal`);
                                } else {
                                    // On second pass, destroy the sprite
                                    console.log(`Periodic cleanup: destroying sprite for mook ${mook.type}`);
                                    
                                    // Check if sprite is still in container
                                    const inContainer = this.mookContainer.list.includes(mook.sprite);
                                    
                                    // Remove from container first
                                    if (inContainer) {
                                        this.mookContainer.remove(mook.sprite);
                                    }
                                    
                                    // Destroy the sprite and its children
                                    mook.sprite.destroy(true);
                                    mook.sprite = null;
                                    mook.healthBar = null;
                                    destroyedCount++;
                                }
                            } catch (e) {
                                console.error(`Error in periodic cleanup: ${e.message}`);
                                // Still try to clear references on error
                                mook.sprite = null;
                                mook.healthBar = null;
                            }
                        }
                    }
                    
                    // Then filter out inactive mooks that have no sprite left
                    const beforeCount = this.gameState.mooks.length;
                    
                    // Only remove inactive mooks that have no sprites
                    this.gameState.mooks = this.gameState.mooks.filter(mook => 
                        mook.active || mook.sprite !== null
                    );
                    const afterCount = this.gameState.mooks.length;
                    
                    // Log results
                    if (destroyedCount > 0 || beforeCount !== afterCount) {
                        console.log(`Periodic cleanup: Removed ${beforeCount - afterCount} mooks, destroyed ${destroyedCount} sprites`);
                        console.log(`Container size after cleanup: ${this.mookContainer.list.length}`);
                    }
                    
                    // VALIDATION - make sure container and game state are in sync
                    if (this.mookContainer.list.length > this.gameState.mooks.filter(m => m.sprite).length) {
                        console.log("WARNING: Container has more sprites than mooks - possible memory leak");
                    }
                },
                loop: true
            });
        } else if (!this.gameState.waveActive && this.cleanupTimer !== undefined) {
            console.log('Removing periodic cleanup timer (wave not active)');
            this.cleanupTimer.remove();
            this.cleanupTimer = undefined;
        }
    }
    
    createTowerAttackEffects(tower, attackResult) {
        if (!attackResult || attackResult.length === 0) return;
        
        // Use the renderer to create tower attack effects
        const projectileId = this.renderer.createTowerAttackEffects(
            tower, 
            attackResult, 
            this.effectsContainer, 
            this.projectiles
        );
        
        // Note: projectile management is now handled by the renderer
    }
    
    setupCellClicks() {
        // We won't store references to DOM elements as class properties
        // We'll work directly with the DOM when needed
        
        // Currently selected tower for info display
        this.selectedTower = null;
        this.selectedTowerGridX = -1;
        this.selectedTowerGridY = -1;
        
        // Setup sell button with a simple click handler
        const sellButton = document.getElementById('sell-button');
        if (sellButton) {
            // Add the event listener directly to the button
            sellButton.addEventListener('click', (event) => {
                console.log("Sell button clicked");
                
                if (this.selectedTower) {
                    // Call the sell tower function
                    const refundAmount = this.sellTower(this.selectedTowerGridX, this.selectedTowerGridY);
                    if (refundAmount > 0) {
                        displayError(`Tower sold for ${refundAmount} gold!`);
                        document.getElementById('tower-info').style.display = 'none';
                        this.selectedTower = null;
                    }
                }
                
                // Prevent the event from propagating to the game canvas
                event.stopPropagation();
            });
        }
        
        // Click anywhere on game to hide tower info
        this.input.on('pointerdown', (pointer) => {
            // Check if the click was on the tower info panel
            const towerInfoPanel = document.getElementById('tower-info');
            
            // Don't hide panel if clicking within tower info panel bounds
            if (towerInfoPanel && towerInfoPanel.style.display === 'block') {
                const rect = towerInfoPanel.getBoundingClientRect();
                if (pointer.x >= rect.left && pointer.x <= rect.right &&
                    pointer.y >= rect.top && pointer.y <= rect.bottom) {
                    console.log("Click inside tower info panel - not hiding");
                    return;
                }
            }
            
            // Hide tower info if clicking outside a cell (in empty space)
            if (!pointer.gameObject && !this.isDragging) {
                console.log("Click in empty space - hiding tower info");
                document.getElementById('tower-info').style.display = 'none';
                this.selectedTower = null;
                this.cancelTowerPlacement();
            }
        });
        
        // Add click handler for grid cells to place towers or show tower info
        this.input.on('gameobjectdown', (pointer, gameObject) => {
            // Only process if not dragging
            if (!this.isDragging) {
                console.log("Clicked gameObject:", gameObject);
                
                // We need to check if we clicked on a tower container or a grid cell
                let gridX, gridY, tower;
                
                // Determine what we clicked on
                const isTowerContainer = gameObject.getData('isTowerContainer') === true;
                const isCellSprite = gameObject.getData('isCellSprite') === true;
                
                console.log("Clicked on gameObject:", gameObject);
                console.log("isTowerContainer:", isTowerContainer, "isCellSprite:", isCellSprite);
                
                // Get grid position from game object
                gridX = gameObject.getData('gridX');
                gridY = gameObject.getData('gridY');
                
                // Check if it's a tower container
                if (gameObject.getData('isTowerContainer') === true) {
                    tower = gameObject.getData('tower');
                    console.log("Clicked on tower container at", gridX, gridY, tower);
                } else {
                    // Get tower from the game state for grid cells
                    tower = this.gameState.getTower(gridX, gridY);
                    console.log("Clicked on grid cell at", gridX, gridY, "Tower:", tower);
                }
                
                // Show tower info if there's a tower
                if (tower) {
                    displayError("Found tower - showing info panel");
                    
                    // Basic tower info display
                    document.getElementById('tower-type').textContent = tower.type;
                    document.getElementById('tower-damage').textContent = tower.damage;
                    document.getElementById('tower-ammo').textContent = tower.ammo;
                    document.getElementById('sell-value').textContent = Math.floor(tower.cost * 0.5);
                    
                    // Store references for the sell button
                    this.selectedTower = tower;
                    this.selectedTowerGridX = gridX;
                    this.selectedTowerGridY = gridY;
                    
                    // Show the panel
                    document.getElementById('tower-info').style.display = 'block';
                    
                    // Cancel tower placement if active
                    this.cancelTowerPlacement();
                    
                    // If it's a tower container, return to prevent further processing
                    if (gameObject.getData('isTowerContainer') === true) {
                        return;
                    }
                } else {
                    // No tower - hide info
                    document.getElementById('tower-info').style.display = 'none';
                    this.selectedTower = null;
                }
                
                // Debug info in error display 
                displayError(`Clicked at grid (${gridX}, ${gridY}) - Tower present: ${!!tower}`);
                
                // If we have a tower type selected for building
                if (this.selectedTowerType) {
                    // If the cell has a tower already
                    if (tower) {
                        // Show tower info instead of trying to build
                        this.showTowerInfo(tower, gridX, gridY);
                        this.cancelTowerPlacement(); // Exit build mode
                    } else {
                        // Attempt to place a tower
                        const success = this.placeTower(gridX, gridY);
                        if (success) {
                            // Clear tower selection after successful placement
                            this.cancelTowerPlacement();
                        }
                    }
                }
                // No tower type selected - handle tower info display or right-click
                else {
                    if (tower) {
                        // If right-click, remove tower
                        if (pointer.rightButtonDown()) {
                            this.removeTower(gridX, gridY);
                            this.hideTowerInfo(); // Hide info if showing
                        } else {
                            // Normal click - show tower info
                            displayError("Showing tower info panel");
                            this.showTowerInfo(tower, gridX, gridY);
                        }
                    } else {
                        // Clicked on empty cell without building mode
                        this.hideTowerInfo(); // Hide tower info if showing
                    }
                }
            }
        });
        
        // Add hover handler for placement preview
        this.input.on('gameobjectmove', (pointer, gameObject) => {
            if (this.selectedTowerType) {
                const gridX = gameObject.getData('gridX');
                const gridY = gameObject.getData('gridY');
                
                // Show placement preview
                this.showPlacementPreview(gridX, gridY);
            }
        });
        
        // Add hover exit handler
        this.input.on('gameobjectout', (pointer, gameObject) => {
            if (this.selectedTowerType) {
                // Hide placement preview when not hovering over a cell
                this.towerPreview.setVisible(false);
                this.rangeIndicator.setVisible(false);
            }
        });
    }
    
    /**
     * Show information about a tower
     * @param {Object} tower - The tower to show info for
     * @param {number} gridX - X position of the tower on grid
     * @param {number} gridY - Y position of the tower on grid
     */
    showTowerInfo(tower, gridX, gridY) {
        console.log("showTowerInfo called with tower:", tower, "at", gridX, gridY);
        
        // Check if we have valid tower data
        if (!tower) {
            console.error("No tower provided to showTowerInfo");
            displayError("Error: No tower data to show");
            return;
        }
        
        // Force hide any existing tower info panel - completely new approach
        this.hideTowerInfo();
        
        // Store tower reference for selling
        this.selectedTower = tower;
        this.selectedTowerGridX = gridX;
        this.selectedTowerGridY = gridY;
        
        try {
            // Get access to the DOM elements - work directly with them
            const panel = document.getElementById('tower-info-panel');
            const emoji = document.getElementById('tower-info-emoji');
            const damage = document.getElementById('tower-info-damage');
            const range = document.getElementById('tower-info-range');
            const level = document.getElementById('tower-info-level');
            const ammo = document.getElementById('tower-info-ammo');
            const sellValue = document.getElementById('tower-sell-value');
            const sellButton = document.getElementById('tower-sell-button');
            
            if (!panel) {
                console.error("Tower info panel not found - ID: tower-info-panel");
                displayError("ERROR: Tower info panel not found in DOM!");
                return;
            }
            
            // Update content directly
            if (emoji) emoji.textContent = this.getTowerTypeEmoji(tower.type);
            if (damage) damage.textContent = tower.damage.toFixed(1);
            if (range) range.textContent = tower.range.toFixed(1);
            if (level) level.textContent = tower.level;
            if (ammo) ammo.textContent = tower.ammo;
            
            // Calculate refund value (50% of tower cost)
            const refundValue = Math.floor(tower.cost * 0.5);
            if (sellValue) sellValue.textContent = refundValue;
            
            // Set up the sell button click handler
            if (sellButton) {
                // Remove existing listeners
                const newButton = sellButton.cloneNode(true);
                if (sellButton.parentNode) {
                    sellButton.parentNode.replaceChild(newButton, sellButton);
                }
                
                // Add new click handler
                newButton.addEventListener('click', (event) => {
                    console.log("Sell button clicked for tower at", gridX, gridY);
                    displayError(`Selling tower at (${gridX},${gridY})...`);
                    
                    // Sell the tower
                    const refundAmount = this.sellTower(gridX, gridY);
                    if (refundAmount > 0) {
                        displayError(`Tower sold for ${refundAmount} gold!`);
                        
                        // Hide panel
                        if (panel) panel.style.display = 'none';
                    } else {
                        displayError("Failed to sell tower!");
                    }
                    
                    // Prevent event propagation
                    event.stopPropagation();
                });
            }
            
            // Display the panel with important visual indicators
            panel.style.display = 'block';
            
            // Show range indicator for the tower
            if (this.rangeIndicator) {
                this.rangeIndicator.setPosition(
                    gridX * this.cellSize + this.cellSize/2,
                    gridY * this.cellSize + this.cellSize/2
                );
                this.rangeIndicator.setScale(tower.range * 2 * (this.cellSize/100));
                this.rangeIndicator.setVisible(true);
                this.rangeIndicator.setAlpha(0.3);
            }
            
            // Log debug info
            console.log("Tower info panel shown:", panel);
            displayError(`Tower info panel should be visible now - ${tower.type} tower at (${gridX},${gridY})`);
            
        } catch (error) {
            console.error("Error showing tower info:", error);
            displayError("Error showing tower info: " + error.message);
        }
    }
    
    /**
     * Hide tower info panel
     */
    hideTowerInfo() {
        // Get panel directly to ensure we have it
        const panel = document.getElementById('tower-info-panel');
        if (panel) {
            // Hide tower info panel
            panel.style.display = 'none';
            console.log("Hiding tower info panel");
        }
        
        // Clear selected tower reference
        this.selectedTower = null;
        this.selectedTowerGridX = -1;
        this.selectedTowerGridY = -1;
        
        // Hide range indicator
        if (this.rangeIndicator) {
            this.rangeIndicator.setVisible(false);
        }
    }
    
    /**
     * Get emoji representation for tower type
     * @param {string} type - Tower type
     * @returns {string} - Emoji representing the tower type
     */
    getTowerTypeEmoji(type) {
        switch (type) {
            case 'basic':
                return '🗼';
            case 'sniper':
                return '🏯';
            case 'splash':
                return '🏰';
            default:
                return '🗼';
        }
    }
    
    /**
     * Sell a tower and get a refund
     * @param {number} gridX - X position of the tower on grid
     * @param {number} gridY - Y position of the tower on grid
     * @returns {number} - Amount of gold refunded
     */
    sellTower(gridX, gridY) {
        console.log(`Selling tower at (${gridX}, ${gridY})`);
        
        // Get refund amount from game state
        const refundAmount = this.gameState.sellTower(gridX, gridY);
        console.log(`Refund amount: ${refundAmount}`);
        
        if (refundAmount > 0) {
            // Update map
            this.tdMap.removeTower(gridX, gridY);
            
            // Remove tower container (containing tower sprite and ammo bar)
            this.towerContainer.getAll().forEach(container => {
                if (container.getData('gridX') === gridX && container.getData('gridY') === gridY) {
                    container.destroy();
                }
            });
            
            // Hide the tower info panel
            document.getElementById('tower-info').style.display = 'none';
            
            // Clear selection
            this.selectedTower = null;
            
            return refundAmount;
        }
        
        return 0;
    }
    
    selectTowerType(type) {
        this.selectedTowerType = type;
        
        // Update tower preview texture
        switch(type) {
            case 'basic':
                this.towerPreview.setTexture('basic-tower');
                break;
            case 'sniper':
                this.towerPreview.setTexture('sniper-tower');
                break;
            case 'splash':
                this.towerPreview.setTexture('splash-tower');
                break;
        }
    }
    
    showPlacementPreview(gridX, gridY) {
        // Check if placement is valid
        const canPlace = this.tdMap.canPlaceTower(gridX, gridY);
        
        // Use the renderer to show placement preview
        const previewObjects = {
            towerPreview: this.towerPreview,
            rangeIndicator: this.rangeIndicator
        };
        
        this.renderer.showPlacementPreview(
            gridX, 
            gridY, 
            this.selectedTowerType, 
            canPlace, 
            previewObjects,
            this.cellSize
        );
    }
    
    placeTower(gridX, gridY) {
        // Check if tower can be placed
        if (!this.tdMap.canPlaceTower(gridX, gridY)) {
            displayError('Cannot place tower here!');
            return false;
        }
        
        // Get tower cost based on type
        let cost = 50;
        if (this.selectedTowerType === 'sniper') {
            cost = 100;
        } else if (this.selectedTowerType === 'splash') {
            cost = 150;
        }
        
        // Check if player has enough gold
        if (this.gameState.gold < cost) {
            displayError('Not enough gold to place this tower!');
            return false;
        }
        
        // Hide tower info if showing
        this.hideTowerInfo();
        
        // Create new tower
        const tower = new Tower(this.selectedTowerType, gridX, gridY);
        
        // Spend gold
        this.gameState.spendGold(tower.cost);
        
        // Update map
        this.tdMap.placeTower(gridX, gridY);
        
        // Add tower to game state
        this.gameState.addTower(tower);
        
        // Create tower sprite
        const worldX = gridX * this.cellSize + this.cellSize/2;
        const worldY = gridY * this.cellSize + this.cellSize/2;
        
        // Create a container for the tower and its ammo bar
        const towerContainer = this.add.container(worldX, worldY);
        
        // Make the container interactive
        towerContainer.setInteractive(new Phaser.Geom.Rectangle(
            -this.cellSize/2, -this.cellSize/2, 
            this.cellSize, this.cellSize
        ), Phaser.Geom.Rectangle.Contains);
        
        // Add tower sprite to container
        let towerSprite;
        switch(tower.type) {
            case 'basic':
                towerSprite = this.add.image(0, 0, 'basic-tower');
                break;
            case 'sniper':
                towerSprite = this.add.image(0, 0, 'sniper-tower');
                break;
            case 'splash':
                towerSprite = this.add.image(0, 0, 'splash-tower');
                break;
            default:
                towerSprite = this.add.image(0, 0, 'basic-tower');
        }
        
        // Scale tower to fit cell
        towerSprite.setScale(this.cellSize/100 * 0.7);
        
        // Add tower sprite to container
        towerContainer.add(towerSprite);
        
        // Create ammo bar background (gray)
        const barWidth = this.cellSize * 0.6;
        const barHeight = this.cellSize * 0.1;
        const ammoBarBackground = this.add.rectangle(
            0, 
            this.cellSize * 0.3, // Position below tower
            barWidth,
            barHeight,
            0x666666 // Gray color
        );
        ammoBarBackground.setOrigin(0.5, 0.5);
        towerContainer.add(ammoBarBackground);
        
        // Create ammo bar foreground (light gray)
        const ammoBar = this.add.rectangle(
            -barWidth/2, // Anchored at left edge
            this.cellSize * 0.3, // Same position as background
            barWidth, // Full width initially
            barHeight,
            0xaaaaaa // Light gray color
        );
        ammoBar.setOrigin(0, 0.5); // Anchor at left edge
        towerContainer.add(ammoBar);
        
        // Store reference to ammo bar for updating
        tower.ammoBar = ammoBar;
        tower.barWidth = barWidth;
        
        // Store reference to gridX and gridY and tower
        towerContainer.setData('gridX', gridX);
        towerContainer.setData('gridY', gridY);
        towerContainer.setData('tower', tower);
        towerContainer.setData('isTowerContainer', true);
        
        // Store reference in the tower object too for easier access
        tower.sprite = towerContainer;
        
        // Add to container
        this.towerContainer.add(towerContainer);
        
        // Log that a tower was placed
        console.log(`Tower placed at (${gridX}, ${gridY})`, tower, towerContainer);
        
        // Hide placement preview
        this.towerPreview.setVisible(false);
        this.rangeIndicator.setVisible(false);
        
        return true;
    }
    
    removeTower(gridX, gridY) {
        // Find tower at this grid position
        const tower = this.gameState.getTower(gridX, gridY);
        
        if (!tower) {
            return false;
        }
        
        // Hide tower info if it's the currently selected tower
        if (this.selectedTowerGridX === gridX && this.selectedTowerGridY === gridY) {
            this.hideTowerInfo();
        }
        
        // Remove from game state
        if (this.gameState.removeTower(gridX, gridY)) {
            // Update map
            this.tdMap.removeTower(gridX, gridY);
            
            // Remove tower container (containing tower sprite and ammo bar)
            this.towerContainer.getAll().forEach(container => {
                if (container.getData('gridX') === gridX && container.getData('gridY') === gridY) {
                    container.destroy();
                }
            });
            
            return true;
        }
        
        return false;
    }
    
    cancelTowerPlacement() {
        // Clear tower type selection
        this.selectedTowerType = null;
        
        // Hide placement preview
        this.towerPreview.setVisible(false);
        this.rangeIndicator.setVisible(false);
        
        // Deselect all tower buttons
        if (this.towerButtons) {
            this.towerButtons.forEach(button => button.classList.remove('selected'));
        }
    }
    
    setupCameraControls() {
        // Enable camera controls
        const cam = this.cameras.main;
        
        // Set initial position to center of the map
        const worldWidth = this.tdMap.width * this.cellSize;
        const worldHeight = this.tdMap.height * this.cellSize;
        cam.centerOn(worldWidth/2, worldHeight/2);
        
        // Drag to pan
        this.input.on('pointerdown', (pointer) => {
            // If middle button or right button (or holding space), start panning
            if (pointer.middleButtonDown() || 
                (pointer.rightButtonDown() && !this.input.keyboard.checkDown(this.input.keyboard.addKey('SHIFT'))) || 
                this.input.keyboard.checkDown(this.input.keyboard.addKey('SPACE'))) {
                
                this.isDragging = true;
                this.dragStartX = pointer.x;
                this.dragStartY = pointer.y;
            }
        });
        
        this.input.on('pointermove', (pointer) => {
            if (this.isDragging) {
                const dx = (pointer.x - this.dragStartX) / cam.zoom;
                const dy = (pointer.y - this.dragStartY) / cam.zoom;
                
                cam.scrollX -= dx;
                cam.scrollY -= dy;
                
                this.dragStartX = pointer.x;
                this.dragStartY = pointer.y;
            }
        });
        
        this.input.on('pointerup', () => {
            this.isDragging = false;
        });
        
        // Zoom with mouse wheel
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            const zoomFactor = 0.1;
            const newZoom = deltaY > 0 ? 
                Math.max(0.5, cam.zoom - zoomFactor) : 
                Math.min(2, cam.zoom + zoomFactor);
            
            this.zoomCamera(newZoom, pointer.worldX, pointer.worldY);
        });
        
        // Touch controls for mobile
        this.input.addPointer(1); // Ensure we track 2 pointers for pinch
        
        this.input.on('pointermove', (pointer) => {
            if (this.input.pointer1.isDown && this.input.pointer2.isDown) {
                // This is a pinch
                const currentDistance = Phaser.Math.Distance.Between(
                    this.input.pointer1.x, this.input.pointer1.y,
                    this.input.pointer2.x, this.input.pointer2.y
                );
                
                if (this.pinchDistance > 0) {
                    const distanceDiff = currentDistance - this.pinchDistance;
                    const zoomFactor = 0.01;
                    
                    // Calculate center of pinch for zoom focus
                    const pinchCenterX = (this.input.pointer1.worldX + this.input.pointer2.worldX) / 2;
                    const pinchCenterY = (this.input.pointer1.worldY + this.input.pointer2.worldY) / 2;
                    
                    const newZoom = distanceDiff > 0 ? 
                        Math.min(2, cam.zoom + (zoomFactor * distanceDiff)) : 
                        Math.max(0.5, cam.zoom + (zoomFactor * distanceDiff));
                    
                    this.zoomCamera(newZoom, pinchCenterX, pinchCenterY);
                }
                
                this.pinchDistance = currentDistance;
                this.isDragging = false; // Disable drag during pinch
            }
        });
        
        this.input.on('pointerup', () => {
            if (!this.input.pointer1.isDown || !this.input.pointer2.isDown) {
                this.pinchDistance = 0;
            }
        });
        
        // Add key controls for zoom
        this.zoomInKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS);
        this.zoomOutKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS);
        
        // Add key controls for panning
        this.cursors = this.input.keyboard.createCursorKeys();
    }
    
    zoomCamera(newZoom, focusX, focusY) {
        // Store the pre-zoom camera position and focus point
        const cam = this.cameras.main;
        const oldZoom = cam.zoom;
        
        // Set the new zoom level
        cam.zoom = newZoom;
        this.currentZoom = newZoom;
        
        // Update camera position to maintain focus point
        if (focusX !== undefined && focusY !== undefined) {
            const zoomFactor = newZoom / oldZoom;
            
            // Calculate how much the camera should move to maintain focus
            const offsetX = (focusX - cam.worldView.centerX) * (1 - 1 / zoomFactor);
            const offsetY = (focusY - cam.worldView.centerY) * (1 - 1 / zoomFactor);
            
            cam.scrollX += offsetX;
            cam.scrollY += offsetY;
        }
        
        // Update text display to show current zoom level
        const infoPanel = document.getElementById('info-panel');
        infoPanel.textContent = `Tower Defense Map - Gold: ${this.gameState.gold} - Zoom: ${newZoom.toFixed(2)}x`;
    }
    
    update(time, delta) {
        // Keyboard controls for camera
        if (this.cursors) {
            const speed = 10 / this.cameras.main.zoom;
            
            if (this.cursors.left.isDown) {
                this.cameras.main.scrollX -= speed;
            } else if (this.cursors.right.isDown) {
                this.cameras.main.scrollX += speed;
            }
            
            if (this.cursors.up.isDown) {
                this.cameras.main.scrollY -= speed;
            } else if (this.cursors.down.isDown) {
                this.cameras.main.scrollY += speed;
            }
        }
        
        // Keyboard zoom controls
        if (this.zoomInKey && this.zoomInKey.isDown) {
            const newZoom = Math.min(2, this.cameras.main.zoom + 0.01);
            this.zoomCamera(newZoom);
        } else if (this.zoomOutKey && this.zoomOutKey.isDown) {
            const newZoom = Math.max(0.5, this.cameras.main.zoom - 0.01);
            this.zoomCamera(newZoom);
        }
        
        // Update game state (this already handles tower attacks in GameState.updateTowers)
        this.gameState.update(time, delta);
        
        // Update mook sprites
        this.updateMookSprites();
        
        // Handle tower attacks and their visual effects
        if (this.gameState.towers && this.gameState.towers.length > 0) {
            for (const tower of this.gameState.towers) {
                // Update ammo bar visualization
                if (tower.ammoBar) {
                    tower.ammoBar.width = tower.barWidth * tower.getAmmoPercent();
                }
                
                // Check if tower can fire (now also checks for ammo)
                if (tower.canFire(time)) {
                    // Find a target
                    const target = tower.findTarget(this.gameState.mooks, this.cellSize);
                    if (target) {
                        // Apply damage from tower to target (fire method now handles ammo usage)
                        const damage = tower.fire(time);
                        
                        // Only continue if damage was actually dealt (tower had ammo)
                        if (damage > 0) {
                            // Handle splash damage
                            if (tower.splashRadius > 0) {
                                // Find all mooks in splash radius
                                const splashedMooks = this.gameState.mooks.filter(mook => {
                                    if (!mook.active || mook.reachedEnd) return false;
                                    if (mook === target) return true; // Direct target always gets hit
                                    
                                    const dx = Math.abs(mook.position.x - target.position.x);
                                    const dy = Math.abs(mook.position.y - target.position.y);
                                    return dx <= tower.splashRadius && dy <= tower.splashRadius;
                                });
                                
                                // Apply damage to all mooks in splash radius
                                const attackResults = [];
                                for (const mook of splashedMooks) {
                                    const distanceRatio = mook === target ? 1 : 0.5; // Reduced damage for splash
                                    const isDead = mook.takeDamage(damage * distanceRatio);
                                    if (isDead) {
                                        this.gameState.mookKilled(mook);
                                        attackResults.push({
                                            mook,
                                            isDead: true
                                        });
                                    } else {
                                        attackResults.push({
                                            mook,
                                            isDead: false
                                        });
                                    }
                                }
                                
                                // Create visual effects
                                this.createTowerAttackEffects(tower, attackResults);
                            } else {
                                // Direct damage to a single target
                                const isDead = target.takeDamage(damage);
                                if (isDead) {
                                    this.gameState.mookKilled(target);
                                }
                                
                                // Create visual effects
                                this.createTowerAttackEffects(tower, [{
                                    mook: target,
                                    isDead
                                }]);
                            }
                        }
                    }
                }
            }
        }
        
        // Update info panel with gold and game state
        const infoPanel = document.getElementById('info-panel');
        if (!this.gameState.gameOver) {
            infoPanel.textContent = `Tower Defense Map - Gold: ${this.gameState.gold} - Wave: ${this.gameState.wave} - Zoom: ${this.currentZoom.toFixed(2)}x`;
        }
    }
}

// Export MapScene for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MapScene
    };
} else {
    // For browser use
    window.MapScene = MapScene;
}
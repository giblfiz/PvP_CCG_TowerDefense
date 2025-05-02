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
        // Create textures for map cells and towers
        this.createTextures();
    }
    
    createTextures() {
        // Create map cell textures
        this.createCellTextures();
        
        // Create tower textures
        this.createTowerTextures();
        
        // Create range indicator texture
        this.createRangeTexture();
        
        // Create projectile textures
        this.createProjectileTextures();
    }
    
    createProjectileTextures() {
        // Basic projectile (blue bullet)
        this.createBasicProjectileTexture('basic-projectile');
        
        // Sniper projectile (orange bullet)
        this.createSniperProjectileTexture('sniper-projectile');
        
        // Splash projectile (red bomb)
        this.createSplashProjectileTexture('splash-projectile');
    }
    
    createBasicProjectileTexture(key) {
        const graphics = this.make.graphics();
        
        // Blue bullet
        graphics.fillStyle(0x3399ff);
        graphics.fillCircle(8, 8, 5);
        
        // Highlight
        graphics.fillStyle(0xaaddff);
        graphics.fillCircle(6, 6, 2);
        
        // Generate texture
        graphics.generateTexture(key, 16, 16);
        graphics.clear();
    }
    
    createSniperProjectileTexture(key) {
        const graphics = this.make.graphics();
        
        // Orange bullet
        graphics.fillStyle(0xff9900);
        graphics.fillCircle(8, 8, 6);
        
        // Highlight
        graphics.fillStyle(0xffcc66);
        graphics.fillCircle(6, 6, 2);
        
        // Outline
        graphics.lineStyle(1, 0xffcc00);
        graphics.strokeCircle(8, 8, 6);
        
        // Generate texture
        graphics.generateTexture(key, 16, 16);
        graphics.clear();
    }
    
    createSplashProjectileTexture(key) {
        const graphics = this.make.graphics();
        
        // Red bomb shape
        graphics.fillStyle(0xff3366);
        graphics.fillCircle(10, 10, 8);
        
        // Top highlights
        graphics.fillStyle(0xff99aa);
        graphics.fillCircle(7, 7, 2);
        
        // Fuse
        graphics.lineStyle(2, 0x666666);
        graphics.moveTo(10, 3);
        graphics.lineTo(14, 0);
        
        // Generate texture
        graphics.generateTexture(key, 20, 20);
        graphics.clear();
    }
    
    createCellTextures() {
        // Empty cell texture
        this.createEmptyCellTexture('empty-cell');
        
        // Path cell texture
        this.createPathCellTexture('path-cell');
        
        // Spawn cell texture
        this.createSpawnCellTexture('spawn-cell');
        
        // Exit cell texture
        this.createExitCellTexture('exit-cell');
        
        // Tower cell texture (base)
        this.createTowerCellTexture('tower-cell');
    }
    
    createTowerTextures() {
        // Basic tower texture
        this.createBasicTowerTexture('basic-tower');
        
        // Sniper tower texture
        this.createSniperTowerTexture('sniper-tower');
        
        // Splash tower texture
        this.createSplashTowerTexture('splash-tower');
    }
    
    createEmptyCellTexture(key) {
        const graphics = this.make.graphics();
        graphics.fillStyle(0x333333);
        graphics.fillRect(0, 0, 100, 100);
        graphics.lineStyle(2, 0x555555);
        graphics.strokeRect(1, 1, 98, 98);
        graphics.generateTexture(key, 100, 100);
        graphics.clear();
    }
    
    createPathCellTexture(key) {
        const graphics = this.make.graphics();
        graphics.fillStyle(0x885500);
        graphics.fillRect(0, 0, 100, 100);
        graphics.lineStyle(2, 0xaa7722);
        graphics.strokeRect(1, 1, 98, 98);
        
        // Add path markings
        graphics.lineStyle(3, 0xffcc88);
        graphics.beginPath();
        graphics.moveTo(20, 50);
        graphics.lineTo(80, 50);
        graphics.strokePath();
        
        // Arrow
        graphics.lineTo(70, 40);
        graphics.moveTo(80, 50);
        graphics.lineTo(70, 60);
        graphics.strokePath();
        
        graphics.generateTexture(key, 100, 100);
        graphics.clear();
    }
    
    createSpawnCellTexture(key) {
        const graphics = this.make.graphics();
        graphics.fillStyle(0x00aa00);
        graphics.fillRect(0, 0, 100, 100);
        graphics.lineStyle(2, 0x00cc00);
        graphics.strokeRect(1, 1, 98, 98);
        
        // Add spawn symbol
        graphics.fillStyle(0xffffff);
        graphics.fillCircle(50, 50, 30);
        graphics.fillStyle(0x00aa00);
        graphics.fillCircle(50, 50, 25);
        graphics.fillStyle(0xffffff);
        
        // Add arrow
        graphics.lineStyle(6, 0xffffff);
        graphics.beginPath();
        graphics.moveTo(35, 50);
        graphics.lineTo(75, 50);
        graphics.strokePath();
        graphics.beginPath();
        graphics.moveTo(65, 40);
        graphics.lineTo(75, 50);
        graphics.lineTo(65, 60);
        graphics.strokePath();
        
        graphics.generateTexture(key, 100, 100);
        graphics.clear();
    }
    
    createExitCellTexture(key) {
        const graphics = this.make.graphics();
        graphics.fillStyle(0xaa0000);
        graphics.fillRect(0, 0, 100, 100);
        graphics.lineStyle(2, 0xcc0000);
        graphics.strokeRect(1, 1, 98, 98);
        
        // Add exit symbol
        graphics.fillStyle(0xffffff);
        graphics.fillCircle(50, 50, 30);
        graphics.fillStyle(0xaa0000);
        graphics.fillCircle(50, 50, 25);
        
        // Add X
        graphics.lineStyle(6, 0xffffff);
        graphics.beginPath();
        graphics.moveTo(35, 35);
        graphics.lineTo(65, 65);
        graphics.moveTo(65, 35);
        graphics.lineTo(35, 65);
        graphics.strokePath();
        
        graphics.generateTexture(key, 100, 100);
        graphics.clear();
    }
    
    createTowerCellTexture(key) {
        const graphics = this.make.graphics();
        graphics.fillStyle(0x555555);
        graphics.fillRect(0, 0, 100, 100);
        graphics.lineStyle(2, 0x777777);
        graphics.strokeRect(1, 1, 98, 98);
        
        // Add base platform
        graphics.fillStyle(0x666666);
        graphics.fillRect(10, 10, 80, 80);
        graphics.lineStyle(2, 0x888888);
        graphics.strokeRect(10, 10, 80, 80);
        
        graphics.generateTexture(key, 100, 100);
        graphics.clear();
    }
    
    createBasicTowerTexture(key) {
        const graphics = this.make.graphics();
        
        // Base
        graphics.fillStyle(0x666666);
        graphics.fillRect(0, 0, 100, 100);
        
        // Tower
        graphics.fillStyle(0x3399ff);
        graphics.fillRect(30, 20, 40, 60);
        
        // Top
        graphics.fillStyle(0x55aaff);
        graphics.fillRect(20, 10, 60, 20);
        
        // Border
        graphics.lineStyle(3, 0x333333);
        graphics.strokeRect(30, 20, 40, 60);
        graphics.strokeRect(20, 10, 60, 20);
        
        graphics.generateTexture(key, 100, 100);
        graphics.clear();
    }
    
    createSniperTowerTexture(key) {
        const graphics = this.make.graphics();
        
        // Base
        graphics.fillStyle(0x666666);
        graphics.fillRect(0, 0, 100, 100);
        
        // Tower
        graphics.fillStyle(0xff9900);
        graphics.fillRect(35, 15, 30, 70);
        
        // Top
        graphics.fillStyle(0xffaa00);
        graphics.fillRect(25, 5, 50, 20);
        
        // Border
        graphics.lineStyle(3, 0x333333);
        graphics.strokeRect(35, 15, 30, 70);
        graphics.strokeRect(25, 5, 50, 20);
        
        // Sniper scope
        graphics.fillStyle(0x333333);
        graphics.fillCircle(50, 35, 10);
        graphics.fillStyle(0xbbbbbb);
        graphics.fillCircle(50, 35, 6);
        graphics.fillStyle(0x000000);
        graphics.fillCircle(50, 35, 3);
        
        graphics.generateTexture(key, 100, 100);
        graphics.clear();
    }
    
    createSplashTowerTexture(key) {
        const graphics = this.make.graphics();
        
        // Base
        graphics.fillStyle(0x666666);
        graphics.fillRect(0, 0, 100, 100);
        
        // Tower body
        graphics.fillStyle(0xff3366);
        graphics.fillRect(30, 30, 40, 40);
        
        // Tower sides
        graphics.fillStyle(0xcc3355);
        graphics.fillRect(20, 40, 10, 20);
        graphics.fillRect(70, 40, 10, 20);
        
        // Top
        graphics.fillStyle(0xff5577);
        graphics.fillRect(25, 20, 50, 20);
        
        // Border
        graphics.lineStyle(3, 0x333333);
        graphics.strokeRect(30, 30, 40, 40);
        graphics.strokeRect(20, 40, 10, 20);
        graphics.strokeRect(70, 40, 10, 20);
        graphics.strokeRect(25, 20, 50, 20);
        
        graphics.generateTexture(key, 100, 100);
        graphics.clear();
    }
    
    createRangeTexture() {
        const graphics = this.make.graphics();
        
        // Semi-transparent circle - make it centered properly
        graphics.fillStyle(0xffffff, 0.2);
        graphics.fillCircle(100, 100, 100);
        
        // Border
        graphics.lineStyle(2, 0xffffff, 0.5);
        graphics.strokeCircle(100, 100, 100);
        
        graphics.generateTexture('range-indicator', 200, 200);
        graphics.clear();
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
                        cellSprite = this.add.image(x * this.cellSize + this.cellSize/2, y * this.cellSize + this.cellSize/2, 'empty-cell');
                }
                
                cellSprite.setScale(this.cellSize/100); // Scale to cell size
                cellSprite.setInteractive();
                cellSprite.setData('gridX', x);
                cellSprite.setData('gridY', y);
                
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
                
                // Check if user has enough gold
                if (this.gameState.gold < towerCost) {
                    displayError('Not enough gold to place this tower!');
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
        // Create sprite container
        const container = this.add.container(
            mook.position.x * this.cellSize + this.cellSize/2,
            mook.position.y * this.cellSize + this.cellSize/2
        );
        
        // Create emoji sprite based on mook type
        let emoji;
        switch(mook.type) {
            case Mook.MOOK_FAST:
                emoji = '🚀';
                break;
            case Mook.MOOK_ARMORED:
                emoji = '🛡️';
                break;
            case Mook.MOOK_TANK:
                emoji = '🦖';
                break;
            default:
                emoji = '👾';
        }
        
        // Add emoji text
        const text = this.add.text(0, 0, emoji, {
            fontSize: '32px'
        });
        text.setOrigin(0.5);
        container.add(text);
        
        // Create health bar background
        const barWidth = this.cellSize * 0.8;
        const barHeight = this.cellSize * 0.1;
        const barBg = this.add.rectangle(
            0,
            this.cellSize * 0.4,
            barWidth,
            barHeight,
            0xff0000
        );
        container.add(barBg);
        
        // Create health bar foreground
        const healthBar = this.add.rectangle(
            -barWidth/2 + (barWidth * mook.getHealthPercent())/2,
            this.cellSize * 0.4,
            barWidth * mook.getHealthPercent(),
            barHeight,
            0x00ff00
        );
        healthBar.setOrigin(0, 0.5);
        container.add(healthBar);
        
        // Store reference to container in mook
        mook.sprite = container;
        mook.healthBar = healthBar;
        mook.barWidth = barWidth;
        
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
                    
                    // Update health bar
                    if (mook.healthBar) {
                        const healthPercent = mook.getHealthPercent();
                        mook.healthBar.width = mook.barWidth * healthPercent;
                        mook.healthBar.x = -mook.barWidth/2 + (mook.barWidth * healthPercent)/2;
                        
                        // Change color based on health
                        if (healthPercent < 0.3) {
                            mook.healthBar.fillColor = 0xff3300;
                        } else if (healthPercent < 0.6) {
                            mook.healthBar.fillColor = 0xffff00;
                        } else {
                            mook.healthBar.fillColor = 0x00ff00;
                        }
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
        
        // Get tower position
        const towerX = tower.gridX * this.cellSize + this.cellSize/2;
        const towerY = tower.gridY * this.cellSize + this.cellSize/2;
        
        // Get target
        const target = attackResult[0].mook;
        const targetX = target.position.x * this.cellSize + this.cellSize/2;
        const targetY = target.position.y * this.cellSize + this.cellSize/2;
        
        // Create projectile based on tower type
        let projectileTexture;
        let projectileScale = 1;
        let projectileSpeed = 600; // pixels per second
        let trailEffect = false;
        
        switch(tower.type) {
            case Tower.TOWER_SNIPER:
                projectileTexture = 'sniper-projectile';
                projectileScale = 1.5;
                projectileSpeed = 800; // faster bullet
                trailEffect = true;
                break;
            case Tower.TOWER_SPLASH:
                projectileTexture = 'splash-projectile';
                projectileScale = 1.3;
                projectileSpeed = 400; // slower bomb
                break;
            default:
                projectileTexture = 'basic-projectile';
                projectileScale = 1;
        }
        
        // Create projectile sprite
        const projectile = this.add.image(towerX, towerY, projectileTexture);
        projectile.setScale(projectileScale);
        projectile.setOrigin(0.5);
        
        // Store projectile data for reference
        const projectileId = 'projectile_' + (++this.lastProjectileId);
        this.projectiles.push({
            id: projectileId,
            sprite: projectile,
            target: target,
            tower: tower,
            attackResult: attackResult,
            startX: towerX,
            startY: towerY,
            targetX: targetX,
            targetY: targetY
        });
        
        // Add projectile to effects container
        this.effectsContainer.add(projectile);
        
        // Set up trail effect for sniper projectile
        if (trailEffect) {
            this.time.addEvent({
                delay: 20, // 20ms per trail particle
                repeat: Math.floor(projectileSpeed / 100), // Roughly how long the projectile will travel
                callback: () => {
                    if (!projectile || !projectile.active) return;
                    
                    // Create a trail particle
                    const trail = this.add.circle(
                        projectile.x, 
                        projectile.y, 
                        3, 
                        tower.type === Tower.TOWER_SNIPER ? 0xffcc00 : 0x66aaff
                    );
                    
                    // Add to effects container
                    this.effectsContainer.add(trail);
                    
                    // Fade out and remove
                    this.tweens.add({
                        targets: trail,
                        alpha: 0,
                        scale: 0.5,
                        duration: 300,
                        onComplete: () => {
                            trail.destroy();
                        }
                    });
                }
            });
        }
        
        // Calculate distance and duration for tween
        const distance = Phaser.Math.Distance.Between(towerX, towerY, targetX, targetY);
        const duration = distance / projectileSpeed * 1000; // in ms
        
        // Calculate rotation angle for projectile
        const angle = Phaser.Math.Angle.Between(towerX, towerY, targetX, targetY);
        projectile.setRotation(angle + Math.PI/2); // Adjust based on projectile texture
        
        // Tween projectile to target
        this.tweens.add({
            targets: projectile,
            x: targetX,
            y: targetY,
            duration: duration,
            ease: 'Linear',
            onComplete: () => {
                // Create impact effect
                this.createImpactEffect(tower, target, attackResult);
                
                // Remove projectile
                projectile.destroy();
                
                // Remove from projectiles array
                this.projectiles = this.projectiles.filter(p => p.id !== projectileId);
            }
        });
    }
    
    createImpactEffect(tower, target, attackResult) {
        // Get target position
        const targetX = target.position.x * this.cellSize + this.cellSize/2;
        const targetY = target.position.y * this.cellSize + this.cellSize/2;
        
        // Create impact effect based on tower type
        let impactColor;
        let impactSize;
        
        switch(tower.type) {
            case Tower.TOWER_SNIPER:
                impactColor = 0xff9900; // Orange
                impactSize = 10;
                break;
            case Tower.TOWER_SPLASH:
                impactColor = 0xff3366; // Pink/Red
                impactSize = 15;
                break;
            default:
                impactColor = 0x3399ff; // Blue
                impactSize = 8;
        }
        
        // Create impact flash
        const impact = this.add.circle(targetX, targetY, impactSize, impactColor, 0.8);
        
        // Add to effects container
        this.effectsContainer.add(impact);
        
        // Fade out and scale up the impact
        this.tweens.add({
            targets: impact,
            alpha: 0,
            scale: 2,
            duration: 200,
            onComplete: () => {
                impact.destroy();
            }
        });
        
        // Add splash effect for splash tower
        if (tower.type === Tower.TOWER_SPLASH && tower.splashRadius > 0) {
            // Create explosion
            const explosion = this.add.text(
                targetX,
                targetY,
                '💥',
                { fontSize: '40px' }
            );
            explosion.setOrigin(0.5);
            this.effectsContainer.add(explosion);
            
            // Scale up and fade out
            this.tweens.add({
                targets: explosion,
                scale: 2,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    explosion.destroy();
                }
            });
            
            // Draw splash circle
            const splash = this.add.circle(targetX, targetY, tower.splashRadius * this.cellSize * 0.5, impactColor, 0.3);
            this.effectsContainer.add(splash);
            
            // Fade out and scale down the splash
            this.tweens.add({
                targets: splash,
                alpha: 0,
                scale: 1.5,
                duration: 300,
                onComplete: () => {
                    splash.destroy();
                }
            });
        }
        
        // Add damage effect on the target
        for (const result of attackResult) {
            const mook = result.mook;
            if (mook.sprite) {
                // Make the mook sprite flash red
                const mookSprite = mook.sprite.list[0]; // Get the text object
                this.tweens.add({
                    targets: mookSprite,
                    scale: 1.3,
                    duration: 100,
                    yoyo: true
                });
                
                // If mook is killed, show explosion
                if (result.isDead) {
                    const deathExplosion = this.add.text(
                        mook.position.x * this.cellSize + this.cellSize/2,
                        mook.position.y * this.cellSize + this.cellSize/2,
                        '💥',
                        { fontSize: '40px' }
                    );
                    deathExplosion.setOrigin(0.5);
                    this.effectsContainer.add(deathExplosion);
                    
                    // Scale up and fade out
                    this.tweens.add({
                        targets: deathExplosion,
                        scale: 2,
                        alpha: 0,
                        duration: 500,
                        onComplete: () => {
                            deathExplosion.destroy();
                        }
                    });
                    
                    // Add gold indicator
                    const goldText = this.add.text(
                        mook.position.x * this.cellSize + this.cellSize/2,
                        mook.position.y * this.cellSize,
                        '+' + mook.reward + '💰',
                        { 
                            fontSize: '20px',
                            stroke: '#000000',
                            strokeThickness: 3,
                            fontWeight: 'bold',
                            color: '#ffff00'
                        }
                    );
                    goldText.setOrigin(0.5);
                    this.effectsContainer.add(goldText);
                    
                    // Float up and fade out
                    this.tweens.add({
                        targets: goldText,
                        y: goldText.y - 50,
                        alpha: 0,
                        duration: 1000,
                        onComplete: () => {
                            goldText.destroy();
                        }
                    });
                }
            }
        }
    }
    
    setupCellClicks() {
        // Add click handler for grid cells to place towers
        this.input.on('gameobjectdown', (pointer, gameObject) => {
            // Only process if not dragging and we have a tower selected
            if (!this.isDragging && this.selectedTowerType) {
                const gridX = gameObject.getData('gridX');
                const gridY = gameObject.getData('gridY');
                
                // Attempt to place a tower
                this.placeTower(gridX, gridY);
            }
            // If right-click or holding shift, show tower info or remove
            else if (!this.isDragging && (pointer.rightButtonDown() || this.input.keyboard.checkDown(this.input.keyboard.addKey('SHIFT')))) {
                const gridX = gameObject.getData('gridX');
                const gridY = gameObject.getData('gridY');
                
                // Check if there's a tower here
                const tower = this.gameState.getTower(gridX, gridY);
                if (tower) {
                    // If right-click, remove tower
                    if (pointer.rightButtonDown()) {
                        this.removeTower(gridX, gridY);
                    }
                    // Otherwise show tower info (not implemented yet)
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
        
        // Position the preview
        const worldX = gridX * this.cellSize + this.cellSize/2;
        const worldY = gridY * this.cellSize + this.cellSize/2;
        
        // Show tower preview
        this.towerPreview.setPosition(worldX, worldY);
        this.towerPreview.setVisible(true);
        
        // Set alpha based on placement validity
        this.towerPreview.setAlpha(canPlace ? 0.8 : 0.4);
        
        // Show range indicator
        this.rangeIndicator.setPosition(worldX, worldY);
        this.rangeIndicator.setVisible(true);
        
        // Set range scale based on tower type
        let range = 2;
        if (this.selectedTowerType === 'sniper') {
            range = 6;
        } else if (this.selectedTowerType === 'splash') {
            range = 2.5;
        }
        
        // Scale the range indicator
        const rangeScale = (range * this.cellSize) / 100;
        this.rangeIndicator.setScale(rangeScale);
        
        // Set range indicator alpha
        this.rangeIndicator.setAlpha(canPlace ? 0.5 : 0.2);
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
        
        let towerSprite;
        switch(tower.type) {
            case 'basic':
                towerSprite = this.add.image(worldX, worldY, 'basic-tower');
                break;
            case 'sniper':
                towerSprite = this.add.image(worldX, worldY, 'sniper-tower');
                break;
            case 'splash':
                towerSprite = this.add.image(worldX, worldY, 'splash-tower');
                break;
            default:
                towerSprite = this.add.image(worldX, worldY, 'basic-tower');
        }
        
        // Scale tower to fit cell
        towerSprite.setScale(this.cellSize/100 * 0.7);
        
        // Store reference to gridX and gridY for reference
        towerSprite.setData('gridX', gridX);
        towerSprite.setData('gridY', gridY);
        towerSprite.setData('tower', tower);
        
        // Add to container
        this.towerContainer.add(towerSprite);
        
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
        
        // Remove from game state
        if (this.gameState.removeTower(gridX, gridY)) {
            // Update map
            this.tdMap.removeTower(gridX, gridY);
            
            // Remove tower sprite
            this.towerContainer.getAll().forEach(sprite => {
                if (sprite.getData('gridX') === gridX && sprite.getData('gridY') === gridY) {
                    sprite.destroy();
                }
            });
            
            return true;
        }
        
        return false;
    }
    
    cancelTowerPlacement() {
        this.selectedTowerType = null;
        this.towerPreview.setVisible(false);
        this.rangeIndicator.setVisible(false);
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
                // Check if tower can fire
                if (tower.canFire(time)) {
                    // Find a target
                    const target = tower.findTarget(this.gameState.mooks, this.cellSize);
                    if (target) {
                        // Apply damage from tower to target
                        const damage = tower.fire(time);
                        
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
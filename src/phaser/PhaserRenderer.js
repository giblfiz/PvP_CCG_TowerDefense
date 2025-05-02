/**
 * PhaserRenderer - Handles texture creation and rendering for Phaser game
 */
class PhaserRenderer {
    /**
     * Initialize the renderer
     * @param {Phaser.Scene} scene - The Phaser scene to render to
     * @param {number} cellSize - Size of each grid cell in pixels
     */
    constructor(scene, cellSize = 60) {
        this.scene = scene;
        this.cellSize = cellSize;
    }

    /**
     * Create all game textures
     */
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
    
    /**
     * Create projectile textures
     */
    createProjectileTextures() {
        // Basic projectile (blue bullet)
        this.createBasicProjectileTexture('basic-projectile');
        
        // Sniper projectile (orange bullet)
        this.createSniperProjectileTexture('sniper-projectile');
        
        // Splash projectile (red bomb)
        this.createSplashProjectileTexture('splash-projectile');
    }
    
    /**
     * Create basic projectile texture
     * @param {string} key - Texture key
     */
    createBasicProjectileTexture(key) {
        const graphics = this.scene.make.graphics();
        
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
    
    /**
     * Create sniper projectile texture
     * @param {string} key - Texture key
     */
    createSniperProjectileTexture(key) {
        const graphics = this.scene.make.graphics();
        
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
    
    /**
     * Create splash projectile texture
     * @param {string} key - Texture key
     */
    createSplashProjectileTexture(key) {
        const graphics = this.scene.make.graphics();
        
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
    
    /**
     * Create all cell textures
     */
    createCellTextures() {
        // Empty cell texture - for cells where towers cannot be placed
        this.createEmptyCellTexture('empty-cell');
        
        // Buildable cell texture - for cells where towers can be placed
        this.createBuildableCellTexture('buildable-cell');
        
        // Path cell texture
        this.createPathCellTexture('path-cell');
        
        // Spawn cell texture
        this.createSpawnCellTexture('spawn-cell');
        
        // Exit cell texture
        this.createExitCellTexture('exit-cell');
        
        // Tower cell texture (base)
        this.createTowerCellTexture('tower-cell');
    }
    
    /**
     * Create all tower textures
     */
    createTowerTextures() {
        // Basic tower texture
        this.createBasicTowerTexture('basic-tower');
        
        // Sniper tower texture
        this.createSniperTowerTexture('sniper-tower');
        
        // Splash tower texture
        this.createSplashTowerTexture('splash-tower');
    }
    
    /**
     * Create empty cell texture (for cells where towers cannot be placed)
     * @param {string} key - Texture key
     */
    createEmptyCellTexture(key) {
        const graphics = this.scene.make.graphics();
        graphics.fillStyle(0x333333);
        graphics.fillRect(0, 0, 100, 100);
        graphics.lineStyle(2, 0x555555);
        graphics.strokeRect(1, 1, 98, 98);
        graphics.generateTexture(key, 100, 100);
        graphics.clear();
    }
    
    /**
     * Create buildable cell texture (for cells where towers can be placed)
     * @param {string} key - Texture key
     */
    createBuildableCellTexture(key) {
        const graphics = this.scene.make.graphics();
        
        // Slightly lighter background to indicate buildable area
        graphics.fillStyle(0x444444);
        graphics.fillRect(0, 0, 100, 100);
        
        // Border
        graphics.lineStyle(2, 0x666666);
        graphics.strokeRect(1, 1, 98, 98);
        
        // Add a subtle "+" pattern to indicate buildable
        graphics.lineStyle(1, 0x777777);
        graphics.beginPath();
        graphics.moveTo(50, 25);
        graphics.lineTo(50, 75);
        graphics.moveTo(25, 50);
        graphics.lineTo(75, 50);
        graphics.strokePath();
        
        graphics.generateTexture(key, 100, 100);
        graphics.clear();
    }
    
    /**
     * Create path cell texture
     * @param {string} key - Texture key
     */
    createPathCellTexture(key) {
        const graphics = this.scene.make.graphics();
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
    
    /**
     * Create spawn cell texture
     * @param {string} key - Texture key
     */
    createSpawnCellTexture(key) {
        const graphics = this.scene.make.graphics();
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
    
    /**
     * Create exit cell texture
     * @param {string} key - Texture key
     */
    createExitCellTexture(key) {
        const graphics = this.scene.make.graphics();
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
    
    /**
     * Create tower cell texture
     * @param {string} key - Texture key
     */
    createTowerCellTexture(key) {
        const graphics = this.scene.make.graphics();
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
    
    /**
     * Create basic tower texture
     * @param {string} key - Texture key
     */
    createBasicTowerTexture(key) {
        const graphics = this.scene.make.graphics();
        
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
    
    /**
     * Create sniper tower texture
     * @param {string} key - Texture key
     */
    createSniperTowerTexture(key) {
        const graphics = this.scene.make.graphics();
        
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
    
    /**
     * Create splash tower texture
     * @param {string} key - Texture key
     */
    createSplashTowerTexture(key) {
        const graphics = this.scene.make.graphics();
        
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
    
    /**
     * Create range indicator texture
     */
    createRangeTexture() {
        const graphics = this.scene.make.graphics();
        
        // Semi-transparent circle - make it centered properly
        graphics.fillStyle(0xffffff, 0.2);
        graphics.fillCircle(100, 100, 100);
        
        // Border
        graphics.lineStyle(2, 0xffffff, 0.5);
        graphics.strokeCircle(100, 100, 100);
        
        graphics.generateTexture('range-indicator', 200, 200);
        graphics.clear();
    }
    
    /**
     * Create a mook sprite
     * @param {Object} mook - The mook object
     * @returns {Phaser.GameObjects.Container} - The created sprite container
     */
    createMookSprite(mook) {
        // Create sprite container
        const container = this.scene.add.container(
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
        const text = this.scene.add.text(0, 0, emoji, {
            fontSize: '32px'
        });
        text.setOrigin(0.5);
        container.add(text);
        
        // Create health bar - simplified to just a red bar
        const barWidth = this.cellSize * 0.8;
        const barHeight = this.cellSize * 0.1;
        
        // Create a single red health bar
        const healthBar = this.scene.add.rectangle(
            -barWidth/2, // Anchored at left edge
            this.cellSize * 0.4,
            barWidth * mook.getHealthPercent(), // Initial width based on health
            barHeight,
            0xff0000 // Always red
        );
        healthBar.setOrigin(0, 0.5); // Anchor at left edge
        container.add(healthBar);
        
        // Store references in mook object
        mook.sprite = container;
        mook.healthBar = healthBar;
        mook.barWidth = barWidth;
        
        return container;
    }
    
    /**
     * Create tower attack effects
     * @param {Object} tower - The tower object
     * @param {Array} attackResult - The attack result
     * @param {Phaser.GameObjects.Container} effectsContainer - Container for effects
     * @param {Array} projectiles - Array to store projectile references
     * @returns {number} - ID of the created projectile
     */
    createTowerAttackEffects(tower, attackResult, effectsContainer, projectiles) {
        if (!attackResult || attackResult.length === 0) return null;
        
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
        const projectile = this.scene.add.image(towerX, towerY, projectileTexture);
        projectile.setScale(projectileScale);
        projectile.setOrigin(0.5);
        
        // Generate unique ID for this projectile
        const projectileId = Date.now() + Math.random().toString(36).substr(2, 5);
        
        // Store projectile data for reference
        projectiles.push({
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
        effectsContainer.add(projectile);
        
        // Set up trail effect for sniper projectile
        if (trailEffect) {
            this.setupProjectileTrail(projectile, tower, projectileSpeed, effectsContainer);
        }
        
        // Calculate distance and duration for tween
        const distance = Phaser.Math.Distance.Between(towerX, towerY, targetX, targetY);
        const duration = distance / projectileSpeed * 1000; // in ms
        
        // Calculate rotation angle for projectile
        const angle = Phaser.Math.Angle.Between(towerX, towerY, targetX, targetY);
        projectile.setRotation(angle + Math.PI/2); // Adjust based on projectile texture
        
        // Tween projectile to target
        this.scene.tweens.add({
            targets: projectile,
            x: targetX,
            y: targetY,
            duration: duration,
            ease: 'Linear',
            onComplete: () => {
                this.createImpactEffect(tower, target, attackResult, effectsContainer);
                projectile.destroy();
                
                // Remove from projectiles array
                const index = projectiles.findIndex(p => p.id === projectileId);
                if (index !== -1) {
                    projectiles.splice(index, 1);
                }
            }
        });
        
        return projectileId;
    }
    
    /**
     * Setup projectile trail effect
     * @param {Phaser.GameObjects.Image} projectile - The projectile sprite
     * @param {Object} tower - The tower that fired
     * @param {number} projectileSpeed - Speed of the projectile
     * @param {Phaser.GameObjects.Container} effectsContainer - Container for effects 
     */
    setupProjectileTrail(projectile, tower, projectileSpeed, effectsContainer) {
        this.scene.time.addEvent({
            delay: 20, // 20ms per trail particle
            repeat: Math.floor(projectileSpeed / 100), // Roughly how long projectile will travel
            callback: () => {
                if (!projectile || !projectile.active) return;
                
                // Create a trail particle
                const trail = this.scene.add.circle(
                    projectile.x, 
                    projectile.y, 
                    3, 
                    tower.type === Tower.TOWER_SNIPER ? 0xffcc00 : 0x66aaff
                );
                
                // Add to effects container
                effectsContainer.add(trail);
                
                // Fade out and remove
                this.scene.tweens.add({
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
    
    /**
     * Create impact effect when projectile hits target
     * @param {Object} tower - The tower that fired
     * @param {Object} target - The target mook
     * @param {Array} attackResult - Attack result data
     * @param {Phaser.GameObjects.Container} effectsContainer - Container for effects
     */
    createImpactEffect(tower, target, attackResult, effectsContainer) {
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
        const impact = this.scene.add.circle(targetX, targetY, impactSize, impactColor, 0.8);
        
        // Add to effects container
        effectsContainer.add(impact);
        
        // Fade out and scale up the impact
        this.scene.tweens.add({
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
            this.createSplashEffect(targetX, targetY, tower, impactColor, effectsContainer);
        }
        
        // Add damage effect on all affected targets
        for (const result of attackResult) {
            if (result.mook && result.mook.sprite) {
                this.createMookDamageEffect(result.mook, result.isDead, effectsContainer);
            }
        }
    }
    
    /**
     * Create splash effect for splash towers
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} tower - The tower object
     * @param {number} impactColor - Color of the impact
     * @param {Phaser.GameObjects.Container} effectsContainer - Container for effects
     */
    createSplashEffect(x, y, tower, impactColor, effectsContainer) {
        // Create explosion
        const explosion = this.scene.add.text(
            x,
            y,
            '💥',
            { fontSize: '40px' }
        );
        explosion.setOrigin(0.5);
        effectsContainer.add(explosion);
        
        // Scale up and fade out
        this.scene.tweens.add({
            targets: explosion,
            scale: 2,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                explosion.destroy();
            }
        });
        
        // Draw splash circle
        const splash = this.scene.add.circle(x, y, tower.splashRadius * this.cellSize * 0.5, impactColor, 0.3);
        effectsContainer.add(splash);
        
        // Fade out and scale down the splash
        this.scene.tweens.add({
            targets: splash,
            alpha: 0,
            scale: 1.5,
            duration: 300,
            onComplete: () => {
                splash.destroy();
            }
        });
    }
    
    /**
     * Create damage effect on a mook
     * @param {Object} mook - The mook that was hit
     * @param {boolean} isDead - Whether the mook died from this hit
     * @param {Phaser.GameObjects.Container} effectsContainer - Container for effects
     */
    createMookDamageEffect(mook, isDead, effectsContainer) {
        // Make the mook sprite flash/grow
        if (mook.sprite && mook.sprite.list && mook.sprite.list[0]) {
            const mookSprite = mook.sprite.list[0]; // Get the text object
            this.scene.tweens.add({
                targets: mookSprite,
                scale: 1.3,
                duration: 100,
                yoyo: true
            });
        }
        
        // If mook is killed, add death effects
        if (isDead) {
            this.createMookDeathEffect(mook, effectsContainer);
        }
    }
    
    /**
     * Create death effect when a mook is killed
     * @param {Object} mook - The mook that died
     * @param {Phaser.GameObjects.Container} effectsContainer - Container for effects
     */
    createMookDeathEffect(mook, effectsContainer) {
        const position = mook.position;
        const x = position.x * this.cellSize + this.cellSize/2; 
        const y = position.y * this.cellSize + this.cellSize/2;
        
        // Create explosion
        const deathExplosion = this.scene.add.text(
            x,
            y,
            '💥',
            { fontSize: '40px' }
        );
        deathExplosion.setOrigin(0.5);
        effectsContainer.add(deathExplosion);
        
        // Scale up and fade out
        this.scene.tweens.add({
            targets: deathExplosion,
            scale: 2,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                deathExplosion.destroy();
            }
        });
        
        // Add gold indicator
        const goldText = this.scene.add.text(
            x,
            y,
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
        effectsContainer.add(goldText);
        
        // Float up and fade out
        this.scene.tweens.add({
            targets: goldText,
            y: goldText.y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                goldText.destroy();
            }
        });
    }

    /**
     * Show tower placement preview
     * @param {number} gridX - Grid X position
     * @param {number} gridY - Grid Y position
     * @param {string} towerType - Type of tower
     * @param {boolean} canPlace - Whether tower can be placed here
     * @param {Object} previewObjects - Object with tower preview and range indicator
     * @param {number} cellSize - Size of grid cell
     */
    showPlacementPreview(gridX, gridY, towerType, canPlace, previewObjects, cellSize) {
        const { towerPreview, rangeIndicator } = previewObjects;
        
        // Position the preview
        const worldX = gridX * cellSize + cellSize/2;
        const worldY = gridY * cellSize + cellSize/2;
        
        // Show tower preview
        towerPreview.setPosition(worldX, worldY);
        towerPreview.setVisible(true);
        
        // Set alpha based on placement validity
        towerPreview.setAlpha(canPlace ? 0.8 : 0.4);
        
        // Show range indicator
        rangeIndicator.setPosition(worldX, worldY);
        rangeIndicator.setVisible(true);
        
        // Set range scale based on tower type
        let range = 2;
        if (towerType === 'sniper') {
            range = 6;
        } else if (towerType === 'splash') {
            range = 2.5;
        }
        
        // Scale the range indicator
        const rangeScale = (range * cellSize) / 100;
        rangeIndicator.setScale(rangeScale);
        
        // Set range indicator alpha
        rangeIndicator.setAlpha(canPlace ? 0.5 : 0.2);
    }
}

// Export PhaserRenderer for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhaserRenderer;
} else {
    // For browser use
    window.PhaserRenderer = PhaserRenderer;
}
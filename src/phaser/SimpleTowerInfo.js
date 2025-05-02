/**
 * SimpleTowerInfo - A minimal tower info panel implementation
 */
class SimpleTowerInfo {
    constructor(scene) {
        console.log("SimpleTowerInfo constructor called");
        this.scene = scene;
        this.visible = false;
        this.selectedTower = null;
        
        // Create the UI elements
        this.createPanel();
        
        // Debug helper on window
        window.showPanel = () => {
            this.container.setVisible(true);
            this.visible = true;
            console.log("Panel forced visible");
        };
        
        window.hidePanel = () => {
            this.container.setVisible(false);
            this.visible = false;
            console.log("Panel forced hidden");
        };
    }
    
    createPanel() {
        console.log("Creating simple tower info panel");
        
        // Create container
        this.container = this.scene.add.container(0, 0);
        
        // Position in bottom right with margin
        const x = this.scene.cameras.main.width - 220;
        const y = this.scene.cameras.main.height - 300;
        this.container.setPosition(x, y);
        
        // Critical: Make panel stay in place when camera moves
        this.container.setScrollFactor(0);
        
        // Set depth to ensure it's on top
        this.container.setDepth(1000);
        
        // Initially hidden
        this.container.setVisible(false);
        
        // Create background
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.8);
        bg.fillRect(0, 0, 200, 200);
        bg.lineStyle(2, 0xffff00);
        bg.strokeRect(0, 0, 200, 200);
        
        // Add title
        const title = this.scene.add.text(100, 10, "Tower Info", {
            font: "bold 18px Arial",
            fill: "#ffffff"
        });
        title.setOrigin(0.5, 0);
        
        // Tower type
        const typeLabel = this.scene.add.text(10, 50, "Type:", {
            font: "14px Arial",
            fill: "#ffffff"
        });
        
        this.typeText = this.scene.add.text(150, 50, "Basic", {
            font: "14px Arial",
            fill: "#88ccff"
        });
        this.typeText.setOrigin(1, 0);
        
        // Tower damage
        const damageLabel = this.scene.add.text(10, 80, "Damage:", {
            font: "14px Arial",
            fill: "#ffffff"
        });
        
        this.damageText = this.scene.add.text(150, 80, "10", {
            font: "14px Arial",
            fill: "#ff8888"
        });
        this.damageText.setOrigin(1, 0);
        
        // Tower ammo
        const ammoLabel = this.scene.add.text(10, 110, "Ammo:", {
            font: "14px Arial",
            fill: "#ffffff"
        });
        
        this.ammoText = this.scene.add.text(150, 110, "40", {
            font: "14px Arial",
            fill: "#88ff88"
        });
        this.ammoText.setOrigin(1, 0);
        
        // Sell button background
        const sellBg = this.scene.add.graphics();
        sellBg.fillStyle(0xcc3333);
        sellBg.fillRect(10, 150, 180, 40);
        
        // Create interactive zone for sell button
        const sellZone = this.scene.add.zone(10, 150, 180, 40);
        sellZone.setOrigin(0, 0);
        sellZone.setInteractive();
        
        // Sell button text
        this.sellText = this.scene.add.text(100, 170, "Sell for 25 gold", {
            font: "14px Arial",
            fill: "#ffffff"
        });
        this.sellText.setOrigin(0.5, 0.5);
        
        // Add hover effect
        sellZone.on('pointerover', () => {
            sellBg.clear();
            sellBg.fillStyle(0xff4444);
            sellBg.fillRect(10, 150, 180, 40);
        });
        
        sellZone.on('pointerout', () => {
            sellBg.clear();
            sellBg.fillStyle(0xcc3333);
            sellBg.fillRect(10, 150, 180, 40);
        });
        
        // Add click handler
        sellZone.on('pointerdown', () => {
            console.log("Sell button clicked");
            if (this.selectedTower && this.scene.sellTower) {
                const gridX = this.selectedTower.gridX;
                const gridY = this.selectedTower.gridY;
                const refund = this.scene.sellTower(gridX, gridY);
                console.log(`Tower sold for ${refund} gold`);
                this.hide();
            }
        });
        
        // Add all elements to container
        this.container.add([
            bg, title, 
            typeLabel, this.typeText,
            damageLabel, this.damageText,
            ammoLabel, this.ammoText,
            sellBg, sellZone, this.sellText
        ]);
        
        console.log("Simple tower info panel created successfully");
    }
    
    show(tower) {
        if (!tower) return;
        
        console.log(`Showing info for ${tower.type} tower at (${tower.gridX}, ${tower.gridY})`);
        
        // Store reference to the tower
        this.selectedTower = tower;
        
        // Update text values
        this.typeText.setText(tower.type);
        this.damageText.setText(tower.damage);
        this.ammoText.setText(tower.ammo);
        
        // Update sell value (50% of cost)
        const sellValue = Math.floor(tower.cost * 0.5);
        this.sellText.setText(`Sell for ${sellValue} gold`);
        
        // Position in bottom right with margin
        const x = this.scene.cameras.main.width - 220;
        const y = this.scene.cameras.main.height - 300;
        this.container.setPosition(x, y);
        
        // Show the panel
        this.container.setVisible(true);
        this.visible = true;
    }
    
    hide() {
        this.container.setVisible(false);
        this.visible = false;
        this.selectedTower = null;
    }
    
    isVisible() {
        return this.visible;
    }
    
    updatePosition() {
        if (this.container) {
            const x = this.scene.cameras.main.width - 220;
            const y = this.scene.cameras.main.height - 300;
            this.container.setPosition(x, y);
        }
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.SimpleTowerInfo = SimpleTowerInfo;
}
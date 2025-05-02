/**
 * PhaserTowerInfo - A utility class for creating and managing tower info UI in Phaser
 */
class PhaserTowerInfo {
    constructor(scene) {
        console.log("PhaserTowerInfo constructor called");
        this.scene = scene;
        this.container = null;
        this.selectedTower = null;
        this.selectedTowerGridX = -1;
        this.selectedTowerGridY = -1;
        
        this.titleText = null;
        this.typeText = null;
        this.damageText = null;
        this.ammoText = null;
        this.sellButton = null;
        this.sellText = null;
        
        this.visible = false;
        
        // Create the panel
        this.createPanel();
    }
    
    createPanel() {
        console.log("Creating tower info panel container");
        // Create a container for all elements
        this.container = this.scene.add.container(0, 0);
        
        // Set initial visibility to hidden
        this.container.setVisible(false);
        
        // Set depth to ensure it appears above other game elements - Use higher value
        this.container.setDepth(2000);
        
        // CRITICAL: Keep panel fixed to camera view - prevents scrolling with map
        this.container.setScrollFactor(0);
        
        // Panel dimensions
        const panelWidth = 200;
        const panelHeight = 220;
        
        // Calculate position (bottom right corner with padding)
        const panelX = this.scene.cameras.main.width - panelWidth - 20;
        const panelY = this.scene.cameras.main.height - panelHeight - 100;
        
        // Create panel background with rounded corners
        const panelBg = this.scene.add.graphics();
        panelBg.fillStyle(0x000000, 0.85);
        panelBg.lineStyle(2, 0xFFD700, 1); // Gold border
        panelBg.fillRoundedRect(0, 0, panelWidth, panelHeight, 8);
        panelBg.strokeRoundedRect(0, 0, panelWidth, panelHeight, 8);
        
        // Add panel title
        this.titleText = this.scene.add.text(panelWidth/2, 20, 'Tower Info', {
            fontFamily: 'Arial',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#FFD700',
            align: 'center'
        });
        this.titleText.setOrigin(0.5, 0);
        
        // Add divider line
        const divider = this.scene.add.graphics();
        divider.lineStyle(1, 0xFFD700, 1);
        divider.beginPath();
        divider.moveTo(15, 50);
        divider.lineTo(panelWidth - 15, 50);
        divider.closePath();
        divider.strokePath();
        
        // Define text styles
        const labelStyle = {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#FFFFFF'
        };
        
        const valueStyle = {
            fontFamily: 'Arial',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        };
        
        // Type row
        const typeLabel = this.scene.add.text(15, 70, 'Type:', labelStyle);
        this.typeText = this.scene.add.text(panelWidth - 15, 70, 'Basic', valueStyle);
        this.typeText.setOrigin(1, 0);
        this.typeText.setColor('#88CCFF'); // Light blue
        
        // Damage row
        const damageLabel = this.scene.add.text(15, 100, 'Damage:', labelStyle);
        this.damageText = this.scene.add.text(panelWidth - 15, 100, '10', valueStyle);
        this.damageText.setOrigin(1, 0);
        this.damageText.setColor('#FF8888'); // Light red
        
        // Ammo row
        const ammoLabel = this.scene.add.text(15, 130, 'Ammo:', labelStyle);
        this.ammoText = this.scene.add.text(panelWidth - 15, 130, '40', valueStyle);
        this.ammoText.setOrigin(1, 0);
        this.ammoText.setColor('#88FF88'); // Light green
        
        // Sell button
        const sellButtonGraphic = this.scene.add.graphics();
        sellButtonGraphic.fillStyle(0xCC3333, 1);
        sellButtonGraphic.fillRoundedRect(15, 170, panelWidth - 30, 35, 4);
        
        // Create a zone for interactivity
        const sellButtonZone = this.scene.add.zone(15 + (panelWidth - 30)/2, 170 + 35/2, panelWidth - 30, 35);
        sellButtonZone.setInteractive();
        sellButtonZone.on('pointerover', () => {
            sellButtonGraphic.clear();
            sellButtonGraphic.fillStyle(0xFF4444, 1); // Lighter red on hover
            sellButtonGraphic.fillRoundedRect(15, 170, panelWidth - 30, 35, 4);
        });
        
        sellButtonZone.on('pointerout', () => {
            sellButtonGraphic.clear();
            sellButtonGraphic.fillStyle(0xCC3333, 1); // Back to normal red
            sellButtonGraphic.fillRoundedRect(15, 170, panelWidth - 30, 35, 4);
        });
        
        sellButtonZone.on('pointerdown', () => {
            this.onSellButtonClick();
        });
        
        this.sellButton = {
            graphic: sellButtonGraphic,
            zone: sellButtonZone
        };
        
        // Add sell button text
        this.sellText = this.scene.add.text(panelWidth/2, 188, 'Sell for 25 gold', {
            fontFamily: 'Arial',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#FFFFFF',
            align: 'center'
        });
        this.sellText.setOrigin(0.5, 0.5);
        
        // Add all elements to container
        this.container.add([
            panelBg,
            this.titleText,
            divider,
            typeLabel,
            this.typeText,
            damageLabel,
            this.damageText,
            ammoLabel,
            this.ammoText,
            sellButtonGraphic,
            sellButtonZone,
            this.sellText
        ]);
        
        // Position the container
        this.container.setPosition(panelX, panelY);
        
        // Add global debug helpers
        window.showPanel = () => {
            console.log("Debug: Showing panel");
            this.container.setVisible(true);
            this.visible = true;
        };
        
        window.hidePanel = () => {
            console.log("Debug: Hiding panel");
            this.container.setVisible(false);
            this.visible = false;
        };
        
        console.log("Tower info panel container created");
    }
    
    onSellButtonClick() {
        console.log("Sell button clicked");
        
        if (this.selectedTower) {
            // Call the sellTower method from the main scene
            const refundAmount = this.scene.sellTower(this.selectedTowerGridX, this.selectedTowerGridY);
            
            if (refundAmount > 0) {
                console.log(`Tower sold for ${refundAmount} gold!`);
                this.hide();
            }
        }
    }
    
    update(tower, gridX, gridY) {
        console.log("PhaserTowerInfo.update called for tower:", tower ? tower.type : "none");
        
        if (!tower) {
            console.error("No tower provided to PhaserTowerInfo.update");
            return;
        }
        
        try {
            // Store tower reference
            this.selectedTower = tower;
            this.selectedTowerGridX = gridX;
            this.selectedTowerGridY = gridY;
            
            // Update tower stats
            this.typeText.setText(tower.type);
            this.damageText.setText(tower.damage.toString());
            this.ammoText.setText(tower.ammo.toString());
            
            // Calculate sell value (50% of tower cost)
            const sellValue = Math.floor(tower.cost * 0.5);
            this.sellText.setText(`Sell for ${sellValue} gold`);
            
            // Ensure it's positioned correctly
            const panelWidth = 200;
            const panelHeight = 220;
            const panelX = this.scene.cameras.main.width - panelWidth - 20;
            const panelY = this.scene.cameras.main.height - panelHeight - 100;
            this.container.setPosition(panelX, panelY);
            
            console.log("Tower info updated successfully");
        } catch (error) {
            console.error("Error in PhaserTowerInfo.update:", error);
        }
    }
    
    show(tower, gridX, gridY) {
        console.log("PhaserTowerInfo.show called for tower:", tower ? tower.type : "none", "at", gridX, gridY);
        
        if (!tower) {
            console.error("No tower provided to PhaserTowerInfo.show");
            return;
        }
        
        // Update the panel data
        this.update(tower, gridX, gridY);
        
        // Show the panel
        this.container.setVisible(true);
        this.visible = true;
        
        console.log("Tower info panel is now visible");
    }
    
    hide() {
        console.log("PhaserTowerInfo.hide called");
        this.container.setVisible(false);
        this.visible = false;
        this.selectedTower = null;
        this.selectedTowerGridX = -1;
        this.selectedTowerGridY = -1;
    }
    
    isVisible() {
        return this.visible;
    }
    
    getBounds() {
        return this.container.getBounds();
    }
    
    updatePosition() {
        // Update position on window resize
        const panelWidth = 200;
        const panelHeight = 220;
        const panelX = this.scene.cameras.main.width - panelWidth - 20;
        const panelY = this.scene.cameras.main.height - panelHeight - 100;
        this.container.setPosition(panelX, panelY);
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.PhaserTowerInfo = PhaserTowerInfo;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PhaserTowerInfo };
}
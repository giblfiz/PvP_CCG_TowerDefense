/**
 * Game state for tower defense game
 * Manages resources, waves, mooks and towers
 */
class GameState {
    /**
     * Create a new game state
     */
    constructor() {
        this.gold = 600;
        this.lives = 20;
        this.wave = 0;
        this.towers = [];
        this.mooks = [];
        this.waveActive = false;
        this.waveTimer = null;
        this.gameOver = false;
        this.mooksSpawned = 0;
        this.mooksKilled = 0;
        this.mooksLeaked = 0;
        
        // Wave configuration
        this.waveConfig = {
            spawnDelay: 1000, // ms between spawns
            mooksPerWave: 10, // base number of mooks per wave
            mookTypes: [
                { type: Mook.MOOK_STANDARD, weight: 100 },
                { type: Mook.MOOK_FAST, weight: 0 },
                { type: Mook.MOOK_ARMORED, weight: 0 },
                { type: Mook.MOOK_TANK, weight: 0 }
            ],
            // Define when special mooks appear
            specialMooks: {
                [Mook.MOOK_FAST]: 2, // Fast mooks appear at wave 2
                [Mook.MOOK_ARMORED]: 3, // Armored mooks appear at wave 3
                [Mook.MOOK_TANK]: 5 // Tank mooks appear at wave 5
            },
            maxWaves: 10
        };
        
        // Update UI
        this.updateUI();
    }
    
    /**
     * Add gold to player's resources
     * @param {number} amount - Amount of gold to add
     */
    addGold(amount) {
        this.gold += amount;
        this.updateUI();
    }
    
    /**
     * Spend player's gold
     * @param {number} amount - Amount of gold to spend
     * @returns {boolean} Whether the gold was spent
     */
    spendGold(amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            this.updateUI();
            return true;
        }
        return false;
    }
    
    /**
     * Reduce player's lives
     * @param {number} amount - Amount of lives to reduce
     */
    reduceLives(amount) {
        this.lives -= amount;
        this.updateUI();
        
        if (this.lives <= 0) {
            this.gameOver = true;
            this.endWave();
            
            // Show game over message
            const infoPanel = document.getElementById('info-panel');
            infoPanel.textContent = 'GAME OVER! You reached wave ' + this.wave;
            infoPanel.style.color = '#ff5555';
            infoPanel.style.fontWeight = 'bold';
            
            // Disable wave button
            document.getElementById('wave-button').textContent = 'Game Over';
            document.getElementById('wave-button').disabled = true;
        }
    }
    
    /**
     * Start a new wave of mooks
     * @returns {boolean} Whether the wave was started
     */
    startWave() {
        if (this.gameOver) return false;
        if (!this.waveActive) {
            this.wave++;
            this.waveActive = true;
            this.mooksSpawned = 0;
            this.mooksKilled = 0;
            this.mooksLeaked = 0;
            this.mooks = [];
            
            // Add bonus gold for starting a wave
            this.addGold(25);
            
            // Update wave configuration based on wave number
            this.updateWaveConfig();
            
            // Update UI
            this.updateUI();
            
            return true;
        }
        return false;
    }
    
    /**
     * Update wave configuration based on current wave
     */
    updateWaveConfig() {
        // Update mook type weights based on wave number
        this.waveConfig.mookTypes.forEach(mookType => {
            if (mookType.type === Mook.MOOK_STANDARD) {
                // Standard mooks always present but decrease in later waves
                mookType.weight = Math.max(10, 100 - this.wave * 10);
            } else if (mookType.type === Mook.MOOK_FAST && this.wave >= this.waveConfig.specialMooks[Mook.MOOK_FAST]) {
                // Fast mooks appear at wave 2 and increase
                mookType.weight = (this.wave - this.waveConfig.specialMooks[Mook.MOOK_FAST] + 1) * 20;
            } else if (mookType.type === Mook.MOOK_ARMORED && this.wave >= this.waveConfig.specialMooks[Mook.MOOK_ARMORED]) {
                // Armored mooks appear at wave 3 and increase
                mookType.weight = (this.wave - this.waveConfig.specialMooks[Mook.MOOK_ARMORED] + 1) * 15;
            } else if (mookType.type === Mook.MOOK_TANK && this.wave >= this.waveConfig.specialMooks[Mook.MOOK_TANK]) {
                // Tank mooks appear at wave 5 and increase slowly
                mookType.weight = (this.wave - this.waveConfig.specialMooks[Mook.MOOK_TANK] + 1) * 10;
            }
        });
        
        // Increase mooks per wave
        this.waveConfig.mooksPerWave = 10 + (this.wave * 2);
        
        // Decrease spawn delay slightly
        this.waveConfig.spawnDelay = Math.max(500, 1000 - (this.wave * 50));
    }
    
    /**
     * Spawn a new mook
     * @param {Array} path - Path for the mook to follow
     * @returns {Object|null} The spawned mook or null
     */
    spawnMook(path) {
        if (!this.waveActive || this.mooksSpawned >= this.waveConfig.mooksPerWave) {
            return null;
        }
        
        // Select mook type based on weights
        const mookType = this.selectMookType();
        
        // Create new mook
        const mook = new Mook(mookType, path);
        this.mooks.push(mook);
        this.mooksSpawned++;
        
        // Check if this was the last mook to spawn
        if (this.mooksSpawned >= this.waveConfig.mooksPerWave) {
            // Clear spawn timer if it's the last mook
            if (this.waveTimer) {
                clearTimeout(this.waveTimer);
                this.waveTimer = null;
            }
        }
        
        return mook;
    }
    
    /**
     * Select mook type based on weights
     * @returns {string} Mook type
     */
    selectMookType() {
        // Get total weight
        const totalWeight = this.waveConfig.mookTypes.reduce((sum, type) => sum + type.weight, 0);
        
        // Random value based on total weight
        let random = Math.random() * totalWeight;
        
        // Select mook type
        for (const mookType of this.waveConfig.mookTypes) {
            if (random < mookType.weight) {
                return mookType.type;
            }
            random -= mookType.weight;
        }
        
        // Default to standard mook
        return Mook.MOOK_STANDARD;
    }
    
    /**
     * Handle a mook reaching the end of the path
     * @param {Object} mook - The mook that reached the end
     */
    mookReachedEnd(mook) {
        // Mark mook as inactive and reached end
        mook.active = false;
        mook.reachedEnd = true;
        
        // Reduce lives
        this.reduceLives(mook.damage);
        
        // Track leaked mooks
        this.mooksLeaked++;
        
        // Check if wave is complete
        this.checkWaveCompletion();
    }
    
    /**
     * Handle a mook being killed
     * @param {Object} mook - The mook that was killed
     */
    mookKilled(mook) {
        // Mark mook as inactive
        mook.active = false;
        
        // Add gold reward
        this.addGold(mook.reward);
        
        // Track killed mooks
        this.mooksKilled++;
        
        // Check if wave is complete
        this.checkWaveCompletion();
    }
    
    /**
     * Check if current wave is complete
     */
    checkWaveCompletion() {
        // Wave is complete when all mooks are spawned and either killed or reached the end
        if (this.waveActive && 
            this.mooksSpawned >= this.waveConfig.mooksPerWave && 
            this.mooksKilled + this.mooksLeaked >= this.mooksSpawned &&
            !this.gameOver) {
            
            this.endWave();
        }
    }
    
    /**
     * End the current wave
     */
    endWave() {
        if (!this.waveActive) return;
        
        this.waveActive = false;
        
        // Clear any remaining spawn timer
        if (this.waveTimer) {
            clearTimeout(this.waveTimer);
            this.waveTimer = null;
        }
        
        // Add wave completion bonus if not game over
        if (!this.gameOver) {
            this.addGold(50 + (this.wave * 10));
            
            // Check for game win
            if (this.wave >= this.waveConfig.maxWaves) {
                const infoPanel = document.getElementById('info-panel');
                infoPanel.textContent = 'YOU WIN! You completed all waves!';
                infoPanel.style.color = '#55ff55';
                infoPanel.style.fontWeight = 'bold';
                
                // Update button
                document.getElementById('wave-button').textContent = 'Victory!';
                document.getElementById('wave-button').disabled = true;
                
                this.gameOver = true;
            }
        }
        
        // Update UI
        this.updateUI();
    }
    
    /**
     * Update the UI elements
     */
    updateUI() {
        document.getElementById('gold-value').textContent = this.gold;
        document.getElementById('lives-value').textContent = this.lives;
        document.getElementById('wave-value').textContent = this.wave;
        
        // Update wave button
        if (this.gameOver) {
            document.getElementById('wave-button').textContent = this.lives <= 0 ? 'Game Over' : 'Victory!';
            document.getElementById('wave-button').disabled = true;
        } else if (this.waveActive) {
            const progress = Math.floor((this.mooksKilled + this.mooksLeaked) / this.waveConfig.mooksPerWave * 100);
            document.getElementById('wave-button').textContent = `Wave in Progress - ${progress}%`;
            document.getElementById('wave-button').disabled = true;
        } else {
            document.getElementById('wave-button').textContent = this.wave === 0 ? 'Start Game' : 'Start Wave ' + (this.wave + 1);
            document.getElementById('wave-button').disabled = false;
        }
    }
    
    /**
     * Add a tower to the game
     * @param {Object} tower - Tower to add
     */
    addTower(tower) {
        this.towers.push(tower);
    }
    
    /**
     * Remove a tower from the game
     * @param {number} gridX - X position of the tower on grid
     * @param {number} gridY - Y position of the tower on grid
     * @returns {boolean} Whether the tower was removed
     */
    removeTower(gridX, gridY) {
        const index = this.towers.findIndex(t => t.gridX === gridX && t.gridY === gridY);
        if (index !== -1) {
            const tower = this.towers[index];
            this.towers.splice(index, 1);
            
            // Refund some of the cost
            this.addGold(Math.floor(tower.cost * 0.7));
            return true;
        }
        return false;
    }
    
    /**
     * Get a tower at a grid position
     * @param {number} gridX - X position on grid
     * @param {number} gridY - Y position on grid
     * @returns {Object|null} The tower or null if none found
     */
    getTower(gridX, gridY) {
        return this.towers.find(t => t.gridX === gridX && t.gridY === gridY);
    }
    
    /**
     * Update all game entities
     * @param {number} time - Current game time
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(time, deltaTime) {
        // Skip updates if game over
        if (this.gameOver) return;
        
        // Update mooks
        this.updateMooks(deltaTime);
        
        // Update towers
        this.updateTowers(time);
    }
    
    /**
     * Update all mooks
     * @param {number} deltaTime - Time elapsed since last update
     */
    updateMooks(deltaTime) {
        // Scale deltaTime to seconds
        const deltaSeconds = deltaTime / 1000;
        
        for (let i = 0; i < this.mooks.length; i++) {
            const mook = this.mooks[i];
            
            // Skip inactive mooks
            if (!mook.active) continue;
            
            // Update mook position
            const reachedEnd = mook.update(deltaSeconds);
            
            // Check if mook reached the end
            if (reachedEnd) {
                this.mookReachedEnd(mook);
            }
        }
        
        // Clean up inactive mooks
        this.mooks = this.mooks.filter(mook => mook.active || mook.reachedEnd);
    }
    
    /**
     * Update all towers
     * @param {number} time - Current game time
     */
    updateTowers(time) {
        // Temporarily disable tower attacking here since we're handling it in the scene for visuals
        // This prevents double damage
        
        // We will re-enable this once we refactor to separate visual effects from game logic
        
        /*
        for (const tower of this.towers) {
            // Try to attack a target
            const attackResults = tower.attackTarget(time, this.mooks, 60); // 60 is cellSize
            
            // Process attack results
            if (attackResults) {
                for (const result of attackResults) {
                    if (result.isDead) {
                        this.mookKilled(result.mook);
                    }
                }
            }
        }
        */
    }
}

// Export GameState for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
} else {
    // For browser use
    window.GameState = GameState;
}
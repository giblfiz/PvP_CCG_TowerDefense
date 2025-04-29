/**
 * Handles UI interaction for the game
 */
class GameUI {
  /**
   * Initialize UI handler
   * @param {Object} config - Configuration options
   * @param {Function} config.onStartWave - Callback for starting a wave
   * @param {Function} config.onSelectTower - Callback for tower selection
   */
  constructor(config) {
    this.onStartWave = config.onStartWave;
    this.onSelectTower = config.onSelectTower;
    
    // Get UI elements
    this.healthDisplay = document.getElementById('health-value');
    this.moneyDisplay = document.getElementById('money-value');
    this.waveDisplay = document.getElementById('wave-value');
    this.startWaveButton = document.getElementById('start-wave-button');
    this.towerSelector = document.getElementById('tower-selector');
    
    // Initialize UI events
    this.initEvents();
    
    // Track selected tower
    this.selectedTowerType = 'basic';
  }

  /**
   * Initialize UI event listeners
   */
  initEvents() {
    // Start wave button
    this.startWaveButton.addEventListener('click', () => {
      if (this.onStartWave) {
        this.onStartWave();
      }
    });
    
    // Tower selection
    const towerOptions = this.towerSelector.querySelectorAll('.tower-option');
    towerOptions.forEach(option => {
      option.addEventListener('click', () => {
        // Only allow selecting available towers
        if (!option.classList.contains('unavailable')) {
          // Update selection UI
          towerOptions.forEach(opt => opt.classList.remove('selected'));
          option.classList.add('selected');
          
          // Get tower type and cost
          const towerType = option.dataset.type;
          const towerCost = parseInt(option.dataset.cost, 10);
          
          this.selectedTowerType = towerType;
          
          if (this.onSelectTower) {
            this.onSelectTower({
              type: towerType,
              cost: towerCost
            });
          }
        }
      });
    });
  }

  /**
   * Update displayed stats
   * @param {Object} stats - Current game stats
   * @param {number} stats.health - Player health
   * @param {number} stats.money - Player money
   * @param {number} stats.wave - Current wave number
   */
  updateStats(stats) {
    if (stats.health !== undefined) {
      this.healthDisplay.textContent = stats.health;
      
      // Visual feedback for health changes
      if (stats.health < parseInt(this.healthDisplay.textContent, 10)) {
        this.healthDisplay.classList.add('pulse');
        setTimeout(() => {
          this.healthDisplay.classList.remove('pulse');
        }, 500);
      }
    }
    
    if (stats.money !== undefined) {
      this.moneyDisplay.textContent = stats.money;
    }
    
    if (stats.wave !== undefined) {
      this.waveDisplay.textContent = stats.wave;
    }
    
    // Update tower availability based on funds
    this.updateTowerAvailability(stats.money || 0);
  }

  /**
   * Update which towers are available based on money
   * @param {number} money - Current player money
   */
  updateTowerAvailability(money) {
    const towerOptions = this.towerSelector.querySelectorAll('.tower-option');
    
    towerOptions.forEach(option => {
      const cost = parseInt(option.dataset.cost, 10);
      
      if (money >= cost) {
        option.classList.remove('unavailable');
      } else {
        option.classList.add('unavailable');
        
        // If an unavailable tower is selected, switch to an available one
        if (option.classList.contains('selected') && money < cost) {
          option.classList.remove('selected');
          
          // Find first available tower
          for (const opt of towerOptions) {
            const optCost = parseInt(opt.dataset.cost, 10);
            if (money >= optCost) {
              opt.classList.add('selected');
              this.selectedTowerType = opt.dataset.type;
              
              if (this.onSelectTower) {
                this.onSelectTower({
                  type: this.selectedTowerType,
                  cost: optCost
                });
              }
              
              break;
            }
          }
        }
      }
    });
  }

  /**
   * Get the currently selected tower type
   * @returns {string} Selected tower type
   */
  getSelectedTowerType() {
    return this.selectedTowerType;
  }

  /**
   * Get the cost of the currently selected tower
   * @returns {number} Cost of selected tower
   */
  getSelectedTowerCost() {
    const selectedOption = this.towerSelector.querySelector('.tower-option.selected');
    return selectedOption ? parseInt(selectedOption.dataset.cost, 10) : 0;
  }

  /**
   * Enable or disable the start wave button
   * @param {boolean} enabled - Whether the button should be enabled
   */
  setStartWaveEnabled(enabled) {
    this.startWaveButton.disabled = !enabled;
    this.startWaveButton.textContent = enabled ? 'Start Wave' : 'Wave In Progress';
  }

  /**
   * Show a game event message
   * @param {string} message - Message to display
   * @param {string} type - Message type ('info', 'warning', 'error')
   */
  showMessage(message, type = 'info') {
    console.log(`[${type}] ${message}`);
    
    // In a future version, we can add an on-screen message display
    // For now, just using console.log
  }
}
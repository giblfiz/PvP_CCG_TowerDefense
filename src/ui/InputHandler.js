/**
 * Handles user input (mouse, touch) for the game
 */
class InputHandler {
  /**
   * Initialize input handler
   * @param {Object} config - Configuration options
   * @param {HTMLElement} config.canvas - Game canvas element
   * @param {Function} config.onCellClick - Callback for cell click
   * @param {Function} config.onPan - Callback for map panning
   * @param {Function} config.onZoom - Callback for map zooming
   * @param {number} config.cellSize - Cell size in pixels
   */
  constructor(config) {
    this.canvas = config.canvas;
    this.onCellClick = config.onCellClick;
    this.onPan = config.onPan;
    this.onZoom = config.onZoom;
    this.cellSize = config.cellSize || 40;
    
    // State tracking
    this.isPanning = false;
    this.lastPanPoint = null;
    this.isTouchZooming = false;
    this.lastTouchDistance = 0;
    this.viewportScale = 1;
    this.viewportX = 0;
    this.viewportY = 0;
    
    // Initialize event listeners
    this.initMouseEvents();
    this.initTouchEvents();
    this.initWheelEvents();
  }

  /**
   * Initialize mouse event listeners
   */
  initMouseEvents() {
    // Mouse down
    this.canvas.addEventListener('mousedown', (e) => {
      // Right button or modifier key = panning
      if (e.button === 2 || e.ctrlKey || e.shiftKey) {
        this.startPanning(e.clientX, e.clientY);
        e.preventDefault();
      }
    });
    
    // Mouse move
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isPanning) {
        this.updatePanning(e.clientX, e.clientY);
        e.preventDefault();
      }
    });
    
    // Mouse up
    window.addEventListener('mouseup', (e) => {
      if (this.isPanning) {
        this.stopPanning();
        e.preventDefault();
      }
    });
    
    // Click (processed on mouseup to prevent click after pan)
    this.canvas.addEventListener('click', (e) => {
      if (!this.wasPanning) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.handleCellClick(x, y);
      }
    });
    
    // Prevent context menu
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  /**
   * Initialize touch event listeners
   */
  initTouchEvents() {
    // Touch start
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        // Single touch = potential click or pan
        const touch = e.touches[0];
        this.startPanning(touch.clientX, touch.clientY);
      } else if (e.touches.length === 2) {
        // Two touches = pinch zoom
        this.startTouchZoom(e.touches);
      }
      e.preventDefault();
    }, { passive: false });
    
    // Touch move
    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && this.isPanning) {
        const touch = e.touches[0];
        this.updatePanning(touch.clientX, touch.clientY);
      } else if (e.touches.length === 2 && this.isTouchZooming) {
        this.updateTouchZoom(e.touches);
      }
      e.preventDefault();
    }, { passive: false });
    
    // Touch end
    this.canvas.addEventListener('touchend', (e) => {
      if (this.isPanning) {
        // Check if this was a tap (short touch)
        const wasTap = !this.wasPanning && e.changedTouches.length === 1;
        this.stopPanning();
        
        if (wasTap) {
          const touch = e.changedTouches[0];
          const rect = this.canvas.getBoundingClientRect();
          const x = touch.clientX - rect.left;
          const y = touch.clientY - rect.top;
          this.handleCellClick(x, y);
        }
      }
      
      if (this.isTouchZooming && e.touches.length < 2) {
        this.stopTouchZoom();
      }
      
      e.preventDefault();
    }, { passive: false });
  }

  /**
   * Initialize mouse wheel events for zooming
   */
  initWheelEvents() {
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      
      // Determine zoom direction and factor
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      
      // Get mouse position relative to canvas for zoom centering
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      this.handleZoom(zoomFactor, mouseX, mouseY);
    }, { passive: false });
  }

  /**
   * Start panning operation
   * @param {number} x - Starting X coordinate
   * @param {number} y - Starting Y coordinate
   */
  startPanning(x, y) {
    this.isPanning = true;
    this.wasPanning = false;
    this.lastPanPoint = { x, y };
  }

  /**
   * Update panning operation
   * @param {number} x - Current X coordinate
   * @param {number} y - Current Y coordinate
   */
  updatePanning(x, y) {
    if (!this.isPanning || !this.lastPanPoint) return;
    
    const dx = x - this.lastPanPoint.x;
    const dy = y - this.lastPanPoint.y;
    
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      this.wasPanning = true;
    }
    
    this.viewportX += dx;
    this.viewportY += dy;
    
    if (this.onPan) {
      this.onPan({
        x: this.viewportX,
        y: this.viewportY
      });
    }
    
    this.lastPanPoint = { x, y };
  }

  /**
   * Stop panning operation
   */
  stopPanning() {
    this.isPanning = false;
    this.lastPanPoint = null;
  }

  /**
   * Start touch zoom operation
   * @param {TouchList} touches - Current touches
   */
  startTouchZoom(touches) {
    this.isTouchZooming = true;
    this.lastTouchDistance = this.getTouchDistance(touches);
  }

  /**
   * Update touch zoom operation
   * @param {TouchList} touches - Current touches
   */
  updateTouchZoom(touches) {
    if (!this.isTouchZooming) return;
    
    const currentDistance = this.getTouchDistance(touches);
    const zoomFactor = currentDistance / this.lastTouchDistance;
    
    if (zoomFactor !== 1) {
      // Calculate center point of pinch
      const centerX = (touches[0].clientX + touches[1].clientX) / 2;
      const centerY = (touches[0].clientY + touches[1].clientY) / 2;
      
      // Get position relative to canvas
      const rect = this.canvas.getBoundingClientRect();
      const pinchCenterX = centerX - rect.left;
      const pinchCenterY = centerY - rect.top;
      
      this.handleZoom(zoomFactor, pinchCenterX, pinchCenterY);
      this.lastTouchDistance = currentDistance;
    }
  }

  /**
   * Stop touch zoom operation
   */
  stopTouchZoom() {
    this.isTouchZooming = false;
    this.lastTouchDistance = 0;
  }

  /**
   * Get distance between two touch points
   * @param {TouchList} touches - Touch points
   * @returns {number} Distance between touches
   */
  getTouchDistance(touches) {
    if (touches.length < 2) return 0;
    
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Handle zoom operation
   * @param {number} factor - Zoom factor
   * @param {number} centerX - Zoom center X coordinate
   * @param {number} centerY - Zoom center Y coordinate
   */
  handleZoom(factor, centerX, centerY) {
    // Calculate new scale with limits
    const oldScale = this.viewportScale;
    const newScale = Math.max(0.5, Math.min(3, oldScale * factor));
    
    // If no actual change, exit early
    if (newScale === oldScale) return;
    
    // Calculate new viewport position
    // This keeps the point under the mouse/finger at the same position
    this.viewportX = centerX - (centerX - this.viewportX) * (newScale / oldScale);
    this.viewportY = centerY - (centerY - this.viewportY) * (newScale / oldScale);
    this.viewportScale = newScale;
    
    if (this.onZoom) {
      this.onZoom({
        scale: this.viewportScale,
        x: this.viewportX,
        y: this.viewportY
      });
    }
  }

  /**
   * Handle click on a cell
   * @param {number} x - X coordinate on canvas
   * @param {number} y - Y coordinate on canvas
   */
  handleCellClick(x, y) {
    // Convert from screen coordinates to grid coordinates
    // Account for panning and zooming
    const gridX = Math.floor((x - this.viewportX) / (this.cellSize * this.viewportScale));
    const gridY = Math.floor((y - this.viewportY) / (this.cellSize * this.viewportScale));
    
    if (this.onCellClick) {
      this.onCellClick({ x: gridX, y: gridY });
    }
  }

  /**
   * Get the viewport state
   * @returns {Object} Current viewport state
   */
  getViewport() {
    return {
      x: this.viewportX,
      y: this.viewportY,
      scale: this.viewportScale
    };
  }
}
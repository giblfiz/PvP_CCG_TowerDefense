# Pixi.js Quick Reference

Version: 7.4.0

## Basic Setup

```javascript
// Create a Pixi Application
const app = new PIXI.Application({
  width: 800,
  height: 600,
  backgroundColor: 0x1099bb,
});

// Add the canvas to the HTML document
document.body.appendChild(app.view);
```

## Sprites

```javascript
// Load an image and create a sprite
const texture = PIXI.Texture.from('path/to/image.png');
const sprite = new PIXI.Sprite(texture);

// Position the sprite
sprite.x = 200;
sprite.y = 200;

// Scale the sprite
sprite.scale.x = 0.5;
sprite.scale.y = 0.5;

// Rotate the sprite (in radians)
sprite.rotation = Math.PI / 4; // 45 degrees

// Add the sprite to the stage
app.stage.addChild(sprite);
```

## Animation

```javascript
// Animation loop
app.ticker.add((delta) => {
  // Update game state
  sprite.rotation += 0.01 * delta;
});
```

## Text

```javascript
// Create text
const style = new PIXI.TextStyle({
  fontFamily: 'Arial',
  fontSize: 36,
  fill: '#ffffff',
  stroke: '#000000',
  strokeThickness: 4,
});
const text = new PIXI.Text('Hello Pixi!', style);
text.x = 50;
text.y = 50;
app.stage.addChild(text);
```

## Graphics

```javascript
// Draw shapes
const graphics = new PIXI.Graphics();

// Draw a rectangle
graphics.beginFill(0xFF0000);
graphics.drawRect(50, 50, 100, 100);
graphics.endFill();

// Draw a circle
graphics.beginFill(0x00FF00);
graphics.drawCircle(200, 200, 50);
graphics.endFill();

// Draw a line
graphics.lineStyle(5, 0xFFFFFF, 1);
graphics.moveTo(100, 100);
graphics.lineTo(200, 200);

app.stage.addChild(graphics);
```

## Container

```javascript
// Group objects together
const container = new PIXI.Container();

// Add sprites to the container
container.addChild(sprite1);
container.addChild(sprite2);

// Position the container
container.x = 100;
container.y = 100;

// Scale the container (affects all children)
container.scale.x = 0.5;
container.scale.y = 0.5;

app.stage.addChild(container);
```

## Resources

- [Official Documentation](https://pixijs.com/guides)
- [API Documentation](https://pixijs.download/v7.4.0/docs/index.html)
- [GitHub Repository](https://github.com/pixijs/pixijs)
- [Examples](https://pixijs.io/examples/)

## Notes

This vendored version is v7.4.0. If you need additional features:
- pixi.js - The full version with all features
- pixi.min.js - Minified version for production
- pixi.d.ts - TypeScript definitions for IDE intellisense
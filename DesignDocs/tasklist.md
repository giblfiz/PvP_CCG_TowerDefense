# Refactoring Tasklist

## Completed Tasks

1. **Extract CSS to external file**
   - Created a new CSS file at `css/phaser-game.css`
   - Moved all CSS styles from `phaser-map.html` to the new file
   - Added a link element in `phaser-map.html` to reference the external CSS file

2. **Extract Mook class to external file**
   - Created a new class `PhaserMook` in `src/core/PhaserMook.js`
   - Moved Mook class definition from `phaser-map.html` to the new file
   - Added script tag to load the new file
   - Created alias `Mook = PhaserMook` to maintain compatibility

3. **Extract MapScene class to external file**
   - Created a new file `src/phaser/PhaserGame.js`
   - Moved MapScene class definition from `phaser-map.html` to the new file
   - Moved game initialization code to the new file
   - Added script tag to load the new file
   - Updated phaser-map.html to use the external MapScene class

## Current Code Structure

The current `phaser-map.html` file now contains:
- HTML structure
- JavaScript error handling
- External CSS and JavaScript file references (now including PhaserGame.js)
- JavaScript game class definitions (Tower, TDMap, GameState)
- Simplified game initialization that uses the external MapScene class

## Planned Next Steps

1. **Extract remaining JavaScript game classes**
   - Move Tower class to `src/core/Tower.js`
   - Move TDMap class to `src/core/Map.js`
   - Move GameState class to `src/core/GameState.js`

2. **Refactor MapScene class**
   - The MapScene class is still quite large (1700+ lines)
   - Should be broken down into smaller, more manageable components
   - Consider extracting rendering, camera controls, tower placement, and mook handling into separate modules

2. **Update HTML file to reference external JavaScript files**
   - Add script tags to load each JavaScript file
   - Ensure proper loading order of dependencies

3. **Add modular imports/exports**
   - Add appropriate export statements to each JavaScript file
   - Add import statements to resolve dependencies between files

4. **Refactor game initialization**
   - Move game initialization code to `src/Game.js`
   - Update HTML file to reference this file

5. **Testing Strategy**
   - After each small change, verify the game still works
   - Implement the changes one file at a time
   - Start with the base classes (Mook, Tower) that have fewer dependencies
   - Move to classes with more dependencies (TDMap, GameState, MapScene)

## Notes

- Each step should be very small and tested before moving on
- Keep the original functionality working at all times
- The existing unit and integration tests should be leveraged to verify correctness
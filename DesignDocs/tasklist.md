# Refactoring Tasklist

## Completed Tasks

1. **Extract CSS to external file**
   - Created a new CSS file at `css/phaser-game.css`
   - Moved all CSS styles from `phaser-map.html` to the new file
   - Added a link element in `phaser-map.html` to reference the external CSS file

## Current Code Structure

The current `phaser-map.html` file is a monolithic file containing:
- HTML structure
- CSS styles (now moved to external file)
- JavaScript error handling
- JavaScript game class definitions (Mook, Tower, TDMap, GameState, MapScene)
- Game initialization code

## Planned Next Steps

1. **Extract JavaScript game classes**
   - Move Mook class to `src/core/Mook.js`
   - Move Tower class to `src/core/Tower.js`
   - Move TDMap class to `src/core/Map.js`
   - Move GameState class to `src/core/GameState.js`
   - Move MapScene class to `src/phaser/PhaserGame.js`

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
# Game Overview & Architecture Document (v0.1)

## 1. Overview

* **Game Concept:** A 1v1 competitive game blending classic Tower Defense (TD) mechanics with a strategic Deckbuilding layer. Players defend against waves of "mooks" while simultaneously influencing the waves sent against their opponent through card play.
* **Core Loop:**
    1.  *(Between Games)* Player builds/modifies a deck of cards.
    2.  *(Match Start)* Player is matched with an opponent.
    3.  *(Start of Wave)* Player draws a hand of cards (e.g., Draw 5, Keep 3).
    4.  *(Build Phase)* Player spends currency ($) to build towers, restricted to the *types* indicated on the kept cards for that wave. Playing cards also designates *mook types* to be added to the opponent's next wave.
    5.  *(Action Phase)* Player defends against incoming mooks sent by the opponent (based on their previous card plays and potentially "Attack Towers"). Mooks sent by the player spawn against the opponent.
    6.  Repeat steps 3-5 with increasing difficulty/resources.
    7.  Winner is determined by outlasting the opponent (e.g., reducing opponent health to 0 or surviving longer).
* **Key Differentiators:**
    * **Indirect PvP:** Focus on out-building and overwhelming the opponent's defense via mook waves, not direct attacks.
    * **Dual-Nature Cards:** Each card enables building a specific Tower type *and* sends a specific Mook type/group to the opponent.
    * **Cumulative Mook Waves:** Mooks designated by cards are added cumulatively to subsequent waves sent to the opponent.
    * **Attack Towers:** Special towers that persistently add mooks to the opponent's waves each round they are active.
* **Target Vibe:** Accessible yet strategic. Aims for the "fun toy" or "puzzle duel" feel rather than a sprawling AAA experience. Matches should be relatively fast-paced, discouraging extreme turtling/attrition.

## 2. Target Platform & Audience

* **Primary Platform:** Web Browsers (via HTML5, JavaScript, PixiJS).
* **Secondary Platform:** Potential for Mobile (iOS/Android) via web view wrappers (e.g., Capacitor) if performance allows. Desktop builds also possible via wrappers (e.g., Electron).
* **Target Audience:** Players who enjoy Tower Defense, Deckbuilding games (like Slay the Spire, MtG Arena), competitive strategy games, and are open to indirect PvP interaction.

## 3. Core Gameplay Mechanics

* **Tower Defense:**
    * **Pathing:** Mooks follow predefined paths.
    * **Towers:** Various types including basic damage, elemental affinities (weak/strong vs specific mook flavors), spell-granting, upgrade-only towers (built on existing ones), and persistent "Attack Towers". Built by spending currency ($).
    * **Mooks:** Various types including ground, flying, invisible, mooks that attack towers, and elemental flavors. Stats include health, speed, resistances.
    * **Currency:** Earned passively per wave and/or actively per mook kill. Spent to build towers.
* **Card System:**
    * **Deckbuilding:** Players construct decks (size TBD) between matches from available cards.
    * **Card Acquisition:** TBD (Assume all cards available initially for F2P "Free Beer" model, or simple unlock system).
    * **In-Game Draw:** Draw X, Keep Y mechanic at wave start (X/Y may scale).
    * **Functionality:** Kept cards permit building corresponding Tower types (spending $) and add corresponding Mook types to the opponent's *next* wave. This mook contribution is cumulative across waves.
* **PvP Interaction:**
    * **Asynchronous:** Game states synchronized via backend with noticeable lag (~1s delay acceptable). No requirement for real-time, low-latency networking.
    * **Visibility:** Players see key opponent stats (Health, $, Tower Count, Mook Value on Field) continuously. Option to view opponent's board layout, updated asynchronously ("Fog of War" effect due to delay).
    * **Win Condition:** Typically last player standing (opponent health reaches 0).

## 4. Technical Architecture

* **Client:**
    * Language: JavaScript (ES6+)
    * Rendering: PixiJS library (over HTML Canvas/WebGL)
    * Environment: Web Browser
* **Backend:**
    * Language: PHP
    * Database: MySQL
    * Purpose: Player accounts, deck storage, matchmaking (simple), asynchronous game state relay between opponents.
* **Communication Protocol:**
    * Client <-> Backend: HTTPS requests (likely a simple RESTful API). E.g., `POST /api/game/action`, `GET /api/game/opponent_state`.
* **Development Tooling:**
    * Code Generation: Anthropic Claude via API/CLI.
    * Version Control: Git
    * Testing: TDD approach using a JS testing framework (e.g., Jest, Mocha).
    * Linting: ESLint with a chosen style guide.
    * Build Process: Minimal build tooling initially (potentially just Node.js scripts or Vite/esbuild for bundling/dev server). Dependencies preferably vendored if small, managed via `package.json` otherwise.

## 5. Development Process & Philosophy

* **Methodology:** Iterative, MVP-focused. Build foundational features first, then layer complexity.
* **Feature Rollout:** 0) Foundation -> 1) Core TD -> 2) Balancer -> 3) Cards -> 4) Persistence -> 5) PvP.
* **Claude Workflow:** Success depends on extremely clear, well-defined architectural specifications, interfaces, and atomic tasks provided to Claude. Rigorous testing (automated where possible) is essential.
* **Core Tenets ("Allergies"):**
    * Monetization: Free ("Free Beer"). No microtransactions, ads, etc.
    * Dependencies: Minimize external libraries. Prefer vendoring small libs. Avoid large, opinionated frameworks (React, Angular, etc.). Keep build simple.
    * Tooling: Favor small, sharp, command-line friendly tools.

## 6. Key Challenges & Risks

* **Game Balance:** The central challenge. Balancing card costs/effects (Tower & Mook sides), mook scaling (base + cumulative + Attack Towers), income rate, and overall game pacing.
* **UI/UX:** Presenting necessary game state (own board, opponent state, card choices) clearly and intuitively, especially for potential mobile viewports.
* **Dynamic Balancer:** Designing effective AI players, robust simulation environment, and meaningful parameter adjustment logic.
* **Claude Workflow:** Ensuring quality/correctness of generated code, debugging challenges, maintaining architectural integrity, creating effective prompts/specs.
* **Scope Management:** Resisting feature creep to keep the project achievable within the "toy" game vision.

## 7. Dynamic Game Balancer (High-Level Plan)

* **Purpose:** To automate game balancing by simulating gameplay and adjusting parameters based on outcomes.
* **Components:**
    * **Headless Game Engine:** Ability to run the core game logic without rendering.
    * **AI Player(s):** Simple scripted AI capable of basic decision-making (e.g., prioritizing certain towers, spending currency, playing cards based on simple heuristics). Multiple AI profiles might be needed.
    * **Simulation Runner:** Orchestrates running many AI vs AI matches.
    * **Data Collector:** Records key metrics per match (winner, match length, towers built, cards played, final health, etc.).
    * **Parameter Tuner:** Analyzes aggregated data and adjusts game parameters (stored likely in config files or database - e.g., Tower Costs, Mook HP, Card Effects) based on predefined rules or simple algorithms.
* **Placement:** To be developed *after* the core single-player TD is functional and *before* PvP is enabled.

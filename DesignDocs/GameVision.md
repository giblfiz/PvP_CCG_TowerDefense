# Core Concept & Systems Design - PvP TD Deckbuilder (Working Title)

**Version:** 0.1
**Date:** May 1, 2025

## 1. Introduction / Game Vision

* **Overview:** A 1-versus-1 competitive Tower Defense (TD) game featuring deckbuilding as a core mechanic. Players defend against waves of enemies on their own track while simultaneously influencing the waves attacking their opponent through card play and tower choices.
* **Core Pillars:**
    * Strategic, indirect Player-vs-Player interaction.
    * Unique, cohesive theme (1950s B-Movie/Pulp) and flavor mechanics.
    * Emergent Rock-Paper-Scissors dynamics based on distinct mechanics, not just stats.
* **Target Vibe:** Focused, engaging "toy-like" fun rather than AAA complexity. Embraces a potentially campy, pulpy 1950s B-movie aesthetic. Designed initially for Web (desktop/mobile browsers), potentially wrapped for native mobile later. Free-to-play ("Free Beer" model, no microtransactions).
* **Development Philosophy:** Iterative development starting with a Minimum Viable Product (MVP). Leverages AI (`ccode`) for code generation based on detailed specifications and TDD. Prioritizes simple, focused tools, a clear architecture, and maintainable code (linting, testing).

## 2. Core Gameplay Loop

1.  **Deckbuilding (Between Games):** Players construct decks from available cards. Each card represents **both**:
    * Permission to build a specific **Tower Type** during a wave.
    * A specific **Mook Type/Group** to add to the wave sent against the opponent.
2.  **Match Start:** Two players are matched and presented with symmetrical TD tracks. Players start with initial health and currency.
3.  **Wave Cycle:** The game proceeds in waves. Each wave consists of:
    * **Income Phase:** Players earn baseline currency (`$`) for completing the previous wave, plus bonus currency per mook killed during that wave.
    * **Draw Phase:** Players draw a number of cards from their deck (e.g., Draw 5).
    * **Strategy Phase:** Players choose which cards to keep (e.g., Keep 3). Numbers may scale in later waves.
    * **Build Phase:** Players can build towers, spending currency (`$`). They are *only* allowed to build the Tower Types corresponding to the cards they kept this turn (plus potentially basic universal towers if designed). Towers have placement restrictions based on terrain.
    * **Send Mooks Phase:** The Mook Types/Groups corresponding to the kept cards are added to the pool of mooks that will spawn against the opponent this wave. This effect is **cumulative** – mooks from previous waves' card plays also contribute to the current opponent wave strength.
    * **Action Phase:** Mooks spawn and proceed along their path (or offroad). Towers automatically engage targets based on their type/targeting rules, consuming ammo where applicable. Player-activated tower spells become available based on cooldowns.
4.  **PvP Interaction:** Primarily indirect. Success comes from outlasting the opponent by building a defense strong enough to handle the mooks *they* send (via cards and potentially Attack Towers) while sending mook combinations that overwhelm *their* defenses.
    * Players have persistent visibility of opponent's core stats (e.g., Health, Currency).
    * Players can view the opponent's board, updated asynchronously (~1 second delay) to gauge their strategy and tower setup.
5.  **Win Condition:** (Tentative) The last player with Health Points remaining wins. (Alternatively: First player to leak X mooks loses).

## 3. Theme & Aesthetics

* **Overall Theme:** Unified **1950s B-Movie / Atomic Age Pulp**. Embraces the aesthetics, tropes, and anxieties of the era.
* **Factions / Thematic Groups:** Units and towers belong to one of three thematic groups:
    * **WW2:** Representing the conventional military technology, gritty realism, and recent history context of the 50s (GIs, tanks, artillery, early Cold War tech).
    * **B-Movie Horror:** Representing classic 50s horror tropes (atomic mutants, giant insects, creature features, mad science, blobs, potentially stylized classic monsters like vampires/mummies).
    * **50s Sci-Fi Aliens:** Representing the Atomic Age sci-fi boom (flying saucers, ray guns, little green men, clunky robots, invaders from Mars).
* **Tone:** Intentionally pulpy, potentially campy and humorous, leaning into B-movie charm. Not taking itself overly seriously.
* **Art Style:** (To Be Defined) Suggestions: Pulp comic illustration, retro-futurism, potentially incorporating elements of noir or black-and-white horror visuals. Consistency across factions is key.

## 4. Core Systems & Mechanics

* **Flavors (Mechanic-Driven Rock-Paper-Scissors):** A system of three flavors determines strengths and weaknesses based on distinct mechanics:
    * **Psionic (Psy):**
        * *Mechanic:* Focuses on **Confusion/Mind Control**. Towers/Mooks may turn enemy mooks against their allies, temporarily freeze enemy towers, or drain tower ammo. Includes supernatural mental effects (hypnosis, curses) fitting the Horror theme.
    * **Atomic:**
        * *Mechanic:* Focuses on **Area Denial (AoE Auras) / Long Range / High Power**. Towers/Mooks may create persistent damaging Auras, utilize long-range beam attacks, or trigger large AoE blasts. Can inflict a secondary "Radiation" status effect (e.g., Damage-over-Time, debuff).
    * **Impact:**
        * *Mechanic:* Focuses on **Force/Toughness/Numbers**. Represents conventional firepower, brute strength, high hit points, or swarms. Towers emphasize direct damage or durability; Mooks emphasize high HP, large numbers, or strong physical attacks.
    * **RPS Loop:** **Psionic > Impact > Atomic > Psionic**
        * *Logic:* Mind Control neutralizes brute Force/Numbers; Force/Numbers can overwhelm/destroy Atomic sources/emitters; Atomic energy/AoE disrupts/bypasses Mind Control.

* **Tower Mechanics:**
    * **Health Points (HP):** Towers can be damaged and destroyed, requiring defense or repair.
    * **Ammunition:** Most towers have limited ammo, sufficient for several waves but requiring replenishment (via support towers or other means) for sustained effectiveness. Default ammo lasts a few waves.
    * **Targeting:** Each tower type has a fixed, built-in targeting priority (e.g., First, Strongest Air, Lowest HP). No per-tower player control over targeting.
    * **Faction Synergy:** Support effects (buffs, ammo resupply) are generally more effective when applied to towers of the same faction (WW2, Horror, Alien).
    * **Support Towers:** Dedicated towers providing buffs (damage, range, speed), debuffs, ammo replenishment, HP repair, detection (for invisible mooks), etc.
    * **Spell Towers:** Specific towers grant the player a manually-activated ability (e.g., "Atomic Bomb", "Mass Psionic Freeze"). These abilities consume tower ammo and have significant cooldowns.
    * **Attack Towers (PvP Placeholder):** Towers whose primary function is to enhance the mooks being sent to the opponent (e.g., increase mook speed, HP, or quantity). Implementation deferred.

* **Mook Mechanics:**
    * **Standard:** Follow defined paths on the ground.
    * **Flying:** Ignore ground paths, require specific anti-air targeting.
    * **Invisible:** Cannot be targeted by most single-target attacks unless revealed by a Detector tower/effect. Still vulnerable to untargeted AoE/Auras (e.g., Atomic fields).
    * **Offroad:** Ground units that ignore defined paths and move freely across passable terrain (cannot pass through towers/blockers).
    * **Tower Attackers:** Specific mook types prioritize attacking towers within range.
    * **Flavor Interaction:** Mooks possess defensive properties based on the flavor RPS (e.g., Impact mooks resist Atomic effects but are vulnerable to Psionic control). May have innate flavored attacks.

* **Economy:**
    * Players start with a set amount of currency (`$`).
    * Income is earned both as a lump sum at the end of each successfully defended wave (*base amount*) *and* as a smaller bonus per mook killed (*bonus amount*).

## 5. Unit Concepts (Initial Examples)

* **WW2:**
    * *Mooks:* GI Grunt (Impact), Jeep (Impact, Fast).
    * *Towers:* Machine Gun Nest (Impact), Propaganda Tower (Psionic Effect).
* **Horror:**
    * *Mooks:* Giant Ant (Impact Swarm), Floating Brain (Psionic Flyer).
    * *Towers:* Spitter Plant (Impact Attack), Radiation Pit (Atomic Aura).
* **Aliens:**
    * *Mooks:* Alien Grunt (Atomic Ranged), Clunky Robot (Impact Melee).
    * *Towers:* Ray Gun Turret (Atomic Attack), Mind Control Spire (Psionic Effect).

## 6. Technology Stack (Development)

* **Client:** `JavaScript` (ES2020+), `Phaser 3` game framework.
* **Backend:** `PHP` (8.1+), `MySQL` (for player data, decks, async match state).
* **Development Tooling:** `Node.js`/`npm`, `ESLint`, `Jest` (JS testing), `Composer`/`PHPUnit` (PHP testing), `Git` (version control), `http-server` (or similar) for local testing.
* **AI Assistance:** `ccode` (Anthropic's tool-using model) integrated into the development workflow for code generation, requiring clear task definitions, TDD, and potentially file system interaction tools provided by the user's harness.

## 7. Open Questions / Future Considerations

* Detailed card mechanics (costs, draw/keep specifics, rarities?).
* Card acquisition system and deckbuilding interface design.
* Implementation details for the Tower Upgrade system (deferred).
* Precise stat balancing for all units, towers, and flavors.
* Map design: Definition of paths, placement grids, offroad terrain properties.
* Finalized Win/Loss conditions and match flow details.
* Specific Art Style guide.
* PvP matchmaking, rating, and communication features.
* Details of "Attack Tower" mechanics for PvP.

---
layout: opencs
title: Tower Defense
permalink: /gamify/towerdefense
---

<div id="gameContainer">
    <div id="promptDropDown" class="promptDropDown" style="z-index: 9999"></div>
    <!-- GameEnv will create canvas dynamically -->
</div>

<script type="module">
    // Tower Defense Game assets locations
    import Core from "{{site.baseurl}}/assets/js/GameEnginev1.1/essentials/Game.js";
    import GameControl from "{{site.baseurl}}/assets/js/GameEnginev1.1/essentials/GameControl.js";
    import GameLevelTowerDefense from "{{site.baseurl}}/assets/js/GameEnginev1.1/GameLevelTowerDefense.js";
    import { pythonURI, javaURI, fetchOptions } from '{{site.baseurl}}/assets/js/api/config.js';

    const gameLevelClasses = [GameLevelTowerDefense];

    // Web Server Environment data
    const environment = {
        path: "{{site.baseurl}}",
        pythonURI: pythonURI,
        javaURI: javaURI,
        fetchOptions: fetchOptions,
        gameContainer: document.getElementById("gameContainer"),
        gameLevelClasses: gameLevelClasses
    }
    // Launch Tower Defense Game using the central core and GameControl
    Core.main(environment, GameControl);
</script>

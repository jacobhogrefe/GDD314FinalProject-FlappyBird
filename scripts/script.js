/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 */

//==============================================================================
// Welcome to scripting in Meta Spark Studio! Helpful links:
//
// Scripting Basics - https://fb.me/spark-scripting-basics
// Reactive Programming - https://fb.me/spark-reactive-programming
// Scripting Object Reference - https://fb.me/spark-scripting-reference
// Changelogs - https://fb.me/spark-changelog
//
// Meta Spark Studio extension for VS Code - https://fb.me/spark-vscode-plugin
//
// For projects created with v87 onwards, JavaScript is always executed in strict mode.
//==============================================================================

// How to load in modules
const Scene = require('Scene');
const Patches = require('Patches');
const Persistence = require('Persistence');

// Use export keyword to make a symbol available in scripting debug console
export const Diagnostics = require('Diagnostics');

;(async function () {  // Enables async/await in JS [part 1]

  // To access scene objects
  const [scoreText, highScoreText, scoreNumber, pipePassed] = await Promise.all([
    Scene.root.findFirst('scoreText'),
    Scene.root.findFirst('HighScore'),

    // Takes in the current score and a pulse of whether the pipe was passed or not
    Patches.outputs.get('ScoreNumber'),
    Patches.outputs.getPulse('PassedPipe')
  ]);

  const localStorage = Persistence.local;
  let savedHighScore = 0;
 
  try {
    // get user scope data stored as 'highScore'
    savedHighScore = await localStorage.get('highScore');

    // check if there is a highScore data to be displayed in the console
    if (savedHighScore) {
      Diagnostics.log("Score from previous session: " + savedHighScore.value);
    }
  } catch (error) {
    // display errors in the console
    Diagnostics.log("Error: " + error);
  }

  pipePassed.subscribe(() => {
    try {
      // Attempt to store the data and if successful...
      localStorage.set('highScore', {value: scoreNumber});
    } catch (error) {
      // If not successful output a failure message with the error returned
      Diagnostics.log("Error: " + error);
    }

    scoreText.text = scoreNumber.toString();
    if (savedHighScore && savedHighScore.value > scoreNumber) {
      highScoreText.text = savedHighScore.toString();
      
    } else {
      highScoreText.text = scoreNumber.toString();
    }
  });
})(); // Enables async/await in JS [part 2]

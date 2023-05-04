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
  const [scoreText, highScoreText, endScore, scoreNumber] = await Promise.all([
    // text objects in the scene that need to be updated
    Scene.root.findFirst('scoreText'),
    Scene.root.findFirst('HighScoreText'),
    Scene.root.findFirst('OverScore'),
    // the score scalar that gets tracked
    Patches.outputs.getScalar('ScoreNumber')
  ]);

  const localStorage = Persistence.local;
  let savedHighScore = 0;
 
  // attempts to retrieve the high score data for the user
  try {
    savedHighScore = await localStorage.get('highScore');

    // if the data is retrieved but undefined, it will set the high score to 0
    if (savedHighScore.val == undefined) {
      savedHighScore.val = 0;
    }

    // sets the high score to a text element in the scene so there's never going to be a blank space
    highScoreText.text = "High\nScore: " + savedHighScore.val.toString();

    // check if there is a highScore data to be displayed in the console
    Diagnostics.log("Score from previous session: " + savedHighScore.val);

  } catch (error) {
    // display errors in the console
    Diagnostics.log("Error line 57: " + error);
  }

  // tracks when the score changes
  Patches.outputs.getScalar('ScoreNumber').then(event=> {
      // executes this function when the score changes
      event.monitor().subscribe(function (values) {
         
        // set in game live score and game over screen score
        scoreText.text = "Score: " + values.newValue.toString();
        endScore.text = "Score:\n" + values.newValue.toString();
        Diagnostics.log(values.newValue);

        // check if it's higher than the saved high score
        if (values.newValue > savedHighScore.val) {
          Diagnostics.log("new high: " + values.newValue);
          localStorage.set('highScore', {val: values.newValue});

          highScoreText.text = "High\nScore: " + values.newValue.toString();
        } else {
          Diagnostics.log("old high: " + savedHighScore.val);
        }
     });
  });

})(); // Enables async/await in JS [part 2]
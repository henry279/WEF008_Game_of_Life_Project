let boxColor    = [100, 200, 100];
let strokeColor = [50, 200, 50];
let stableColor = [0, 30, 0]; // Darker color for stable cells
let columns; /* To be determined by window width */
let rows;    /* To be determined by window height */
let currentBoard;
let nextBoard;

let frameRateValue = 5;
let unitLength  = 10;

// Default survival rules: a cell survives if it has 2 or 3 neighbors
let survivalRulesLess = [2]; 
let survivalRulesLarge = [3]; 
// Default reproduction rules: a dead cell becomes alive if it has 3 neighbors
let reproductionRules = [3]; 

function setup() {
  /* Set the canvas to be under the element #canvas*/
  const canvas = createCanvas(windowWidth*0.8, windowHeight - 100);
  canvas.parent(document.querySelector('#canvas'));

  /*Calculate the number of columns and rows */
  columns = floor(width / unitLength);
  rows = floor(height / unitLength);

  /*Making both currentBoard and nextBoard 2-dimensional matrix that has (columns * rows) boxes. */
  currentBoard = [];
  nextBoard = [];
  for (let i = 0; i < columns; i++) {
    currentBoard[i] = [];
    nextBoard[i] = [];
  }

  let survivalruleslessthanInput = document.querySelector('#survival-rules-lessthan');
  survivalruleslessthanInput.addEventListener('input', updateRules);

  let survivalruleslargethanInput = document.querySelector('#survival-rules-largethan');
  survivalruleslargethanInput.addEventListener('input', updateRules);

  let reproductionRulesInput = document.querySelector('#reproduction-rules');
  reproductionRulesInput.addEventListener('input', updateRules);

  updateRules();

  init(); // Set the initial values of the currentBoard and nextBoard
}

/**
 * Initialize/reset the board state
 */
function init() {
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      // let someVariables = <condictions> : <when_true> : <when_false>;
      currentBoard[i][j] = random() > 0.8 ? 1 : 0; // one line if
      nextBoard[i][j] = 0;
    }
  }

    // Adjust the frame rate based on the slider value
    frameRate(frameRateValue);
}

function draw() {
  background(255);
  generate();
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      if (isStable(i, j)) {
        fill(stableColor[0], stableColor[1], stableColor[2]);
      } else if(currentBoard[i][j] == 1) {
        fill(boxColor[0], boxColor[1], boxColor[2]);
      } else {
        fill(255);
      }


      stroke(strokeColor[0], strokeColor[1], strokeColor[2]);
      rect(i * unitLength, j * unitLength, unitLength, unitLength);
    }
  }
}

function generate() {
  //Loop over every single box on the board
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      // Count all living members in the Moore neighborhood(8 boxes surrounding)
      let neighbors = 0;
      for (let i of [-1, 0, 1]) {
        for (let j of [-1, 0, 1]) {
          if (i == 0 && j == 0) {
            // the cell itself is not its own neighbor
            continue;
          }
          // The modulo operator is crucial for wrapping on the edge
          neighbors += currentBoard[(x + i + columns) % columns][(y + j + rows) % rows];
        }
      }
      

      // Rules of Life
      if (currentBoard[x][y] == 1 && neighbors < survivalRulesLess) {
        // Die of Loneliness
        nextBoard[x][y] = 0;
      } else if (currentBoard[x][y] == 1 && neighbors > survivalRulesLarge) {
        // Die of Overpopulation
        nextBoard[x][y] = 0;
      } else if (currentBoard[x][y] == 0 && reproductionRules.includes(neighbors)) {
        // New life due to Reproduction
        nextBoard[x][y] = 1;
      } else {
        // Stasis
        nextBoard[x][y] = currentBoard[x][y];
      }
    }
  }

  // Swap currentBoard and nextBoard
  let temp = currentBoard;
  currentBoard = nextBoard;
  nextBoard = temp;
}

function isStable(x, y) {
  // Check if the cell at (x, y) is stable
  const currentValue = currentBoard[x][y];

  if (currentBoard[x][y] == 1 && currentBoard[x][y] == nextBoard[x][y]) {
    return true;
  } else {
    return false
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight - 100);
  columns = floor(width / unitLength);
  rows = floor(height / unitLength);
  init();
}

function resetGame() {
  init();
}

function countLiveNeighbors(x, y) {
  let count = 0;

  // Check the eight neighboring cells
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      // Skip the current cell
      if (i === 0 && j === 0) {
        continue;
      }

      const neighborX = x + i;
      const neighborY = y + j;

      // Check if the neighboring cell is within the game board boundaries
      if (neighborX >= 0 && neighborX < columns && neighborY >= 0 && neighborY < rows) {
        count += currentBoard[neighborX][neighborY];
      }
    }
  }

  return count;
}

function handleSliderChange() {
  frameRateValue = Number(document.querySelector('#framerate-bar').value);
  document.querySelector('#framerate-value').textContent = frameRateValue;

  unitLength = Number(document.querySelector('#unit-length-bar').value);
  document.querySelector('#unit-length-value').textContent = unitLength;

  // Get the selected color from the dropdown menu
  let select = document.querySelector('#cell-color');
  let selectedColor;

  if (select.value == "ByNoOfNeiB"){
    selectedColor = [100,250,150]
  } else {
    selectedColor = select.value.split(',').map(Number);
  }

  // Update the boxColor variable
  boxColor = selectedColor;


  // Control on and off for stable-color
  let selectstable = document.querySelector('#stable-color');

  if (selectstable.value == "On"){
    stableColor = [0, 30, 0];
  } else if (selectstable.value == "Off"){
    stableColor = boxColor
  }


  // Get the selected color from the dropdown menu
  let selectstroke = document.querySelector('#stroke-color');
  let selectedStrokeColor = selectstroke.value.split(',').map(Number);

  // Update the boxColor variable
 strokeColor = selectedStrokeColor;

  init();
}




/**
 * When mouse is dragged
 */
function mouseDragged() {
    /**
     * If the mouse coordinate is outside the board
     */
    if (mouseX > unitLength * columns || mouseY > unitLength * rows) {
        return;
    }
    const x = Math.floor(mouseX / unitLength);
    const y = Math.floor(mouseY / unitLength);
    currentBoard[x][y] = 1;
    fill(boxColor);
    stroke(strokeColor);
    rect(x * unitLength, y * unitLength, unitLength, unitLength);
}

/**
 * When mouse is pressed
 */
function mousePressed() {
    noLoop();
    mouseDragged();
}

/**
 * When mouse is released
 */
function mouseReleased() {
    loop();
}

function updateRules() {
  let survivalruleslessthanInput = document.querySelector('#survival-rules-lessthan').value;
  survivalRulesLess = survivalruleslessthanInput.split(',').map(rule => parseInt(rule.trim()));

  let survivalruleslargethanInput = document.querySelector('#survival-rules-largethan').value;
  survivalRulesLarge = survivalruleslargethanInput.split(',').map(rule => parseInt(rule.trim()));

  let reproductionRulesInput = document.querySelector('#reproduction-rules').value;
  reproductionRules = reproductionRulesInput.split(',').map(rule => parseInt(rule.trim()));
}


document.querySelector('#reset-game').addEventListener('click', resetGame);
document.querySelector('#framerate-bar').addEventListener('input', handleSliderChange);
document.querySelector('#unit-length-bar').addEventListener('input', handleSliderChange);
document.querySelector('#stop-button').addEventListener('click', stopGame);
document.querySelector('#continue-button').addEventListener('click', continueGame);
document.querySelector('#cell-color').addEventListener('change', handleSliderChange);
document.querySelector('#stroke-color').addEventListener('change', handleSliderChange);
document.querySelector('#stable-color').addEventListener('change', handleSliderChange);

function stopGame() {
  noLoop();
}

function continueGame() {
  loop();
}
const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Events = Matter.Events;

let engine;
let world;

const exaustClouds = 25;

let car;
let computerCar;

let balls = [];
let walls = [];
let bumpers = [];
let pockets = [];

let visibleWallOffset;

let ballComputerIsFocusedOn;
let computersBallType = 'solid';

let gameStarted = false;

let replayButton;

let countdownMode = true;
let countdownText;
let eightBallEarthquake = false;

function resetGame() {
  replayButton.hide();

  // remove previous balls and setup new balls
  balls.forEach(b => {
    World.remove(world, b.body);
  })
  balls = [];
  setupRackOfBalls();

  updateCountdownOverlay();

  // remove previous cars and setup new cars
  World.remove(world, car.body);
  World.remove(world, computerCar.body);
  car = new Car(isPlayer = true)
  computerCar = new Car(isPlayer = false);
  computerCar.accelerating(true);
}

function setup() {
  const h = min(window.innerHeight, window.innerWidth / 2);
  // keep table dimensions nice
  const w = min(window.innerWidth, h * 2);
  createCanvas(w, h);

  visibleWallOffset = width/32;

  engine = Engine.create();
  world = engine.world;

  // disable matter.js gravity (top-down game)
  engine.world.gravity.y = 0;

  //collision detection (pockets should make balls disappear)
  Events.on(engine, 'collisionStart', collision);

  addWalls();
  addBumpers();
  addPockets();

  car = new Car(isPlayer = true)

  // computer always accelerates (TODO: AI)
  computerCar = new Car(isPlayer = false);
  computerCar.accelerating(true);

  replayButton = createButton("Play Again");
  replayButton.addClass('replay-button');
  replayButton.hide();
  replayButton.mousePressed(resetGame);

  const playButton = select('#play');
  const startScreen = select('#start-screen');
  playButton.mouseClicked(function() {
    startScreen.hide();
    setupRackOfBalls();
    updateCountdownOverlay();
    gameStarted = true;
  });
}

function collision(event) {
  const pairs = event.pairs;
  for (let i = 0; i < pairs.length; i++) {
    const labelA = pairs[i].bodyA.label;
    const labelB = pairs[i].bodyB.label;
    if (labelA === 'pocket' && labelB === 'ball') {
      removeBall(pairs[i].bodyB);
    } else if (labelA === 'ball' && labelB === 'pocket') {
      removeBall(pairs[i].bodyA);
    } else if (labelA === 'eightBall' && labelB === 'car') {
      eightBallHit(pairs[i].bodyB);
    } else if (labelA === 'car' && labelB === 'eightBall') {
      eightBallHit(pairs[i].bodyA);
    } else if ((labelA === 'ball' || labelA === 'eightBall') &&
                labelB === 'wall') {
      // matterjs BUG: ball has gone through bumper
      resetBallPosition(pairs[i].bodyA);
    } else if ((labelB === 'ball' || labelB === 'eightBall') &&
                labelA === 'wall') {
      // matterjs BUG: ball has gone through bumper
      resetBallPosition(pairs[i].bodyB);
    }
  }
}

function resetBallPosition(ballBody) {
  const ballId = ballBody.id;
  const matches = balls.filter(b => b.body.id === ballId);
  const ball = matches.length > 0 ? matches[0] : null;
  if (ball) {
    setBallBackInBounds(ball);
  }
}

function setBallBackInBounds(ball) {
  const visibleWallOffset = width/32;
  const bumperThickness = width/108;
  const edgeOffset = visibleWallOffset + bumperThickness;
  const xPos = ball.body.position.x;
  const yPos = ball.body.position.y;
  let x = xPos, y = yPos;
  if (xPos < edgeOffset) {
    x = edgeOffset + 1;
  }
  if (xPos > width - edgeOffset) {
    x = width - edgeOffset - 1
  }
  if (yPos < edgeOffset) {
    y = edgeOffset + 1
  }
  if (yPos > height - edgeOffset) {
    y = height - edgeOffset - 1
  }
  Body.setPosition(ball.body, { x, y });
}

function eightBallHit(carBody) {
  const playerId = car.body.id;
  const computerId = computerCar.body.id;
  if (playerId === carBody.id) {
    car.eightBallCollision();
  } else if (computerId === carBody.id) {
    computerCar.eightBallCollision();
  }

  eightBallEarthquake = true;
  setTimeout(function() { eightBallEarthquake = false }, 1000);
}

function updateCountdownOverlay(msgIdx = 0) {
  let msgs = ['3', '2', '1', 'GO!'];
  countdownText = msgs[msgIdx];
  countdownMode = true;
  if (msgIdx === msgs.length) {
    countdownMode = false;
  } else {
    setTimeout(function() {
      updateCountdownOverlay(msgIdx + 1)
    }, 1000);
  }
}

function drawCountdownOverlay() {
  push();
  // draw grayed out background
  fill(0, 105);
  rect(0, 0, width, height);
  // text settings
  textAlign(CENTER, CENTER);
  const size = width > 600 ? 256 : 128;
  textSize(size);
  fill(255);
  noStroke();
  // countdownText is a global variable (can be '3', '2', '1', or 'GO!')
  text(countdownText, width/2, height/2);
  pop();
}

function removeBall(body) {
  const bodyId = body.id;
  World.remove(world, body);
  for (let i = balls.length - 1; i >= 0; i--) {
    if (bodyId == balls[i].id) {
      balls.splice(i, 1);
    }
  }
}

// helper method to shuffle ball order
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getRandomizedBallOrderArray() {
  let solidBalls = [1, 2, 3, 4, 5, 6, 7];
  let stripedBalls = [9, 10, 11, 12, 13, 14, 15];
  // eight ball in the back middle. everything else is random.
  let nonEightBalls = solidBalls.concat(stripedBalls);

  shuffleArray(nonEightBalls);

  let firstTwelve = nonEightBalls.slice(0, 12);
  let firstThirteen = firstTwelve.concat(8);
  let lastTwo = nonEightBalls.slice(12, 14);
  const randomizedBallOrderArray = firstThirteen.concat(lastTwo);
  return randomizedBallOrderArray;
}

function setupRackOfBalls() {
  const centerX = 0.68 * width;
  const centerY = 0.5 * height;
  const ballDiameter = width/32;
  const ballNums = getRandomizedBallOrderArray();

  let row = 1;
  let y = centerY;
  let x = centerX + ballDiameter;
  balls.push(new Ball(ballNums[0], x, y));
  for (let i = 1; i <= 14; i++) {
    if ([1, 3, 6, 10].indexOf(i) > -1) {
      row++;
      x += ballDiameter;
      y = centerY - ((row - 1) * ballDiameter * 0.5)
    } else {
      y += ballDiameter;
    }
    balls.push(new Ball(ballNums[i], x, y));
  }
}

function keyReleased() {
  if (keyCode == UP_ARROW || keyCode == DOWN_ARROW) {
    car.accelerating(false)
  } else if (keyCode == RIGHT_ARROW || keyCode == LEFT_ARROW) {
    car.rotate(0)
  }
}

function keyPressed() {
  if (keyCode === RIGHT_ARROW) {
    car.rotate(PI/72)
  } else if (keyCode === LEFT_ARROW) {
    car.rotate(-PI/72)
  } else if (keyCode === UP_ARROW) {
    car.accelerationDirection = 'forwards';
    car.accelerating(true)
  } else if (keyCode === DOWN_ARROW) {
    car.accelerationDirection = 'backwards';
    car.isBoosting = false;
    car.accelerating(true)
  } else if (keyCode === 32) {
    car.boost();
    car.accelerationDirection = 'forwards';
    car.accelerating(true);
  } else if (keyCode === 80) {
    gameStarted = !gameStarted;
  }
}

function draw() {

  if (eightBallEarthquake) {
    translate(random(-10, 10), random(-10, 10))
  }

  if (gameStarted) {
    drawGame();

    if (countdownMode) { drawCountdownOverlay() };

    let gameOver = isGameOver();
    if (!gameOver) { updateGame() };
  }
}

function updateGame() {
  Engine.update(engine);

  if (!countdownMode) {
    car.update();
    computerCar.update();
  };

  balls.forEach(b => b.update())

  closestBall = findClosestBall(computersBallType);
  if (closestBall) {
    computerCar.pointTowardsBall(closestBall);
  }
  computerCar.checkIfNeedToGoInReverse();
}

function drawGame() {
  drawPoolTable()
  car.render()
  balls.length > 0 ? balls.forEach(b => b.render()) : setupRackOfBalls();
  computerCar.render();
}

function isGameOver() {
  let gameOver = false;
  const stripes = balls.filter(b => b.ballType() === 'stripe').length;
  const solids = balls.filter(b => b.ballType() === 'solid').length;
  if (stripes === 0) {
    gameOver = true;
    this.gameOver(winner = "stripe");
  } else if (solids === 0) {
    gameOver = true;
    this.gameOver(winner = "solid");
  }
  return gameOver;
}

function gameOver(winner) {
  replayButton.show();
  const winningPlayer = computersBallType === winner ? 'Computer' : 'Player';
  push();
  fill(0, 105);
  rect(0, 0, width, height);
  textAlign(CENTER, CENTER);
  const size = width > 600 ? 32 : 24;
  textSize(size);
  fill(255);
  noStroke();
  text(`All ${winner}s sunk! ${winningPlayer} wins!`, width/2, height/4);
  pop();
}

function findClosestBall(ballType) {
  let closestDistance = Number.MAX_SAFE_INTEGER;
  let closestBall = null;
  const firstBall = ballType === 'solid' ? 1 : 9;
  const lastBall = ballType === 'solid' ? 7 : 15;

  let currentBall; let currentDistance;
  // array indexing so subtract one
  for (let i = firstBall - 1; i <= lastBall - 1; i++) {
    currentBallArray = balls.filter(b => b.number === i);
    if (currentBallArray.length > 0) {
      currentBall = currentBallArray[0];
      currentDistance = distanceBetween(computerCar, currentBall);
      if (currentDistance < closestDistance) {
        closestDistance = currentDistance;
        closestBall = currentBall;
      }
    }
  }
  return closestBall;
}

function distanceBetween(object1, object2) {
  const a2 = Math.pow(object1.position.x - object2.position.x, 2);
  const b2 = Math.pow(object1.position.y - object2.position.y, 2);
  return a2 + b2;
}

function drawPoolTable() {
  background(COLORS.blueGreen);
  walls.forEach(w => w.render());
  bumpers.forEach(b => b.render());
  pockets.forEach(p => p.render());
}

function addWalls() {
  const wallThickness = 500;
  const wt2 = wallThickness/2;

  bottomWall = new Wall(width/2, height + wt2 - visibleWallOffset, width, wallThickness, 0);
  topWall = new Wall(width/2, -wt2 + visibleWallOffset, width, wallThickness, 0);

  leftWall = new Wall(-wt2 + visibleWallOffset, height/2, height, wallThickness, PI/2);
  rightWall = new Wall(width + wt2 - visibleWallOffset, height/2, height, wallThickness, PI/2);

  walls.push(topWall); walls.push(bottomWall);
  walls.push(leftWall); walls.push(rightWall);
}

function addBumpers() {
  const bumperThickness = width/108;
  const adjustedWidth = width - visibleWallOffset*2;

  bottomLeftBumper = new Bumper(adjustedWidth/4 + visibleWallOffset, height - visibleWallOffset, adjustedWidth/2, bumperThickness, 0);
  bottomRightBumper = new Bumper(3*adjustedWidth/4 + visibleWallOffset, height - visibleWallOffset, adjustedWidth/2, bumperThickness, 0);

  topLeftBumper = new Bumper(adjustedWidth/4 + visibleWallOffset, visibleWallOffset, adjustedWidth/2, bumperThickness, -PI);
  topRightBumper = new Bumper(3*adjustedWidth/4 + visibleWallOffset, visibleWallOffset, adjustedWidth/2, bumperThickness, -PI);

  leftBumper = new Bumper(visibleWallOffset, height/2, height - visibleWallOffset*2, bumperThickness, PI/2);
  rightBumper = new Bumper(width - visibleWallOffset, height/2, height - visibleWallOffset*2, bumperThickness, -PI/2);

  bumpers.push(topLeftBumper); bumpers.push(topRightBumper);
  bumpers.push(leftBumper); bumpers.push(rightBumper);
  bumpers.push(bottomLeftBumper); bumpers.push(bottomRightBumper);
}

function addPockets() {
  const radius = width/24,
        topY = visibleWallOffset,
        bottomY = height - visibleWallOffset,
        leftX = visibleWallOffset,
        middleX = width/2,
        rightX = width - visibleWallOffset;

  [leftX, middleX, rightX].forEach((x) => {
    [topY, bottomY].forEach((y) => {
      if (x === middleX) {
        pockets.push(new Pocket(x, y, radius, isMiddle = true));
      } else {
        pockets.push(new Pocket(x, y, radius, isMiddle = false));
      }
    })
  })
}

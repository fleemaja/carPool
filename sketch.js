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
let rack = [];
let pockets = [];

let visibleWallOffset;

let ballComputerIsFocusedOn;
let computersBallType = 'solid';

let displayValue;


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
  addPockets();

  car = new Car(isPlayer = true)

  // computer always accelerates (TODO: AI)
  computerCar = new Car(isPlayer = false);
  computerCar.accelerating(true);

  setupRackOfBalls();
}

function collision(event) {
  var pairs = event.pairs;
  for (let i = 0; i < pairs.length; i++) {
    const labelA = pairs[i].bodyA.label;
    const labelB = pairs[i].bodyB.label;
    if (labelA == 'pocket' && labelB == 'ball') {
      removeBall(pairs[i].bodyB)
    } else if (labelA == 'ball' && labelB == 'pocket') {
      removeBall(pairs[i].bodyA);
    }
  }
}

function setupRackOfBalls() {
  rackEmUp()

  setTimeout(function() {
    removeRack();
  }, 1000);
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

function rackEmUp() {
  const wallThickness = width/48;
  const rackWidth = 0.45 * height;
  const centerX = 0.75 * width;
  const centerY = 0.5 * height;
  const xOffset = 0.866 * rackWidth/2;

  topWall = new RackWall(centerX - xOffset, centerY - rackWidth/4, wallThickness, rackWidth, PI/3);
  bottomWall = new RackWall(centerX - xOffset, centerY + rackWidth/4, wallThickness, rackWidth, -PI/3);
  leftWall = new RackWall(centerX, centerY, wallThickness, rackWidth, 0);
  rack.push(topWall); rack.push(bottomWall); rack.push(leftWall);

  for (let i = 1; i <= 15; i++) {
    balls.push(new Ball(i, centerX - xOffset/2, centerY));
  }
}

function removeRack() {
  for (let i = rack.length - 1; i >= 0; i--) {
    World.remove(world, rack[i].body);
    rack.splice(i, 1);
  }
}

function keyReleased() {
  if (keyCode == UP_ARROW) {
    car.accelerating(false)
  } else if (keyCode == RIGHT_ARROW || keyCode == LEFT_ARROW) {
    car.rotate(0)
  }
}

function keyPressed() {
  if (keyCode == RIGHT_ARROW) {
    car.rotate(PI/128)
  } else if (keyCode == LEFT_ARROW) {
    car.rotate(-PI/128)
  } else if (keyCode == UP_ARROW) {
    car.accelerationDirection = 'forwards';
    car.accelerating(true)
  } else if (keyCode == DOWN_ARROW) {
    car.accelerationDirection = 'backwards';
    car.accelerating(true)
  }
}

function draw() {

  drawPoolTable()

  Engine.update(engine)

  car.render()
  car.update()

  if (balls.length > 0) {
    balls.forEach(b => {
      b.update()
      b.render()
    })
  } else {
    setupRackOfBalls();
  }

  computerCar.render()
  computerCar.update()
  closestBall = findClosestBall(computersBallType);
  computerCar.pointTowardsBall(closestBall);
  computerCar.checkIfNeedToGoInReverse();
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
  pockets.forEach(p => p.render());
  rack.forEach(r => r.render());
}

function addWalls() {
  const wallThickness = 500;
  const wt2 = wallThickness/2;

  bottomWall = new Wall(width/2, height + wt2 - visibleWallOffset, width, wallThickness, 0)
  topWall = new Wall(width/2, -wt2 + visibleWallOffset, width, wallThickness, 0)

  leftWall = new Wall(-wt2 + visibleWallOffset, height/2, height, wallThickness, PI/2)
  rightWall = new Wall(width + wt2 - visibleWallOffset, height/2, height, wallThickness, PI/2)

  walls.push(topWall); walls.push(bottomWall);
  walls.push(leftWall); walls.push(rightWall);
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
      pockets.push(new Pocket(x, y, radius));
    })
  })
}

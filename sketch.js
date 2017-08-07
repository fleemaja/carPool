const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Events = Matter.Events;

let engine;
let world;

const exaustClouds = 25;
let car;

let balls = [];
let walls = [];
let pockets = [];

let visibleWallOffset;

function setup() {
  const w = window.innerWidth
  // keep table dimensions nice
  const h = min(window.innerHeight, w * 0.61);
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

  car = new Car()
  for (let i = 1; i <= 15; i++) {
    balls.push(new Ball(i))
  }
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

function removeBall(body) {
  const bodyId = body.id;
  World.remove(world, body);
  for (let i = balls.length - 1; i >= 0; i--) {
    if (bodyId == balls[i].id) {
      balls.splice(i, 1);
    }
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
    car.rotate(PI/72)
  } else if (keyCode == LEFT_ARROW) {
    car.rotate(-PI/72)
  } else if (keyCode == UP_ARROW) {
    car.accelerating(true)
  }
}

function draw() {

  drawPoolTable()

  Engine.update(engine)

  car.render()
  car.update()

  balls.forEach(b => b.render())

}

function drawPoolTable() {
  background(COLORS.blueGreen);
  walls.forEach(w => w.render());
  pockets.forEach(p => p.render());
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

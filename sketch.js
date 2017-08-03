const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;

let engine;
let world;

const exaustClouds = 25;
let car;

let balls = [];


function setup() {
  const w = window.innerWidth
  // keep table dimensions nice
  const h = min(window.innerHeight, w * 0.61);
  createCanvas(w, h)

  engine = Engine.create();
  world = engine.world;

  // disable matter.js gravity (top-down game)
  engine.world.gravity.y = 0;

  addWalls()

  car = new Car()
  for (let i = 0; i < 9; i++) {
    balls.push(new Ball(i))
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
}

function addWalls() {
  const wallThickness = 500;
  const wt2 = wallThickness/2;

  bottomWall = new Wall(width/2, height + wt2, width, wallThickness, 0)
  topWall = new Wall(width/2, -wt2, width, wallThickness, 0)

  leftWall = new Wall(-wt2, height/2, height, wallThickness, PI/2)
  rightWall = new Wall(width + wt2, height/2, height, wallThickness, PI/2)
}

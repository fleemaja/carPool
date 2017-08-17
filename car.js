class Car {
  constructor(isPlayer) {
    this.isPlayer = isPlayer;
    this.position = createVector(width/6, height/2)
    this.width = width/36
    this.length = this.width * 2
    this.isAccelerating = false
    this.accelerationDirection = 'forwards'
    this.rotation = 0
    this.color = COLORS.white
    this.history = [];
    const options = { density: 1, friction: 0.2, mass: 200 }
    this.body = Bodies.rectangle(
      this.position.x, this.position.y, this.length, this.width, options
    )
    this.body.label = "car";
    this.velocity = createVector(this.body.velocity.x, this.body.velocity.y);
    World.add(world, this.body)
  }

  update() {
    if (this.isAccelerating) {
      this.accelerate(this.accelerationDirection)
    }
    this.rotate(this.rotation)
    this.history.push([this.body.position.x, this.body.position.y]);
    if (this.history.length > exaustClouds) {
      this.history.splice(0, 1);
    }
    this.position.x = this.body.position.x;
    this.position.y = this.body.position.y;
    this.velocity.x = this.body.velocity.x;
    this.velocity.y = this.body.velocity.y;
  }

  accelerating(isAccelerating) {
    this.isAccelerating = isAccelerating
  }

  accelerate(direction) {
    const force = p5.Vector.fromAngle(this.body.angle)
    direction === 'forwards' ? force.mult(0.02) : force.mult(-0.02);
    Body.applyForce(this.body, this.body.position, force)
  }

  rotate(rotation) {
    this.rotation = rotation
    Body.setAngularVelocity(this.body, rotation)
  }

  // for computer player. weird way to find right rotation...
  pointTowardsBall(ball) {

    const leftVelocity = this.velocity.copy();
    const rightVelocity = this.velocity.copy();

    const leftRotatedVelocity = leftVelocity.rotate(-PI/36);
    const leftAdjustedPosition = createVector(this.position.x + leftRotatedVelocity.x, this.position.y + leftRotatedVelocity.y);
    const desiredLeft = p5.Vector.sub(ball.position, leftAdjustedPosition);

    const rightRotatedVelocity = rightVelocity.rotate(PI/36);
    const rightAdjustedPosition = createVector(this.position.x + rightRotatedVelocity.x, this.position.y + rightRotatedVelocity.y);
    const desiredRight = p5.Vector.sub(ball.position, rightAdjustedPosition);

    const steerMag = desiredLeft.mag() - desiredRight.mag();
    let rotation = map(steerMag, -0.5, 0.5, -PI/72, PI/72);
    this.rotate(rotation);
  }

  checkIfNeedToGoInReverse() {
    const epsilon = 0.005;
    const x = this.position.x;
    const y = this.position.y;
    const offset = (0.87 * this.length) + visibleWallOffset;

    if (Math.abs(this.velocity.x) < epsilon || Math.abs(this.velocity.y) < epsilon) {
      if (x > width - offset ||
          x < offset ||
          y > height - offset ||
          y < offset) {
          this.accelerateBackwards()
      }
    }
  }

  accelerateBackwards() {
    this.accelerationDirection = 'backwards';
    setTimeout(function() {
      this.accelerationDirection = 'forwards'
    }.bind(this), 1000);
  }

  render() {
    const angle = this.body.angle;
    push()
    rectMode(CENTER)
    translate(this.body.position.x, this.body.position.y)
    fill(54);
    noStroke();
    const label = this.isPlayer ? "player" : "computer";
    text(label, -this.width/2, -this.length/2);
    rotate(angle);
    stroke(0);
    // tires
    fill(COLORS.lightBlack)
    ellipse(this.length/3, -this.width/2, this.width/4, this.width/8)
    ellipse(this.length/3, this.width/2, this.width/4, this.width/8)
    ellipse(-this.length/3, -this.width/2, this.width/4, this.width/8)
    ellipse(-this.length/3, this.width/2, this.width/4, this.width/8)
    // car body
    fill(this.color)
    rect(0, 0, this.length, this.width, 5);
    fill(COLORS.lightBlack);
    rect(-this.length/24, 0, 0.7 * this.length, 0.8 * this.width, 5);
    fill(this.color);
    rect(-this.length/12, 0, 0.45 * this.length, 0.6 * this.width, 5);
    // headlights
    fill(255, 255, 200);
    ellipse(this.length/2, -this.width/3, this.width/8, this.width/4);
    ellipse(this.length/2, this.width/3, this.width/8, this.width/4);
    pop()
    push()
    noStroke();
    const carWidth = this.width;
    this.history.forEach(function(h, i) {
      const [ x, y ] = h
      push()
      translate(x, y)
      rotate(angle);
      fill(COLORS.black, i);
      ellipse(-carWidth, 0, exaustClouds - i + random(-10, 10), exaustClouds - i + random(-3, 3));
      pop()
    })
    pop()
  }
}

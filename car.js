class Car {
  constructor(isPlayer) {
    this.isPlayer = isPlayer;
    this.position = createVector(width/6, height/2)
    this.width = width/36
    this.length = this.width * 2
    this.isAccelerating = false
    this.isBoosting = false
    this.accelerationDirection = 'forwards'
    this.rotation = 0
    this.color = COLORS.white
    this.history = [];
    const options = { density: 1, friction: 0.2, mass: 125 }
    this.body = Bodies.rectangle(
      this.position.x, this.position.y, this.length, this.width, options
    )
    this.body.label = 'car';
    this.ghost = false;
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

    this.keepInBounds()
  }

  accelerating(isAccelerating) {
    this.isAccelerating = isAccelerating
  }

  accelerate(direction) {
    const force = p5.Vector.fromAngle(this.body.angle)
    const fVal = this.isBoosting ? 0.10 : 0.02;
    direction === 'forwards' ? force.mult(fVal) : force.mult(-fVal);
    Body.applyForce(this.body, this.body.position, force)
  }

  rotate(rotation) {
    this.rotation = rotation
    Body.setAngularVelocity(this.body, rotation)
  }

  boost() {
    if (this.accelerationDirection === 'forwards') {
      this.isBoosting = true;
      setTimeout(function() {
        this.isBoosting = false;
      }.bind(this), 1000);
    }
  }

  // for computer player. weird way to find correct way to rotate...
  pointTowardsBall(ball) {
    const leftVelocity = this.velocity.copy();
    const rightVelocity = this.velocity.copy();

    const leftRotatedVelocity = leftVelocity.rotate(-PI/36);
    const leftAdjustedPosition = createVector(this.position.x + leftRotatedVelocity.x, this.position.y + leftRotatedVelocity.y);
    const desiredLeft = p5.Vector.sub(ball.position, leftAdjustedPosition);

    const rightRotatedVelocity = rightVelocity.rotate(PI/36);
    const rightAdjustedPosition = createVector(this.position.x + rightRotatedVelocity.x, this.position.y + rightRotatedVelocity.y);
    const desiredRight = p5.Vector.sub(ball.position, rightAdjustedPosition);

    // boost to faraway ball
    if (desiredLeft.mag() > 150) { this.boost() };

    const steerMag = desiredLeft.mag() - desiredRight.mag();
    const dir = this.accelerationDirection === 'forwards' ? 1 : -1;
    let rotation = map(steerMag, -0.5, 0.5, -dir * PI/72, dir * PI/72);
    this.rotate(rotation);
  }

  checkIfNeedToGoInReverse() {
    const epsilon = 0.005;
    const x = this.position.x;
    const y = this.position.y;
    // only reverse near the edges/pockets
    // (width/144 is the pocket collision radius)
    const offset = this.length + visibleWallOffset + width/144;

    if (x > width - offset ||
        x < offset ||
        y > height - offset ||
        y < offset) {
      if (Math.abs(this.velocity.x) < epsilon || Math.abs(this.velocity.y) < epsilon) {
        this.accelerateBackwards()
      }
    }
  }

  accelerateBackwards() {
    this.accelerationDirection = 'backwards';
    this.isBoosting = false;
    setTimeout(function() {
      this.accelerationDirection = 'forwards'
    }.bind(this), 1000);
  }

  eightBallCollision() {
    this.ghost = true;
    this.body.label = 'ghost';
    this.body.isSensor = true;
    setTimeout(function() {
      this.ghost = false;
      this.body.label = 'car';
      this.body.isSensor = false;
    }.bind(this), 8000)
  }

  keepInBounds() {
    // body is in sensor mode when in 8 ball punishment state
    // so collisions are no longer happening
    // need to keep body position within table bounds
    const visibleWallOffset = width/32;
    const bumperThickness = width/108;
    const edgeOffset = visibleWallOffset + bumperThickness;
    const xPos = this.body.position.x;
    const yPos = this.body.position.y;
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
    Body.setPosition(this.body, { x, y });
  }

  render() {
    const angle = this.body.angle;
    const alpha = this.ghost ? 54 : 255;
    push()
    rectMode(CENTER)
    translate(this.body.position.x, this.body.position.y)
    fill(54, alpha);
    noStroke();
    const label = this.isPlayer ? "player" : "computer";
    text(label, -this.width/2, -this.length/2);
    rotate(angle);
    stroke(0, alpha);
    // tires
    fill(COLORS.lightBlack, alpha)
    ellipse(this.length/3, -this.width/2, this.width/4, this.width/8)
    ellipse(this.length/3, this.width/2, this.width/4, this.width/8)
    ellipse(-this.length/3, -this.width/2, this.width/4, this.width/8)
    ellipse(-this.length/3, this.width/2, this.width/4, this.width/8)
    // car body
    fill(this.color, alpha)
    rect(0, 0, this.length, this.width, 5);
    fill(COLORS.lightBlack, alpha);
    rect(-this.length/24, 0, 0.7 * this.length, 0.8 * this.width, 5);
    fill(this.color, alpha);
    rect(-this.length/12, 0, 0.45 * this.length, 0.6 * this.width, 5);
    // headlights
    fill(255, 255, 200, alpha);
    ellipse(this.length * 0.45, -this.width/3, this.width/8, this.width/4);
    ellipse(this.length * 0.45, this.width/3, this.width/8, this.width/4);
    const reversing = this.accelerationDirection === 'backwards' &&  this.isAccelerating;
    // bright lights on the back of car when reversing
    reversing ? fill(...COLORS.red, alpha) : fill(...COLORS.dimRed, alpha);
    noStroke();
    ellipse(-this.length * 0.45, -this.width/3, this.width/8, this.width/8);
    ellipse(-this.length * 0.45, this.width/3, this.width/8, this.width/8);
    // if boosting draw flames
    if (this.isBoosting) {
      fill(255, random(0, 255), 0, alpha);
      // x1, y1, x2, y2, x3, y3
      triangle(-this.length*0.5, -this.width/8, -this.length*0.5, this.width/8, -this.length, random(-this.width*0.15, this.width*0.15))
    }
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

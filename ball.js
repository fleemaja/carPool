class Ball {
  constructor(number, x, y) {
    this.position = createVector(x, y)
    this.radius = width/32
    this.number = number
    const options = {
      restitution: 0.9,
      friction: 0.001,
      density: 0.0001
    }
    this.body = Bodies.circle(
      this.position.x, this.position.y, this.radius/2, options
    )
    this.number !== 8 ? this.body.label = "ball" : this.body.label = "eightBall";
    this.id = this.body.id;
    World.add(world, this.body)
  }

  update() {
    this.position.x = this.body.position.x;
    this.position.y = this.body.position.y;
  }

  ballType() {
    if (this.number === 8) { return "eight" };
    return this.number < 8 ? "solid" : "stripe";
  }

  drawSolid(number, color) {
    fill(color)
    ellipse(0, 0, this.radius)
    fill(COLORS.white)
    ellipse(0, 0, this.radius/2)
    fill(COLORS.black)
    textAlign(CENTER, CENTER);
    text(number, 0, 0)
  }

  drawStripe(number, color) {
    fill(COLORS.white)
    ellipse(0, 0, this.radius)
    fill(color)
    rectMode(CENTER);
    rect(0, 0, this.radius, this.radius/2, this.radius/(2*PI))
    fill(COLORS.white)
    ellipse(0, 0, this.radius/2)
    fill(COLORS.black)
    textAlign(CENTER, CENTER);
    text(number, 0, 0)
  }

  displaySolidBall(number) {
    switch (number) {
      case 1 : this.drawSolid(number, COLORS.yellow); break;
      case 2 : this.drawSolid(number, COLORS.blue); break;
      case 3 : this.drawSolid(number, COLORS.red); break;
      case 4 : this.drawSolid(number, COLORS.purple); break;
      case 5 : this.drawSolid(number, COLORS.orange); break;
      case 6 : this.drawSolid(number, COLORS.green); break;
      case 7 : this.drawSolid(number, COLORS.maroon); break;
      case 8 : this.drawSolid(number, COLORS.black); break;
      default: break;
    }
  }

  displayStripedBall(number) {
    switch (number) {
      case 9 : this.drawStripe(number, COLORS.yellow); break;
      case 10: this.drawStripe(number, COLORS.blue); break;
      case 11: this.drawStripe(number, COLORS.red); break;
      case 12: this.drawStripe(number, COLORS.purple); break;
      case 13: this.drawStripe(number, COLORS.orange); break;
      case 14: this.drawStripe(number, COLORS.green); break;
      case 15: this.drawStripe(number, COLORS.maroon); break;
      default: break;
    }
  }

  displayBall(number) {
    number <= 8 ? this.displaySolidBall(number) : this.displayStripedBall(number);
  }

  render() {
    push()
    translate(this.body.position.x, this.body.position.y)
    rotate(this.body.angle)
    this.displayBall(this.number)
    pop()
  }
}

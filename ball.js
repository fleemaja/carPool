class Ball {
  constructor(number) {
    this.position = createVector(width/2, height/2)
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
    World.add(world, this.body)
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

  displaySolidBall(number) {
    switch (number) {
      case 1: this.drawSolid(number, COLORS.yellow); break;
      case 2: this.drawSolid(number, COLORS.blue); break;
      case 3: this.drawSolid(number, COLORS.red); break;
      case 4: this.drawSolid(number, COLORS.purple); break;
      case 5: this.drawSolid(number, COLORS.orange); break;
      case 6: this.drawSolid(number, COLORS.green); break;
      case 7: this.drawSolid(number, COLORS.maroon); break;
      case 8: this.drawSolid(number, COLORS.black); break;
      default:
        return
    }
  }

  displayStripedBall(number) {
    console.log("STRIPED BALL")
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

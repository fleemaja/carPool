class Pocket {
  constructor(x, y, r, isMiddle) {
    this.x = x;
    this.y = y;
    this.radius = r;
    this.isMiddle = isMiddle;
    const options = { isStatic: true }
    this.body = Bodies.circle(x, y, r/6, options);
    this.body.label = "pocket";
    World.add(world, this.body);
  }

  render() {
    fill(COLORS.black);
    noStroke();
    if (this.isMiddle) {
      const yAdjustment = this.y < height/2 ? -height/64 : height/64;
      ellipse(this.x, this.y + yAdjustment, this.radius);
    } else {
      ellipse(this.x, this.y, this.radius);
    }
  }
}

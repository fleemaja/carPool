class Pocket {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.radius = r;
    const options = { isStatic: true }
    this.body = Bodies.circle(x, y, r/2, options);
    this.body.label = "pocket";
    World.add(world, this.body);
  }

  render() {
    fill(COLORS.black);
    noStroke();
    ellipse(this.x, this.y, this.radius);
  }
}

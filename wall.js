class Wall {
  constructor(x, y, w, h, a) {
    const options = {
      friction: 0.5,
      restitution: 0.5,
      angle: a,
      isStatic: true
    }
    this.body = Bodies.rectangle(x, y, w, h, options);
    this.body.label = "wall";
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.a = a;
    World.add(world, this.body);
  }

  render() {
    push();
    fill(COLORS.tableWood);
    noStroke();
    translate(this.x, this.y)
    rotate(this.a);
    rectMode(CENTER);
    rect(0, 0, this.w, this.h);
    pop();
  }
}

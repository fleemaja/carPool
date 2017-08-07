class RackWall {
  constructor(x, y, w, h, a) {
    const options = {
      friction: 0.5,
      angle: a,
      restitution: 0.5,
      isStatic: true
    }
    this.body = Bodies.rectangle(x, y, w, h, options);
    this.body.label = "rackWall";
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.a = a;
    World.add(world, this.body);
  }

  render() {
    push();
    fill(COLORS.rackWood);
    noStroke();
    translate(this.x, this.y)
    rotate(this.a);
    rectMode(CENTER);
    rect(0, 0, this.w, this.h);
    pop();
  }
}

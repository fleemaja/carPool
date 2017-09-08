class Bumper {
  constructor(x, y, w, h, a) {
    const options = {
      friction: 0.5,
      restitution: 0.5,
      angle: a,
      isStatic: true
    }
    // x, y, width, height, slope, [options]
    this.body = Bodies.trapezoid(x, y, w, h, 0.13, options);
    this.body.label = "bumper";
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.a = a;
    this.vertices = this.body.vertices.reduce((accumulator, vertex) => {
      const v = [ vertex.x, vertex.y ];
      return accumulator.concat(v)
    }, []);
    World.add(world, this.body);
  }

  render() {
    const v = this.vertices;
    push();
    fill(COLORS.darkBlueGreen);
    noStroke();
    quad(v[0], v[1], v[2], v[3], v[4], v[5], v[6], v[7]);
    pop();
  }
}

export class PowerUp {
  id: number;
  x: number;
  y: number;
  speed: number;
  type: string;
  wid: number;
  hgt: number;
  color: string;

  constructor(
    id: number,
    x: number,
    y: number,
    speed: number,
    type: string,
    wid: number,
    hgt: number,
    color: string,
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.type = type;
    this.wid = wid;
    this.hgt = hgt;
    this.color = color;
  }

  moveDown(): void {
    this.y += this.speed;
  }

  getY(): number {
    return this.y;
  }
}

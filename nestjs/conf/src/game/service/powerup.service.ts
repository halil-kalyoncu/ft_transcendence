export class PowerUp {
    id: number;
    x: number;
    y: number;
	speed: number;
    type: string;
	wid: number;
	hgt: number;
    
    constructor(id: number, x: number, y: number, speed: number, type: string, wid: number, hgt: number) {
        this.id = id;
        this.x = x;
        this.y = y;
		this.speed = speed;
        this.type = type;
		this.wid = wid;
		this.hgt = hgt;
    }

	moveDown(): void {
		this.y += this.speed;
	}

	getY(): number {
		return this.y;
	}
}

export class PowerUp {
    id: number;
    x: number;
    y: number;
	speed: number;
    type: string;
    
    constructor(id: number, x: number, y: number, speed: number, type: string) {
        this.id = id;
        this.x = x;
        this.y = y;
		this.speed = speed;
        this.type = type;
    }

	moveDown(): void {
		this.y += this.speed;
	}

	getY(): number {
		return this.y;
	}
}

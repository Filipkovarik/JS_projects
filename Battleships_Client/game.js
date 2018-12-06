var Game, GameInterface, GameSocket, Game1;

jQuery(()=>{

const fleet = [1,5,4,3,2,2,1,1];

GameSocket = class GameSocket {
	constructor (player){
		
	}
	
	send (message) {
		
	}
}

GameSocket.$Messages = {MISS: 0, HIT: 1, SINK: 2, NOT_STARTED: 255}

GameInterface = class GameInterface {
	constructor (w,h) {
		this.field = $(`<div id="game_field">` + (`<row>` + (`<cell></cell>`).repeat(w) + `</row>`).repeat(h));
		this.field.appendTo(document.body)
	}
	
	clearField() {
		this.field.find("cell").removeClass("ship_single ship_left ship_right ship_top ship_bottom ship_horizontal ship_vertical ship_hit")
	}
	
	drawShip(ship){
		let fields = ship.fieldsOccupied.map( ([x,y])=> this.field.find(":eq("+y+")").find(":eq("+x+")") );
		if (fields.length == 1) { fields[0].addClass("ship_single"); return; }
		let first = fields.shift();
		let last = fields.pop();
		first.addClass(ship.orientation === Ship.$Orientation.HORIZONTAL ? "ship_left" : "ship_top")
		last.addClass(ship.orientation === Ship.$Orientation.HORIZONTAL ? "ship_right" : "ship_bottom")
		fields.forEach(field => field.addClass(ship.orientation === Ship.$Orientation.HORIZONTAL ? "ship_horizontal" : "ship_vertical"))
	}
	
}

Game = class Game {
	constructor(w,h) {
		this.width = w;
		this.height = h;
		this.gameInterface = new GameInterface(w,h);
		this.ships_unplaced = fleet.map(size => new Ship(size))
		this.ships_placed = [];
		this.field = new Array(h).fill().map(_ => new Array(w).fill())
	}
	
	drawShips(ship){
		this.ships_placed.forEach(x => this.gameInterface.drawShip(x));
		if (ship !== undefined) this.gameInterface.drawShip(ship);
	}
	
	placeShip() {
		if (this.ships_unplaced.length == 0) return false;
		let current_ship = this.ships_unplaced.shift();
		
		document.addEventListener("keypress", 
			e =>
			{	
				this.gameInterface.clearField()
				switch(e.key) {
					case "ArrowRight": current_ship.x + 1 < this.width && current_ship.x++; break;
					case "ArrowLeft": current_ship.x - 1 >= 0 && current_ship.x--; break;
					case "ArrowDown": current_ship.y + 1 < this.height && current_ship.y++; break;
					case "ArrowUp": current_ship.y - 1 >= 0 && current_ship.y--; break;
					case "Space": current_ship.orientation = current_ship.orientation[0] ? Ship.$Orientation.VERTICAL : Ship.$Orientation.HORIZONTAL 
					case "Enter": this.placeShip() || this.start(); break;
				}
				
				this.drawShips(current_ship);
				
			}
		
		)
		return true;
	}
	
	
	
	fire() {}
}

class Ship {
	constructor (size) {
		this.x = 0;
		this.y = 0;
		this.orientation = Ship.$Orientation.HORIZONTAL;
		this.size = size;
		this.alive = true;
	}
	
	get fieldsOccupied() {
		let f = [];
		for (let i = 0; i < this.size; i++) {
			let newx = this.x + i*this.orientation.x;
			let newy = this.y + i*this.orientation.y;
			f.push([newx, newy]);
		}
		return f;
	}
	
	
}

Ship.$Orientation = {HORIZONTAL: {x: 1, y: 0}, VERTICAL: {x: 0, y: 1} }

Game1 = new Game(10, 10);

});
var Game, Ship, GameInterface, GameSocket, Game1;

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
		this.field = $(`<div class="game_field" id="game_field_1">` + (`<row>` + (`<cell></cell>`).repeat(w) + `</row>`).repeat(h));
		this.field.children().toArray().forEach((row, y) => [].forEach.call(row.children, (cell, x) => {cell.innerText = "ABCDEFGHIJKLMNOPQRSTUVXYZ"[x] + y; $(cell).attr("x", x).attr("y", y);}));
		this.field.appendTo(document.body);
		this.field_opponent = $(`<div class="game_field" id="game_field_2">` + (`<row>` + (`<cell></cell>`).repeat(w) + `</row>`).repeat(h));
		this.field_opponent.children().toArray().forEach((row, y) => [].forEach.call(row.children, (cell, x) => {cell.innerText = "ABCDEFGHIJKLMNOPQRSTUVXYZ"[x] + y; $(cell).attr("x", x).attr("y", y);}));
		this.field_opponent.appendTo(document.body);
	}
	
	clearField() {
		this.field.find("cell").removeClass("ship_single ship_left ship_right ship_top ship_bottom ship_horizontal ship_vertical ship_hit")
	}
	
	drawShip(ship){
		let fields = ship.getFieldsOccupied().map( ([x,y])=> this.field.find("row:eq("+y+")").find("cell:eq("+x+")") );
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
		this.current_ship;
		this.field = new Array(h).fill().map(_ => new Array(w).fill())
		this.ready = false;
	}
	
	start () {
		this.ready = true;
	}
	
	drawShips(){
		this.ships_placed.forEach(x => this.gameInterface.drawShip(x));
		if (this.current_ship instanceof Ship) this.gameInterface.drawShip(this.current_ship);
	}
	
	checkConflict() {
		if(this.current_ship === null) return true;
		let placements = {};
		let k = ([x,y])=>y*this.width+x;
		this.ships_placed.forEach(placed => placed.getFieldsOccupied().map(f => k(f)).forEach(p => {placements[p] = true}))
		return this.current_ship.getFieldsOccupied().every(f => placements[k(f)] != true);
		
	}
	
	placeShip() {
		if (this.ships_unplaced.length == 0) return false;
		this.current_ship = this.ships_unplaced.shift();
		this.drawShips(this.current_ship);
		
		if(this.ships_placed.length == 0) document.addEventListener("keypress", 
			e =>
			{	
				if (this.ships_unplaced.length == 0 && this.current_ship == null) return false;
				this.gameInterface.clearField()
				switch(e.key) {
					case "ArrowRight": this.current_ship.x + 1 < this.width && this.current_ship.x++; break;
					case "ArrowLeft": this.current_ship.x - 1 >= 0 && this.current_ship.x--; break;
					case "ArrowDown": this.current_ship.y + 1 < this.height && this.current_ship.y++; break;
					case "ArrowUp": this.current_ship.y - 1 >= 0 && this.current_ship.y--; break;
					case "t": this.current_ship.orientation = (this.current_ship.orientation == Ship.$Orientation.VERTICAL) ? Ship.$Orientation.HORIZONTAL : Ship.$Orientation.VERTICAL; break;
					case " ": 
						if (this.checkConflict()) {
						this.ships_placed.push(this.current_ship);
						this.placeShip() || ( this.current_ship = null || this.start() );} break;
				}
				
				this.drawShips();
				
			}
		
		);
		return true;
	}
	
	
	
	fire(x, y) {
		//if (!this.ready) return false;
		console.log(x,y)
		this.gameInterface.field_opponent.find("cell[x="+x+"][y="+y+"]").addClass("hit")
	}
}

Ship = class Ship {
	constructor (size) {
		this.x = 0;
		this.y = 0;
		this.orientation = Ship.$Orientation.HORIZONTAL;
		this.size = size;
		this.alive = true;
	}
	
	getFieldsOccupied() {
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

Game1.placeShip();

$("#game_field_2 cell").click(e => Game1.fire(parseInt($(e.target).attr("x")),parseInt($(e.target).attr("y"))))

});
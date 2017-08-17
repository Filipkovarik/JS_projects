Game = class Game {


	
}

Game.Board = class Board {
	constructor(width, height, baseTileType){
		this.baseTileType = baseTileType;
	}
	
	getRawAt(x,y){
		return this[y][x]
	}
	
	getAt(x,y){
		return this[y][x] || this.baseTileType
	}
	
	setAt(x,y,tile){
		return this[y][x] = tile
	}
}

Game.TileSet = class TileSet extends Array {
	constructor (proplist){
		this.proplist = proplist;
	}
	
	add (tileType){
		if(this.proplist.some(x=>tileType.props === undefined)) throw new ReferenceError('Given TileType does not set all required properties of given TileSet')
		else this.push(tileType);
	}
}

Game.TileType = class TileType {
	constructor (props){
		this.props = props
	}
}

Game.Tile = class Tile {
	constructor(x, y, tileType, boundStruct){
		this.x = x;
		this.y = y;
		this.tileType = tileType;
		this.boundStruct = boundStruct;
	}
	
	create(){
		
	}
	
	destroy(){
		if (this.boundStruct) this.boundStruct.destroyFromTile.apply(this.boundStruct, arguments)
	}
}

Game.Structure = class Structure { //use for 1×1 too
	constructor (x, y, boardseg){
		
	}
	
	create(){
		
	}
	
	destroy(){
		
	}
	
	destroyFromTile(){
		
	}
}


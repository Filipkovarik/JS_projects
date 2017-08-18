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

Game.TileType = class TileType {
	constructor(name, props) {
		tiletype = this
		this.Tile = class Tile extends Game.Tile {
			constructor(x, y, boundStruct){
				super(x, y, tiletype, boundStruct)
			}
		}
		
		this.Tile.props = props
		this.Tile.tileName = name
	}
}


Game.Structure = class Structure { //use for 1×1 too
	constructor (x, y, structtype, boundTiles){
		
	}
	
	create(){
		
	}
	
	destroy(){
		
	}
	
	destroyFromTile(){
		
	}
}

Game.StructureType = class StructureType {
	constructor(name, props) {
		structtype = this
		this.Structure = class Structure extends Game.Structure {
			constructor(x, y, boundTiles){
				super(x, y, structtype, boundTiles)
			}
		}
		
		this.Structure.props = props
		this.Structure.tileName = name
	}
}
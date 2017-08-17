function cartes(a,b){
	r = []
	for (aa = 0; aa < a.length; aa++)
		for (bb = 0; bb < b.length; bb++)
			r.push([a[aa],b[bb]])
	return r
}
	
Game = class Game {
	constructor(){}
	
	start(){}
}

GameCanvas = document.getElementsByTagName("canvas")[0].getContext("2d")
GameCanvas.clearRect(0,0,1000,1000)

GameObject = function GameObject (sprite,hitbox,name) {
	o = class GameObjectInstance {
		constructor(x, y){
			this.x = x;
			this.y = y;
			GameInstanceList.push(this)
		}
		draw(){
			return this.getSprite().draw(this.x, this.y, GameCanvas)
		}
		checkCollide(obj){
			this.hitbox.checkHitBox(this.x, this.y, obj.getHitBox(), obj.x, obj.y)
		}
		getHitBox(){
			return this.constructor.hitbox
		}
		getSprite(){
			return this.constructor.sprite
		}
	}
	o.sprite = sprite
	o.hitbox = hitbox
	o._name = name
	return o
}

GameInstanceList = []

Sprite = class Sprite {
	constructor(draw){this.draw = draw}
}

HitBox = class HitBox {
	constructor(rectangles){
		this.rectangles = rectangles
	}
	
	checkPoint(selfx, selfy, x, y){
		x-=selfx
		y-=selfy
		return this.rectangles.some(rect=> rect.x1<=x && rect.x2>=x && rect.y1<=y && rect.y2>=y)
	}
	
	checkRect(selfx, selfy, rect, rectx, recty){
		return cartes([rect.x1+rectx,rect.x2+rectx],[rect.y1+recty,rect.y2+recty]).some((x,y)=>this.checkPoint(selfx, selfy, x, y))
	}
	
	checkHitBox(selfx, selfy, hitbox, boxx, boxy){
		return hitbox.rectangles.some(r=>this.checkRect(selfx, selfy, r, boxx, boxy))
	}
}


PlayerObj = new GameObject(
	new Sprite(
		function draw(x, y, cn){
			cn.strokeRect(x, y, 20, -20)
		}
	),
	new HitBox(
		[
			{x1:0, y1:0, x2: -20, y2: -20}
		]
	),
	"Player"
);

FloorObj = new GameObject(
	new Sprite(
		function draw(x, y, cn){
			cn.moveTo(x,y)
			cn.lineTo(1000,y)
		}
	),
	new HitBox(
		[
			{x1: 0, y1: 0, x2: 1000, y2: 500}
		]
	),
	"Floor"
)

Player = new PlayerObj(0, 500)

Floor = new FloorObj(0, 501)


function gameLoop(){
	GameInstanceList.forEach(x=>x.draw())
}


gameLoop()
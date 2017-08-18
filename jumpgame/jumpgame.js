var game

$(_=>{


function cartes(a,b){
	r = []
	for (aa = 0; aa < a.length; aa++){
		for (bb = 0; bb < b.length; bb++){
			r.push([a[aa],b[bb]])
		}
	}
	return r
}


GameCanvas = $("canvas")[0].getContext("2d")
canvasw = 256
canvash = 256
GameCanvas.clearRect(0,0,canvasw,canvash)

GameObject = function GameObject (sprite,hitbox,name) {
	
	o = class {
		constructor(x, y, hs, vs){
			this.x = x;
			this.y = y;
			this.hs = hs||0;
			this.vs = vs||0;
			this.obj_type = this.constructor._name
			GameInstanceList.push(this)
		}
		draw(){
			return this.getSprite().draw(this.x, this.y, GameCanvas)
		}
		checkCollide(obj, c){
			return c ? this.getHitBox().checkHitBox(this.x, this.y, obj.getHitBox(), obj.x, obj.y) : (this.checkCollide(obj, true) || obj.checkCollide(this, true));
		}
		getHitBox(){
			return this.constructor.hitbox
		}
		getSprite(){
			return this.constructor.sprite
		}
		tickPhysics(){
			this.x+=this.hs
			this.y+=this.vs
		}
	}
	o.sprite = sprite
	o.hitbox = hitbox
	o._name = name
	GameObjectTypes[o._name]=o
	return o
}
GameObjectTypes = {}

GameInstanceList = []

Sprite = class Sprite {
	constructor(draw){this.draw = draw}
}

HitBox = class HitBox {
	constructor(rectangles){
		this.rectangles = rectangles.map(r=>({ x1: Math.min(r.x1,r.x2), x2: Math.max(r.x1,r.x2), y1: Math.min(r.y1,r.y2), y2: Math.max(r.y1,r.y2) }))
	}
	
	checkPoint(selfx, selfy, x, y){
		x-=selfx
		y-=selfy
		return this.rectangles.some(rect=> (rect.x1<=x && rect.x2>=x && rect.y1<=y && rect.y2>=y))
	}
	
	checkRect(selfx, selfy, rect, rectx, recty){
		return cartes([rect.x1+rectx,rect.x2+rectx],[rect.y1+recty,rect.y2+recty]).some(([x,y])=>this.checkPoint(selfx, selfy, x, y))
	}
	
	checkHitBox(selfx, selfy, hitbox, boxx, boxy){
		return hitbox.rectangles.some(r=>this.checkRect(selfx, selfy, r, boxx, boxy));
	}
}

PlayerObj = new GameObject(
	new Sprite(
		function draw(x, y, cn){
			cn.fillStyle = "green"
			cn.fillRect(x, y, ~~(canvasw/10), -~~(canvash/10))
		}
	),
	new HitBox(
		[
			{x1:0, y1:0, x2: ~~(canvasw/10), y2: -~~(canvash/10)}
		]
	),
	"Player"
);

FloorObj = new GameObject(
	new Sprite(
		function draw(x, y, cn){
			cn.strokeStyle = "black"
			cn.beginPath()
			cn.moveTo(x,y)
			cn.lineTo(canvasw,y)
			cn.stroke()
		}
	),
	new HitBox(
		[
			{x1: 0, y1: 0, x2: canvasw, y2: ~~(canvash/2)+1}
		]
	),
	"Floor"
);

ObstacleObj = new GameObject(
	new Sprite(
		function draw(x, y, cn){
			cn.fillStyle = "red"
			cn.fillRect(x, y, ~~(canvasw/10), -~~(canvash/10))
		}
	),
	new HitBox(
		[
			{x1:0, y1:0, x2: ~~(canvasw/10), y2: -~~(canvash/10)}
		]
	),
	"Obstacle"
);

var gameBegin

TimerObj = new GameObject(
	new Sprite(
		function draw(x, y, cn){
			$("#time").text(~~((new Date()-gameBegin)/100))
		}
	),
	new HitBox([]),
	"Timer"
)

game = function game(){

GameInstanceList = [];

Player = new PlayerObj(0, ~~(canvash/2)-20)

Floor = new FloorObj(0, ~~(canvash/2))

Timer = new TimerObj(0,0)

var keyDown = [];
var KEY_SPACE = 32;
var lastObstacle = +new Date()
gameBegin = +new Date()
function gameLoop(){
	
	
	window.onkeyup = function(e) {keyDown[e.keyCode]=false;}
	window.onkeydown = function(e) {keyDown[e.keyCode]=true;}
	
	
	gameTime = +new Date()-gameBegin
	
	
	if (+new Date() - lastObstacle > 700 - ~~(gameTime/1E3)) if(Math.random()<0.1) {new ObstacleObj(canvasw+20, ([~~(canvash/2), ~~(canvash/3)])[+(Math.random()<0.3)], -~~(gameTime/70E3)-6); lastObstacle = +new Date()}
		
	GameInstanceList = GameInstanceList.filter(o=> Math.abs(o.x) < canvasw*3 && Math.abs(o.y) < canvash*3)
	
	GameCanvas.clearRect(0,0,canvasw,canvash)
	GameInstanceList.forEach(x=>x.draw())
	GameInstanceList.forEach(x=>x.tickPhysics())
	
	if (Player.y < Floor.y) Player.vs += 2 - +!!(keyDown[KEY_SPACE] && Player.vs < 0)
	if (Player.y > Floor.y) {Player.y = Floor.y; Player.vs = 0}
	if (Player.y == Floor.y && keyDown[KEY_SPACE]) Player.vs = -10
	if (GameInstanceList.filter(x=>x.obj_type == "Obstacle").some(o=>o.checkCollide(Player))){
		GameCanvas.clearRect(0,0,canvasw,canvash)
		GameInstanceList.forEach(x=>x.draw())
		clearInterval(game.interval)
	}
	
}


game.interval = setInterval(gameLoop, 30)

}

//game()


})
var LangCon;

(function(){
let DOM = document.getElementById("LangCon_glyphFrame");
let LSKey = "glyphs";
 
class Facepalm extends Error {}	
N=_=>Object.create(null);
let LC = LangCon = N();


LC.pullID = function(){return arguments.callee.id++};
LC.pullID.id = 0;
LC.internal = N();
LC.glyphs = localStorage.getItem(LSkey)||N();

LC.glyphs.__$isGlyphList = true;
LC.save = function(){localStorage.setItem(LSkey,LC.glyphs);}

LC.assign = function(glyph){LC.glyphs[glyph.name]=glyph};

LC.parse = function(obj){
if(obj.__$isGlyphList || obj instanceof Array) return obj.map(x=>LC.parse(x));
   return new LC[obj.type].fromDef(obj); 
};


LC.Glyph = class Glyph {
	constructor (name, src, subareas) { //[left, top, width, height] ~ [0 to 1, 0 to 1, 0 to 1, 0 to 1] (multiple of superglyph)
	  this.name = name;
    this.src = src;
  	this.subareas = subareas; 
	}
	
	static fromDef (obj) {
	  return new this(obj.name, obj.src, obj.subareas);
	}
	
	toHTML () {
    return '<div class="alt">$name<div name="glyph_$name" class="glyph" style="background-image:url(\'$src\')></div></div>'
    .replace(/\$name/g,this.name).replace("$src",this.src);
	}
	
	toDef () {
	  return {name: this.name, src: this.src, subareas: this.subareas, type: "Glyph"};
	}

let RS = LC.internal.Resize = function Resize(glyph, left, top, width, height){   //relative to superglyph
	    if(top == undefined)
	    return '<div class="resize-flex-grow" style="flex-grow: $flex-grow">$glyph</div>'
	    .replace("$flex-grow",left||1).replace("$glyph",glyph.toHTML());
	    let s = (x=>(100*x).toFixed(0));
	    return '<div class="resize" style="position:relative; width: $w%; height: $h%; left: $l%; top: $t%;">$g</div>'.replace("$w",s(width)).replace("$h",s(height)).replace("$l",s(left)).replace("$r",s(right)).replace("$g",glyph.toHTML());
};


let PC = LC.internal.PositionCombine = class PositionCombine extends LC.Glyph {
    constructor (name, ...glyphs) { //name, [glyph(, ratio)] (,[glyph(, ratio)]) .IS //ratio (name instanceof Object){glyphs = LC.parse(name.glyphs); name = name.name;}s noflex-grois.;lyphs = glyghs;
	    this.name = name || "C("+this.glyphs.map(x=>x[0].name).join("&")+")"+LC.pullID();
	}
	
	toDef (id){
	    return {name: id + this.name, glyphs: this.glyphs.map(x=>x.toDef())}
	}
;}

let VC = LC.VerticalCombine = class VerticalCombine extends LC.internal.PositionCombine {
	constructor() {
	    this.super.apply(this,arguments);
	    this.name = "V"+this.name;
	}
	
	static fromDef(obj) {
	  return 
	}
	
	toHTML () {
		return '<div class="vertical-combine">$subglyphs</div>'
	.replace("$subglyphs",this.subglyphs.map([g,r]=>RS(g,r)));
	}
	
	toDef(){
	  let s = superprototype.toDef.call(this,"V");
		s.type = "VerticalCombine";
	}
}

let CC = LC.Combine = class CustomCombine extends LC.Glyph {
	constructor (name, base, ...subglyphs)
	{
		this.name = name;
		this.base = base;
		this.subglyphs = subglyphs;
		if(this.subglyphs.length > this.base.subareas.length) throw new Facepalm();
	}

	    
	toHTML(){
	    
	}
}
LC.DOM = DOM;


LC.draw = function(name){
   LC.DOM.innerHTML = LC.glyphs[name].toHTML(); 
}

})()






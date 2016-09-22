var LangCon;

(function($){
let DOM = $("#LangCon_glyphFrame");
let LSkey = "glyphs";
 
class Facepalm extends Error {}	
N=_=>Object.create(null);
let LC = LangCon = N();

LC.pullID = function(){return arguments.callee.id++};
LC.pullID.id = 0;
LC.internal = N();
LC.glyphs = localStorage.getItem(LSkey)||N();

LC.glyphs.__$isGlyphList = true;
LC.save = function(){localStorage.setItem(LSkey,LC.glyphs);}

LC.assign = function(glyph){LC.glyphs[glyph.name]=glyph; LC.save();};

LC.parse = function(obj){
if(obj.__$isGlyphList || obj instanceof Array) return obj.map(x=>LC.parse(x));
   return new LC[obj.type].fromDef(obj); 
};


LC.Glyph = class Glyph {
	constructor (name, src, subareas) { //[left, top, width, height] ~ [0 to 1, 0 to 1, 0 to 1, 0 to 1] (multiple of superglyph)
		this.name = name;
    	this.src = src;
  		this.subareas = subareas;
		LC.assign(this);
	}
	
	static fromDef (obj) {
		return new this(obj.name, obj.src, obj.subareas);
	}
	
	toHTML () {
    		return '<div class="alt">$name<div name="glyph_$name" class="glyph" style="background-image:url(\'$src\')></div></div>'.replace(/\$name/g,this.name).replace("$src",this.src);
	}
	
	toDef () {
		return {name: this.name, src: this.src, subareas: this.subareas, type: "Glyph"};
	}

}

let RS = LC.internal.Resize = function Resize(glyph, left, top, width, height){   //relative to superglyph
	    if(top == undefined) return '<div class="resize-flex-grow" style="flex-grow: $flex-grow">$glyph</div>'.replace("$flex-grow",left||1).replace("$glyph",glyph.toHTML());
	    let s = (x=>(100*x).toFixed(0));
	    return '<div class="resize" style="position:relative; width: $w%; height: $h%; left: $l%; top: $t%;">$g</div>'.replace("$w",s(width)).replace("$h",s(height)).replace("$l",s(left)).replace("$t",s(top)).replace("$g",glyph.toHTML());
};

let PC = LC.internal.PositionCombine = class PositionCombine extends LC.Glyph {
	constructor (name, ...glyphs) { //name, [glyph(, ratio)] (,[glyph(, ratio)]) .IS //ratio (name instanceof Object){glyphs = LC.parse(name.glyphs); name = name.name;}s noflex-grois.;lyphs = glyghs;
		this.name = name || "C("+this.glyphs.map(x=>x[0].name).join("&")+")"+LC.pullID();
	}
	
	static fromDef(obj) {
		return new LC[obj.type](obj.name, ...(obj.glyphs.map(x=>LC.glyphs[x])));
	}
	
	toDef (id){
		return {name: id + this.name, glyphs: this.glyphs.map(x=>x.name)}
	}
}

let VC = LC.VerticalCombine = class VerticalCombine extends LC.internal.PositionCombine {
	constructor() {
	    this.super.apply(this,arguments);
	    this.name = "V"+this.name;
		LC.assign(this);
	}

	toHTML () {
		return '<div class="vertical-combine">$subglyphs</div>'.replace("$subglyphs",this.subglyphs.map(([g,r])=>RS(g,r)));
	}
	
	toDef(){
		let s = superprototype.toDef.call(this,"V");
		s.type = "VerticalCombine";
	}
}

let CC = LC.Combine = class CustomCombine extends LC.Glyph {
	constructor (name, base, ...subglyphs)
	{
		this.name = name || "CC(" + this.base.name + "," + this.subglyphs.map(x=>x[0].name) + ")";
		this.base = base;
		this.subglyphs = subglyphs;
		if(this.subglyphs.length > this.base.subareas.length) throw new Facepalm();
		LC.assign(this);
	}
	
	static fromDef (obj){
		return new this(obj.name,LC.parse(obj.base), ...(obj.subglyphs.map(x=>LC.glyphs[x])))
	}
	
	toDef(){
		return {type: "Combine", name: this.name, subglyphs: this.subglyphs.map(x=>x?x.name:""), base: this.base.name};
	}
	    
	toHTML(){
		this.subglyphs.map((g,i)=>g?RS(g, ...this.subareas[i]):"")
	}
}

let Cat = LC.Category = class Category {
	constructor (name,members){
		this.name = name;
		this.members = members||[];
		LC.assign(this);
	}
	
	toDef (){
		return {name: this.name, type:"Category", members: this.members.map(x=>x.name)};
	}
	
	static fromDef(obj) {
		return new this(obj.name, obj.members.map(x=>LC.glyphs[x]));
	}
}

LC.DOM = DOM;


LC.draw = function(name){
   LC.DOM.innerHTML = LC.glyphs[name].toHTML(); 
}

})(jQuery)

$(function(){
	$("#LangCon_glyphFrame").resizable({containment:"#LangCon_container"});
	$("#LangCon_container").controlgroup();
});




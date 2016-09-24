var LangCon;

(function($){
let DOM = $("#LangCon_glyphFrame");
let DOMMenu = $("#LangCon_menu_accordion");
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

LC.NEW = N();

LC.NEW.Glyph = function(){
	$("#dialog_Glyph_GlyphImage").val("C:/Users/Filip/Desktop/Lang");
	$("dialog#dialog_Glyph").dialog("open");
}

})(jQuery)

$(function(){
		
	$("#LangCon_glyphFrame").resizable({containment:"#LangCon_container"});
	
	$("#LangCon_menu_accordion").accordion({heightStyle: "fill"});
	$("#LangCon_menu_add_button").button({icon:"ui-icon-plus"});
	$("#LangCon_menu_add_menu").menu().children().children().click(function(e){
		LangCon.NEW[$(e.target).attr("name")]();
	});
	
	$("dialog#dialog_Glyph").dialog({modal: true, resizable: false, autoOpen: false, width: "90vw"});
	$("#dialog_Glyph_GlyphImage").keyup(function(){
		let t = $(this);
		let s = t.val();
		s = s.indexOf("data:")==0?s.replace(/\r|\n/g,""):s.replace(/\\|\//g,"\\\\");
		t.parent().find(".dialog_glyphFrame").css("background-image","url('"+s+"')");
	})
	$("#dialog_Glyph_SVG_button").click(function(){$("#dialog_Glyph_GlyphImage").val("data:image/svg+xml;utf-8,<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>")}).button();
	$("#dialog_Glyph_subareas_new").click(function(){
		let smex = function(arr){
		arr[-1] = 0;
		let m = arr.findIndex((x, i, a)=>x-arr[i-1]>1);
		return m == -1 ? arr[arr.length-1]+1 : arr[m-1];
		}
		let t = $(this).parent().parent().find(".dialog_glyphFrame");
		let s = $(document.createElement("div"))
		.addClass("dialog_Glyph_subarea")
		.keyup(function(e){if(e.key=="Delete") $(this).resizable("destroy").draggable("destroy").remove();})
		.text(smex(t.children().map((_,x)=>+$(x).text()).get()))
		.appendTo(t)
		.resizable({containment: t})
		.draggable({containment: "parent"});
	}).button();
	
	$("#LangCon_container").controlgroup();
	$("#LangCon_menu").controlgroup();
});




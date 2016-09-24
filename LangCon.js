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
	
	class SlideSnap {
	constructor (name,values,ease,root,max,oom){
			SlideSnap[name] = this;
			this.values = values;
			this.max = max;
			this.ease = ease;
			this.root = root;
			this.oom = oom;
			
			let m = Math.max(...values);
			this.positions = this.values.map(x=>this.norm(x/m));
		}
		
		norm (s){
			return this.ease(s+this.root)/this.max;
		}
		
		snap (s){
			s = s / (1 << this.oom);
			let b = this.positions.findIndex(x => x >= s);
			if (b == 0) return [this.positions[0], this.values[0]];
			let ratio = this.positions[b]/(this.positions[b-1]+this.positions[b]);
			if((s-this.positions[b-1])/(this.positions[b-1]-this.positions[b])<=ratio)--b;
			return [this.positions[b]*(1<<this.oom), this.values[b]];
		}
	}
	
	new SlideSnap("percentSnap",[1,2,5,10,20,25],x=>Math.log(x),1,Math.E,8);
	
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
		let n = smex(t.children().map((_,x)=>+$(x).text()).get());
		let s = $(document.createElement("div"))
		.addClass("dialog_Glyph_subarea")
		.on("mousedown touchdown",function(){$(".dialog_Glyph_subareas_last").text($(this).attr("no"))})
		.text(n)
		.attr("no",n)
		.appendTo(t)
		.resizable({containment: t})
		.draggable({containment: "parent"});
	}).button();
	
	$("#dialog_Glyph_subareas_delete").click(function(){
		let n = +$(this).find(".dialog_Glyph_subareas_last").text();
		let e = $(".dialog_Glyph_subarea[no="+n+"]");
		if (e.length)
			e.draggable("destroy").resizable("destroy").remove();
	}).button();
	
	/*$("#LangCon_Glyph_subareas_snap_slider").slider({
		min:0,
		max:1<<SlideSnap.percentSnap.oom,
		create: function(){
			$("#LangCon_Glyph_subareas_snap_slider_handle").text(SlideSnap.percentSnap.values[0]+"%");
		},
		slide: function(event,ui){
			let s = SlideSnap.percentSnap;
			let p = s.snap(ui.value);
			
			$("#LangCon_Glyph_subareas_snap_slider_handle").text(p[1]+"%");
			return true;
		}
	});*/
	//CUS I GIV D F UP, selct mnu insted m8
	
	$("#LangCon_container").controlgroup();
	$("#LangCon_menu").controlgroup();
});




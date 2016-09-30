var LangCon;

(function($){
var N=_=>Object.create(null); //Null prototype function
	
//Magic variables

let LSkey = "Filipkovarik/LangCon/glyphs";

//*facepalm* when I have to 
class Facepalm extends Error {}	

//base object
let LC = LangCon = N();
LC.internal = N();
LC.internal.glyphs = {};

//setting up LangCon.glyphs
LC.glyphs = N();
LC.glyphs.__$isGlyphList = true;


//Storage functions
LC.assign = function(glyph){LC.glyphs[glyph.name]=glyph; LC.save();};
LC.rename = function(name1,name2){let a = LC.glyphs[name1]; a.name = name2; delete LC[name1]; LC.assign(a);}

LC.parse = function(obj){
if(obj instanceof Array) return obj.map(x=>LC.parse(x));
   return LC[obj.type].fromDef(obj); 
};

LC.internal.glyphs.toDef = function (){
	let DEFed = N();
	for (let k in LC.glyphs){
		if(Object.prototype.hasOwnProperty.call(LC.glyphs,k))
			if(k[0]+k[1]+k[2] == "__$") {DEFed[k]=LC.glyphs[k]; continue;}
			DEFed[k] = LC.glyphs[k].toDef();
	}
	return DEFed;
}
LC.internal.glyphs.fromDef = function (obj){
	let unDEFed = N();
	for (let k in obj){
		if(Object.prototype.hasOwnProperty.call(obj,k))
			if(k[0]+k[1]+k[2] == "__$") {unDEFed[k]=obj[k]; continue;}
			unDEFed[k] = LC.parse(obj[k]);
	}
	return unDEFed;
}

LC.save = function(){localStorage.setItem(LSkey,JSON.stringify(LC.internal.glyphs.toDef()));}
LC.load = function(){LC.glyphs = LC.internal.glyphs.fromDef(JSON.parse(localStorage.getItem(LSkey)));}

LC.pullID = function(){return arguments.callee.id++};
LC.pullID.id = 0;

/* --== Glyph-likes ==-- */


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
		let j = $('<div class="alt_text">$name</div><div name="glyph_$name" class="glyph"></div>'.replace(/\$name/g,this.name));
		j[1].style.backgroundImage = "url('"+this.src.replace(/\'/g,"\\'")+"')";
		return j.map((_,x)=>x.outerHTML).get().join("");
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



LC.draw = function(name){
   LC.DOM.html(LC.glyphs[name].toHTML()); 
}

LC.NEW = N();
LC.EDIT = N();

LC.NEW.Glyph = function(){
	$("#dialog_Glyph_GlyphImage").val("").trigger("keyup");
	$("#dialog_Glyph .dialog_glyphFrame").children().remove();
	$("#dialog_Glyph input[name=name]").val("");
	$("dialog#dialog_Glyph").dialog("open");
}

LC.NEW.PositionCombine = function(){
	$("dialog#dialog_PositionCombine").dialog("open");
}


//Loading glyphs
LC.load();	

})(jQuery)

$(function(){
	
	LangCon.DOM = $("#LangCon_glyphFrame");
	LangCon.DOMMenu = $("#LangCon_menu_accordion");
	
	LangCon.updateables = {
		dialog_PositionCombine_glyphFrame: function(){
			let c = LangCon[$("input[type=radio][name=dialog_PositionCombine_orientation]:checked").val()];
			
			new c("PCTemp",...($("#dialog_PositionCombine_subglyphs_table tr:not(#dialog_PositionCombine_subglyphs_table_head)").map(
				(_,x)=>[
					x.find("input[type=text].dialog_PositionCombine_subglyphs_table_subglyph_name").val(),
					x.find("input[type=text].dialog_PositionCombine_subglyphs_table_subglyph_ratio").val()
					]
			)));
			$("#dialog_PositionCombine .dialog_glyphFrame").html(LangCon.glyphs.PCTemp);
		}
	};
	//onLoad jQuery UI setup
	
	(_=>{//Main Menu
	$("#LangCon_glyphFrame").resizable({containment:"#LangCon_container"});
	
	$("#LangCon_menu_accordion").accordion({heightStyle: "fill"});
	$("#LangCon_menu_add_button").button({icon:"ui-icon-plus"});
	$("#LangCon_menu_add_menu").menu().children().children().click(function(e){
		LangCon.NEW[$(e.target).attr("name")]();
	});
	$("#LangCon_container").controlgroup();
	$("#LangCon_menu").controlgroup();
	})();
	
	(_=>{//Dialogs
	(_=>{//New Glyph dialog
	$("dialog#dialog_Glyph").dialog({
		modal: true,
		resizable: false,
		autoOpen: false,
		width: "90vw"
	});
	$("#dialog_Glyph_GlyphImage").keyup(function(){
		let t = $(this);
		let s = t.val();
		s = s.indexOf("data:")==0?s.replace(/\r|\n/g,""):s.replace(/\\|\//g,"\\\\");
		t.parent().find(".dialog_glyphFrame").css("background-image","url('"+s+"')");
	})
	$("#dialog_Glyph_SVG_button").click(function(){$("#dialog_Glyph_GlyphImage").val("data:image/svg+xml;utf-8,<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>")}).button();
	$("#dialog_Glyph_subareas_new").click(function(){
		let smex = function(arr){
			arr = arr.sort((x,y)=>x>y)
			for (let i = 0; i < arr.length; i++){
				if(i+1 != arr[i])return i+1;
			}
			return arr.length+1;
		}
		let t = $(this).parent().parent().find(".dialog_glyphFrame");
		let n = smex(t.children(".dialog_Glyph_subarea").map((_,x)=>+$(x).text()).get());
		let s = $(document.createElement("div"))
		.addClass("dialog_Glyph_subarea")
		.on("mousedown touchdown",function(){$(".dialog_Glyph_subareas_last").text($(this).attr("no"))})
		.text(n)
		.attr("no",n)
		.appendTo(t)
		.resizable({containment: t, grid:[15,15]})
		.draggable({containment: "parent", grid:[15,15]});
	}).button();
	
	$("#dialog_Glyph_subareas_delete").click(function(){
		let n = +$(this).find(".dialog_Glyph_subareas_last").text();
		let e = $(".dialog_Glyph_subarea[no="+n+"]");
		if (e.length)
			e.draggable("destroy").resizable("destroy").remove();
	}).button();
	
	$("#dialog_Glyph_create_button").click(function(){
		let d = $("dialog#dialog_Glyph");
		new LangCon.Glyph(
			d.find("[name=name]").val()||"Glyph"+LangCon.pullID(),
			d.find("[name=image_path]").val(),
			d.find(".dialog_glyphFrame").children(".dialog_Glyph_subarea").sort((x,y)=>+$(x).attr("no") > +$(y).attr("no"))
				.map(
					(_,x) => ["left","top","width","height"].map( p => +$(x).css(p)/300 )
				).get()
			);
		d.dialog("close");
	}).button();
	})();
	(_=>{//New Position Combination dialog
	$("dialog#dialog_PositionCombine").dialog({
		modal: true,
		resizable: false,
		autoOpen: false,
		width: "90vw"
	});
	
	$("#dialog_PositionCombine_subglyphs_add").click(function(){
		let s = $('<tr><td><input type="text" class="dialog_PositionCombine_subglyphs_table_subglyph_name"></td><td><input class="dialog_PositionCombine_subglyphs_table_subglyph_ratio"></td><td><button></button></td></tr>');
		s.find(".dialog_PositionCombine_subglyphs_table_subglyph_ratio").spinner({min: 1})
		s.find("button").click(function(){
			let p = $(this).parent();
			p.find(".dialog_PositionCombine_subglyphs_table_subglyph_ratio").spinner("destroy");
			$(this).button("destroy");
			p.remove();
		}).button({showLabel:false, icon:"ui-icon-close"})
		s.appendTo($("#dialog_PositionCombine_subglyphs_table_inner"))
	}).button();
	
	$("input[type=radio][name=dialog_PositionCombine_orientation]").checkboxradio().on("change",function(e){
		if(!$(e.target).prop("checked")) return true;
		LangCon.updateables.dialog_PositionCombine_glyphFrame();
	});
	
	$("#dialog_PositionCombine_orientation").controlgroup();
	
	})();
	})();
		
});




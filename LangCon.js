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
LC.assign = function(glyph,__$Do_not_save){
	LC.glyphs[glyph.name]=glyph;
	if(glyph instanceof LangCon.Glyph)LangCon.glyphs.All.add(glyph.name); 
	LangCon.updateables?LangCon.updateables.accordion_menu():setTimeout(_=>LangCon.updateables.accordion_menu(),1000);
	__$Do_not_save||LC.save();
	};
	
LC.rename = function(name1,name2){
	let a = LC.glyphs[name1];
	a.name = name2;
	delete LC.glyphs[name1];
	for (let member of Object.values(LangCon.glyphs))
		if(member instanceof LangCon.Category)member.renameHandle(name1,name2);
	LC.assign(a);
	}
	
LC.delete = function(name,__$Do_not_save){
	delete LC.glyphs[name1];
	for (let member of Object.values(LangCon.glyphs))
		if(member instanceof LangCon.Category)member.remove(name1);
	LangCon.glyphs.All.remove(name);
	LangCon.updateables?LangCon.updateables.accordion_menu():setTimeout(_=>LangCon.updateables.accordion_menu(),1000);
	__$Do_not_save||LC.save();
	}

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
LC.internal.DO_NOT_ASSIGN = {};

LC.save = function(){localStorage.setItem(LSkey,JSON.stringify(LC.internal.glyphs.toDef()));}
LC.load = function(){LC.glyphs = LC.internal.glyphs.fromDef(JSON.parse(localStorage.getItem(LSkey)));}

LC.pullID = function(){return arguments.callee.id++};
LC.pullID.id = 0;

/* --== Glyph-likes ==-- */


LC.Glyph = class Glyph {
	constructor (name, src, subareas) { //[left, top, width, height] ~ [0 to 1, 0 to 1, 0 to 1, 0 to 1] (multiple of superglyph)
		this.name = name;
    	this.src = src;
  		this.subareas = subareas||[];
		name==LC.internal.DO_NOT_ASSIGN||LC.assign(this);
	}
	
	static fromDef (obj) {
		return new this(obj.name, obj.src, obj.subareas, obj.alttext);
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
	    if(top == undefined) return '<div class="resize-flex-grow glyph" style="flex-grow: $flex-grow; flex-basis: 0;">$glyph</div>'.replace("$flex-grow",left||1).replace("$glyph",glyph.toHTML());
	    let s = (x=>(100*x).toFixed(0));
	    return '<div class="resize glyph" style="position:absolute; width: $w%; height: $h%; left: $l%; top: $t%;">$g</div>'.replace("$w",s(width)).replace("$h",s(height)).replace("$l",s(left)).replace("$t",s(top)).replace("$g",glyph.toHTML());
};

let PC = LC.internal.PositionCombine = class PositionCombine extends LC.Glyph {
	constructor (name, ...glyphs) { //name, [glyph(, ratio)] (,[glyph(, ratio)]) .IS //ratio (name instanceof Object){glyphs = LC.parse(name.glyphs); name = name.name;}s noflex-grois.;lyphs = glyghs;
		super(LC.internal.DO_NOT_ASSIGN);
		this.name = name || "C("+this.glyphs.map(x=>x[0].name).join("&")+")"+LC.pullID();
		this.glyphs = glyphs;
	}
	
	static fromDef(obj) {
		return new LC[obj.type](obj.name, ...(obj.glyphs.map(x=>LC.glyphs[x])));
	}
	
	toDef (){
		return {name:  this.name, glyphs: this.glyphs.map(x=>x.name)}
	}
}

let VC = LC.VerticalCombine = class VerticalCombine extends LC.internal.PositionCombine {
	constructor() {
	    super(...arguments);
	    this.name = arguments[0]||"V"+this.name;
		LC.assign(this);
	}

	toHTML () {
		return '<div class="vertical-combine glyph">$glyphs</div>'.replace("$glyphs",this.glyphs.map(([g,r])=>RS(g,r)).join(""));
	}
	
	toDef(){
		let s = LangCon.internal.PositionCombine.prototype.toDef.call(this);
		s.type = "VerticalCombine";
	}
}

let HC = LC.HorizontalCombine = class HorizontalCombine extends LC.internal.PositionCombine {
	constructor() {
	    super(...arguments);
	    this.name = arguments[0]||"H"+this.name;
		LC.assign(this);
	}

	toHTML () {
		return '<div class="horizontal-combine glyph">$glyphs</div>'.replace("$glyphs",this.glyphs.map(([g,r])=>RS(g,r)).join(""));
	}
	
	toDef(){
		let s = LangCon.internal.PositionCombine.prototype.toDef.call(this);
		s.type = "HorizontalCombine";
	}
}

let CC = LC.CustomCombine = class CustomCombine extends LC.Glyph {
	constructor (name, base, ...subglyphs)
	{
		super(LC.internal.DO_NOT_ASSIGN);
		if(base instanceof Array) this.base = base[0];
		else this.base = base;
		if(subglyphs[0] instanceof Array) this.subglyphs = subglyphs.map(x=>x[0]);
		else this.subglyphs = subglyphs;
		this.subglyphs = this.subglyphs.map(x=>x==LC.glyphs.$NoSuchGlyph?undefined:x);
		if(this.subglyphs.length > this.base.subareas.length) this.subglyphs.splice(this.base.subareas.length,this.subglyphs.length-this.base.subareas.length);
		this.name = name || "CC(" + this.base.name + "," + this.subglyphs.map(x=>x[0].name) + ")";
		LC.assign(this);
	}
	
	static fromDef (obj){
		return new this(obj.name,LC.glyphs[obj.base], ...(obj.subglyphs.map(x=>LC.glyphs[x])));
	}
	
	toDef(){
		return {type: "CustomCombine", name: this.name, subglyphs: this.subglyphs.map(x=>x?x.name:""), base: this.base.name};
	}
	    
	toHTML(){
		let sglps = $(this.subglyphs.map((g,i)=>g?RS(g, ...this.base.subareas[i]):"").join(""));
		let base = $(this.base.toHTML());
		base.eq(1).append(sglps);
		return base.get().map(x=>x.outerHTML).join("");
	}
}

let Cat = LC.Category = class Category {
	constructor (name,members,__$Do_not_save){
		this.name = name;
		this.members = members||N();
		LC.assign(this,__$Do_not_save);
	}
	
	toDef (){
		return {name: this.name, type:"Category", members: this.toArray()};
	}
	
	add (name){
		this.members[name] = 1;
		LangCon.save();
	}
	
	remove (name){
		delete this.members[name];
		LangCon.save();
	}
	
	renameHandle (name1,name2){
		if(this[name1]==1){
			remove(name1);
			add(name2);
		}
	}
	
	toArray(){
		return Object.keys(this.members);
	}
	
	static fromDef(obj) {
		return new this(obj.name, (o=>{obj.members.forEach(x=>o[x]=1);return o})({}));
	}
}



LC.draw = function(name){
	LC.DOM.children(".alt_text").remove();
	LC.DOM.children(".glyph").remove();
	LC.DOM.prepend($(LC.glyphs[name].toHTML())); 
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
	$("#dialog_PositionCombine_subglyphs_table tr:not(#dialog_PositionCombine_subglyphs_table_head)").remove();
	$("#dialog_PositionCombine_glyph_name").val("");
	$("#dialog_PositionCombine_subglyphs_add").click();
	$("#dialog_PositionCombine_subglyphs_add").click();
	$("dialog#dialog_PositionCombine").dialog("open");
}

LC.NEW.Category = function(){
	new LC.Category(prompt("Enter category name:",""));
}

LC.EDIT.Glyph = function(name){
	let s = LangCon.glyphs[name];
	if(!s) {LC.NEW.Glyph(); return;}
	$("#dialog_Glyph_GlyphImage").val(s.src).trigger("keyup");
	$("#dialog_Glyph .dialog_glyphFrame").children().remove();
	let t = x=>300*x+"px";
	s.subareas.forEach(
		x=>{
			$("#dialog_Glyph_subareas_new").click();
			$(".dialog_Glyph_subarea").eq(-1).css({left: t(x[0]), top: t(x[1]), width: t(x[2]), height: t(x[3])});
		}
	)
	$("#dialog_Glyph input[name=name]").val(name);
	$("dialog#dialog_Glyph").dialog("open");
}

LC.EDIT.PositionCombine = function(name){
	let s = LangCon.glyphs[name];
	if(!s) {LC.NEW.PositionCombine(); return;}
	$("#dialog_PositionCombine_glyph_name").val(s.name);
	let p = s.glyphs||s.subglyphs;
	$("#dialog_PositionCombine_subglyphs_table tr:not(#dialog_PositionCombine_subglyphs_table_head)").remove();
	if(s.base){
		$("#dialog_PositionCombine_subglyphs_add").click();
		let u = $("#dialog_PositionCombine_subglyphs_table_inner tr").eq(-1);
		u.find(".dialog_PositionCombine_subglyphs_table_subglyph_name").val(s.base.name);
		}
	p.forEach(
	x=>{
		$("#dialog_PositionCombine_subglyphs_add").click();
		let u = $("#dialog_PositionCombine_subglyphs_table_inner tr").eq(-1);
		if(!(x instanceof Array))x=[x,1];
		u.find(".dialog_PositionCombine_subglyphs_table_subglyph_name").val(x[0].name);
		u.find(".dialog_PositionCombine_subglyphs_table_subglyph_ratio").val(x[1]);
		}
	)
	$("#dialog_PositionCombine [value="+s.constructor.name+"]").click();
	$("dialog#dialog_PositionCombine").dialog("open");

}

LC.EDIT.Category = function(){
	LC.rename($("#LangCon_menu_accordion .ui-accordion-header-active").text(),prompt("Enter new name for category:",""))
}

new LC.Category("All",N(),true);
LC.glyphs.All.members = new Proxy(LC.glyphs.All.members,{
	get:function(target,key){
		if(key==="members"){
				for (let glyph of Object.values(Object.create(target[key])))
					if(!LangCon.glyphs[glyph]) target.remove(glyph);
		}
		return target[key];
	}})

//Loading glyphs
LC.load();


new LC.Glyph("$NoSuchGlyph",'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg"><text text-anchor="middle" x="50%" y="50%" lengthAdjust="spacingAndGlyphs" textLength="100%">Error: No such glyph</text></svg>');



})(jQuery)

$(function(){
	
	LangCon.DOM = $("#LangCon_glyphFrame");
	LangCon.DOMMenu = $("#LangCon_menu_accordion");
	
	LangCon.updateables = {
		dialog_PositionCombine_glyphFrame: function(){
			let c = LangCon[$("input[type=radio][name=dialog_PositionCombine_orientation]:checked").val()];
			let glps = Array.prototype.map.call(
					$("#dialog_PositionCombine_subglyphs_table tr:not(#dialog_PositionCombine_subglyphs_table_head)"),
					x=>{ return	[
							LangCon.glyphs[
								$(x).find("input[type=text].dialog_PositionCombine_subglyphs_table_subglyph_name").val()
							]||LangCon.glyphs.$NoSuchGlyph,
							$(x).find("input.dialog_PositionCombine_subglyphs_table_subglyph_ratio").val()
						]
					}
				);
			new c("PCTemp",
				...(glps.length?glps:[[LangCon.glyphs.$NoSuchGlyph,1]])
			);
			$("#dialog_PositionCombine .dialog_glyphFrame").html(LangCon.glyphs.PCTemp.toHTML());
		},
		accordion_menu: function(){
			let s = $("#LangCon_menu_accordion");
			s.children().remove();
			s.append(Object.values(LangCon.glyphs).filter(x=>x instanceof LangCon.Category).map(
			x => $("<h3>").text(x.name).add(
					$('<div>').append(
						$(
							x.toArray().sort((x,y)=>(x>y)-(y>x))
							.map(y=>{
								let g = LangCon.glyphs[y];
								return $("<div>").text(y).prepend($("<div>").append($(g.toHTML())));
							}).reduce(function(a,b){return a.add(b)},$())
						)
					)
				)
			).reduce(function(a,b){return a.add(b)},$()))
			.accordion("refresh");
		}
	};
	//onLoad jQuery UI setup
	
	(_=>{//Main Menu
	$("#LangCon_glyphFrame").resizable({containment:"#LangCon_container"});
	
	$("#LangCon_menu_accordion").accordion({heightStyle: "fill"});
	$("#LangCon_menu_add_button").button({icon:"ui-icon-plus"});
	$("#LangCon_menu_edit_button").button({icon:"ui-icon-gear"});
	$("#LangCon_menu_add_menu").menu().children().children().click(function(e){
		LangCon.NEW[$(e.target).attr("name")]();
	});
	$("#LangCon_menu_edit_menu").menu().children().children().click(function(e){
		LangCon.EDIT[$(e.target).attr("name")]();
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
			d.find(".dialog_glyphFrame").children(".dialog_Glyph_subarea").sort((x,y)=>+$(x).attr("no") > +$(y).attr("no")).get()
				.map(
					x => ["left","top","width","height"].map( p => parseInt($(x).css(p))/300 )
				)
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
		s.find(".dialog_PositionCombine_subglyphs_table_subglyph_name").on("keydown keyup change paste", function(){LangCon.updateables.dialog_PositionCombine_glyphFrame();});
		s.find(".dialog_PositionCombine_subglyphs_table_subglyph_ratio").spinner({min: 1, width: 80, change: _=>LangCon.updateables.dialog_PositionCombine_glyphFrame()}).spinner("value",1)
		s.find("button").click(function(){
			let p = $(this).parent().parent();
			p.find(".dialog_PositionCombine_subglyphs_table_subglyph_ratio").spinner("destroy").on("spinchange",function(){LangCon.updateables.dialog_PositionCombine_glyphFrame();});
			$(this).button("destroy");
			p.remove();
			LangCon.updateables.dialog_PositionCombine_glyphFrame();
		}).button({showLabel:false, icon:"ui-icon-close"})
		s.appendTo($("#dialog_PositionCombine_subglyphs_table_inner"));
		LangCon.updateables.dialog_PositionCombine_glyphFrame();
	}).button();
	
	$("input[type=radio][name=dialog_PositionCombine_orientation]").checkboxradio().on("change",function(e){
		if(!$(e.target).prop("checked")) return true;
		LangCon.updateables.dialog_PositionCombine_glyphFrame();
	});
	
	$("#dialog_PositionCombine_create_button").click(function(){
		LangCon.rename("PCTemp",$("#dialog_PositionCombine_glyph_name").val());
		$("#dialog_PositionCombine").dialog("close");
	}).button();
	
	$("#dialog_PositionCombine_orientation").controlgroup();
	
	})();
	})();
		
});




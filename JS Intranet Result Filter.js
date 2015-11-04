// ==UserScript==
// @name         Javascript Intranet Result Filter
// @version      1.1.01
// @description  A filter for our school's schedule change page 
// @author       Filipkovarik a.k.a. Filipkoss2329
// @match        http://intranet.gjs.cz/stranky/suplovani.asp
// @website      https://plus.google.com/110634539236392530518
// @grant        none
// @require      http://code.jquery.com/jquery-latest.min.js
// @namespace https://greasyfork.org/users/19505
// ==/UserScript==

(function($){
location.hash=""
PageObjects = Object.create(null);
PageObjects.Row = function(a,b,d){
var e=this.DOM=$(a);
var c=e.children();
this.prof = b;
this.class = c.eq(1).text();
this.hours = c.eq(2).text().replace(/[\.]/g,"").split("-");
this.subj = c.eq(3).text();
this.change = c.eq(4).text();
this.where = c.eq(5).text();
this.hide = e.hide.bind(e);
this.show = e.show.bind(e);
this.hideProf = function(){c.eq(0).find("b").text("");}
this.showProf = function(){c.eq(0).find("b").text(this.prof);}
if(!d)this.hideProf();
}
PageObjects.Table = function(a){
var e =this.DOM= $(a);
e.prev().wrap(function(){ return "<a name=\"" + ($(this).text().split(" ")[1]) + "\"></a>" })
var after = e.next().text();
this.notes = after.split("umístění")[0];
//this.moves = new PageObjects.Move(after.split("umístění")[1].split(":")[1]);
this.rows = [];
var l;
var rws = e.children().children("[bgcolor]")
for (var i = 0; i < rws.toArray().length; i++){
var k = rws.eq(i).children().eq(0).text().split("").slice(2).join("");
l = (k=="\u00a0")?l:k;
this.rows.push(new PageObjects.Row(rws[i],l,l==k))
 }
}
PageObjects.init = function(){$("table:not([border])").remove(); $("table:contains(Kde)[bordercolor]").each(function(){PageObjects.tables.push(new PageObjects.Table(this));})
PageObjects.inputs();
PageObjects.styles();
}
PageObjects.styles=function(){
var styles=
[
"#filter-input {width: 150px}",
"#date-jump-input {width: 100px}",
"#filtering input[type=button] {margin: 2px 3px}"
]
$("head").append($(document.createElement("style")).html(styles.join("\n")))
}
PageObjects.inputs=function(){
$("a[href='suplovani1.asp']")[0].outerHTML+='<div id=filtering><br><br><input type=button id=date-jump-button-1 value=Dnes><input type=button id=date-jump-button-2 value=Zítra><input type=button id=date-jump-button-3 value=Včera><input type=button id=date-jump-button-4 value="Nejbližší suplování"><br><input type=text id=date-jump-input name=filter-input><input type=button id=date-jump-button><font size=2>(den.měsíc, den.měsíc.rok)</font><br><input type=text id=filter-input name=filter-input><input type=button id=filter-button value=Filtrovat> <font size=2>(<s>část jména</s>, třída)</font><br><font size=2>Nechte prázdné pro obnovení všech výsledků</font></div>';
$("#date-jump-button").val("Jít na datum").click(PageObjects.jumpToDate);
$("#filter-button").click(PageObjects.filter);
if(localStorage&&localStorage.getItem("lastFilter")){$("#filter-input").val(localStorage.getItem("lastFilter"));}
$("#date-jump-button-1").click(function(){PageObjects.jumpToDate("dnes")});
$("#date-jump-button-2").click(function(){PageObjects.jumpToDate("zítra")});
$("#date-jump-button-3").click(function(){PageObjects.jumpToDate("včera")});
$("#date-jump-button-4").click(function(){PageObjects.jumpToDate("nejb")});
$("#filter-input").keyup(function(e){if(e.which==13){e.preventDefault(); $("#filter-button").click();}});
$("#date-jump-input").keyup(function(e){if(e.which==13){e.preventDefault(); $("#date-jump-button").click();}});
}
PageObjects.jumpToDate = function(a){
location.hash="";
var e=new Date();
if(a=="nejb"){
var y=e.getFullYear();
var f = $("a[name]").map(function(){return this.name}).toArray();
while(!~f.indexOf(e.getDate()+"."+(e.getMonth()+1)+"."+e.getFullYear())||e.getFullYear()>y+1) e.setDate(e.getDate()+1);
if(e.getFullYear()>y+1)alert("Suplování na dnes ani na další dny nejsou k dispozici.")
}
if(a=="včera")e.setDate(e.getDate()-1)
if(a=="zítra")e.setDate(e.getDate()+1)
if(~["včera","dnes","zítra","nejb"].indexOf(a)){location.hash=e.getDate()+"."+(e.getMonth()+1)+"."+e.getFullYear();return false;}
var g=$("#date-jump-input").val();
f=g.split(".");
if(f[1]) {location.hash=f[0]+"."+f[1]+"."+(f[2]||(new Date().getFullYear())); return true}

}
PageObjects.filter = function(){

var query = $("#filter-input").val();
if(localStorage){localStorage.setItem("lastFilter",query)}
for(var ii=0;ii<PageObjects.tables.length;ii++){ var i = PageObjects.tables[ii]; var f="";
 for(var ji=0;ji<i.rows.length; ji++){ var j = i.rows[ji];
  try{j.hide(); j.hideProf();}catch(a){}
  if(j.prof!=f)j.showProf();
  debug();                                    
  if  (query===""||(j.prof.indexOf(query)>-1)||((/[ĎŇŤŠČŘŽÝÁÍÉÚŮA-Z][ěščřžýáíéóúůďťňa-z]{2,}/.exec(j.change)||[""])[0].indexOf(query)+1)||j.class==query||j.class==((/^(?:(?:V|I)*|[1-4])(?=a|b)/.exec(/^(?:I?V|V?I{1,3}|[1-4])(?:a|b)$/.exec(query)||[""])[0])+"a,b"))
  {j.show(); f=j.prof;}
  }
 }
}
function debug(){try{throw Error()}catch (e){}}
PageObjects.tables = []; 
PageObjects.init()

})(jQuery)



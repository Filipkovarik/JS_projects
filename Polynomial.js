var AdvMath;
(function(){
function shallowCopy(a){var target={}; for (var i in a){if(a.hasOwnProperty(i)) target[i] = a[i];} return target}
AdvMath = {
Cartez:function(a,b){var c=[];for(var i=0;i<a.length;i++){for(var j=0;j<b.length;j++){c.push([a[i],b[j]])}}return c},
Monomial:function(a,b){if("string"==typeof a)return AdvMath.Monomial.parse(a);if(a instanceof AdvMath.Monomial){this.coef=a.coef; this.memb=shallowCopy(a.memb);} else {this.coef = a||1; this.memb = b||{}}},
Polynomial:function(a){if("string"==typeof a)return AdvMath.Polynomial.parse(a);if(a instanceof AdvMath.Polynomial){this.memb = a.clone().memb} else {var u = (a instanceof Array)?a:arguments;this.memb = []; for(var i=0;i<u.length;i+=2) 
 {
    if(u[i] instanceof Object) [].splice.call(u,i,0,1);
    if(+u[i+1]==u[i+1]) [].splice.call(u,i+1,0,{});

  this.memb.push(new AdvMath.Monomial(u[i],u[i+1]))}
  }
 }
}
AdvMath.Monomial.parse = function(a){
var k=new AdvMath.Monomial();
if(a[0]=="+") a = a.split("").slice(1).join("");
var h=a.split("*");
k.coef = isNaN(parseFloat(h[0]))?(h[0][0]=="-"?-1:1):parseFloat(h[0]);
if(k.coef==-1) h[0] = h[0].split("").slice(1).join(""); else if(k.coef!==1) h.splice(0,1);
h.forEach(function(i){var m = i.split("^"); k.memb[m[0]] = parseFloat(m[1])||1})
return k;
}
AdvMath.Monomial.prototype = {
constructor: AdvMath.Monomial,
mult: function(a){a=new AdvMath.Monomial(a);k=this.clone();k.coef*=a.coef;for(var g in a.memb)k.memb[g]=k.memb[g]?k.memb[g]+a.memb[g]:a.memb[g];return k},

membString:function(){a=""; for(var m in this.memb){for(var i =0;i<this.memb[m];i++){a+=m;}} return a;},

order:function(){return Math.max.apply(0,Object.keys(this.memb).map((function(i){return this.memb[i]}).bind(this)))},

pow:function(i){var k = this; for(var m=1;m<i;m++){k=k.mult(this);} return k;},

clone:function(){return new AdvMath.Monomial(this.coef,shallowCopy(this.memb));},


coefForm:function(i){
var g = (Object.keys(this.memb).every((function(i){return this[i]==0;}).bind(this.memb))?"1":"");
return (this.coef>=0&&i?"+":"")+(this.coef==1?g:(this.coef==-1?"-"+g:parseFloat(this.coef.toFixed(3))))},

toString:function(i){a=this.coefForm(i);for(var b in this.memb)a+=(this.memb[b]==0?"":(((["+","-",""].indexOf(a)>-1)?"":"*")+b+(this.memb[b]==1?"":("^"+this.memb[b])))); return a},

toHTMLString:function(i){a=this.coefForm(i);for(var b in this.memb)a+=(this.memb[b]==0?"":(b+(this.memb[b]==1?"":this.memb[b].toString().sup())));return a},

eval: function(a){
 k=this.clone();
 for(var b in k.memb){
  if(a.hasOwnProperty(b)){
   k.coef*=Math.pow(a[b],k.memb[b]);
   k.memb[b] = 0;
   }
  }
  return k;
 }
}
AdvMath.Polynomial.parse = function(a){
var k = new AdvMath.Polynomial();
("+"+a).match(/[\+\-]+[^\+\-]*/g).forEach(function(i){k.memb.push(AdvMath.Monomial.parse(i));})
return k;
}
AdvMath.Polynomial.prototype = {
constructor: AdvMath.Polynomial,
sort:function(){var k=this.undup(); k.memb=k.memb
.sort(function(a,b){var m=a.membString(); var n=b.membString(); return m<n-m>n}); return k;},
add:function(a){a=new AdvMath.Polynomial(a);var k=this.clone(); for(var i=0;i<a.memb.length;i++){k.memb.push(a.memb[i])} return k;},
sub:function(a){a=new AdvMath.Polynomial(a);var k=this.clone(); var g = a.mult(new AdvMath.Polynomial(-1,{})); for(var i=0;i<a.memb.length;i++){k.memb.push(g.memb[i])} return k;},
pow:function(i){var k = this; for(var m=1;m<i;m++){k=k.mult(this);} return k;},
toString: function(){b="";for(var i=0;i<this.memb.length;i++)b+=this.memb[i].toString(i); return b},
toHTMLString: function(){b="";for(var i=0;i<this.memb.length;i++)b+=this.memb[i].toHTMLString(i); return b},
clone: function(){c=new AdvMath.Polynomial();for(var i=0;i<this.memb.length;i++)c.memb.push(this.memb[i].clone()); return c},
eval: function(a){var k = this.clone();for(var i = 0;i<this.memb.length;i++){k.memb[i] = k.memb[i].eval(a)}; return k},
mult: function(a){a=new AdvMath.Polynomial(a);var k = new AdvMath.Polynomial();var g = AdvMath.Cartez(this.memb,a.memb); for(var i=0; i<g.length;i++)k.memb.push(g[i][0].mult(g[i][1])); return k;},
undup:function(){var k = this.clone(); k.memb = k.memb.reduce(function(m,v){return m.every(function(i,k,p){if(Object.keys(i.memb).every(function(p){return (v.memb[p]||0)==(i.memb[p]||0)})){i.coef+=v.coef; if(i.coef==0){p.splice(k,1);} return false;} return true;})?m.concat(v):m;  },[]).reverse();

return k;

 }
}


})()




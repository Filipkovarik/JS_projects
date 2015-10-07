function ruleSequence(b,r,t){
while(t--)
{
var k = eval(r.replace(/\$[0-9]+/g,function(a){return "("+JSON.stringify(b[b.length-a.substring(1,1000)])+")"}).replace(/\$\_[0-9]*/g,function(a){return "("+JSON.stringify(b[a.substring(2,1000)])+")"}).replace(/\_N\_/g,"("+b.length+")"));
if(k instanceof Array) k.forEach(function(a){b.push(a)})
else b.push(k);
}
return b;
}

function newtsqrt(a,p){
var b=a.toString();
b=b.split("").reverse().join("").substring(0,b.length/2+1).split("").reverse().join("").replace(/^0/,1);
return ruleSequence([a,b],"($_0/$1+$1)/2",p||10).pop()
}
// for whole numbers

function newtsqrt2(a,p){
return ruleSequence([a],"($_0/$1+$1)/2",p||10).pop()
}

function approxPI(p){
var k=ruleSequence([0,0.5],"[($2+$1)/2,newtsqrt2($1*($2+$1)/2,5)]",p);
return 1/((k.pop()+k.pop())/2) //lolz k-pop
}
// approxPI(12) is the closest in decimal output

function riemann_zeta(s,p){var k = ruleSequence([s],"Math.pow(_N_,-$_0)",p);k.shift();return k.reduce(function(a,b){return a+b})}

function look_and_say(seed,num,base){
base=base||10;
seed=seed.toString();
return ruleSequence([base,seed],"l_a_s($1.split(''),$_0)",num)
}

function l_a_s(k,b){
   if(k.length==1)return "1"+k[0];
   var l="";
   for(var i=0,m=0,p="",o=k.length;i<o;i++){
	var c=k[i];
    
	if(c!=p&&i!=o-1){if(p)l+=m.toString(b)+p;p=c;m=0}
	if(c!=p&&i==o-1){if(p)l+=m.toString(b)+p+"1"+k[i];}
	if(c==p&&i!=o-1){m++}
	if(c==p&&i==o-1){l+=(m+1).toString(b)+p}
    
   }
   return l
  }

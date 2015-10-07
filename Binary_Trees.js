(function(W,_u,_n,O,OC,Leaf,Lp){
Leaf.prototype=Lp;
var lf=new Leaf();
function nO(){return OC(_n)}
function mr(d,s,o){for(var c in s)d[c]=o||!d[c]?s[c]:d[c];return d}
function BW(v,b,t){return b<v&&v<t}
var T=W.Trees=nO();
var TB=T.Binary=function(a,p,s){
var k=TB,T=this;
if(!(T instanceof k)){return new k(a,p)}
if(a instanceof k)return a;
T.key=a
T.parent=p||!1;
T.onSide=s||null;
T.pos=[];
T.at=T;
}
TB.DEPTHFIRSTSEARCH=101;
TB.DIRECTIONLEFT=0;
TB.DIRECTIONRIGHT=1;
TB.DIRECTIONUP=-1;
TB.POSITIONROOT=-2;
TB.prototype={valueOf:function(){return this.key},
constructor:TB,
left:lf,
right:lf,
isLeaf:!1,
toString:function(){return this.key+"<"+this.left.toString()+","+this.right.toString()+">"},
append:function(s,t){this[s?"right":"left"]=new this.constructor(t,this,s)},
atTree:function(){return this.at},
isRoot:function(){return !this.parent},
replaceTree:function(s){var T=this;
if(T.isRoot())return !1;
var p=T.at,k=p.onSide;T.traverse(-1);
T.at.append(k,s); T.traverse(k);
return p;
},
removeTree:function(){var T=this;
if(T.isRoot())return !1;
var p=T.at,k=p.onSide;T.traverse(-1);
T.at.append(k,lf);
return p;
},
getHeight:function(){return Math.max(this.left.getHeight(),this.right.getHeight())+1},
getBalance:function(){return this.left.getHeight()-this.right.getHeight()},
traverse:function(d){var T=this;
if(d instanceof Array)d.forEach(T.traverse.bind(T))
if(d==-2){while(T.traverse(-1)!=!1){}return T.at;}
if(d==-1&&T.at.parent){T.pos.pop();return (T.at=T.at.parent);}
if((d==0&&!T.at.left.isLeaf)||(d==1&&!T.at.right.isLeaf)){T.pos.push(d);return (T.at=T[d?"right":"left"]);}
return !1},
atKey:function(){return this.at.key},
setCurKey:function(a){this.at.key=a},
search:function(v,t,p){t=t||0;
 if(t==101){
  var c1,c2,c3,T=this;
  c1=T.key==v;
  if(!c1)c2=T.left.search(v,t,p);
  if(!c1&&!c2)c3=T.right.search(v,t,p);
  if(c1||c2||c3){T.isRoot()||p.unshift(T.onSide);return c1?T:c2||c3}
    }
  }//,
}
var BST=T.BST=function(a,p,s,c){
if(a instanceof BST)return a;
var T=this;
TB.call(T,a,p,s)
if(p){
 T.topLim=p.topLim;
 T.bottomLim=p.bottomLim;
 if(s==0)T.topLim=p.key;
 else if(s==1) T.bottomLim=p.key;
}
if(!c&&!T.isBST())throw new RangeError("Key out of range, BST not valid.")
}

BST.prototype=mr(OC(TB.prototype),{
constructor:BST,
getMin:function(){var k = this;while(!k.left.isLeaf)k=k.left;return k.key},
getMin:function(){var k = this;while(!k.right.isLeaf)k=k.right;return k.key},
bottomLim:-Infinity,
topLim:Infinity,
isBST:function(){var T=this;return BW(T.key,T.bottomLim,T.topLim)&&T.left.isBST()&&T.right.isBST()},
},1)

})(window,undefined,null,Object,Object.create,function Leaf(){},{getHeight:function(){return 0},toString:function(){return "leaf"},isLeaf:!0,isBST:function(){return !0},search:function(){return !1}})

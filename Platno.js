var Facepalm = class Facepalm extends Error {constructor(desc){this.description=desc}};

Function.isPrimitive = function(type){
try{return Object(type.prototype.valueOf()) instanceof type}catch(e){return Object((new type).valueOf()) instanceof type}
}

var TypeArray = class TypeArray extends Array {
constructor(type){
super();
this.type = type;
let n = ()=>undefined;
return new Proxy(this,{
    setPrototypeOf:n,
    defineProperty:n,
    set:(t,k,v)=>{
        if((!Number.isInteger(+k)) || k<0) throw new RangeError("Array key must be a non-negative integer.");
        if(!(Function.isPrimitive(type)?typeof v == typeof t.type.prototype.valueOf():v instanceof t.type)) throw new TypeError("Trying to insert invalid type into TypedArray" + (t.type.name?", typed to "+t.type.name:"."))
        t[k]=v;
    }});
}
}

if(!_)_ = {
    assign:function(){
        let args = Array.prototype.slice.call(arguments);
        let destination = args.shift();
        args.forEach(
            o => {
                for (let key in o)
                    if (o.hasOwnProperty(key))
                        destination[key] = o[key];
            }  
        );
        return destination;
    }
};


var Platno = class Platno {
    constructor (canv_obj) {
        this.ctx = canv_obj.getContext("2d");
    }
};

Platno.Vector = class Vector {
        constructor(){
            let args = Array.prototype.slice(arguments);
            args = args.map(x=>+x);
            if(args.some(isNaN))
                throw new Facepalm("Vectors contain NUMBERS ONLY, FFS");
            _.assign(this,args);
        }
        
        toString(){Array.toString.apply(this,arguments);}
        
        add(v,inst){
            if(!(v instanceof Vector))
                throw new Facepalm("WTF ru doin' m8?! Vector + 2.3pi apples ?!");
            if(this.length !== v.length)
                throw new Facepalm("U can only add same-dimensional vectors");
            switch(inst){
                case 1: return this.forEach((nu,i) => this[i] += v[i]), this;
                case 2: return v.forEach((nu,i) => v[i] += this[i]), v;
                default: return new Vector(...Array(v.length).fill().map((_,i)=>this[i]+v[i]));
            }
        }
        
        substract(v,inst){
            if(!(v instanceof Vector))
                throw new (class Facepalm{constructor(desc){this.description=desc}})("WTF ru doin' m8?! Vector + 2.3pi apples ?!");
            return this.add(v.invert(),2);
        }
        
        invert(inst){
            if(!inst)return new Vector(...Array.prototype.map.call(this, x=>-x));
            else return this.forEach((nu,i) => this[i]=-this[i]), this;
        }
        
        scalar_multiply(n,inst){
            if(!inst)return new Vector(...Array.prototype.map.call(this, x=>x*n));
            else return this.forEach((nu,i) => this[i]*=n), this;
        }

        getLength(){
            return Math.pow(Array.prototype.map.call(this,x=>Math.pow(x,this.length)).reduce((a,b)=>a+b),1/this.length);
        }        
};

Platno.Color = class Color {
    constructor(r,g,b,a){
        this.r=r; this.g=g; this.b=b; this.alpha=a;
    }
    valueOf(exclA){
        return (exclA?["r","g","b"]:["r","g","b","alpha"]).map(x=>this[x]);
    }
    toString(exclA){
        return (exclA?"rgb(":"rgba(") + this.valueOf(exclA)+ ")";
    }
};

Platno.Gradient = class Gradient {
  constructor(){
    this.colorStops = new TypeArray(Color);
    Array.prototype.forEach.call(arguments,(at,color)=>this.colorStops[at]=color);
  }
  smoothen(n){
      n = n||0.9;
      this.colorStops[n] = (x=>{x.alpha=0;return x})(new Color(...this.colorStops[1].valueOf()));
  }
};

Platno.RadialGradient = class RadialGradient extends Gradient {}

Platno.LinearGradient = class LinearGradient extends Gradient {}

Platno.Tool = class Tool {
    constructor(){}
};
_.assign(Platno.Tool.prototype,{
   alpha:1 
});


Platno.Brush = class Brush extends Platno.Tool {
   constructor(strokeStyle,lineWidth,widthDrawMode,lineCap,lineJoin,miterLimit,lineDash,lineDashOffset){
       if(strokeStyle.split("").slice(0,5)==="rgba(") {
           let s = strokeStyle.split(",");
           this.alpha = +s[3];
           this.strokeStyle = "rgb("+s[0].split("(")[1],s[1],s[2]+",)";
       }
       else if(strokeStyle!==undefined) this.strokeStyle=strokeStyle;
       if(lineWidth!==undefined) this.lineWidth = lineWidth;
       if(widthDrawMode!==undefined) this.widthDrawMode = widthDrawMode;
       if(lineCap!==undefined) this.lineCap = lineCap;
       if(lineJoin!==undefined) this.lineJoin = lineJoin;
       if(miterLimit!==undefined) this.miterLimit = miterLimit;
       if(lineDash!==undefined) this.lineDash = lineDash;
       if(lineDashOffset===undefined) lineDashOffset = 0;
       if(typeof lineDashOffset === "number") this.lineDashOffset = (()=>lineDashOffset);
        else this.lineDashOffset = lineDashOffset;
        
   }
};
Platno.Brush.widthDrawModes = {
  FROM_LEFT_TOP: function (v,b){let h = b.lineWidth/2; return v.add(new Vector(h,h),2)},
  FROM_CENTER: function (v){return v},
  FROM_CENTER_AUTO_CRISP:function (v,b){let h = (b.lineWidth/2)%1; return v.add(new Vector(h,h),2)},
};
_.assign(Platno.Brush.prototype,{
    strokeStyle:    "black",
    lineWidth:  1,
    widthDrawMode: Platno.Brush.widthDrawModes.FROM_LEFT_TOP,
    lineCap:    "butt",
    lineJoin:   "miter",
    miterLimit: 10
});

Platno.PaintRoller = class PaintRoller extends Platno.Tool {
    constructor(fillStyle){
       if(fillStyle.split("").slice(0,5)==="rgba(") {
           let s = fillStyle.split(",");
           this.alpha = +s[3];
           this.fillStyle = "rgb("+s[0].split("(")[1],s[1],s[2]+",)";
       }
       else if(fillStyle!==undefined) this.fillStyle=fillStyle;
    }
};
_.assign(Platno.PaintRoller.prototype,{
    fillStyle:  "black"
});

let PCO = Platno.CanvasObject = class CanvasObject {
    //drawTick(){if(this.visible)this.draw();}
    draw(){}
};
_.assign(PCO.prototype, {
        visible:    true
    });

PCO.CanvasPoint = class CanvasPoint extends PCO {
    constructor(u){
        if(!(u instanceof Platno.Vector && u.length === 2)) throw new Facepalm("Instructions unclear: got timespace stuck in oven");
        this.position = u;
    }
};

let PCG = PCO.CanvasGroup = class CanvasGroup extends PCO {
    constructor(){
        this.elements = new TypeArray(this.memberType);
        Array.prototype.forEach.call(arguments,x=>this.elements.push(x));
    }
};
_.assign(PCO.CanvasGroup.prototype, {
        memberType:   PCO
    });

PCO.Line = class Line extends PCG {
    constructor(){
        super(...Array.prototype.slice.call(arguments,0,2));
    }
};
_.assign(PCO.Line.prototype, {
        memberType:   PCO.Point
    });

PCO.Polygon = class Polygon extends PCG {
    constructor(){
        super(...arguments);
    }
};
_.assign(PCO.Polygon.prototype, {
        memberType:   PCO.Point
    });



var AAMotor;

(function(){
{"see Tapwrap.js";
function TapWrap(a){
	var o=Object.create(TapWrap.prototype);
	o._wrapped=a;
	return o
};
TapWrap.prototype=
{
	val:	function(){return this._wrapped},
	set:	function(prop,val){ //,prop2,val2,prop3,val3 or {prop: val, prop1: val1}
				if(arguments.length>2)
					while(arguments.length)
						this.set([].shift.call(arguments),[].shift.call(arguments));
				if(prop instanceof Object)
					for(var i in prop)
						prop.hasOwnProperty(i)&&(this._wrapped[i]=prop[i]); 
				else this._wrapped[prop]=val;
				return this
			},
	tap:	function(func,args,val){
				var g;
				if(typeof func=="function")g=func.apply(this._wrapped,args);
				else g=this._wrapped[func].apply(this._wrapped,args);
				return val?g:this;
			}
};
Object.defineProperty(Object.prototype,"tapWrap",{value:function(){return TapWrap(this);}, writable: true, configurable: true, enumerable: false})
}

function Facepalm(){Error.apply(this,arguments);}





let AAM = AAMotor = function(){}
AAM.tapWrap()
.set({
	e:{//enums
		gender:{MALE:"Male",FEMALE:"Female","???":"???", HIDDEN: {toString:_=>throw new Facepalm("Someone here is lazy for proper code")}},
		voice:{ //?simplify toDef functions here?
			MALE:	{filename:"human", pitch:1},
			FEMALE: {filename:"human", pitch:2},
			ANDROGYNOUS: {filename:"human", pitch:Math.sqrt(2)}
			TYPEWRITER: {filename:"typewriter",pitch:1},
			NONE: {}
		}
	
	}
}
.set({
	C:{ //classes
		Story: TapWrap(function Story(){
			
		}).set({prototype:{
			
		}}),
		
		Script: TapWrap(function Script(){
			
		}).set({prototype:{
			
		}}),
		
		Scene: TapWrap(function Scene(){
			
		}).set({prototype:{
			
		}}),
		
		Character: TapWrap(function Character(desc,dispname,props,spriteset){
			this.desc = desc;
			this.dispname = dispname;
			this.props = props;
			this.sprites = spriteset;
		}).set({prototype:{
			dispname:"???",
			gender: AAM.e.gender["???"],
			age: -1,
			voice: AAM.e.voice.NONE
		}}),
		
		Spriteset: TapWrap(function(){
			
		}).set({prototype:{
			
		}}),
		
		Evidence: TapWrap(function Evidence(desc,checkB){
			
		}).set({prototype:{
			checkB:	false;
		}}),
		
		Description: TapWrap(function Description(name,meta,text){
			this.name = name;
			this.meta = meta;
			this.text = text;
		}).set({prototype:{
			name:"???",
			meta:"",
			text:""
			toDef: function(){return {$TYPE: this.constructor.name, name:this.name, meta:this.meta, text: this.text}}
		}}),
		
		Variables: TapWrap(function(){
			
		}).set({prototype:{
			
		}})
	},
	
})
for (let c in AAM.C)if(AAM.C.hasOwnProperty(c))AAM.C[c].prototype.constructor = AAM.C;


})();
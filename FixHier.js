FixHier = function(o){
	let r = function(q,v,s){
		let [o,p] = FixHier.d[this.$id];
		switch (typeof q){
			"undefined": return o;
			"number": 
				if(!(o instanceof Array) && Object.keys(o).filter(x=>+x===x).length==0) {
					let k = o
				}
		}
		
		}
	r.$id = FixHier.pullId.next().value;
	FixHier.d[r.$id] = {};
}
FixHier.pullId = (function* pullId(n=0){while(!0)yield n++})()
FixHier.d = Object.create(null);
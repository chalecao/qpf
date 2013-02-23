define(function(){

/**
 * derive a sub class from base class
 * @defaultOpt [Object|Function] default option of this sub class, 
 						method of the sub can use this.xxx to access this option
 * @initialize [Function](optional) initialize after the sub class is instantiated
 * @proto [Object](optional) prototype methods/property of the sub class
 *
 */
function derive(defaultOpt, initialize/*optional*/, proto/*optional*/){

	if( typeof initialize == "object"){
		proto = initialize;
		initialize = null;
	}

	var _super = this;

	var sub = function(options){

		// call super constructor
		_super.call( this );

		// call defaultOpt generate function each time
		// if it is a function, So we can make sure each 
		// property in the object is fresh
		_.extend( this, typeof defaultOpt == "function" ?
						defaultOpt.call(this) : defaultOpt );

		for( var name in options ){
			if( typeof this[name] == "undefined" ){
				console.warn( name+" is not an option");
			}
		}
		_.extend( this, options );

		if( this.constructor == sub){
			// find the base class, and the initialize function will be called 
			// in the order of inherit
			var base = sub,
				initializeChain = [initialize];
			while(base.__super__){
				base = base.__super__;
				initializeChain.unshift( base.__initialize__ );
			}
			for(var i = 0; i < initializeChain.length; i++){
				if( initializeChain[i] ){
					initializeChain[i].call( this );
				}
			}
		}
	};
	// save super constructor
	sub.__super__ = _super;
	// initialize function will be called after all the super constructor is called
	sub.__initialize__ = initialize;

	// extend prototype function
	_.extend( sub.prototype, _super.prototype, proto);

	sub.prototype.constructor = sub;
	
	// extend the derive method as a static method;
	sub.derive = _super.derive;

	return sub;
}

return {
	derive : derive
}

})
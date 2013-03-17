 (function(factory){
 	// AMD
 	if( typeof define !== "undefined" && define["amd"] ){
 		define(["exports"], factory);
 	// No module loader
 	}else{
 		factory( window["qpf"] = {} );
 	}

})(function(_exports){

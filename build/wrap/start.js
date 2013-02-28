 (function(factory){
 	// AMD
 	if( typeof define !== "undefined" && define["amd"] ){
 		define(["exports"], factory);
 	// No module loader
 	}else{
 		factory( window["wse_ui"] = {} );
 	}

})(function(_exports){

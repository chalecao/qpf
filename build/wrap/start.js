 (function(factory){
 	// AMD
 	if( typeof define !== "undefined" && define["amd"] ){
 		define(["exports", "knockout", "$"], factory);
 	// No module loader
 	}else{
 		factory( window["qpf"] = {}, ko );
 	}

})(function(_exports, ko, $){

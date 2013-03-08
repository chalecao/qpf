
var wse_ui = require("src/main");

// only export the use method 
_exports.use = function(path){
	return require(path);
}

})
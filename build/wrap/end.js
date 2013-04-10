
var qpf = require("src/qpf");

// only export the use method 
_exports.use = function(path){
	return require(path);
}

})
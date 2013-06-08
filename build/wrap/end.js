
var qpf = require("src/qpf");

// only export the use method 
_exports.use = function(path){
	return require(path);
}

for(var name in qpf){
    _exports[name] = qpf[name];
}

})
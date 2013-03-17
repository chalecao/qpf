({
	baseUrl : "../",
	paths : {
		"qpf" : "src/qpf",
		"core" : "src/core",
		"components" : "src/components",
		// libraries
		"knockout" : "thirdparty/knockout",
		"ko.mapping": "thirdparty/ko.mapping",
		"goo" : "thirdparty/goo"
	},
	// excludeShallow : ['knockout', 'ko.mapping', 'goo'],
	name : "build/almond",
	include : [ "src/main"],
				
	out:"./output/qpf.js",
	wrap : {
		startFile : 'wrap/start.js',
		endFile : 'wrap/end.js'
	},
	optimize:"none"
})
({
	baseUrl : "../",
	paths : {
		"wse_ui" : "src/wse_ui",
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
				
	out:"./output/wse_ui.js",
	wrap : {
		startFile : 'wrap/start.js',
		endFile : 'wrap/end.js'
	},
	optimize:"none"
})
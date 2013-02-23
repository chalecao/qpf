({
	baseUrl : "../",
	paths : {
		"core" : "src/core",
		"components" : "src/components",
		// libraries
		"knockout" : "thirdparty/knockout",
		"ko.mapping": "thirdparty/ko.mapping",
		"goo" : "thirdparty/goo"
	},
	excludeShallow : ['knockout', 'ko.mapping', 'goo'],
	// plugins
	map : {
		'*' : {
			'less' : 'require-lib/require-less/less',
			'css' : 'require-lib/require-css/css'
		}
	},
	name : "src/wse_ui",
	out:"./output/wse_ui.min.js"
})
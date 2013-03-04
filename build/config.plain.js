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
	// excludeShallow : ['knockout', 'ko.mapping', 'goo'],
	name : "build/almond",
	include : [ "components/meta/button",
				"components/meta/checkbox",
				"components/meta/combobox",
				"components/meta/label",
				"components/meta/range",
				"components/meta/spinner",
				"components/meta/textfield",
				"components/meta/canvas",
				"components/container/window",
				"components/container/tab",
				"components/widget/vector"],
				
	out:"./output/wse_ui.js",
	wrap : {
		startFile : 'wrap/start.js',
		endFile : 'wrap/end.js'
	},
	optimize:"none"
})
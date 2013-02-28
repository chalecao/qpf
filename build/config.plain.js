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
	// plugins
	map : {
		'*' : {
			'less' : 'require-lib/require-less/less',
			'css' : 'require-lib/require-css/css'
		}
	},
	name : "build/almond",
	include : ["components/meta/button",
				"components/meta/checkbox",
				"components/meta/combobox",
				"components/meta/label",
				"components/meta/range",
				"components/meta/spinner",
				"components/meta/textfield",
				"components/container/window",
				"components/widget/vector"],
				
	out:"./output/wse_ui.js",
	wrap : {
		startFile : 'wrap/start.js',
		endFile : 'wrap/end.js'
	}
})
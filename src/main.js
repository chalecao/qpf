// portal for all the components
define(["core/xmlparser",
		"core/mixin/derive",
		"core/mixin/event",
		"components/base",
		"components/util",
		"components/meta/button",
		"components/meta/canvas",
		"components/meta/checkbox",
		"components/meta/combobox",
		"components/meta/label",
		"components/meta/meta",
		"components/meta/range",
		"components/meta/spinner",
		"components/meta/textfield",
		"components/container/container",
		"components/container/panel",
		"components/container/window",
		"components/container/tab",
		"components/container/vbox",
		"components/container/hbox",
		"components/container/inline",
		"components/container/application",
		"components/widget/vector",
		"components/widget/widget",
		"components/widget/palette"], function(){

	console.log("wse ui is loaded");

	return {
		core : {
			xmlparser : require('core/xmlparser'),
			mixin : {
				derive : require('core/mixin/derive'),
				event : require('core/mixin/event')
			}
		},
		components : {
			base : require('components/base'),
			mixin : {
				draggable : require('components/mixin/draggable')
			},
			meta : {
				meta : require('components/meta/meta'),
				button : require('components/meta/button'),
				checkbox : require('components/meta/checkbox'),
				combobox : require('components/meta/combobox'),
				label : require('components/meta/label'),
				range : require('components/meta/range'),
				spinner : require('components/meta/spinner'),
				textfield : require('components/meta/textfield'),
				canvas : require("components/meta/canvas")
			},
			container : {
				container : require('components/container/container'),
				panel : require('components/container/panel'),
				window : require('components/container/window'),
				tab : require("components/container/tab"),
				vbox : require("components/container/vbox"),
				hbox : require("components/container/hbox"),
				inline : require("components/container/inline"),
				application : require("components/container/application")
			},
			widget : {
				widget : require("components/widget/widget"),
				vector : require("components/widget/vector"),
				palette : require("components/widget/palette")
			}
		}
	}
})
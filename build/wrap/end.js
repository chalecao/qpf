
var wse_ui = {
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
			tab : require("components/container/tab")
		},
		widget : {
			widget : require("components/widget/widget"),
			vector : require("components/widget/vector")
		}
	}
}

for(var name in wse_ui){
	_exports[name] = wse_ui[name];
}

_exports["knockout"] = require("knockout");
_exports["goo"] = require("goo");

})
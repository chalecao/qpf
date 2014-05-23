define(function(require){
    
    var qpf =  {
	"Base": require('qpf/Base'),
	"container": {
		"Accordian": require('qpf/container/Accordian'),
		"Application": require('qpf/container/Application'),
		"Box": require('qpf/container/Box'),
		"Container": require('qpf/container/Container'),
		"HBox": require('qpf/container/HBox'),
		"Inline": require('qpf/container/Inline'),
		"List": require('qpf/container/List'),
		"Panel": require('qpf/container/Panel'),
		"Tab": require('qpf/container/Tab'),
		"VBox": require('qpf/container/VBox'),
		"Window": require('qpf/container/Window')
	},
	"core": {
		"Clazz": require('qpf/core/Clazz'),
		"XMLParser": require('qpf/core/XMLParser'),
		"color": require('qpf/core/color'),
		"mixin": {
			"derive": require('qpf/core/mixin/derive'),
			"notifier": require('qpf/core/mixin/notifier')
		}
	},
	"helper": {
		"Draggable": require('qpf/helper/Draggable'),
		"Resizable": require('qpf/helper/Resizable')
	},
	"meta": {
		"Button": require('qpf/meta/Button'),
		"CheckBox": require('qpf/meta/CheckBox'),
		"Color": require('qpf/meta/Color'),
		"ComboBox": require('qpf/meta/ComboBox'),
		"IconButton": require('qpf/meta/IconButton'),
		"Label": require('qpf/meta/Label'),
		"ListItem": require('qpf/meta/ListItem'),
		"Meta": require('qpf/meta/Meta'),
		"NativeHtml": require('qpf/meta/NativeHtml'),
		"Slider": require('qpf/meta/Slider'),
		"Spinner": require('qpf/meta/Spinner'),
		"TextField": require('qpf/meta/TextField'),
		"Tree": require('qpf/meta/Tree')
	},
	"util": require('qpf/util'),
	"widget": {
		"ColorViewModel": require('qpf/widget/ColorViewModel'),
		"Palette": require('qpf/widget/Palette'),
		"PaletteWindow": require('qpf/widget/PaletteWindow'),
		"Vector": require('qpf/widget/Vector'),
		"Widget": require('qpf/widget/Widget')
	}
};

    qpf.create = qpf.Base.create;
    
    qpf.init = qpf.util.init;

    return qpf;
})
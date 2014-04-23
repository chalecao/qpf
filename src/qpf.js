define(function(require){
    
    var qpf =  {
	"Base": require('Base'),
	"container": {
		"Accordian": require('container/Accordian'),
		"Application": require('container/Application'),
		"Box": require('container/Box'),
		"Container": require('container/Container'),
		"HBox": require('container/HBox'),
		"Inline": require('container/Inline'),
		"List": require('container/List'),
		"Panel": require('container/Panel'),
		"Tab": require('container/Tab'),
		"VBox": require('container/VBox'),
		"Window": require('container/Window')
	},
	"core": {
		"Clazz": require('core/Clazz'),
		"XMLParser": require('core/XMLParser'),
		"mixin": {
			"derive": require('core/mixin/derive'),
			"notifier": require('core/mixin/notifier')
		}
	},
	"helper": {
		"Draggable": require('helper/Draggable'),
		"Resizable": require('helper/Resizable')
	},
	"meta": {
		"Button": require('meta/Button'),
		"CheckBox": require('meta/CheckBox'),
		"ComboBox": require('meta/ComboBox'),
		"Label": require('meta/Label'),
		"ListItem": require('meta/ListItem'),
		"Meta": require('meta/Meta'),
		"NativeHtml": require('meta/NativeHtml'),
		"Slider": require('meta/Slider'),
		"Spinner": require('meta/Spinner'),
		"TextField": require('meta/TextField'),
		"Tree": require('meta/Tree')
	},
	"util": require('util'),
	"widget": {
		"Color": require('widget/Color'),
		"Palette": require('widget/Palette'),
		"Vector": require('widget/Vector'),
		"Widget": require('widget/Widget')
	}
};

    qpf.create = qpf.Base.create;

    return qpf;
})
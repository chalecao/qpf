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
	"meta": {
		"Button": require('meta/Button'),
		"CheckBox": require('meta/CheckBox'),
		"ComboBox": require('meta/ComboBox'),
		"Label": require('meta/Label'),
		"Meta": require('meta/Meta'),
		"Slider": require('meta/Slider'),
		"Spinner": require('meta/Spinner'),
		"TextField": require('meta/TextField'),
		"Tree": require('meta/Tree')
	},
	"mixin": {
		"Draggable": require('mixin/Draggable')
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
define(["knockout",
		"components/mixin/draggable",
		"components/meta/button",
		"components/meta/label",
		"components/meta/checkbox",
		"components/meta/spinner",
		"components/meta/range",
		"components/meta/textfield",
		"components/meta/combobox",
		'components/widget/vector',
		"components/container/container"], function(ko){

	var Base = require("components/base");
	var Draggable = require("components/mixin/draggable");

	var tpl = $("#Template").html();

	// var codeMirror = CodeMirror($('#CodeEditor')[0], {
	// 	mode : "htmlmixed",
	// 	value : tpl,
	// 	theme : "ambiance",
	// 	lineNumbers : true
	// })

	var $el = $(tpl);
	ko.applyBindings({}, $el[0]);

	$('.right').append( $el );

	var item = Base.getByDom($("#Main"));

})
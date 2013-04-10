define(["knockout",
		"../src/qpf"], function(ko){

	var Base = require("components/base");
	var Draggable = require("components/mixin/draggable");

	var tpl = $("#Template").html();

	var $el = $(tpl);
	$('.right').append( $el );

	var viewModel = {
		title : ko.observable("window"),
		clickHandler : function(){
			$el.qpf("dispose");
		},
		info : ko.observable("Im a label~")
	}
	$el.qpf("init", viewModel);

})
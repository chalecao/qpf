define(["knockout",
		"../src/main"], function(ko){

	var Base = require("components/base");
	var Draggable = require("components/mixin/draggable");

	var tpl = $("#Template").html();

	var $el = $(tpl);
	$('.right').append( $el );

	var viewModel = {
		title : ko.observable("window"),
		clickHandler : function(){
			viewModel.info("button is clicked");
		},
		info : ko.observable("Im a label~")
	}

	ko.applyBindings(viewModel, $el[0]);

	var item = Base.getByDom($el[0]);

})
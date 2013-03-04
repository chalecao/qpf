define(["knockout",
		"../src/main"], function(ko){

	var XMLParser = require("core/xmlparser");

	var viewModel = {
		title : ko.observable("window"),
		clickHandler : function(){
			viewModel.info("button is clicked");
		},
		vector : {
			x : ko.observable(10),
			y : ko.observable(10)
		},
		info : ko.observable("Im a label~")
	}

	$.get('./component.xml', function(result){

		var dom = XMLParser.parse(result);
		console.log(dom);
		document.body.appendChild(dom);

		ko.applyBindings(viewModel, dom);
		
	}, 'text')

})
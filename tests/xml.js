define(['core/xmlparser',
		"knockout",
		"components/mixin/draggable",
		"components/meta/button",
		"components/meta/label",
		"components/meta/checkbox",
		"components/meta/spinner",
		"components/meta/range",
		"components/meta/textfield",
		"components/meta/combobox",
		'components/widget/vector',
		"components/container/window",
		'components/container/tab'], function(XMLParser, ko){

	var viewModel = {
		title : ko.observable("window"),
		clickHandler : function(){
			viewModel.info("button is clicked");
		},
		info : ko.observable("Im a label~")
	}

	$.get('./component.xml', function(result){

		var dom = XMLParser.parse(result);

		document.body.appendChild(dom);

		ko.applyBindings(viewModel, dom);
		
	}, 'text')

})
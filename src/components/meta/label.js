//======================================
// Label component
//======================================
define(['./meta',
		'core/xmlparser',
		'knockout'], function(Meta, XMLParser, ko){

var Label = Meta.derive(function(){
return {
	// value of the Label
	text : ko.observable('Label')
	
} }, {

	template : '<Label data-bind="html:text"></Label>',

	type : 'LABEL',

	css : 'label'
});

Meta.provideBinding("label", Label);

// provide parser when do xmlparsing
XMLParser.provideParser("label", function(xmlNode){

	var text = XMLParser.util.getTextContent(xmlNode);
	if(text){
		return {
			text : text
		}
	}
})

return Label;

})
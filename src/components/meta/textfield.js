//===================================
// Textfiled component
//
// @VMProp text
// @VMProp placeholder
//
//===================================
define(['./meta',
		'knockout'], function(Meta, ko){

var TextField = Meta.derive(
{
	
	tag : "div",

	viewModel : {

		text : ko.observable(""),
		
		placeholder : ko.observable("")
	}

}, {
	
	type : "TEXTFIELD",

	template : '<input type="text" data-bind="attr:{placeholder:placeholder}, value:text"/>'
})

Meta.provideBinding("textfield", TextField);

})
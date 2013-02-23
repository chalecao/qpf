//======================================
// Button component
//======================================
define(['./meta',
		'knockout'], function(Meta, ko){

var Button = Meta.derive(function(){
return {
	$el : $('<button data-bind="html:text"></button>'),

	viewModel : {
		// value of the button
		text : ko.observable('Button')
	}
}}, {

	type : 'BUTTON',
});

Meta.provideBinding("button", Button);

return Button;

})
//======================================
// Label component
//======================================
define(['./meta',
		'knockout'], function(Meta, ko){

var Label = Meta.derive(function(){
return {
	$el : $('<Label data-bind="html:text"></Label>'),

	viewModel : {
		// value of the Label
		text : ko.observable('Label')
	}
} }, {
	type : 'LABEL',
});

Meta.provideBinding("label", Label);

return Label;

})
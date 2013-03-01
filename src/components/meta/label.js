//======================================
// Label component
//======================================
define(['./meta',
		'knockout'], function(Meta, ko){

var Label = Meta.derive(function(){
return {
	viewModel : {
		// value of the Label
		text : ko.observable('Label')
	}
} }, {

	template : '<Label data-bind="html:text"></Label>',

	type : 'LABEL',

	css : 'label'
});

Meta.provideBinding("label", Label);

return Label;

})
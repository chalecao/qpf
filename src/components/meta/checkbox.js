//======================================
// Checkbox component
//======================================
define(['./meta',
		'knockout'], function(Meta, ko){

var Checkbox = Meta.derive(function(){
return {
	
	viewModel : {
		// value of the button
		checked : ko.observable(false),
		label : ko.observable("")
	}
}}, {

	template : '<input type="checkbox" data-bind="checked:checked" />\
				<span data-bind="css:{checked:checked}"></span>\
				<label data-bind="text:label"></label>',

	type : 'CHECKBOX',
	css : 'checkbox',

	// binding events
	afterRender : function(){
		var vm = this.viewModel;
		this.$el.click(function(){
			vm.checked( ! vm.checked() );
		})
	}
});

Meta.provideBinding("checkbox", Checkbox);

return Checkbox;

})	
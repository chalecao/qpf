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

	eventsProvided : ['click'],

	type : 'BUTTON',

	afterrender : function(){
		var me = this;
		this.$el.click(function(){
			me.trigger("click");
		})
	}
});

Meta.provideBinding("button", Button);

return Button;

})
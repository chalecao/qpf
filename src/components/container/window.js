//===================================
// Window componennt
// Window is a panel wich can be drag
// and close
//===================================
define(["./container",
		"./panel",
		'../mixin/draggable',
		"knockout"], function(Container, Panel, Draggable, ko){

var Window = Panel.derive(function(){

return {

}}, function(){
	_.extend(this.viewModel, {
		left : ko.observable(0),
		top : ko.observable(0)
	});
}, {

	type : 'WINDOW',

	css : _.union('window', Panel.prototype.css),

	initialize : function(){
		Draggable.applyTo( this );
	},

	afterRender : function(){
		
		Panel.prototype.afterRender.call( this );

		this.draggable.add( this.$el, this._$header);
	}
})

Container.provideBinding("window", Window);

return Window;

})
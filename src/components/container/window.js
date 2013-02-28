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

}}, {

	type : 'WINDOW',

	initialize : function(){
		Draggable.applyTo( this );
	},

	afterrender : function(){
		
		Panel.prototype.afterrender.call( this );

		this.draggable.add( this.$el, this._$header);
	}
})

Container.provideBinding("window", Window);

return Window;

})
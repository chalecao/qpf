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

	$el : $('<div data-bind="style:{left:_leftPx, top:_topPx}"></div>'),

	viewModel : {

		children : ko.observableArray(),
		title : ko.observable("Window"),

		left : ko.observable(0),
		top : ko.observable(0),

		_leftPx : ko.computed(function(){
			return this.viewModel.left()+"px";
		}, this, {
			deferEvaluation : true
		}),
		_topPx : ko.computed(function(){
			return this.viewModel.top()+"px";
		}, this, {
			deferEvaluation : true
		})
	}
}}, {

	type : 'WINDOW',

	css : _.union('window', Panel.prototype.css),

	initialize : function(){
		Draggable.applyTo( this );

		this.$el.bind("resize", {
			context : this
		}, this.resizeBody);
	},

	afterRender : function(){
		
		Panel.prototype.afterRender.call( this );

		this.draggable.add( this.$el, this._$header);
		
		this._$body.bind("resize", {context : this}, this.resizeContainer);
	}
})

Container.provideBinding("window", Window);

return Window;

})
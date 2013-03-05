//===============================================
// base class of vbox and hbox
//===============================================

define(['./container',
		'knockout',
		'core/jquery.resize'], function(Container, ko){

var Box = Container.derive(function(){

return {

}}, {

	type : 'BOX',

	css : 'box',

	initialize : function(){
		this.on("resize", this.resize);

		this.viewModel.children.subscribe(function(){
			this.resize();
		}, this);

		this.$el.css("position", "relative");

		var self = this;
		this.$el.resize(function(){
			self.resize();
		})
	},
	// method will be rewritted
	resize : function(){},

	_getMargin : function($el){
		return {
			left : parseInt($el.css("marginLeft")) || 0,
			top : parseInt($el.css("marginTop")) || 0,
			bottom : parseInt($el.css("marginBottom")) || 0,
			right : parseInt($el.css("marginRight")) || 0,
		}
	}

})


// Container.provideBinding("box", Box);

return Box;

})
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
		this.on("resize", this._deferResize, this);

		this.viewModel.children.subscribe(function(children){
			this.resize();
			_.each(children, function(child){
				child.on('resize', this._deferResize, this);
			}, this)
		}, this);

		this.$el.css("position", "relative");

		var self = this;
		this.$el.resize(function(){
			self._deferResize();
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
	},

	_resizeTimeout : 0,

	_deferResize : function(){
		var self = this;
		// put resize in next tick,
		// if multiple child hav triggered the resize event
		// it will do only once;
		if( this._resizeTimeout ){
			clearTimeout( this._resizeTimeout );
		}
		this._resizeTimeout = setTimeout(function(){
			self.resize()
		});
	}

})


// Container.provideBinding("box", Box);

return Box;

})
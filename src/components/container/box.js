//===============================================
// base class of vbox and hbox
//===============================================

define(['./container',
		'knockout'], function(Container, ko){

var Box = Container.derive(function(){

return {

}}, {

	type : 'BOX',

	css : 'box',

	initialize : function(){

		this.children.subscribe(function(children){
			this.afterResize();
			// resize after the child resize happens will cause recursive
			// reszie problem
			// _.each(children, function(child){
			// 	child.on('resize', this.afterResize, this);
			// }, this)
		}, this);

		this.$el.css("position", "relative");

		var self = this;
	},

	_getMargin : function($el){
		return {
			left : parseInt($el.css("marginLeft")) || 0,
			top : parseInt($el.css("marginTop")) || 0,
			bottom : parseInt($el.css("marginBottom")) || 0,
			right : parseInt($el.css("marginRight")) || 0,
		}
	},

	_resizeTimeout : 0,

	afterResize : function(){

		var self = this;
		// put resize in next tick,
		// if multiple child have triggered the resize event
		// it will do only once;
		if( this._resizeTimeout ){
			clearTimeout( this._resizeTimeout );
		}
		this._resizeTimeout = setTimeout(function(){
			self.resizeChildren();
			Container.prototype.afterResize.call(self);
		});

	}

})


// Container.provideBinding("box", Box);

return Box;

})
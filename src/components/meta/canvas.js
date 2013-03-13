//==============================
// Canvas, 
// Use Goo.js as drawing library 
//==============================
define(["goo",
		"knockout",
		"./meta"], function(Goo, ko, Meta){

var Canvas = Meta.derive(function(){

return {

	tag : "canvas",

	viewModel : {
		
		framerate : ko.observable(0)
	},

	stage : null
}}, {

	type : 'CANVAS',

	css : 'canvas',

	initialize : function(){

		this.stage = Goo.create(this.$el[0]);

		this.viewModel.framerate.subscribe(function(newValue){
			newValue ?
				this.run( newValue ) :
				this.stop();
		});

		this.afterResize();
	},

	_runInstance : 0,
	run : function( fps ){
		if( this._runInstance ){
			clearTimeout( this._runInstance)
		}
		this._runInstance = setTimeout( this.render.bind(this), 1000 / fps)
	},
	stop : function(){
		clearTimeout( this._runInstance );
		this._runInstance = 0;
	},

	doRender : function(){
		this.stage.render();
	},

	afterResize : function(){
		if( this.stage ){
			var width = this.viewModel.width(),
				height = this.viewModel.height();
			if( width && height ){
				this.stage.resize( width, height );
			}
			this.render();
		}
	}
});

Meta.provideBinding("canvas", Canvas);

return Canvas;

})
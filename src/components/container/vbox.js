//===============================================
// vbox layout
// 
// Items of vbox can have flex and prefer two extra properties
// About this tow properties, can reference to flexbox in css3
// http://www.w3.org/TR/css3-flexbox/
// https://github.com/doctyper/flexie/blob/master/src/flexie.js
// TODO : add flexbox support
// 		 align 
//		padding ????
//===============================================

define(['./container',
		'knockout',
		'core/jquery.resize'], function(Container, ko){

var vBox = Container.derive(function(){

return {

}}, {

	type : 'VBOX',

	css : 'vbox',

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

	resize : function(){

		var flexSum = 0,
			remainderHeight = this.$el.height(),
			childrenWithFlex = [];

		_.each(this.viewModel.children(), function(child){
			// stretch the width
			// (when align is stretch)
			child.viewModel.width( this.$el.width() );
			
			var prefer = ko.utils.unwrapObservable( child.viewModel.prefer );

			// item has a prefer size;
			if( prefer ){
				// TODO : if the prefer size is lager than vbox size??
				prefer = Math.min(prefer, remainderHeight);
				child.viewModel.height( prefer );

				remainderHeight -= prefer;
			}else{
				var flex = parseInt(ko.utils.unwrapObservable( child.viewModel.flex ) || 1);
				// put it in the next step to compute
				// the height based on the flex property
				childrenWithFlex.push(child);
				flexSum += flex;
			}
		}, this);

		_.each( childrenWithFlex, function(child){
			var flex = ko.utils.unwrapObservable( child.viewModel.flex ),
				ratio = flex / flexSum;
			child.viewModel.height( remainderHeight * ratio );	
		})

		var prevHeight = 0;
		_.each(this.viewModel.children(), function(child){
			child.$el.css({
				"position" : "absolute",
				"left" : '0px',
				"top" : prevHeight + "px"
			})
			prevHeight += child.viewModel.height();
		})
	}

})


Container.provideBinding("vbox", vBox);

return vBox;

})
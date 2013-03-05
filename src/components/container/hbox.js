//===============================================
// hbox layout
// 
// Items of hbox can have flex and prefer two extra properties
// About this tow properties, can reference to flexbox in css3
// http://www.w3.org/TR/css3-flexbox/
// https://github.com/doctyper/flexie/blob/master/src/flexie.js
//===============================================

define(['./container',
		'knockout',
		'core/jquery.resize'], function(Container, ko){

var hBox = Container.derive(function(){

return {

}}, {

	type : 'HBOX',

	css : 'hbox',

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
			remainderWidth = this.$el.width(),
			childrenWithFlex = [];

		_.each(this.viewModel.children(), function(child){
			// stretch the height
			// (when align is stretch)
			child.viewModel.height( this.$el.height() );

			var prefer = ko.utils.unwrapObservable( child.viewModel.prefer );

			// item has a prefer size;
			if( prefer ){
				// TODO : if the prefer size is lager than vbox size??
				prefer = Math.min(prefer, remainderWidth);
				child.viewModel.width( prefer );

				remainderWidth -= prefer;
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
			child.viewModel.width( remainderWidth * ratio );	
		})

		var prevWidth = 0;
		_.each(this.viewModel.children(), function(child){
			child.$el.css({
				"position" : "absolute",
				"top" : '0px',
				"left" : prevWidth + "px"
			})
			prevWidth += child.viewModel.width();
		})
	}

})


Container.provideBinding("hbox", hBox);

return hBox;

})
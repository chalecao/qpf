//===============================================
// hbox layout
// 
// Items of hbox can have flex and prefer two extra properties
// About this tow properties, can reference to flexbox in css3
// http://www.w3.org/TR/css3-flexbox/
// https://github.com/doctyper/flexie/blob/master/src/flexie.js
//===============================================

define(['./container',
		'./box',
		'knockout'], function(Container, Box, ko){

var hBox = Box.derive(function(){

return {

}}, {

	type : 'HBOX',

	css : 'hbox',

	resize : function(){

		var flexSum = 0,
			remainderWidth = this.$el.width(),
			childrenWithFlex = [],

			marginCache = [],
			marginCacheWithFlex = [];

		_.each(this.viewModel.children(), function(child, idx){
			var margin = this._getMargin(child.$el);
			marginCache.push(margin);
			// stretch the height
			// (when align is stretch)
			child.viewModel.height( this.$el.height()-margin.top-margin.bottom );

			var prefer = ko.utils.unwrapObservable( child.viewModel.prefer );

			// item has a prefer size;
			if( prefer ){
				// TODO : if the prefer size is lager than vbox size??
				prefer = Math.min(prefer, remainderWidth);
				child.viewModel.width( prefer );

				remainderWidth -= prefer+margin.left+margin.right;
			}else{
				var flex = parseInt(ko.utils.unwrapObservable( child.viewModel.flex ) || 1);
				// put it in the next step to compute
				// the height based on the flex property
				childrenWithFlex.push(child);
				marginCacheWithFlex.push(margin);

				flexSum += flex;
			}
		}, this);

		_.each( childrenWithFlex, function(child, idx){
			var margin = marginCacheWithFlex[idx];
			var flex = ko.utils.unwrapObservable( child.viewModel.flex ),
				ratio = flex / flexSum;
			child.viewModel.width( remainderWidth*ratio-margin.left-margin.right );	
		})

		var prevWidth = 0;
		_.each(this.viewModel.children(), function(child, idx){
			var margin = marginCache[idx];
			child.$el.css({
				"position" : "absolute",
				"top" : '0px',
				"left" : prevWidth + "px"
			});
			prevWidth += child.viewModel.width()+margin.left+margin.right;
		})
	}

})


Container.provideBinding("hbox", hBox);

return hBox;

})
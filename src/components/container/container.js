//============================================
// Base class of all container component
//============================================
define(["../base",
		"knockout"], function(Base, ko){

var Container = Base.derive(function(){
return {
	viewModel : {
		// all child components
		children : ko.observableArray()
	}

}}, function(){

}, {

	type : "CONTAINER",

	css : 'container',
	
	template : '<div data-bind="foreach:children" style="height:100%;width:100%">\
					<div data-bind="wse_view:$data"></div>\
				</div>',

	// add child component
	add : function( sub ){
		sub.parent = this;
		this.viewModel.children.push( sub );
	},
	// remove child component
	remove : function(){
		sub.parent = null;
		this.viewModel.children.remove( sub );
	},
	children : function(){
		return this.viewModel.children()
	},
	dispose : function(){
		
		_.each(this.viewModel.children(), function(child){
			child.dispose();
		});

		Base.prototype.dispose.call( this );
	},
	// get child component by name
	get : function( name ){
		if( ! name ){
			return;
		}
		return _.filter( this.children(), function(item){ return item.name === name } )[0];
	}
})

Container.provideBinding = Base.provideBinding;

// modify the wse_ui bindler
var baseBindler = ko.bindingHandlers["wse_ui"];
ko.bindingHandlers["wse_ui"] = {

	init : function(element, valueAccessor, allBindingsAccessor, viewModel){
		
		//save the child nodes before the element's innerHTML is changed in the createComponentFromDataBinding method
		var childNodes = Array.prototype.slice.call(element.childNodes);

		var component = baseBindler.createComponent(element, valueAccessor);

		if( component && component.instanceof(Container) ){
			// hold the renderring of children until parent is renderred
			// If the child renders first, the element is still not attached
			// to the document. So any changes of observable will not work.
			// Even worse, the dependantObservable is disposed so the observable
			// is detached in to the dom
			// https://groups.google.com/forum/?fromgroups=#!topic/knockoutjs/aREJNrD-Miw
			var subViewModel = {
				'__deferredrender__' : true	
			}
			_.extend(subViewModel, viewModel);
			// initialize from the dom element
			for(var i = 0; i < childNodes.length; i++){
				var child = childNodes[i];
				if( ko.bindingProvider.prototype.nodeHasBindings(child) ){
					// Binding with the container's viewModel
					ko.applyBindings(subViewModel, child);
					var sub = Base.getByDom( child );
					if( sub ){
						component.add( sub );
					}
				}
			}
		}
		if( ! viewModel['__deferredrender__']){
			// do render in the hierarchy from parent to child
			// traverse tree in pre-order
			function render(node){
				node.render();
				if( node.instanceof(Container) ){
					_.each(node.children(), function(child){
						render(child);
					})
				}
			}
			render( component );
		}

		return { 'controlsDescendantBindings': true };

	},
	update : function(element, valueAccessor){
		baseBindler.update(element, valueAccessor);
	}
}

Container.provideBinding("container", Container);

return Container;

})
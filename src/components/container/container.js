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
	
	template : '<div data-bind="foreach:children">\
					<div data-bind="wse_view:$data"></div>\
				</div>',
	// add child component
	add : function( sub ){
		this.viewModel.children.push( sub );
	},
	// remove child component
	remove : function(){
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

		var result = baseBindler.init(element, valueAccessor);

		var component = Base.getByDom( element );

		if( component && component.instanceof(Container) ){

			var children = [];
			// initialize from the dom element
			for(var i = 0; i < childNodes.length; i++){
				var child = childNodes[i];
				if( ko.bindingProvider.prototype.nodeHasBindings(child) ){
					// Binding with the container's viewModel
					ko.applyBindings(viewModel, child);
					var sub = Base.getByDom( child );
					if( sub ){
						children.push( sub );
					}
				}
			}

			component.viewModel.children( children );
		}

		return result;

	},
	update : function(element, valueAccessor){
		baseBindler.update(element, valueAccessor);
	}
}

Container.provideBinding("container", Container);

return Container;

})
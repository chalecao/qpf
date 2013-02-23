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
					<div data-bind="wse_view:$data">\
				</div>',
	// add child component
	add : function( sub ){
		if( ! this.viewModel.children ){
			throw new Error("viewModel must have children property");
		}
		this.viewModel.children.push( sub );
	},
	// remove child component
	remove : function(){
		if( ! this.viewModel.children ){
			throw new Error("viewModel must have children property");
		}
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

//-------------------------------------------
// Handle bingings in the knockout template
var bindings = {};
Container.provideBinding = function(name, Component ){
	bindings[name] = Component;
}
var unwrap = ko.utils.unwrapObservable;
// provide bindings to knockout
ko.bindingHandlers["wse_container"] = {
	init : function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext ){
		var value = valueAccessor();
		
		var options = unwrap(value) || {},
			type = unwrap(options.type),
			name = unwrap(options.name),
			attr = _.omit(options, "type", "name");
						
		if( options.type ){
			var Component = bindings[ options.type ];
			if( Component ){
				var instance = new Component({
					name : name || "",
					attribute : attr
				});
				// initialize from the dom element
				for(var i = 0; i < element.childNodes.length; i++){
					var child = element.childNodes[i];
					if( ko.bindingProvider.prototype.nodeHasBindings(child) ){
						// Binding with the container's viewModel
						// TODO : or replace with bindingContext??
						ko.applyBindings(viewModel, child);
						var sub = Base.get( child.getAttribute("data-wse-guid") );
						if( sub ){
							instance.add( sub );
						}
					}
				}
				// default is initialize from the children property
				
				// save the guid in the element data attribute
				element.setAttribute("data-wse-guid", instance.__GUID__);
			}else{
				console.error("Unkown UI type, " + options.type);
			}
		}else{
			console.error("UI type is needed");
		}

		// not apply bindings to the descendant doms in the UI component
		return { 'controlsDescendantBindings': true };
	},
	// updated the type, name, attribute
	update : function(element){

	}
}
// append the element of view in the binding
ko.bindingHandlers["wse_view"] = {
	update : function(element, valueAccessor){
		var value = valueAccessor();

		var subView = unwrap(value);
		if( subView && subView.$el ){
			$(element).html('').append( subView.$el );
		}

	}
}

// create component from json
Container.fromJSON = function( json ){

}

Container.provideBinding("container", Container);

return Container;

})
//============================================
// Base class of all container component
//============================================
define(["../base",
		"knockout"], function(Base, ko){

var Container = Base.derive(function(){
	return {
		// all child components
		children : ko.observableArray()
	}
}, {

	type : "CONTAINER",

	css : 'container',
	
	template : '<div data-bind="foreach:children" class="qpf-children">\
					<div data-bind="qpf_view:$data"></div>\
				</div>',

	// add child component
	add : function( sub ){
		sub.parent = this;
		this.children.push( sub );
	},
	// remove child component
	remove : function(){
		sub.parent = null;
		this.children.remove( sub );
	},
	children : function(){
		return this.children()
	},
	// resize when width or height is changed
	afterResize : function(){
		// stretch the children
		if( this.height() ){
			this.$el.children(".qpf-children").height( this.height() );	
		}
		// trigger the after resize event in post-order
		_.each(this.children(), function(child){
			child.afterResize();
		}, this);
		Base.prototype.afterResize.call(this);
	},
	dispose : function(){
		
		_.each(this.children(), function(child){
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

// modify the qpf bindler
var baseBindler = ko.bindingHandlers["qpf"];
ko.bindingHandlers["qpf"] = {

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
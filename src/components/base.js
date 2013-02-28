//=====================================
// Base class of all components
// it also provides some util methods like
// Base.get()
// Base.getByDom()
//=====================================
define(["core/mixin/derive",
		"core/mixin/event",
		"./Util",
		"knockout"], function(Derive, Events, Util, ko){

var clazz = new Function();

_.extend(clazz, Derive);
_.extend(clazz.prototype, Events);

var repository = {};	//repository to store all the component instance

var Base = clazz.derive(function(){
return {	// Public properties
	// Name of component, will be used in the query of the component
	name : "",
	// Tag of wrapper element
	tag : "div",
	// Attribute of the wrapper element
	attr : {},
	// Jquery element as a wrapper
	// It will be created in the constructor
	$el : null,
	// ViewModel for knockout binding
	// !IMPORTANT the property in the view model can not be override
	// set method is provided if you want to set the value in the viewModel
	viewModel : {},
	// Attribute will be applied to the viewModel
	// WARNING: It will be only used in the constructor
	// So there is no need to re-assign a new viewModel when created an instance
	// if property in the attribute is a observable
	// it will be binded to the property in viewModel
	attribute : {},
	// ui skin
	skin : "",
	// Class prefix
	classPrefix : "wse-ui-",
	// Skin prefix
	skinPrefix : "wse-skin-"
}}, function(){	//constructor

	this.__GUID__ = genGUID();
	// add to repository
	repository[this.__GUID__] = this;

	if( ! this.$el){
		this.$el = $(document.createElement(this.tag));
	}
	this.$el.attr(this.attr);
	if( this.skin ){
		this.$el.addClass( this.withPrefix(this.skin, this.skinPrefix) );
	}
	// Class name of wrapper element is depend on the lowercase of component type
	this.$el.addClass( this.withPrefix(this.type.toLowerCase(), this.classPrefix) );
	// apply attribute to the view model
	this._mappingAttributesToViewModel( this.attribute );

	this.initialize();
	this.render();

}, {// Prototype
	// Type of component. The className of the wrapper element is
	// depend on the type
	type : "BASE",
	// Template of the component, will be applyed binging with viewModel
	template : "",
	// Declare the events that will be provided 
	// Developers can use on method to subscribe these events
	// It is used in the binding handlers to judge which parameter
	// passed in is events
	eventsProvided : [],

	// Will be called after the component first created
	initialize : function(){},
	// set the attribute in the modelView
	set : function(key, value){
		if( typeof(key) == "string" ){
			var source = {};
			source[key] = value;
		}else{
			source = key;
		};
		this._mappingAttributesToViewModel( source );
	},
	// Call to refresh the component
	// Will trigger beforerender and afterrender hooks
	// beforerender and afterrender hooks is mainly provide for
	// the subclasses
	render : function(){
		this.beforerender && this.beforerender();
		this.dorender();
		this.afterrender && this.afterrender();

		this.trigger("render");
	},
	// Default render method
	dorender : function(){
		this.$el.html(this.template);
		ko.applyBindings( this.viewModel, this.$el[0] );
	},
	// Dispose the component instance
	dispose : function(){
		if( this.$el ){
			// remove the dom element
			this.$el.remove()
		}
		// remove from repository
		repository[this.__GUID__] = null;

		this.trigger("dispose");
	},
	withPrefix : function(className, prefix){
		if( className.indexOf(prefix) != 0 ){
			return prefix + className;
		}
	},
	withoutPrefix : function(className, prefix){
		if( className.indexOf(prefix) == 0){
			return className.substr(prefix.length);
		}
	},
	// mapping the attributes to viewModel 
	_mappingAttributesToViewModel : function(attributes){
		for(var name in attributes){
			var attr = attributes[name];
			var propInVM = this.viewModel[name];
			if( ! propInVM ){
				// console.error("Attribute "+name+" is not a valid viewModel property");
				continue;
			}
			if( ko.isObservable(propInVM) ){
				propInVM(ko.utils.unwrapObservable(attr) );

				if( ko.isObservable(attr) ){
					Util.bridge(propInVM, attr);
				}
			}else{
				propInVM = ko.utils.unwrapObservable(attr);
			}
		}	
	}
})


// get a unique component by guid
Base.get = function(guid){
	return repository[guid];
}
Base.getByDom = function(domNode){
	var $domNode = $(domNode),
		guid = $domNode.attr("data-wse-guid");
	return Base.get(guid);
}

// dispose all the components attached in the domNode and
// its children(if recursive is set true)
Base.disposeDom = function(domNode, resursive){

	if(typeof(recursive) == "undefined"){
		recursive = true;
	}

	domNode = $(domNode)[0];

	function dispose(node){
		var guid = node.getAttribute("data-wse-guid");
		var component = Base.get(guid);
		if( component ){
			// do not recursive traverse the children of component
			// element
			// hand over dispose of sub element task to the components
			// it self
			component.dispose();
		}else{
			if( recursive ){
				for(var i = 0; i < node.childNodes.length; i++){
					var child = node.childNodes[i];
					if( child.nodeType == 1 ){
						dispose( child );
					}
				}
			}
		}
	}

	dispose(domNode);
}
// util function of generate a unique id
var genGUID = (function(){
	var id = 0;
	return function(){
		return id++;
	}
})();

//----------------------------
// knockout extenders
ko.extenders.numeric = function(target, precision) {

	var fixer = ko.computed({
		read : target,
		write : function(newValue){	
			if( newValue === "" ){
				target("");
				return;
			}else{
				var val = parseFloat(newValue);
			}
			val = isNaN( val ) ? 0 : val;
			precision = ko.utils.unwrapObservable(precision);
			var multiplier = Math.pow(10, precision);
			val = Math.round(val * multiplier) / multiplier;
			// dont update the value again when the value is still the same
			if( target() !== val ){
				target(val);
			}
		}
	});

	fixer( target() );

	return fixer;
};

//-------------------------------------------
// Handle bingings in the knockout template
var bindings = {};
Base.provideBinding = function(name, Component ){
	bindings[name] = Component;
}
// provide bindings to knockout
ko.bindingHandlers["wse_ui"] = {
	init : function( element, valueAccessor ){

		// dispose the previous component host on the element
		var prevComponent = Base.getByDom( element );
		if( prevComponent ){
			prevComponent.dispose();
		}
		var component = Util.createComponentFromDataBinding( element, valueAccessor, bindings );

		// not apply bindings to the descendant doms in the UI component
		return { 'controlsDescendantBindings': true };
	},

	update : function( element, valueAccessor ){
		// var value = valueAccessor();
		// var options = unwrap(value) || {},
		// 	type = unwrap(options.type),
		// 	name  = unwrap(options.name),
		// 	attr = unwrap(options.attribute);

		// var component = Base.get( element.getAttribute("data-wse-guid") );

		// if( component &&
		// 	component.type.toLowerCase() == type.toLowerCase() ){	// do simple update
		// 	component.name = name;
		// 	if( attr ){
		// 		koMapping.fromJS( attr, {}, component.viewModel );	
		// 	}
		// }else{
		// 	ko.bindingHandlers["wse_meta"].init( element, valueAccessor );
		// }

	}
}

// append the element of view in the binding
ko.bindingHandlers["wse_view"] = {
	init : function(element, valueAccessor){
		var value = valueAccessor();

		var subView = ko.utils.unwrapObservable(value);
		if( subView && subView.$el ){
			$(element).html('').append( subView.$el );
		}
		// PENDING
		// handle disposal (if KO removes by the template binding)
        // ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
            // subView.dispose();
        // });

		return { 'controlsDescendantBindings': true };
	}
}

// export the interface
return Base;

})
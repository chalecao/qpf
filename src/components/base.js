//=====================================
// Base class of all components
// it also provides some util methods like
// Base.get()
// Base.getByDom()
//=====================================
define(["core/mixin/derive",
		"core/mixin/event",
		"knockout",
		"ko.mapping"], function(Derive, Events, ko, koMapping){

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
	koMapping.fromJS(this.attribute, {}, this.viewModel);

	this.initialize();
	this.render();

}, {// Prototype
	// Type of component. The className of the wrapper element is
	// depend on the type
	type : "BASE",
	// Template of the component, will be applyed binging with viewModel
	template : "",
	// Will be called after the component first created
	initialize : function(){},
	// set the attribute in the modelView
	set : function(key, value){
		if( typeof(key) == "string" ){
			var source = {};
			source[key] = value;
		}else{
			source = key
		};

		koMapping.fromJS(source, {}, this.viewModel);
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
		// get data from Attribute
		if( this.attribute ){
			koMapping.fromJS(this.attribute, {}, this.viewModel);	
		}
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

// export the interface
return Base;

})
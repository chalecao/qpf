//=====================================
// Base class of all components
// it also provides some util methods like
// Base.get()
// Base.getByDom()
//=====================================
define(["core/mixin/derive",
		"core/mixin/event",
		"./util",
		"knockout"], function(Derive, Event, Util, ko){

var clazz = new Function();

_.extend(clazz, Derive);
_.extend(clazz.prototype, Event);

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
	
	parent : null,
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

	if( this.css ){
		_.each( _.union(this.css), function(className){
			this.$el.addClass( this.withPrefix(className, this.classPrefix) );
		}, this)
	}
	// Class name of wrapper element is depend on the lowercase of component type
	// this.$el.addClass( this.withPrefix(this.type.toLowerCase(), this.classPrefix) );
	
	// extend default properties to view Models
	// like normal dom element, node of wse will have height, width, id
	// style attribute, and all this will map to the attribute in dom
	_.extend(this.viewModel, {
		id : ko.observable(""),
		width : ko.observable(),
		height : ko.observable(),
		disable : ko.observable(false),
		style : ko.observable("")
	});
	this.viewModel.width.subscribe(function(newValue){
		this.$el.width(newValue);
		this.trigger("resize");
	}, this);
	this.viewModel.height.subscribe(function(newValue){
		this.$el.height(newValue);
		this.trigger("resize");
	}, this);
	this.viewModel.disable.subscribe(function(newValue){
		this.$el[newValue?"addClass":"removeClass"]("wse-disable");
	}, this);
	this.viewModel.id.subscribe(function(newValue){
		this.$el.attr("id", newValue);
	}, this);
	this.viewModel.style.subscribe(function(newValue){
		var valueSv = newValue;
		var styleRegex = /\s*(\S*?)\s*:\s*(\S*)\s*/g;
		// preprocess the style string
		newValue = "{" + _.chain(newValue.split(";"))
						.map(function(item){
							return item.replace(styleRegex, '"$1":"$2"');
						})
						.filter(function(item){return item;})
						.value().join(",") + "}";
		try{
			var obj = JSON.parse(newValue);
			this.$el.css(obj);
		}catch(e){
			console.error("Syntax Error of style: "+ valueSv);
		}
	}, this)


	// apply attribute to the view model
	this._mappingAttributesToViewModel( this.attribute );

	this.initialize();
	// Here we removed auto rendering at constructor
	// to support deferred rendering after the $el is attached
	// to the document
	// this.render();

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
	eventsProvided : ["click", "mousedown", "mouseup", "mousemove", "resize"],

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
		this._mappingAttributesToViewModel( source, true );
	},
	// Call to refresh the component
	// Will trigger beforeRender and afterRender hooks
	// beforeRender and afterRender hooks is mainly provide for
	// the subclasses
	render : function(){
		this.beforeRender && this.beforeRender();
		this.doRender();
		this.afterRender && this.afterRender();

		this.trigger("render");
	},
	// Default render method
	doRender : function(){
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
	_mappingAttributesToViewModel : function(attributes, onlyUpdate){
		for(var name in attributes){
			var attr = attributes[name];
			var propInVM = this.viewModel[name];
			// create new attribute when it is not existed
			// in the viewModel, even if it will not be used
			if( ! propInVM ){
				// is observableArray or plain array
				if( (ko.isObservable(attr) && attr.push) ||
					attr.constructor == Array){
					this.viewModel[name] = ko.observableArray();
				}else{
					this.viewModel[name] = ko.observable();
				}
			}
			if( ko.isObservable(propInVM) ){
				propInVM(ko.utils.unwrapObservable(attr) );
			}else{
				this.viewModel[name] = ko.utils.unwrapObservable(attr);
			}
			if( ! onlyUpdate){
				if( ko.isObservable(attr) ){
					Util.bridge(propInVM, attr);
				}
			}
		}	
	}
})

// register proxy events of dom
var proxyEvents = ["click", "mousedown", "mouseup", "mousemove"];
Base.prototype.on = function(eventName){
	// lazy register events
	if( proxyEvents.indexOf(eventName) >= 0 ){
		this.$el.bind(eventName, {
			context : this
		}, proxyHandler);
	}
	Event.on.apply(this, arguments);
}
function proxyHandler(e){
	var context = e.data.context;
	var eventType = e.type;

	context.trigger(eventType);
}


// get a unique component by guid
Base.get = function(guid){
	return repository[guid];
}
Base.getByDom = function(domNode){
	var guid = domNode.getAttribute("data-wse-guid");
	return Base.get(guid);
}

// dispose all the components attached in the domNode and
// its children(if recursive is set true)
Base.disposeDom = function(domNode, resursive){

	if(typeof(recursive) == "undefined"){
		recursive = true;
	}

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

	createComponent : function(element, valueAccessor){
		// dispose the previous component host on the element
		var prevComponent = Base.getByDom( element );
		if( prevComponent ){
			prevComponent.dispose();
		}
		var component = Util.createComponentFromDataBinding( element, valueAccessor, bindings );
		return component;
	},

	init : function( element, valueAccessor ){

		var component = ko.bindingHandlers["wse_ui"].createComponent(element, valueAccessor);

		component.render();
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
			Base.disposeDom(element);
			element.innerHTML = "";
			element.appendChild( subView.$el[0] );
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
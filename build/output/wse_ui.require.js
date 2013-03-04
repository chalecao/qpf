
//===================================================
// Xml Parser
// parse wml and convert it to dom with knockout data-binding
// TODO	xml valid checking, 
//		provide xml childNodes Handler in the Components
//===================================================
define('core/xmlparser',['require','exports','module'],function(require, exports, module){
	
	// return document fragment converted from the xml
	var parse = function( xmlString ){
		
		if( typeof(xmlString) == "string"){
			var xml = parseXML( xmlString );
		}else{
			var xml = xmlString;
		}
		if( xml ){

			var rootDomNode = document.createElement("div");

			convert( xml, rootDomNode);

			return rootDomNode;
		}
	}

	function parseXML( xmlString ){
		var xml, parser;
		try{
			if( window.DOMParser ){
				xml = (new DOMParser()).parseFromString( xmlString, "text/xml");
			}else{
				xml = new ActiveXObject("Microsoft.XMLDOM");
				xml.async = "false";
				xml.loadXML( xmlString );
			}
			return xml;
		}catch(e){
			console.error("Invalid XML:" + xmlString);
		}
	}

	var customParsers = {};
	// provided custom parser from Compositor
	// parser need to return a plain object which key is attributeName
	// and value is attributeValue
	function provideParser(componentType /*tagName*/, parser){
		customParsers[componentType] = parser;
	}

	function parseXMLNode(xmlNode){
		if( xmlNode.nodeType !== 1){
			return;
		}
		var bindingResults = {
			type : xmlNode.tagName.toLowerCase()
		} 

		var convertedAttr = convertAttributes( xmlNode.attributes );
		var customParser = customParsers[bindingResults.type];
		if( customParser ){
			var result = customParser(xmlNode);
			if( result &&
				typeof(result) !="object"){
				console.error("Parser must return an object converted from attributes")
			}else{
				// data in the attributes has higher priority than
				// the data from the children
				_.extend(convertedAttr, result);
			}
		}

		var bindingString = objectToDataBindingFormat( convertedAttr, bindingResults );

		var domNode = document.createElement('div');
		domNode.setAttribute('data-bind',  "wse_ui:"+bindingString);

		return domNode;
	}

	function convertAttributes(attributes){
		var ret = {};
		for(var i = 0; i < attributes.length; i++){
			var attr = attributes[i];
			ret[attr.nodeName] = attr.nodeValue;
		}
		return ret;
	}

	function objectToDataBindingFormat(attributes, bindingResults){

		bindingResults = bindingResults || {};

		var preProcess = function(attributes, bindingResults){

			_.each(attributes, function(value, name){
				// recursive
				if( value.constructor == Array){
					bindingResults[name] = [];
					preProcess(value, bindingResults[name]);
				}else if( value.constructor == Object){
					bindingResults[name] = {};
					preProcess(value, bindingResults[name]);
				}else if( value ){
					// this value is an expression or observable
					// in the viewModel if it has @binding[] flag
					var isBinding = /^\s*@binding\[(.*?)\]\s*$/.exec(value);
					if( isBinding ){
						// add a tag to remove quotation the afterwards
						// conveniently, or knockout will treat it as a 
						// normal string, not expression
						value = "{{BINDINGSTART" + isBinding[1] + "BINDINGEND}}";

					}
					bindingResults[name] = value
				}
			});
		}
		preProcess( attributes, bindingResults );

		var bindingString = JSON.stringify(bindingResults);
		
		bindingString = bindingString.replace(/\"\{\{BINDINGSTART(.*?)BINDINGEND\}\}\"/g, "$1");

		return bindingString;
	}

	function convert(root, parent){

		var children = getChildren(root);

		for(var i = 0; i < children.length; i++){
			var node = parseXMLNode( children[i] );
			if( node ){
				parent.appendChild(node);
				convert( children[i], node);
			}
		}
	}

	function getChildren(parent){
		
		var children = [];
		var node = parent.firstChild;
		while(node){
			children.push(node);
			node = node.nextSibling;
		}
		return children;
	}

	function getChildrenByTagName(parent, tagName){
		var children = getChildren(parent);
		
		return _.filter(children, function(child){
			return child.tagName && child.tagName.toLowerCase() === tagName;
		})
	}


	exports.parse = parse;
	//---------------------------------
	// some util functions provided for the components
	exports.provideParser = provideParser;

	function getTextContent(xmlNode){
		var children = getChildren(xmlNode);
		var text = '';
		_.each(children, function(child){
			if(child.nodeType==3){
				text += child.textContent.replace(/(^\s*)|(\s*$)/g, "");
			}
		})
		return text;
	}

	exports.util = {
		convertAttributes : convertAttributes,
		objectToDataBindingFormat : objectToDataBindingFormat,
		getChildren : getChildren,
		getChildrenByTagName : getChildrenByTagName,
		getTextContent : getTextContent
	}
});
define('core/mixin/derive',[],function(){

/**
 * derive a sub class from base class
 * @makeDefaultOpt [Object|Function] default option of this sub class, 
 						method of the sub can use this.xxx to access this option
 * @initialize [Function](optional) initialize after the sub class is instantiated
 * @proto [Object](optional) prototype methods/property of the sub class
 *
 */
function derive(makeDefaultOpt, initialize/*optional*/, proto/*optional*/){

	if( typeof initialize == "object"){
		proto = initialize;
		initialize = null;
	}

	// extend default prototype method
	var extendedProto = {
		// instanceof operator cannot work well,
		// so we write a method to simulate it
		'instanceof' : function(constructor){
			var selfConstructor = sub;
			while(selfConstructor){
				if( selfConstructor === constructor ){
					return true;
				}
				selfConstructor = selfConstructor.__super__;
			}
		}
	}

	var _super = this;

	var sub = function(options){

		// call super constructor
		_super.call( this );

		// call defaultOpt generate function each time
		// if it is a function, So we can make sure each 
		// property in the object is fresh
		_.extend( this, typeof makeDefaultOpt == "function" ?
						makeDefaultOpt.call(this) : makeDefaultOpt );

		for( var name in options ){
			if( typeof this[name] == "undefined" ){
				console.warn( name+" is not an option");
			}
		}
		_.extend( this, options );

		if( this.constructor == sub){
			// find the base class, and the initialize function will be called 
			// in the order of inherit
			var base = sub,
				initializeChain = [initialize];
			while(base.__super__){
				base = base.__super__;
				initializeChain.unshift( base.__initialize__ );
			}
			for(var i = 0; i < initializeChain.length; i++){
				if( initializeChain[i] ){
					initializeChain[i].call( this );
				}
			}
		}
	};
	// save super constructor
	sub.__super__ = _super;
	// initialize function will be called after all the super constructor is called
	sub.__initialize__ = initialize;

	// extend prototype function
	_.extend( sub.prototype, _super.prototype, extendedProto, proto);

	sub.prototype.constructor = sub;
	
	// extend the derive method as a static method;
	sub.derive = _super.derive;


	return sub;
}

return {
	derive : derive
}

});
define('core/mixin/event',[],function(){

/**
 * Event interface
 * + on(eventName, handler[, context])
 * + trigger(eventName[, arg1[, arg2]])
 * + off(eventName[, handler])
 */
return{
	trigger : function(){
		if( ! this.__handlers__){
			return;
		}
		var name = arguments[0];
		var params = Array.prototype.slice.call( arguments, 1 );

		var handlers = this.__handlers__[ name ];
		if( handlers ){
			for( var i = 0; i < handlers.length; i+=2){
				var handler = handlers[i],
					context = handlers[i+1];
				handler.apply(context || this, params);
			}
		}
	},
	
	on : function( target, handler, context/*optional*/ ){

		if( ! target){
			return;
		}
		var handlers = this.__handlers__ || ( this.__handlers__={} );
		if( ! handlers[target] ){
			handlers[target] = [];
		}
		if( handlers[target].indexOf(handler) == -1){
			// struct in list
			// [handler,context,handler,context,handler,context..]
			handlers[target].push( handler );
			handlers[target].push( context );
		}

		return handler;
	},

	off : function( target, handler ){
		
		var handlers = this.__handlers__ || {};

		if( handlers[target] ){
			if( handler ){
				var arr = handlers[target];
				// remove handler and context
				var idx = arr.indexOf(handler);
				if( idx >= 0)
					arr.splice( idx, 2 );
			}else{
				handlers[target] = [];
			}
		}

	}
}
});
//==========================
// Util.js
// provide util function to operate
// the components
//===========================
define('components/util',['knockout',
		'exports'], function(ko, exports){

	var unwrap = ko.utils.unwrapObservable;

	exports.createComponentFromDataBinding = function( element, valueAccessor, availableBindings ){
		
		var value = valueAccessor();
		
		var options = unwrap(value) || {},
			type = unwrap(options.type);

		if( type ){
			var Constructor = availableBindings[type];

			if( Constructor ){
				var component = exports.createComponentFromJSON( options, Constructor)
				if( component ){
					element.innerHTML = "";
					element.appendChild( component.$el[0] );
				}
				// save the guid in the element data attribute
				element.setAttribute("data-wse-guid", component.__GUID__);
			}else{
				console.error("Unkown UI type, " + type);
			}
		}else{
			console.error("UI type is needed");
		}

		return component;
	}

	exports.createComponentFromJSON = function(options, Constructor){

		var type = unwrap(options.type),
			name = unwrap(options.name),
			attr = _.omit(options, "type", "name");

		var events = {};

		// Find which property is event
		_.each(attr, function(value, key){
			if( key.indexOf("on") == 0 &&
				Constructor.prototype.eventsProvided.indexOf(key.substr("on".length)) >= 0 &&
				typeof(value) == "function"){
				delete attr[key];
				events[key.substr("on".length)] = value;
			}
		})

		var component = new Constructor({
			name : name || "",
			attribute : attr
		});
		// binding events
		_.each(events, function(handler, name){
			component.on(name, handler);
		})

		return component;
	
	}

	// build a bridge of twe observables
	// and update the value from source to target
	// at first time
	exports.bridge = function(target, source){
		target.subscribe(function(newValue){
			try{
				source(newValue);
			}catch(e){
				// Normally when source is computed value
				// and it don't have a write function  
				console.error(e.toString());
			}
		})
		source.subscribe(function(newValue){
			try{
				target(newValue);
			}catch(e){
				console.error(e.toString());
			}
		})
	}
})
;
//=====================================
// Base class of all components
// it also provides some util methods like
// Base.get()
// Base.getByDom()
//=====================================
define('components/base',["core/mixin/derive",
		"core/mixin/event",
		"./util",
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
	_.extend(this.viewModel, {
		id : ko.observable(""),
		width : ko.observable(),
		height : ko.observable(),
		disable : ko.observable(false)
	});
	this.viewModel.width.subscribe(function(newValue){
		this.$el.width(newValue);
	}, this);
	this.viewModel.height.subscribe(function(newValue){
		this.$el.height(newValue);
	}, this);
	this.viewModel.disable.subscribe(function(newValue){
		this.$el[newValue?"addClass":"removeClass"]("wse-disable");
	}, this);
	this.viewModel.id.subscribe(function(newValue){
		this.$el.attr("id", newValue);
	}, this);

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
			if( ! propInVM ){
				// console.error("Attribute "+name+" is not a valid viewModel property");
				continue;
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

});
//==================================
// Base class of all meta component
// Meta component is the ui component
// that has no children
//==================================
define('components/meta/meta',['../base',
		'knockout',
		'ko.mapping'], function(Base, ko, koMapping){

var Meta = Base.derive(
{
}, {
	type : "META",

	css : 'meta'
})

// Inherit the static methods
Meta.provideBinding = Base.provideBinding;

return Meta;

});
//======================================
// Button component
//======================================
define('components/meta/button',['./meta',
		'core/xmlparser',
		'knockout'], function(Meta, XMLParser, ko){

var Button = Meta.derive(function(){
return {
	$el : $('<button data-bind="html:text"></button>'),

	viewModel : {
		// value of the button
		text : ko.observable('Button')
	}
}}, {

	eventsProvided : ['click'],

	type : 'BUTTON',

	css : 'button',

	afterRender : function(){
		var me = this;
		this.$el.click(function(){
			me.trigger("click");
		})
	}
});

Meta.provideBinding("button", Button);

// provide parser when do xmlparsing
XMLParser.provideParser("button", function(xmlNode){
	
	var text = XMLParser.util.getTextContent(xmlNode);
	if(text){
		return {
			text : text
		}
	}
})

return Button;

});
//==============================
// Canvas, 
// Use Goo.js as drawing library 
//==============================
define('components/meta/canvas',["goo",
		"./meta"], function(Goo, Meta){

var Canvas = Meta.derive(function(){

return {

	tag : "canvas",

	viewModel : {
		width : ko.observable(256),
		height : ko.observable(256)
	},

	stage : null
}}, {

	type : 'CANVAS',
	css : 'canvas',

	initialize : function(){

		this.stage = Goo.create(this.$el[0]);

		this.viewModel.width.subscribe(function(newValue){
			this.resize();
		}, this);
		this.viewModel.height.subscribe(function(newValue){
			this.resize();
		}, this);
	},

	doRender : function(){
		this.stage.render();
	},

	resize : function(){
		this.stage.resize( this.viewModel.width(), this.viewModel.height());
	}
});

Meta.provideBinding("canvas", Canvas);

return Canvas;

});
//======================================
// Checkbox component
//======================================
define('components/meta/checkbox',['./meta',
		'knockout'], function(Meta, ko){

var Checkbox = Meta.derive(function(){
return {
	
	viewModel : {
		// value of the button
		checked : ko.observable(false),
		label : ko.observable("")
	}
}}, {

	template : '<input type="checkbox" data-bind="checked:checked" />\
				<span data-bind="css:{checked:checked}"></span>\
				<label data-bind="text:label"></label>',

	type : 'CHECKBOX',
	css : 'checkbox',

	// binding events
	afterRender : function(){
		var vm = this.viewModel;
		this.$el.click(function(){
			vm.checked( ! vm.checked() );
		})
	}
});

Meta.provideBinding("checkbox", Checkbox);

return Checkbox;

})	;
//===================================
// Combobox component
// 
// @VMProp	value
// @VMProp	items
//			@property	value
//			@property	text
//===================================

define('components/meta/combobox',['./meta',
		'core/xmlparser',
		'knockout'], function(Meta, XMLParser, ko){

var Combobox = Meta.derive(function(){
return {

	$el : $('<div data-bind="css:{active:active}" tabindex="0"></div>'),

	viewModel : {

		value : ko.observable(),

		items : ko.observableArray(),	//{value, text}

		defaultText : ko.observable("select"),

		active : ko.observable(false),

		//events
		_focus : function(){
			this.active(true);
		},
		_blur : function(){
			this.active(false);
		},
		_toggle : function(){
			this.active( ! this.active() );
		},
		_select : function(value){
			value = ko.utils.unwrapObservable(value);
			this.value(value);
			this._blur();
		},
		_isSelected : function(value){
			return this.value() === ko.utils.unwrapObservable(value);
		}
	}
}}, {
	
	type : 'COMBOBOX',

	css : 'combobox',

	initialize : function(){

		this.viewModel.selectedText = ko.computed(function(){
			var val = this.value();
			var result =  _.filter(this.items(), function(item){
				return ko.utils.unwrapObservable(item.value) == val;
			})[0];
			if( typeof(result) == "undefined"){
				return this.defaultText();
			}
			return ko.utils.unwrapObservable(result.text);
		}, this.viewModel);

	},

	template : '<div class="wse-combobox-selected wse-common-button" data-bind="html:selectedText,click:_toggle"></div>\
				<ul class="wse-combobox-items" data-bind="foreach:items">\
					<li data-bind="html:text,attr:{\'data-wse-value\':value},click:$parent._select.bind($parent,value),css:{selected:$parent._isSelected(value)}"></li>\
				</ul>',

	afterRender : function(){

		var self = this;
		this._$selected = this.$el.find(".wse-combobox-selected");
		this._$items = this.$el.find(".wse-combobox-items");

		this.$el.blur(function(){
			self.viewModel._blur();
		})

	},

	//-------method provided for the developers
	select : function(value){
		this.viewModel.select(value);
	}
})

Meta.provideBinding("combobox", Combobox);

XMLParser.provideParser('combobox', function(xmlNode){
	var items = [];
	var nodes = XMLParser.util.getChildrenByTagName(xmlNode, "item");
	_.each(nodes, function(child){
		// Data source can from item tags of the children
		var value = child.getAttribute("value");
		var text = child.getAttribute("text") ||
					XMLParser.util.getTextContent(child);

		if( value !== null){
			items.push({
				value : value,
				text : text
			})
		}
	})
	if( items.length){
		return {
			items : items
		}
	}
})


return Combobox;

});
//======================================
// Label component
//======================================
define('components/meta/label',['./meta',
		'core/xmlparser',
		'knockout'], function(Meta, XMLParser, ko){

var Label = Meta.derive(function(){
return {
	viewModel : {
		// value of the Label
		text : ko.observable('Label')
	}
} }, {

	template : '<Label data-bind="html:text"></Label>',

	type : 'LABEL',

	css : 'label'
});

Meta.provideBinding("label", Label);

// provide parser when do xmlparsing
XMLParser.provideParser("label", function(xmlNode){

	var text = XMLParser.util.getTextContent(xmlNode);
	if(text){
		return {
			text : text
		}
	}
})

return Label;

});
//=================================
// mixin to provide draggable interaction
// support multiple selection
//
// @property	helper
// @property	axis "x" | "y"
// @property	container
// @method		add( target[, handle] )
// @method		remove( target )
//=================================

define('components/mixin/draggable',["core/mixin/derive",
		"core/mixin/event",
		"knockout"], function(Derive, Event, ko){

var clazz = new Function();
_.extend(clazz, Derive);
_.extend(clazz.prototype, Event);

//---------------------------------
var DraggableItem = clazz.derive(function(){
return {

	id : 0,

	target : null,

	handle : null,

	margins : {},

	// original position of the target relative to 
	// its offsetParent, here we get it with jQuery.position method
	originPosition : {},

	// offset of the offsetParent, which is get with jQuery.offset
	// method
	offsetParentOffset : {},
	// cache the size of the draggable target
	width : 0,
	height : 0,
	// save the original css position of dragging target
	// to be restored when stop the drag
	positionType : "",
	//
	// data to be transferred
	data : {},

	// instance of [Draggable]
	host : null
}}, {
	
	setData : function( data ){

	},

	remove : function(){
		this.host.remove( this.target );
	}
});

//--------------------------------
var Draggable = clazz.derive(function(){
return {

	items : {}, 

	axis : null,

	// the container where draggable item is limited
	// can be an array of boundingbox or HTMLDomElement or jquery selector
	container : null,

	helper : null,

	//private properties
	// boundingbox of container compatible with getBoundingClientRect method
	_boundingBox : null,

	_mouseStart : {},
	_$helper : null

}}, {

add : function( elem, handle ){
	
	var id = genGUID(),
		$elem = $(elem);
	if( handle ){
		var $handle = $(handle);
	}

	$elem.attr( "data-wse-draggable", id )
		.addClass("wse-draggable");
	
	(handle ? $(handle) : $elem)
		.bind("mousedown", {context:this}, this._mouseDown);

	var newItem = new DraggableItem({
		id : id,
		target : elem,
		host : this,
		handle : handle
	})
	this.items[id] = newItem;

	return newItem;
},

remove : function( elem ){

	if( elem instanceof DraggableItem){
		var item = elem,
			$elem = $(item.elem),
			id = item.id;
	}else{
		var $elem = $(elem),
			id = $elem.attr("data-wse-draggable");
		
		if( id  ){
			var item = this.items[id];
		}
	}	
	delete this.items[ id ];

	
	$elem.removeAttr("data-wse-draggable")
		.removeClass("wse-draggable");
	// remove the events binded to it
	(item.handle ? $(item.handle) : $elem)
		.unbind("mousedown", this._mouseDown);
},

clear : function(){

	_.each(this.items, function(item){
		this.remove( item.target );
	}, this);
},

_save : function(){

	_.each(this.items, function(item){

		var $elem = $(item.target),
			$offsetParent = $elem.offsetParent(),
			position = $elem.position(),
			offsetParentOffset = $offsetParent.offset(),
			margin = {
				left : parseInt($elem.css("marginLeft")) || 0,
				top : parseInt($elem.css("marginTop")) || 0
			};

		item.margin = margin;
		// fix the position with margin
		item.originPosition = {
			left : position.left - margin.left,
			top : position.top - margin.top
		},
		item.offsetParentOffset = offsetParentOffset;
		// cache the size of the dom element
		item.width = $elem.width(),
		item.height = $elem.height(),
		// save the position info for restoring after drop
		item.positionType = $elem.css("position");

	}, this);

},

_restore : function( restorePosition ){

	_.each( this.items, function(item){

		var $elem = $(item.target),
			position = $elem.offset();

		$elem.css("position", item.positionType);

		if( restorePosition ){
			$elem.offset({
				left : item.originPosition.left + item.margin.left,
				top : item.originPosition.top + item.margin.top
			})
		}else{
			$elem.offset(position);
		}
	}, this);
},

_mouseDown : function(e){
	
	if( e.which !== 1){
		return;
	}

	var self = e.data.context;
	//disable selection
	e.preventDefault();

	self._save();

	self._triggerProxy("dragstart", e);

	if( ! self.helper ){

		_.each( self.items, function(item){
			
			var $elem = $(item.target);

			$elem.addClass("wse-draggable-dragging");

			$elem.css({
				"position" : "absolute",
				"left" : (item.originPosition.left)+"px",
				"top" : (item.originPosition.top)+"px"
			});

		}, self);

		if( self.container ){
			self._boundingBox = self._computeBoundingBox( self.container );
		}else{
			self._boundingBox = null;
		}

	}else{

		self._$helper = $(self.helper);
		document.body.appendChild(self._$helper[0]);
		self._$helper.css({
			left : e.pageX,
			top : e.pageY
		})
	}

	$(document.body).bind("mousemove", {context:self}, self._mouseMove )
		.bind("mouseout", {context:self}, self._mouseOut )
		.bind("mouseup", {context:self}, self._mouseUp );

	self._mouseStart = {
		x : e.pageX,
		y : e.pageY
	};

},

_computeBoundingBox : function(container){

	if( _.isArray(container) ){

		return {
			left : container[0][0],
			top : container[0][1],
			right : container[1][0],
			bottom : container[1][1]
		}

	}else if( container.left && 
				container.right &&
				container.top &&
				container.bottom ) {

		return container;
	}else{
		// using getBoundingClientRect to get the bounding box
		// of HTMLDomElement
		try{
			var $container = $(container),
				offset = $container.offset();
			var bb = {
				left : offset.left + parseInt($container.css("padding-left")) || 0,
				top : offset.top + parseInt($container.css("padding-top")) || 0,
				right : offset.left + $container.width() - parseInt($container.css("padding-right")) || 0,
				bottom : offset.top + $container.height() - parseInt($container.css("padding-bottom")) || 0
			};
			
			return bb;
		}catch(e){
			console.error("Invalid container type");
		}
	}

},

_mouseMove : function(e){

	var self = e.data.context;

	self._triggerProxy("drag", e);

	var offset = {
		x : e.pageX - self._mouseStart.x,
		y : e.pageY - self._mouseStart.y
	}

	if( ! self._$helper){

		_.each( self.items, function(item){
			// calculate the offset position to the document
			var left = item.originPosition.left + item.offsetParentOffset.left + offset.x,
				top = item.originPosition.top + item.offsetParentOffset.top + offset.y;
			// constrained in the area of container
			if( self._boundingBox ){
				var bb = self._boundingBox;
				left = left > bb.left ? 
								(left+item.width < bb.right ? left : bb.right-item.width)
								 : bb.left;
				top = top > bb.top ? 
							(top+item.height < bb.bottom ? top : bb.bottom-item.height)
							: bb.top;
			}

			var axis = ko.utils.unwrapObservable(self.axis);
			if( !axis || axis.toLowerCase() !== "y"){
				$(item.target).css("left", left - item.offsetParentOffset.left + "px");
			}
			if( !axis || axis.toLowerCase() !== "x"){
				$(item.target).css("top", top - item.offsetParentOffset.top + "px");
			}

		}, self );


	}else{

		self._$helper.css({
			"left" : e.pageX,
			"top" : e.pageY
		})
	}	
},

_mouseUp : function(e){

	var self = e.data.context;

	$(document.body).unbind("mousemove", self._mouseMove)
		.unbind("mouseout", self._mouseOut)
		.unbind("mouseup", self._mouseUp)

	if( self._$helper ){

		self._$helper.remove();
	}else{

		_.each(self.items, function(item){

			var $elem = $(item.target);

			$elem.removeClass("wse-draggable-dragging");

		}, self)
	}
	self._restore();

	self._triggerProxy("dragend", e);
},

_mouseOut : function(e){
	// PENDING
	// this._mouseUp.call(this, e);
},

_triggerProxy : function(){
	var args = arguments;
	_.each(this.items, function(item){
		item.trigger.apply(item, args);
	});
}

});


var genGUID = (function(){
	var id = 1;
	return function(){
		return id++;
	}
}) ();

return {
	applyTo : function(target, options){

		// define a namespace for draggable mixin
		target.draggable = target.draggable || {};

		_.extend( target.draggable, new Draggable(options) );
		
	}
}

});
//===================================
// Range component
// 
// @VMProp value
// @VMProp step
// @VMProp min
// @VMProp max
// @VMProp orientation
// @VMProp format
//
// @method computePercentage
// @method updatePosition	update the slider position manually
// @event change newValue prevValue self[Range]
//===================================
define('components/meta/range',['./meta',
		'../mixin/draggable',
		'knockout'], function(Meta, Draggable, ko){

var Range = Meta.derive(function(){

return {

	$el : $('<div data-bind="css:orientation"></div>'),

	viewModel : {

		value : ko.observable(0),

		step : ko.observable(1),

		min : ko.observable(-100),

		max : ko.observable(100),

		orientation : ko.observable("horizontal"),// horizontal | vertical

		precision : ko.observable(0),

		format : "{{value}}",

		_format : function(number){
			return this.format.replace("{{value}}", number);
		}
	},

	// compute size dynamically when dragging
	autoResize : true,

}}, {

	type : "RANGE",

	css : 'range',

	template : '<div class="wse-range-groove-box">\
					<div class="wse-range-groove-outer">\
						<div class="wse-range-groove">\
							<div class="wse-range-percentage"></div>\
						</div>\
					</div>\
				</div>\
				<div class="wse-range-min" data-bind="text:_format(min())"></div>\
				<div class="wse-range-max" data-bind="text:_format(max())"></div>\
				<div class="wse-range-slider">\
					<div class="wse-range-slider-inner"></div>\
					<div class="wse-range-value" data-bind="text:_format(value())"></div>\
				</div>',

	eventsProvided : ["change"],
	
	initialize : function(){

		this.viewModel.value = this.viewModel.value.extend( {numeric : this.viewModel.precision} );

		// add draggable mixin
		Draggable.applyTo( this, {
			axis : ko.computed(function(){
				return this.viewModel.orientation() == "horizontal" ? "x" : "y"
			}, this)
		});

		var prevValue = this.viewModel.value();
		this.viewModel.value.subscribe(function(newValue){
			if( this._$box){
				this.updatePosition();
			}
			this.trigger("change", parseFloat(newValue), parseFloat(prevValue), this);
			
			prevValue = newValue;
		}, this);
	},

	afterRender : function(){

		// cache the element;
		this._$box = this.$el.find(".wse-range-groove-box");
		this._$percentage = this.$el.find(".wse-range-percentage");
		this._$slider = this.$el.find(".wse-range-slider");

		this.draggable.container = this.$el.find(".wse-range-groove-box");
		var item = this.draggable.add( this._$slider );
		
		item.on("drag", this._dragHandler, this);

		this.updatePosition();

		// disable text selection
		this.$el.mousedown(function(e){
			e.preventDefault();
		});
	},

	_dragHandler : function(){

		var percentage = this.computePercentage(),
			min = parseFloat( this.viewModel.min() ),
			max = parseFloat( this.viewModel.max() ),
			value = (max-min)*percentage+min;

		this.viewModel.value( value );
	},

	_cacheSize : function(){

		// cache the size of the groove and slider
		var isHorizontal =this._isHorizontal(); 
		this._boxSize =  isHorizontal ?
							this._$box.width() :
							this._$box.height();
		this._sliderSize = isHorizontal ?
							this._$slider.width() :
							this._$slider.height();
	},

	computePercentage : function(){

		if( this.autoResize ){
			this._cacheSize();
		}

		var offset = this._computeOffset();
		return offset / ( this._boxSize - this._sliderSize );
	},

	_computeOffset : function(){

		var isHorizontal = this._isHorizontal(),
			grooveOffset = isHorizontal ?
							this._$box.offset().left :
							this._$box.offset().top;
			sliderOffset = isHorizontal ? 
							this._$slider.offset().left :
							this._$slider.offset().top;

		return sliderOffset - grooveOffset;
	},

	_setOffset : function(offsetSize){
		var isHorizontal = this._isHorizontal(),
			grooveOffset = isHorizontal ?
							this._$box.offset().left :
							this._$box.offset().top,
			offset = isHorizontal ? 
					{left : grooveOffset+offsetSize} :
					{top : grooveOffset+offsetSize};

		this._$slider.offset( offset );
	},

	updatePosition : function(){

		if( this.autoResize ){
			this._cacheSize();
		}

		var min = this.viewModel.min(),
			max = this.viewModel.max(),
			value = this.viewModel.value(),
			percentage = ( value - min ) / ( max - min ),

			size = (this._boxSize-this._sliderSize)*percentage;
		
		// if( this._boxSize > 0 ){
			// this._setOffset(size);
		// }else{	//incase the element is still not in the document
			this._$slider.css( this._isHorizontal() ?
								"right" : "bottom", (1-percentage)*100+"%");
		// }
		this._$percentage.css( this._isHorizontal() ?
								'width' : 'height', percentage*100+"%");
	},

	_isHorizontal : function(){
		return ko.utils.unwrapObservable( this.viewModel.orientation ) == "horizontal";
	}
})

Meta.provideBinding("range", Range);

return Range;

});
//===================================
// Spinner component
//
// @VMProp step
// @VMProp value
// @VMProp precision
//
// @event change newValue prevValue self[Range]
//===================================
define('components/meta/spinner',['./meta',
		'knockout'], function(Meta, ko){

function increase(){
	this.value( parseFloat(this.value()) + parseFloat(this.step()) );
}

function decrease(){
	this.value( parseFloat(this.value()) - parseFloat(this.step()) );
}

var Spinner = Meta.derive(function(){
return {
	viewModel : {

		step : ko.observable(1),
		
		value : ko.observable(1),

		valueUpdate : "afterkeydown", //"keypress" "keyup" "afterkeydown"

		precision : ko.observable(2),

		increase : increase,

		decrease : decrease
		
	}
}}, {
	type : 'SPINNER',

	css : 'spinner',

	initialize : function(){
		this.viewModel.value = this.viewModel.value.extend( {numeric : this.viewModel.precision} );

		var prevValue = this.viewModel.value() || 0;
		this.viewModel.value.subscribe(function(newValue){

			this.trigger("change", parseFloat(newValue), parseFloat(prevValue), this);
			prevValue = newValue;
		}, this)
	},

	eventsProvided : ["change"],

	template : '<div class="wse-left">\
					<input type="text" class="wse-spinner-value" data-bind="value:value,valueUpdate:valueUpdate" />\
				</div>\
				<div class="wse-right">\
					<div class="wse-common-button wse-increase" data-bind="click:increase">\
					+</div>\
					<div class="wse-common-button wse-decrease" data-bind="click:decrease">\
					-</div>\
				</div>',

	afterRender : function(){
		var self = this;
		// disable selection
		this.$el.find('.wse-increase,.wse-decrease').mousedown(function(e){
			e.preventDefault();
		})
		this._$value = this.$el.find(".wse-spinner-value")
		// numeric input only
		this._$value.keydown(function(event){
			// Allow: backspace, delete, tab, escape and dot
			if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 190 ||
				 // Allow: Ctrl+A
				(event.keyCode == 65 && event.ctrlKey === true) || 
				// Allow: home, end, left, right
				(event.keyCode >= 35 && event.keyCode <= 39)) {
				// let it happen, don't do anything
				return;
			}
			else {
				// Ensure that it is a number and stop the keypress
				if ( event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 ) ) 
				{
					event.preventDefault(); 
				}
	        }
		})

		this._$value.change(function(){
			// sync the value in the input
			if( this.value !== self.viewModel.value().toString() ){
				this.value = self.viewModel.value();
			}
		})
	}
})

Meta.provideBinding('spinner', Spinner);

return Spinner;
});
//===================================
// Textfiled component
//
// @VMProp text
// @VMProp placeholder
//
//===================================
define('components/meta/textfield',['./meta',
		'knockout'], function(Meta, ko){

var TextField = Meta.derive(
{
	
	tag : "div",

	viewModel : {

		text : ko.observable(""),
		
		placeholder : ko.observable("")
	}

}, {
	
	type : "TEXTFIELD",

	css : 'textfield',

	template : '<input type="text" data-bind="attr:{placeholder:placeholder}, value:text"/>'
})

Meta.provideBinding("textfield", TextField);

});
//============================================
// Base class of all container component
//============================================
define('components/container/container',["../base",
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
	
	template : '<div data-bind="foreach:children">\
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

});
//===================================
// Panel
// Container has title and content
//===================================
define('components/container/panel',["./container",
		"knockout"], function(Container, ko){

var Panel = Container.derive(function(){

return {

	viewModel : {

		title : ko.observable(""),

		children : ko.observableArray([])
	}
}}, {

	type : 'PANEL',

	css : 'panel',

	template : '<div class="wse-panel-header">\
					<div class="wse-panel-title" data-bind="html:title"></div>\
					<div class="wse-panel-tools"></div>\
				</div>\
				<div class="wse-panel-body" data-bind="foreach:children">\
					<div data-bind="wse_view:$data"></div>\
				</div>\
				<div class="wse-panel-footer"></div>',

	afterRender : function(){
		var $el = this.$el;
		this._$header = $el.children(".wse-panel-header");
		this._$tools = this._$header.children(".wse-panel-tools");
		this._$body = $el.children(".wse-panel-body");
		this._$footer = $el.children(".wse-panel-footer");

	}
})

Container.provideBinding("panel", Panel);

return Panel;

})

;
//===================================
// Window componennt
// Window is a panel wich can be drag
// and close
//===================================
define('components/container/window',["./container",
		"./panel",
		'../mixin/draggable',
		"knockout"], function(Container, Panel, Draggable, ko){

var Window = Panel.derive(function(){

return {

	$el : $('<div data-bind="style:{left:_leftPx, top:_topPx}"></div>'),

	viewModel : {

		children : ko.observableArray(),
		title : ko.observable("Window"),

		left : ko.observable(0),
		top : ko.observable(0),

		_leftPx : ko.computed(function(){
			return this.viewModel.left()+"px";
		}, this, {
			deferEvaluation : true
		}),
		_topPx : ko.computed(function(){
			return this.viewModel.top()+"px";
		}, this, {
			deferEvaluation : true
		})
	}
}}, {

	type : 'WINDOW',

	css : _.union('window', Panel.prototype.css),

	initialize : function(){
		Draggable.applyTo( this );
	},

	afterRender : function(){
		
		Panel.prototype.afterRender.call( this );

		this.draggable.add( this.$el, this._$header);
	}
})

Container.provideBinding("window", Window);

return Window;

});
//============================================
// Tab Container
// Children of tab container must be a panel
//============================================
define('components/container/tab',["./panel",
		"./container",
		"../base",
		"knockout"], function(Panel, Container, Base, ko){

var Tab = Panel.derive(function(){

return {
	viewModel : {
		
		children : ko.observableArray(),

		active : ko.observable(0),

		maxTabWidth : 100,

		minTabWidth : 30

	}
}}, {

	type : "TAB",

	css : 'tab',

	add : function(item){
		if( item.instanceof(Panel) ){
			Panel.prototype.add.call(this, item);
		}else{
			console.error("Children of tab container must be instance of panel");
		}
		// compute the tab value;
		this.viewModel.children.subscribe(this._updateTabSize, this)
	},

	eventsProvided : ['change'],

	initialize : function(){
		this.viewModel.active.subscribe(function(idx){
			this.trigger('change', idx, this.viewModel.children()[idx]);
		}, this)
	},

	template : '<div class="wse-tab-header">\
					<ul class="wse-tab-tabs" data-bind="foreach:children">\
						<li data-bind="css:{active:$index()===$parent.active()},\
										click:$parent.active.bind($data, $index())">\
							<a data-bind="html:viewModel.title"></a>\
						</li>\
					</ul>\
					<div class="wse-tab-tools"></div>\
				</div>\
				<div class="wse-tab-body">\
					<div class="wse-tab-views" data-bind="foreach:children">\
						<div data-bind="wse_tab_view:$data,\
										visible:$index()===$parent.active()"></div>\
					</div>\
				</div>\
				<div class="wse-tab-footer"></div>',

	afterRender : function(){
		this._updateTabSize();
	},

	_updateTabSize : function(){
		var length = this.viewModel.children().length,
			tabSize = Math.floor((this.$el.width()-20)/length);
		// clamp
		tabSize = Math.min(this.viewModel.maxTabWidth, Math.max(this.viewModel.minTabWidth, tabSize) );

		this.$el.find(".wse-tab-header>.wse-tab-tabs>li").width(tabSize);
	}

})

ko.bindingHandlers["wse_tab_view"] = {

	_afterRender : function(){
		var element = this.element,
			subView = this.view,
			$body = subView._$body,
			$bodyPlaceHolder = $('<div class="wse-panel-body-placeholder"></div>')[0];

		// put a placeholder in the body for replace back
		$body.replaceWith($bodyPlaceHolder);
		element.appendChild($body[0]);

		subView.off("render", ko.bindingHandlers["wse_tab_view"]._afterRender );
	},

	init : function(element, valueAccessor){

		var subView = ko.utils.unwrapObservable( valueAccessor() );
		if( subView && subView.$el){
			subView.$el.detach();
			Base.disposeDom(element);
			element.innerHTML = "";
			if( subView._$body ){
				ko.bindingHandlers["wse_tab_view"]._afterRender.call({element:element, view:subView});
			}else{
				// append the view after render
				subView.on("render", ko.bindingHandlers["wse_tab_view"]._afterRender, {
					element : element,
					view : subView
				});
			}
		}

		//handle disposal (if KO removes by the template binding)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
        	subView.$el.children(".wse-panel-body-placeholder").replaceWith(subView._$body);
        });

		return { 'controlsDescendantBindings': true };
	}
}

Container.provideBinding("tab", Tab);

return Tab;

});
//====================================
// Base class of all widget component
// Widget is component mixed with meta 
// ,containers and other HTMLDOMElenents
//====================================
define('components/widget/widget',['../base',
		'../meta/meta',
		'../container/container',
		'knockout',
		'ko.mapping'], function(Base, Meta, Container, ko, koMapping){

var Widget = Base.derive(
{

}, {
	type : "WIDGET",

	css : 'widget'
})

//-------------------------------------------
// Handle bingings in the knockout template
Widget.provideBinding = Base.provideBinding;
Widget.provideBinding("widget", Widget);

return Widget;

});
//===================================
// Vector widget
// 
// @VMProp	items
// @VMProp	constrainProportion
// @VMProp	constrainType
// @VMProp	constrainRatio
//===================================
define('components/widget/vector',['./widget',
		'../base',
		'core/xmlparser',
		'knockout',
		'../meta/spinner',
		'../meta/range'], function(Widget, Base, XMLParser, ko){

var Vector = Widget.derive(function(){
return {

	viewModel : {
		// data source of item can be spinner type
		// or range type, distinguish with type field
		// @field type	spinner | range
		items : ko.observableArray(),

		// set true if you want to constrain the proportions
		constrainProportion : ko.observable(false),

		constrainType : ko.observable("diff"),	//diff | ratio

		_toggleConstrain : function(){
			this.constrainProportion( ! this.constrainProportion() );
		}
	},
	// Constrain ratio is only used when constrain type is ratio
	_constrainRatio : [],
	// Constrain diff is only uese when constrain type is diff
	_constrainDiff : [],
	// cache all sub spinner or range components
	_sub : []
}}, {

	type : "VECTOR",

	css : 'vector',

	initialize : function(){
		this.$el.attr("data-bind", 'css:{"wse-vector-constrain":constrainProportion}')
		// here has a problem that we cant be notified 
		// if the object in the array is updated
		this.viewModel.items.subscribe(function(item){
			// make sure self has been rendered
			if( this._$list ){
				this._cacheSubComponents();
				this._updateConstraint();
			}
		}, this);

		this.viewModel.constrainProportion.subscribe(function(constrain){
			if( constrain ){
				this._computeContraintInfo();
			}
		}, this)
	},

	template : '<div class="wse-left">\
					<div class="wse-vector-link" data-bind="click:_toggleConstrain"></div>\
				</div>\
				<div class="wse-right" >\
					<ul class="wse-list" data-bind="foreach:items">\
						<li data-bind="wse_ui:$data"></li>\
					</ul>\
				</div>',

	afterRender : function(){
		// cache the list element
		this._$list = this.$el.find(".wse-list");

		this._cacheSubComponents();
		this._updateConstraint();
	},

	dispose : function(){
		_.each(this._sub, function(item){
			item.dispose();
		});
		Base.prototype.dispose.call( this );
	},

	_cacheSubComponents : function(){

		var self = this;
		self._sub = [];

		this._$list.children().each(function(){
			
			var component = Base.getByDom(this);
			self._sub.push( component );
		});

		this._computeContraintInfo();
	},

	_computeContraintInfo : function(){
		this._constrainDiff = [];
		this._constrainRatio = [];
		_.each(this._sub, function(sub, idx){
			var next = this._sub[idx+1];
			if( ! next){
				return;
			}
			var value = sub.viewModel.value(),
				nextValue = next.viewModel.value();
			this._constrainDiff.push( nextValue-value);

			this._constrainRatio.push(value == 0 ? 1 : nextValue/value);

		}, this);
	},

	_updateConstraint : function(){

		_.each(this._sub, function(sub){

			sub.on("change", this._constrainHandler, this);
		}, this)
	},

	_constrainHandler : function(newValue, prevValue, sub){

		if(this.viewModel.constrainProportion()){

			var selfIdx = this._sub.indexOf(sub),
				constrainType = this.viewModel.constrainType();

			for(var i = selfIdx; i > 0; i--){
				var current = this._sub[i].viewModel.value,
					prev = this._sub[i-1].viewModel.value;
				if( constrainType == "diff"){
					var diff = this._constrainDiff[i-1];
					prev( current() - diff );
				}else if( constrainType == "ratio"){
					var ratio = this._constrainRatio[i-1];
					prev( current() / ratio );
				}

			}
			for(var i = selfIdx; i < this._sub.length-1; i++){
				var current = this._sub[i].viewModel.value,
					next = this._sub[i+1].viewModel.value;

				if( constrainType == "diff"){
					var diff = this._constrainDiff[i];
					next( current() + diff );
				}else if( constrainType == "ratio"){
					var ratio = this._constrainRatio[i];
					next( current() * ratio );
				}
			}
		}
	}
})

Widget.provideBinding("vector", Vector);

XMLParser.provideParser("vector", function(xmlNode){
	var items = [];
	var children = XMLParser.util.getChildren(xmlNode);
	_.chain(children).filter(function(child){
		var tagName = child.tagName && child.tagName.toLowerCase();
		return tagName && (tagName === "spinner" ||
							tagName === "range");
	}).each(function(child){
		var attributes = XMLParser.util.convertAttributes(child.attributes);
		attributes.type = child.tagName.toLowerCase();
		items.push(attributes);
	})
	if(items.length){
		return {
			items : items
		}
	}
})

return Vector;

});
// portal for all the components
define('src/main',["core/xmlparser",
		"core/mixin/derive",
		"core/mixin/event",
		"components/base",
		"components/util",
		"components/meta/button",
		"components/meta/canvas",
		"components/meta/checkbox",
		"components/meta/combobox",
		"components/meta/label",
		"components/meta/meta",
		"components/meta/range",
		"components/meta/spinner",
		"components/meta/textfield",
		"components/container/container",
		"components/container/panel",
		"components/container/window",
		"components/container/tab",
		"components/widget/vector",
		"components/widget/widget"], function(){

	console.log("wse ui is loaded");

	return {
		core : {
			xmlparser : require('core/xmlparser'),
			mixin : {
				derive : require('core/mixin/derive'),
				event : require('core/mixin/event')
			}
		},
		components : {
			base : require('components/base'),
			mixin : {
				draggable : require('components/mixin/draggable')
			},
			meta : {
				meta : require('components/meta/meta'),
				button : require('components/meta/button'),
				checkbox : require('components/meta/checkbox'),
				combobox : require('components/meta/combobox'),
				label : require('components/meta/label'),
				range : require('components/meta/range'),
				spinner : require('components/meta/spinner'),
				textfield : require('components/meta/textfield'),
				canvas : require("components/meta/canvas")
			},
			container : {
				container : require('components/container/container'),
				panel : require('components/container/panel'),
				window : require('components/container/window'),
				tab : require("components/container/tab")
			},
			widget : {
				widget : require("components/widget/widget"),
				vector : require("components/widget/vector")
			}
		}
	}
});// preload all the components
require(['src/main'], function(){});
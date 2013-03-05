//===================================
// Combobox component
// 
// @VMProp	value
// @VMProp	items
//			@property	value
//			@property	text
//===================================

define(['./meta',
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

	eventsProvided : _.union(Meta.prototype.eventsProvided, "change"),

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

})
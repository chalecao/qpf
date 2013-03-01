//===================================
// Combobox component
// 
// @VMProp	value
// @VMProp	options
//			@property	value
//			@property	text
//===================================

define(['./meta',
		'knockout'], function(Meta, ko){

var Combobox = Meta.derive(function(){
return {

	$el : $('<div data-bind="css:{active:active}" tabindex="0"></div>'),

	viewModel : {

		value : ko.observable(),

		options : ko.observableArray(),	//{value, text}

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
		}
	}
}}, {
	
	type : 'COMBOBOX',

	css : 'combobox',

	initialize : function(){

		this.viewModel.selectedText = ko.computed(function(){
			var val = this.value();
			var result =  _.filter(this.options(), function(item){
				return ko.utils.unwrapObservable(item.value) == val;
			})[0];
			if( typeof(result) == "undefined"){
				return this.defaultText();
			}
			return ko.utils.unwrapObservable(result.text);
		}, this.viewModel);

	},

	template : '<div class="wse-combobox-selected wse-common-button" data-bind="html:selectedText,click:_toggle"></div>\
				<ul class="wse-combobox-options" data-bind="foreach:options">\
					<li data-bind="html:text,attr:{\'data-wse-value\':value},click:$parent._select.bind($parent,value)"></li>\
				</ul>',

	afterRender : function(){

		var self = this;
		this._$selected = this.$el.find(".wse-combobox-selected");
		this._$options = this.$el.find(".wse-combobox-options");

		this.$el.blur(function(){
			self.viewModel._blur();
		})

	},

	//-------method provide for the users
	select : function(value){
		this.viewModel.select(value);
	}
})

Meta.provideBinding("combobox", Combobox);

return Combobox;

})
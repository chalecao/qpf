//===================================
// Spinner component
//
// @VMProp step
// @VMProp value
// @VMProp precision
//
// @event change newValue prevValue self[Range]
//===================================
define(['./meta',
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

	eventsProvided : _.union(Meta.prototype.eventsProvided, "change"),

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
})
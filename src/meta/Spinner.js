/**
 * Spinner component
 *
 * @VMProp step
 * @VMProp value
 * @VMProp precision
 *
 * @event change newValue prevValue self[Spinner]
 */
define(function(require) {

	'use strict';

	var Meta = require("./Meta");
	var ko = require("knockout");
	var $ = require('$');
	var _ = require("_");

	var Draggable = require('../helper/Draggable');

	function increase() {
		this.value(parseFloat(this.value()) + parseFloat(this.step()));
	}

	function decrease() {
		this.value(parseFloat(this.value()) - parseFloat(this.step()));
	}

	var Spinner = Meta.derive(function() {
		var ret = {
			step : ko.observable(1),
			valueUpdate : "", //"keypress" "keyup" "afterkeydown" "input"
			precision : ko.observable(2),
			min : ko.observable(null),
			max : ko.observable(null),
			increase : increase,
			decrease : decrease
		};
		ret.value = ko.observable(1).extend({
			numeric : ret.precision,
			clamp : { 
						max : ret.max,
						min : ret.min
					}
		});
		return ret;
	}, {
		type : 'SPINNER',

		css : 'spinner',

		initialize : function() {
			var prevValue = this.value() || 0;
			this.value.subscribe(function(newValue) {
				this.trigger("change", parseFloat(newValue), parseFloat(prevValue), this);
				prevValue = newValue;
			}, this)
		},

		eventsProvided : _.union(Meta.prototype.eventsProvided, "change"),

		template : '<div class="qpf-left">\
						<input type="text" class="qpf-spinner-value" data-bind="value:value,valueUpdate:valueUpdate" />\
					</div>\
					<div class="qpf-right">\
						<div class="qpf-common-button qpf-increase" data-bind="click:increase">\
						+</div>\
						<div class="qpf-common-button qpf-decrease" data-bind="click:decrease">\
						-</div>\
					</div>',

		afterRender : function() {
			var self = this;
			// disable selection
			this.$el.find('.qpf-increase,.qpf-decrease').mousedown(function(e) {
				e.preventDefault();
			});

			Draggable.applyTo(this, {
				updateDomPosition: false
			});

			this.draggable.add(this.$el.find('.qpf-right'));
			this.draggable.on('dragstart', this._onDragStart, this);
			this.draggable.on('drag', this._onDrag, this);

			this._$value = this.$el.find(".qpf-spinner-value")
			// numeric input only
			this._$value.keydown(function(event) {
				var keyCode = event.keyCode;
				// Allow: backspace, delete, tab, escape, minus, dot
				if (keyCode == 46 || keyCode == 8 || keyCode == 9 || keyCode == 27 || keyCode == 190 || keyCode == 189 ||
					 // Allow: Ctrl+A
					(keyCode == 65 && event.ctrlKey === true) || 
					// Allow: home, end, left, right
					(keyCode >= 35 && keyCode <= 39)) {
					// let it happen, don't do anything
					return;
				}
				else {
					// Ensure that it is a number and stop the keypress
					if (event.shiftKey || (keyCode < 48 || keyCode > 57) && (keyCode < 96 || keyCode > 105)) {
						event.preventDefault(); 
					}
		        }
			});

			this._$value.change(function() {
				// sync the value in the input
				if (this.value !== self.value().toString()) {
					this.value = self.value();
				}
			})
		},

		_onDragStart : function(e) {
			this._y0 = e.pageY;
		},

		_onDrag : function(e) {
			var oy = e.pageY - this._y0;
			if (oy < 0) {
				oy = Math.floor(oy / 5);
			} else {
				oy = Math.ceil(oy / 5);
			}
			this.value(this.value() - this.step() * oy);
			this._y0 = e.pageY;
		}
	})

	Meta.provideBinding('spinner', Spinner);

	return Spinner;
})
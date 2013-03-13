//=============================================
// Palette
//=============================================
define(function(require){

var Widget = require("./widget"),
	ko = require("knockout"),
	Color = require("./color_vm");

// component will be used in the widget
require("components/widget/vector");
require("components/meta/textfield");
require("components/meta/range");

var Palette = Widget.derive(function(){
	var ret = {
		viewModel : new Color
	}
	return ret;
}, {

	type : 'PALETTE',

	css : 'palette',

	eventsProvided : _.union(Widget.prototype.eventsProvided, ['change', 'apply']),

	template : 	'<div class="wse-palette-adjuster">\
					<div class="wse-left">\
						<div class="wse-palette-picksv" data-bind="style:{backgroundColor:hueRGB}">\
							<div class="wse-palette-saturation">\
								<div class="wse-palette-value"></div>\
							</div>\
							<div class="wse-palette-picker"></div>\
						</div>\
						<div class="wse-palette-pickh">\
							<div class="wse-palette-picker"></div>\
						</div>\
						<div class="wse-palette-alpha">\
							<div data-bind="wse_ui:{type:\'range\', min:0, max:1, value:alpha, precision:2}"></div>\
						</div>\
					</div>\
					<div class="wse-right">\
						<div class="wse-palette-rgb">\
							<div data-bind="wse_ui:{type:\'label\', text:\'RGB\'}"></div>\
							<div data-bind="wse_ui:{type:\'vector\', items:rgbVector}"></div>\
						</div>\
						<div class="wse-palette-hsv">\
							<div data-bind="wse_ui:{type:\'label\', text:\'HSV\'}"></div>\
							<div data-bind="wse_ui:{type:\'vector\', items:hsvVector}"></div>\
						</div>\
						<div class="wse-palette-hex">\
							<div data-bind="wse_ui:{type:\'label\', text:\'#\'}"></div>\
							<div data-bind="wse_ui:{type:\'textfield\',text:hexString}"></div>\
						</div>\
					</div>\
				</div>\
				<div style="clear:both"></div>\
				<div class="wse-palette-recent">\
				</div>\
				<div class="wse-palette-buttons">\
					<div data-bind="wse_ui:{type:\'button\', text:\'Cancel\', class:\'small\'}"></div>\
					<div data-bind="wse_ui:{type:\'button\', text:\'Apply\', class:\'small\'}"></div>\
				</div>',

	initialize : function(){
		this.viewModel.hex.subscribe(this._setPickerPosition, this);
		// incase the saturation and value is both zero or one, and
		// the rgb value not change when hue is changed
		this.viewModel._h.subscribe(this._setPickerPosition, this);
	},
	afterRender : function(){
		this._$svSpace = $('.wse-palette-picksv');
		this._$hSpace = $('.wse-palette-pickh');
		this._$svPicker = this._$svSpace.children('.wse-palette-picker');
		this._$hPicker = this._$hSpace.children('.wse-palette-picker');

		this._svSize = this._$svSpace.height();
		this._hSize = this._$hSpace.height();

		this._setPickerPosition();
		this._setupSvDragHandler();
		this._setupHDragHandler();
	},

	_setupSvDragHandler : function(){
		var self = this;

		var _getMousePos = function(e){
			var offset = self._$svSpace.offset(),
				left = e.pageX - offset.left,
				top = e.pageY - offset.top;
			return {
				left :left,
				top : top
			}
		};
		var _mouseMoveHandler = function(e){
			var pos = _getMousePos(e);
			self._computeSV(pos.left, pos.top);
		}
		var _mouseUpHandler = function(e){
			$(document.body).unbind("mousemove", _mouseMoveHandler)
							.unbind("mouseup", _mouseUpHandler)
							.unbind('mousedown', _disableSelect);
		}
		var _disableSelect = function(e){
			e.preventDefault();
		}
		this._$svSpace.mousedown(function(e){
			var pos = _getMousePos(e);
			self._computeSV(pos.left, pos.top);

			$(document.body).bind("mousemove", _mouseMoveHandler)
							.bind("mouseup", _mouseUpHandler)
							.bind("mousedown", _disableSelect);
		})
	},

	_setupHDragHandler : function(){
		var self = this;

		var _getMousePos = function(e){
			var offset = self._$hSpace.offset(),
				top = e.pageY - offset.top;
			return top;
		};
		var _mouseMoveHandler = function(e){
			self._computeH(_getMousePos(e));
		};
		var _disableSelect = function(e){
			e.preventDefault();
		}
		var _mouseUpHandler = function(e){
			$(document.body).unbind("mousemove", _mouseMoveHandler)
							.unbind("mouseup", _mouseUpHandler)
							.unbind('mousedown', _disableSelect);
		}

		this._$hSpace.mousedown(function(e){
			self._computeH(_getMousePos(e));

			$(document.body).bind("mousemove", _mouseMoveHandler)
							.bind("mouseup", _mouseUpHandler)
							.bind("mousedown", _disableSelect);
		})

	},

	_computeSV : function(left, top){
		var saturation = left / this._svSize,
			value = (this._svSize-top)/this._svSize;

		this.viewModel._s(saturation*100);
		this.viewModel._v(value*100);
	},

	_computeH : function(top){

		this.viewModel._h( top/this._hSize * 360 );
	},

	_setPickerPosition : function(){
		if( this._$svPicker){
			var hsv = this.viewModel.hsv(),
				hue = hsv[0],
				saturation = hsv[1],
				value = hsv[2];

			// set position relitave to space
			this._$svPicker.css({
				left : Math.round( saturation/100 * this._svSize ) + "px",
				top : Math.round( (100-value)/100 * this._svSize ) + "px"
			})
			this._$hPicker.css({
				top : Math.round( hue/360 * this._hSize) + "px"
			})
		}
	}
})

Widget.provideBinding("palette", Palette);

return Palette;
})
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
define(['./meta',
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

	eventsProvided : _.union(Meta.prototype.eventsProvided, "change"),
	
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

	afterResize : function(){

		this.updatePosition();
		Meta.prototype.afterResize.call(this);
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
		
		if( this._boxSize > 0 ){
			this._setOffset(size);
		}else{	//incase the element is still not in the document
			this._$slider.css( this._isHorizontal() ?
								"right" : "bottom", (1-percentage)*100+"%");
		}
		this._$percentage.css( this._isHorizontal() ?
								'width' : 'height', percentage*100+"%");
	},

	_isHorizontal : function(){
		return ko.utils.unwrapObservable( this.viewModel.orientation ) == "horizontal";
	}
})

Meta.provideBinding("range", Range);

return Range;

})
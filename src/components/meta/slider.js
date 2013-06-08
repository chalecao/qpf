//===================================
// Slider component
// 
// @VMProp value
// @VMProp step
// @VMProp min
// @VMProp max
// @VMProp orientation
// @VMProp format
//
// @method computePercentage
// @method updatePosition   update the slider position manually
// @event change newValue prevValue self[Slider]
//===================================
define(function(require){

var Meta = require("./meta");
var Draggable = require("../mixin/draggable");
var ko = require("knockout");
var $ = require("$");
var _ = require("_");

var Slider = Meta.derive(function(){

    var ret =  {

        $el : $('<div data-bind="css:orientation"></div>'),

        value : ko.observable(0),

        step : ko.observable(1),

        min : ko.observable(-100),

        max : ko.observable(100),

        orientation : ko.observable("horizontal"),// horizontal | vertical

        precision : ko.observable(2),

        format : "{{value}}",

        _format : function(number){
            return this.format.replace("{{value}}", number);
        },

        // compute size dynamically when dragging
        autoResize : true
    }

    ret.value = ko.observable(1).extend({
        numeric : ret.precision,
        clamp : { 
                    max : ret.max,
                    min : ret.min
                }
    })
    return ret;

}, {

    type : "SLIDER",

    css : 'slider',

    template : '<div class="qpf-slider-groove-box">\
                    <div class="qpf-slider-groove-outer">\
                        <div class="qpf-slider-groove">\
                            <div class="qpf-slider-percentage"></div>\
                        </div>\
                    </div>\
                </div>\
                <div class="qpf-slider-min" data-bind="text:_format(min())"></div>\
                <div class="qpf-slider-max" data-bind="text:_format(max())"></div>\
                <div class="qpf-slider-control">\
                    <div class="qpf-slider-control-inner"></div>\
                    <div class="qpf-slider-value" data-bind="text:_format(value())"></div>\
                </div>',

    eventsProvided : _.union(Meta.prototype.eventsProvided, "change"),
    
    initialize : function(){
        // add draggable mixin
        Draggable.applyTo( this, {
            axis : ko.computed(function(){
                return this.orientation() == "horizontal" ? "x" : "y"
            }, this)
        });

        var prevValue = this.value();
        this.value.subscribe(function(newValue){
            if( this._$box){
                this.updatePosition();
            }
            this.trigger("change", parseFloat(newValue), parseFloat(prevValue), this);
            
            prevValue = newValue;
        }, this);
    },

    afterRender : function(){

        // cache the element;
        this._$box = this.$el.find(".qpf-slider-groove-box");
        this._$percentage = this.$el.find(".qpf-slider-percentage");
        this._$control = this.$el.find(".qpf-slider-control");

        this.draggable.container = this.$el.find(".qpf-slider-groove-box");
        var item = this.draggable.add( this._$control );
        
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
            min = parseFloat( this.min() ),
            max = parseFloat( this.max() ),
            value = (max-min)*percentage+min;

        this.value( value );

        
    },

    _cacheSize : function(){

        // cache the size of the groove and slider
        var isHorizontal =this._isHorizontal();
        this._boxSize =  isHorizontal ?
                            this._$box.width() :
                            this._$box.height();
        this._sliderSize = isHorizontal ?
                            this._$control.width() :
                            this._$control.height();
    },

    computePercentage : function(){

        if( this.autoResize ){
            this._cacheSize();
        }

        var offset = this._computeOffset();
        return offset / ( this._boxSize - this._sliderSize );
    },

    _computeOffset : function(){

        var isHorizontal = this._isHorizontal();
        var grooveOffset = isHorizontal ?
                            this._$box.offset().left :
                            this._$box.offset().top;
        var sliderOffset = isHorizontal ? 
                            this._$control.offset().left :
                            this._$control.offset().top;

        return sliderOffset - grooveOffset;
    },

    _setOffset : function(offsetSize){
        var isHorizontal = this._isHorizontal();
        var grooveOffset = isHorizontal ?
                            this._$box.offset().left :
                            this._$box.offset().top;
        var offset = isHorizontal ? 
                    {left : grooveOffset+offsetSize} :
                    {top : grooveOffset+offsetSize};

        this._$control.offset( offset );
    },

    updatePosition : function(){
        
        if( ! this._$control){
            return;
        }
        if( this.autoResize ){
            this._cacheSize();
        }

        var min = this.min();
        var max = this.max();
        var value = this.value();
        var percentage = ( value - min ) / ( max - min );
        
        var size = (this._boxSize-this._sliderSize)*percentage;
        
        if( this._boxSize > 0 ){
            this._setOffset(size);
        }else{  //incase the element is still not in the document
            this._$control.css( this._isHorizontal() ?
                                "right" : "bottom", (1-percentage)*100+"%");
        }
        this._$percentage.css( this._isHorizontal() ?
                                'width' : 'height', percentage*100+"%");
    },

    _isHorizontal : function(){
        return ko.utils.unwrapObservable( this.orientation ) == "horizontal";
    }
})

Meta.provideBinding("slider", Slider);

return Slider;

})
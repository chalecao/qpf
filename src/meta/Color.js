define(function(require) {

    var Meta = require('./Meta');
    var ko = require('knockout');
    var colorUtil = require('../core/color');

    var PaletteWindow = require('../widget/PaletteWindow');

    function hexToString(hex) {
        var string = hex.toString(16);
        var fill = [];
        for (var i = 0; i < 6-string.length; i++) {
            fill.push('0');
        }
        return "#" + fill.join("") + string;
    }

    function hexToRgb(value) {
        var r = (value >> 16) & 0xff;
        var g = (value >> 8) & 0xff;
        var b = value & 0xff;
        return [r, g, b];
    }

    function rgbToHex(r, g, b) {
        return r << 16 | g << 8 | b;
    }

    // Share one palette window instance
    var _paletteWindow = null;

    var Color = Meta.derive(function() {
        var ret = {

            color: ko.observable('#ffffff'),

            _palette: null
        }
        var self = this;

        ret._colorHexStr = ko.computed(function() {
            var color = ret.color();
            if (typeof(color) == 'string') {
                var rgb = colorUtil.parse(ret.color());
                var hex = rgbToHex(rgb[0], rgb[1], rgb[2]);   
            } else {
                var hex = color;
            }
            return hexToString(hex).toUpperCase();
        });

        return ret;
    }, {

        type: 'COLOR',

        css: 'color',

        template : '<div data-bind="text:_colorHexStr" class="qpf-color-hex"></div>\
                    <div class="qpf-color-preview" data-bind="style:{backgroundColor:_colorHexStr()}"></div>',

        initialize: function() {
            var self = this;

            if (!_paletteWindow) {

                _paletteWindow = new PaletteWindow({
                    temporary: true
                });
                _paletteWindow.$el.hide();

                this._palette = _paletteWindow.getPalette();

                document.body.appendChild(_paletteWindow.$el[0]);

                _paletteWindow.render();
            }

            this.$el.click(function(){
                self.showPalette();
            });
        },

        showPalette : function(){

            _paletteWindow.show();

            this._palette.on("change", this._paletteChange, this);
            this._palette.on("cancel", this._paletteCancel, this);
            this._palette.on("apply", this._paletteApply, this);


            var color = this.color();
            if (typeof(color) == 'string') {
                var rgb = colorUtil.parse(this.color());
            } else {
                var rgb = hexToRgb(color);
            }

            this._palette.set(rgbToHex(rgb[0], rgb[1], rgb[2]));
        },

        _paletteChange : function(hex) {
            if (typeof(this.color()) == 'string') {
                this.color(hexToString(hex));
            } else {
                this.color(hex);
            }
        },

        _paletteCancel : function(){

            _paletteWindow.hide();
            
            this._palette.off("change");
            this._palette.off("apply");
            this._palette.off("cancel");
        },

        _paletteApply : function(){
            this._paletteCancel();
        }
    });
    
    Meta.provideBinding('color', Color);

    return Color;
});
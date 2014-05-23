define(function(require){
    
    var Palette = require("./Palette");
    var Window = require('../container/Window')
    var ko = require("knockout");

    var _ = require('_');

    var PaletteWindow = Window.derive({
        
        _palette: null

    }, {
        type: 'PALETTEWINDOW',

        css: _.union('palette-window', Window.prototype.css),

        initialize: function() {

            Window.prototype.initialize.call(this);
            
            this._palette = new Palette();

            this._palette.width(370);

            this.add(this._palette);

            this.title("Palette");
        },

        show: function() {
            this.$el.show();

            this.$el.css({
                left: Math.round($(window).width() / 2 - this.$el.width() / 2) + 'px',
                top: Math.round($(window).height() / 2 - this.$el.height() / 2) + 'px',
            });
        },

        hide: function() {
            this.$el.hide();
        },

        getPalette: function() {
            return this._palette;
        }
    });

    return PaletteWindow;
})
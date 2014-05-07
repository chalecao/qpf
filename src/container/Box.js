/**
 * base class of vbox and hbox
 */

define(function(require) {

    var Base = require('../Base');
    var Container = require("./Container");
    var ko = require("knockout");
    var $ = require("$");
    var _ = require("_");

    var Box = Container.derive({
        _inResize : false
    }, {

        type : 'BOX',

        css : 'box',

        initialize : function() {

            this.children.subscribe(this._onChildrenChanged, this);

            this.$el.css("position", "relative");

            Container.prototype.initialize.call(this);
        },

        _onChildrenChanged : function(children) {
            this.onResize();
            _.each(children, function(child) {
                child.on('resize', this.onResize, this);
            }, this);
        },

        _getMargin : function($el) {
            return {
                left : parseInt($el.css("marginLeft")) || 0,
                top : parseInt($el.css("marginTop")) || 0,
                bottom : parseInt($el.css("marginBottom")) || 0,
                right : parseInt($el.css("marginRight")) || 0,
            }
        },

        _resizeTimeout : 0,

        onResize : function() {
            // Avoid recursive call from children
            if (this._inResize) {
                return;
            }
            var self = this;
            // put resize in next tick,
            // if multiple child have triggered the resize event
            // it will do only once;
            if (this._resizeTimeout) {
                clearTimeout(this._resizeTimeout);
            }
            this._resizeTimeout = setTimeout(function() {
                self._inResize = true;
                self.resizeChildren();
                Base.prototype.onResize.call(self);
                self._inResize = false;
            }, 1);
        }
    })


    // Container.provideBinding("box", Box);

    return Box;

})
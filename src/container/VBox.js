/**
 * vbox layout
 * 
 * Items of vbox can have flex and prefer two extra properties
 * About this tow properties, you can reference to flexbox in css3
 * http://www.w3.org/TR/css3-flexbox/
 * https://github.com/doctyper/flexie/blob/master/src/flexie.js
 * TODO : add flexbox support
 *       align 
 *      padding ????
 */

define(function(require) {

    var Container = require("./Container");
    var Box = require("./Box");
    var ko = require("knockout");
    var $ = require("$");
    var _ = require("_");

    var vBox = Box.derive({
        _flexSum : 0,
        _childrenWithFlex : [],
        _marginCache : [],
        _marginCacheWithFlex : [],
        _remainderHeight : 0,
        _accHeight : 0
    }, {

        type : 'VBOX',

        css : 'vbox',

        resizeChildren : function() {

            this._flexSum = 0;
            this._accHeight = 0;
            this._childrenWithFlex = [];
            this._marginCache = [];
            this._marginCacheWithFlex = [];
            this._remainderHeight = this.$el.height();

            _.each(this.children(), this._iterateChildren, this);

            _.each(this._childrenWithFlex, this._updateChildrenHeight, this)

            _.each(this.children(), this._updateChildrenPosition, this);
        },


        _iterateChildren : function(child) {
            if (!child.visible()) {
                return;
            }
            var margin = this._getMargin(child.$el);
            this._marginCache.push(margin);
            // stretch the width
            // (when align is stretch)
            child.width(this.$el.width() - margin.left - margin.right);

            var prefer = ko.utils.unwrapObservable(child.prefer);
            var resizable = ko.utils.unwrapObservable(child.resizable);
            // Item is resizable, use the width and height directly
            if (resizable) {
                var height = +child.height() || 0;
                this._remainderHeight -= height + margin.top + margin.bottom;
            }
            // item has a prefer size (not null or undefined);
            else if (prefer != null) {
                // TODO : if the prefer size is larger than vbox size??
                prefer = Math.min(prefer, this._remainderHeight);
                child.height(prefer);

                this._remainderHeight -= prefer + margin.top + margin.bottom;
            } else {
                var flex = parseInt(ko.utils.unwrapObservable(child.flex) || 1);
                // put it in the next step to compute
                // the height based on the flex property
                this._childrenWithFlex.push(child);
                this._marginCacheWithFlex.push(margin);

                this._flexSum += flex;
            }
        },

        _updateChildrenPosition : function(child, idx) {
            if (!child.visible()) {
                return;
            }
            var margin = this._marginCache[idx];
            child.$el.css({
                "position" : "absolute",
                "left" : '0px', // still set left to zero, use margin to fix the layout
                "top" : this._accHeight + "px"
            })
            this._accHeight += +child.height() + margin.top + margin.bottom;
        },

        _updateChildrenHeight : function(child, idx) {
            if (!child.visible()) {
                return;
            }
            var margin = this._marginCacheWithFlex[idx];
            var flex = parseInt(ko.utils.unwrapObservable(child.flex) || 1),
                ratio = flex / this._flexSum;
            child.height(Math.floor(this._remainderHeight*ratio) - margin.top - margin.bottom); 
        }
    });


    Container.provideBinding("vbox", vBox);

    return vBox;

})
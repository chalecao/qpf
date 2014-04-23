/**
 * hbox layout
 *
 * Items of hbox can have flex and prefer two extra properties
 * About this tow properties, you can reference to flexbox in css3
 * http://www.w3.org/TR/css3-flexbox/
 * https://github.com/doctyper/flexie/blob/master/src/flexie.js
 */

define(function(require) {

    var Container = require("./Container");
    var Box = require("./Box");
    var ko = require("knockout");
    var $ = require("$");
    var _ = require("_");

    var hBox = Box.derive({
        _flexSum : 0,
        _childrenWithFlex : [],
        _marginCache : [],
        _marginCacheWithFlex : [],
        _remainderWidth : 0,
        _accWidth : 0
    }, {

        type : 'HBOX',

        css : 'hbox',

        resizeChildren : function() {

            this._flexSum = 0;
            this._accWidth = 0;
            this._childrenWithFlex = [];
            this._marginCache = [];
            this._marginCacheWithFlex = [];
            this._remainderWidth = this.$el.width();

            _.each(this.children(), this._iterateChildren, this);

            _.each(this._childrenWithFlex, this._updateChildrenWidth, this)

            _.each(this.children(), this._updateChildrenPosition, this);
        },

        _iterateChildren : function(child, idx) {
            var margin = this._getMargin(child.$el);
            this._marginCache.push(margin);
            // stretch the height
            // (when align is stretch)
            child.height(this.$el.height() - margin.top - margin.bottom );

            var prefer = ko.utils.unwrapObservable(child.prefer);
            var resizable = ko.utils.unwrapObservable(child.resizable);
            // Item is resizable, use the width and height directly
            if (resizable) {
                var width = +child.width() || 0;
                this._remainderWidth -= width + margin.left + margin.right;
            }
            // item has a prefer size (not null or undefined);
            else if (prefer != null) {
                // TODO : if the prefer size is larger than vbox size??
                prefer = Math.min(prefer, this._remainderWidth);
                child.width(prefer);

                this._remainderWidth -= prefer + margin.left + margin.right;
            } else {
                var flex = parseInt(ko.utils.unwrapObservable(child.flex ) || 1);
                // put it in the next step to compute
                // the height based on the flex property
                this._childrenWithFlex.push(child);
                this._marginCacheWithFlex.push(margin);

                this._flexSum += flex;
            }
        },

        _updateChildrenPosition : function(child, idx) {
            var margin = this._marginCache[idx];
            child.$el.css({
                "position" : "absolute",
                "top" : '0px',
                "left" : this._accWidth + "px"
            });
            this._accWidth += +child.width() + margin.left + margin.right;
        },

        _updateChildrenWidth : function(child, idx) {
            var margin = this._marginCacheWithFlex[idx];
            var flex = parseInt(ko.utils.unwrapObservable(child.flex ) || 1);
            var ratio = flex / this._flexSum;

            child.width(Math.floor(this._remainderWidth * ratio) - margin.left - margin.right);   
        }
    })


    Container.provideBinding("hbox", hBox);

    return hBox;

})
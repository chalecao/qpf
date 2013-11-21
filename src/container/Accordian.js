
/**
 * Accordion Container
 * Children of accordion container must be a panel
 */
define(function(require) {

var Container = require("./Container");
var Panel = require("./Panel");
var ko = require("knockout");
var $ = require("$");
var _ = require("_");

var Accordion = Container.derive(function() {

    var ret = {
        actived : ko.observable(0)
    }
    ret.actived.subscribe(function(idx) {
        this._active(idx);
    }, this);
    return ret;
}, {

    type : "ACCORDIAN",
    css : 'tab',

    add : function(item) {
        if (item instanceof Panel) {
            Panel.prototype.add.call(this, item);
        } else {
            console.error("Children of accordion container must be instance of panel");
        }
        this._active(this.actived());
    },

    eventsProvided : _.union('change', Container.prototype.eventsProvided),

    initialize : function() {
        this.children.subscribe(function() {
            this._updateSize();
        }, this);

        Container.prototype.initialize.call(this);
    },

    template : '',

    onResize : function() {

    },

    _updateSize : function() {

    },

    _active : function() {
        
    }
});

Container.provideBinding("accordion", Accordion);

return Accordion;
})
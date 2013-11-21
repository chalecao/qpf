/**
 * Base class of all meta component
 * Meta component is the ui component
 * that has no children
 */
define(function(require) {

var Base = require("../Base");
var ko = require("knockout");

var Meta = Base.derive(
{
}, {
    type : "META",

    css : 'meta'
});

// Inherit the static methods
Meta.provideBinding = Base.provideBinding;

Meta.provideBinding("meta", Meta);

return Meta;

})
//==================================
// Base class of all meta component
// Meta component is the ui component
// that has no children
//==================================
define(['../base',
        'knockout'], function(Base, ko){

var Meta = Base.derive(
{
}, {
    type : "META",

    css : 'meta'
})

// Inherit the static methods
Meta.provideBinding = Base.provideBinding;

return Meta;

})
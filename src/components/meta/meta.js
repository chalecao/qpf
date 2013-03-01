//==================================
// Base class of all meta component
// Meta component is the ui component
// that has no children
//==================================
define(['../base',
		'knockout',
		'ko.mapping'], function(Base, ko, koMapping){

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
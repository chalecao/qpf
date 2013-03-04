//====================================
// Base class of all widget component
// Widget is component mixed with meta 
// ,containers and other HTMLDOMElenents
//====================================
define(['../base',
		'../meta/meta',
		'../container/container',
		'knockout',
		'ko.mapping'], function(Base, Meta, Container, ko, koMapping){

var Widget = Base.derive(
{

}, {
	type : "WIDGET",

	css : 'widget'
})

//-------------------------------------------
// Handle bingings in the knockout template
Widget.provideBinding = Base.provideBinding;
Widget.provideBinding("widget", Widget);

return Widget;

})
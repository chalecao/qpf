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
	type : "WIDGET"
})

//-------------------------------------------
// Handle bingings in the knockout template
var bindings = {};
Widget.provideBinding = function(name, Component ){
	bindings[name] = Component;
}
var unwrap = ko.utils.unwrapObservable;

ko.bindingHandlers["wse_widget"] = {
	init : function( element, valueAccessor ){
		var value = valueAccessor();
		
		var options = unwrap(value) || {},
			type = unwrap(options.type),
			name = unwrap(options.name),
			attr = _.omit(options, "type", "name");
		if( type ){
			var Component = bindings[ type ];
			if( Component ){
				// dispose the previous component host on the element
				var prevComponent = Base.get( element.getAttribute("data-wse-guid") );
				if( prevComponent ){
					prevComponent.dispose();
				}

				var instance = new Component({
					name : name || "",
					attribute : attr
				});
				element.innerHTML = "";
				element.appendChild( instance.$el[0] );

				// save the guid in the element data attribute
				element.setAttribute("data-wse-guid", instance.__GUID__);
			}else{
				console.error("Unkown UI type, " + options.type);
			}
		}else{
			console.error("UI type is needed");
		}

		// not apply bindings to the descendant doms in the UI component
		return { 'controlsDescendantBindings': true };
	},

	update : function( element, valueAccessor ){

	}
}

Widget.provideBinding("widget", Widget);

return Widget;

})
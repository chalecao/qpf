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
	type : "META"
})

//-------------------------------------------
// Handle bingings in the knockout template
var bindings = {};
Meta.provideBinding = function(name, Component ){
	bindings[name] = Component;
}
var unwrap = ko.utils.unwrapObservable;
// provide bindings to knockout
ko.bindingHandlers["wse_meta"] = {
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
		// var value = valueAccessor();
		// var options = unwrap(value) || {},
		// 	type = unwrap(options.type),
		// 	name  = unwrap(options.name),
		// 	attr = unwrap(options.attribute);

		// var component = Base.get( element.getAttribute("data-wse-guid") );

		// if( component &&
		// 	component.type.toLowerCase() == type.toLowerCase() ){	// do simple update
		// 	component.name = name;
		// 	if( attr ){
		// 		koMapping.fromJS( attr, {}, component.viewModel );	
		// 	}
		// }else{
		// 	ko.bindingHandlers["wse_meta"].init( element, valueAccessor );
		// }

	}
}

return Meta;

})
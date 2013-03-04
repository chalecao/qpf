//==========================
// Util.js
// provide util function to operate
// the components
//===========================
define(['knockout',
		'exports'], function(ko, exports){

	var unwrap = ko.utils.unwrapObservable;

	exports.createComponentFromDataBinding = function( element, valueAccessor, availableBindings ){
		
		var value = valueAccessor();
		
		var options = unwrap(value) || {},
			type = unwrap(options.type);

		if( type ){
			var Constructor = availableBindings[type];

			if( Constructor ){
				var component = exports.createComponentFromJSON( options, Constructor)
				if( component ){
					element.innerHTML = "";
					element.appendChild( component.$el[0] );
				}
				// save the guid in the element data attribute
				element.setAttribute("data-wse-guid", component.__GUID__);
			}else{
				console.error("Unkown UI type, " + type);
			}
		}else{
			console.error("UI type is needed");
		}

		return component;
	}

	exports.createComponentFromJSON = function(options, Constructor){

		var type = unwrap(options.type),
			name = unwrap(options.name),
			attr = _.omit(options, "type", "name");

		var events = {};

		// Find which property is event
		_.each(attr, function(value, key){
			if( key.indexOf("on") == 0 &&
				Constructor.prototype.eventsProvided.indexOf(key.substr("on".length)) >= 0 &&
				typeof(value) == "function"){
				delete attr[key];
				events[key.substr("on".length)] = value;
			}
		})

		var component = new Constructor({
			name : name || "",
			attribute : attr
		});
		// binding events
		_.each(events, function(handler, name){
			component.on(name, handler);
		})

		return component;
	
	}

	// build a bridge of twe observables
	// and update the value from source to target
	// at first time
	exports.bridge = function(target, source){
		target.subscribe(function(newValue){
			try{
				source(newValue);
			}catch(e){
				// Normally when source is computed value
				// and it don't have a write function  
				console.error(e.toString());
			}
		})
		source.subscribe(function(newValue){
			try{
				target(newValue);
			}catch(e){
				console.error(e.toString());
			}
		})
	}
})

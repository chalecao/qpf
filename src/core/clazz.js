define(['./mixin/derive',
		'./mixin/event'], function(Derive, Event){

var Clazz = new Function();
_.extend(Clazz, Derive);
_.extend(Clazz.prototype, Event);

return Clazz;
})
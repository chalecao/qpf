define(function(require){

    var deriveMixin = require("./mixin/derive");
    var eventMixin = require("./mixin/event");

    var Clazz = new Function();
    _.extend(Clazz, deriveMixin);
    _.extend(Clazz.prototype, eventMixin);

    return Clazz;
})
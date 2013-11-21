define(function(require){

    var deriveMixin = require("./mixin/derive");
    var notifierMixin = require("./mixin/notifier");
    var _ = require("_");

    var Clazz = new Function();
    _.extend(Clazz, deriveMixin);
    _.extend(Clazz.prototype, notifierMixin);

    return Clazz;
})
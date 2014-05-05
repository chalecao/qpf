define(function(require){

    var Button = require("./Button");
    var Meta = require("./Meta");
    var ko = require("knockout");

    var IconButton = Button.derive(function(){
        return {
            $el : $("<div></div>"),
            icon : ko.observable("")
        }
    }, {
        type : "ICONBUTTON",
        css : _.union("icon-button", Button.prototype.css),

        template : '<div class="qpf-icon" data-bind="css:icon"></div>',
    })

    Meta.provideBinding("iconbutton", IconButton);

    return IconButton;

});
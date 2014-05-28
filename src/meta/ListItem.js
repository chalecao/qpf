// Default list item component
// Specially provide for List container
define(function(require){

    var Meta = require("./Meta");
    var ko = require("knockout");

    var ListItem = Meta.derive(function(){
        return {
            title : ko.observable("")
        }
    }, {
        type : "LISTITEM",
        
        css : "list-item",

        initialize : function(){
            this.$el.mousedown(function(e){
                e.preventDefault();
            });
        },

        template : '<div class="qpf-list-item-title" data-bind="html:title"></div>'
    })

    return ListItem;
})
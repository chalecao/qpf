// portal for all the components
define(function(require){

    console.log("qpf is loaded");

    return {
        core : {
            xmlparser : require('core/xmlparser'),
            mixin : {
                derive : require('core/mixin/derive'),
                event : require('core/mixin/event')
            }
        },
        components : {
            base : require('components/base'),
            util : require("components/util"),
            mixin : {
                draggable : require('components/mixin/draggable')
            },
            meta : {
                meta : require('components/meta/meta'),
                button : require('components/meta/button'),
                checkbox : require('components/meta/checkbox'),
                combobox : require('components/meta/combobox'),
                label : require('components/meta/label'),
                range : require('components/meta/range'),
                spinner : require('components/meta/spinner'),
                textfield : require('components/meta/textfield')
            },
            container : {
                container : require('components/container/container'),
                panel : require('components/container/panel'),
                window : require('components/container/window'),
                tab : require("components/container/tab"),
                vbox : require("components/container/vbox"),
                hbox : require("components/container/hbox"),
                inline : require("components/container/inline"),
                application : require("components/container/application")
            },
            widget : {
                widget : require("components/widget/widget"),
                vector : require("components/widget/vector"),
                palette : require("components/widget/palette")
            }
        }
    }
})
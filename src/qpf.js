// portal for all the components
define(function(require){

    var qpf = {
        core : {
            XMLParser : require('core/xmlparser'),
            mixin : {
                derive : require('core/mixin/derive'),
                event : require('core/mixin/event')
            },
            Clazz : require("core/clazz")
        },
        Base : require('base'),
        util : require("util"),
        mixin : {
            Draggable : require('mixin/draggable')
        },
        meta : {
            Meta : require('meta/meta'),
            Button : require('meta/button'),
            Checkbox : require('meta/checkbox'),
            Combobox : require('meta/combobox'),
            Label : require('meta/label'),
            Slider : require('meta/slider'),
            Spinner : require('meta/spinner'),
            Textfield : require('meta/textfield')
        },
        container : {
            Container : require('container/container'),
            Panel : require('container/panel'),
            Window : require('container/window'),
            Tab : require("container/tab"),
            VBox : require("container/vbox"),
            HBox : require("container/hbox"),
            Inline : require("container/inline"),
            Application : require("container/application")
        },
        widget : {
            Widget : require("widget/widget"),
            Vector : require("widget/vector"),
            Palette : require("widget/palette")
        }
    }

    qpf.create = qpf.Base.create;

    return qpf;
})
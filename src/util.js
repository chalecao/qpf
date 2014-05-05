/**
 * Util.js
 * provide util function to operate
 * the components
 */
define(function(require) {

    var ko = require("knockout");
    var XMLParser = require("./core/XMLParser");
    var Base = require("./Base");
    var exports = {};

    // Return an array of components created from XML
    exports.createComponentsFromXML = function(XMLString, viewModel) {
        var dom = XMLParser.parse(XMLString);
        ko.applyBindings(viewModel || {}, dom);
        var ret = [];
        var node = dom.firstChild;
        while (node) {
            var component = Base.getByDom(node);
            if (component) {
                ret.push(component);
            }
            node = node.nextSibling;
        }
        return ret;
    }

    exports.initFromXML = function(dom, XMLString, viewModel) {
        var components = exports.createComponentsFromXML(XMLString, viewModel);
        for (var i = 0; i < components.length; i++) {
            dom.appendChild(components[i].$el[0]);
        }
        return components;
    }

    exports.init = function(dom, viewModel, callback) {
        ko.applyBindings(dom, viewModel);

        var xmlPath = dom.getAttribute('data-qpf-xml');
        if (xmlPath) {
            $.get(xmlPath, function(XMLString) {
                exports.initFromXML(dom, XMLString, viewModel);
                callback && callback();
            }, 'text');
        }
    }

    return exports;

})

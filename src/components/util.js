//==========================
// Util.js
// provide util function to operate
// the components
//===========================
define(['knockout',
        'core/xmlparser',
        './base',
        'exports'], function(ko, XMLParser, Base, exports){

    // Return an array of components created from XML
    exports.createComponentsFromXML = function(XMLString, viewModel){

        var dom = XMLParser.parse(XMLString);
        ko.applyBindings(viewModel || {}, dom);
        var ret = [];
        var node = dom.firstChild;
        while(node){
            var component = Base.getByDom(node);
            if( component ){
                ret.push(component);
            }
            node = node.nextSibling;
        }
        return ret;
    }
})

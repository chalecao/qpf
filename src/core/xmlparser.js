//===================================================
// Xml Parser
// parse wml and convert it to dom with knockout data-binding
// TODO	xml valid checking, 
//		provide xml childNodes Handler in the Components
//===================================================
define(function(require, exports, module){

	// return document fragment converted from the xml
	var parse = function( xmlString ){
		
		if( typeof(xmlString) == "string"){
			var xml = parseXML( xmlString );
		}else{
			var xml = xmlString;
		}
		if( xml ){

			var rootDomNode = document.createElement("div");

			convert( xml, rootDomNode);

			return rootDomNode;
		}
	}

	function parseXML( xmlString ){
		var xml, parser;
		try{
			if( window.DOMParser ){
				xml = (new DOMParser()).parseFromString( xmlString, "text/xml");
			}else{
				xml = new ActiveXObject("Microsoft.XMLDOM");
				xml.async = "false";
				xml.loadXML( xmlString );
			}
			return xml;
		}catch(e){
			console.error("Invalid XML:" + xmlString);
		}
	}

	function parseXMLNode(xmlNode){
		if( xmlNode.nodeType !== 1){
			return;
		}
		var bindingResults = {
			type : xmlNode.tagName.toLowerCase()
		} 
		attributes = xmlNode.attributes;
		for(var i = 0; i < attributes.length; i++){
			var attr = attributes[i],
				name = attr.nodeName,
				value = attr.nodeValue;
			if( value ){
				// this value is an expression or observable
				// in the viewModel if it has @binding[] flag
				var isBinding = /^\s*@binding\[(.*?)\]\s*$/.exec(value);
				if( isBinding ){
					// add a tag to remove quotation the afterwards
					// conveniently, or knockout will treat it as a 
					// normal string, not expression
					value = "{{BINDINGSTART" + isBinding[1] + "BINDINGEND}}";

				}
				bindingResults[name] = value
			}
		}

		var domNode = document.createElement('div');

		var bindingString = JSON.stringify(bindingResults);
		
		bindingString = bindingString.replace(/\"\{\{BINDINGSTART(.*?)BINDINGEND\}\}\"/, "$1");

		domNode.setAttribute('data-bind',  "wse_ui:"+bindingString);

		return domNode;
	}

	function convert(root, parent){

		var children = getChildren(root);

		for(var i = 0; i < children.length; i++){
			var node = parseXMLNode( children[i] );
			if( node ){
				parent.appendChild(node);
				convert( children[i], node);
			}
		}
	}

	function getChildren(parent){
		
		var children = [];
		var node = parent.firstChild;
		while(node){
			children.push(node);
			node = node.nextSibling;
		}
		return children;
	}

	exports.parse = parse;
})
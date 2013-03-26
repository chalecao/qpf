//===================================
// Tree Component
// Example
// ----------------xml---------------
// <tree>
//   <item icon="assets/imgs/file.gif">foo</item>
//   <item css="folder">
//     <item title="bar" icon="assets/imgs/file.gif"></item>
//   </item>
// </tree>
// ----------------------------------
// 
//===================================
define(['./meta',
		'knockout'], function(Meta, ko){

var Tree = Meta.derive(function(){

	return {
		// Example
		// [{
		//    title : "" | ko.observable(),
		//    icon  : "" | ko.observable(),      //icon img url
		//    css 	: "" | ko.observable(),      //css class
		//    items : [] | ko.observableArray()  //sub items
		// }]
		items : ko.observableArray(),

		draggable : ko.observable(false),

		renamble : ko.observable(false)
	}
}, {

	type : "TREE",
	
	css : 'tree',

	template : '<ul data-bind="foreach:items">\
					<li data-bind="qpf_tree_itemview:"></div>\
				</ul>'
})

var itemTemplate = '<li class="qpf-tree-item">\
						<div class="qpf-tree-item-title">\
							<span class="qpf-tree-item-icon"></span>\
							<a class="qpf-tree-item-caption" data-bind="text:title"></span>\
						</div>\
						<ul class="qpf-tree-subitems" data-bind="if:items"></ul>\
					</li>';

ko.bindingHandlers["qpf_tree_itemview"] = {

}

})
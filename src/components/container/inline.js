//=============================================
// Inline Layout
//=============================================
define(["./container",
		"knockout"], function(Container, ko){

var Inline = Container.derive({
}, {

	type : "INLINE",

	css : "inline",

	template : '<div data-bind="foreach:children" class="wse-children">\
					<div data-bind="wse_view:$data"></div>\
				</div>\
				<div style="clear:both"></div>'
})

Container.provideBinding("inline", Inline);

return Inline;

})
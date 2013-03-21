//=============================================
// Inline Layout
//=============================================
define(["./container",
		"knockout"], function(Container, ko){

var Inline = Container.derive({
}, {

	type : "INLINE",

	css : "inline",

	template : '<div data-bind="foreach:children" class="qpf-children">\
					<div data-bind="qpf_view:$data"></div>\
				</div>\
				<div style="clear:both"></div>'
})

Container.provideBinding("inline", Inline);

return Inline;

})
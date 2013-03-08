//===================================
// Panel
// Container has title and content
//===================================
define(["./container",
		"knockout",
		"core/jquery.resize"], function(Container, ko){

var Panel = Container.derive(function(){

return {

	viewModel : {

		title : ko.observable(""),

		children : ko.observableArray([])
	}
}}, {

	type : 'PANEL',

	css : 'panel',

	initialize : function(){
		this.$el.bind("resize", {
			context : this
		}, this.resizeBody);
	},

	template : '<div class="wse-panel-header">\
					<div class="wse-panel-title" data-bind="html:title"></div>\
					<div class="wse-panel-tools"></div>\
				</div>\
				<div class="wse-panel-body" data-bind="foreach:children">\
					<div data-bind="wse_view:$data" class="wse-container-item"></div>\
				</div>\
				<div class="wse-panel-footer"></div>',
	
	afterRender : function(){
		var $el = this.$el;
		this._$header = $el.children(".wse-panel-header");
		this._$tools = this._$header.children(".wse-panel-tools");
		this._$body = $el.children(".wse-panel-body");
		this._$footer = $el.children(".wse-panel-footer");

		this._$body.bind("resize", {context : this}, this.resizeContainer);
	},

	resizeBody : function(e){
		var self = e.data.context;
		if( self.viewModel.height() &&
			self.viewModel.height() !== "auto"){
			if( self._$body){
				var headerHeight = self._$header.height(),
					footerHeight = self._$footer.height();
				// use Jquery's innerHeight method here, because we need to consider 
				// the padding of body;
				self._$body.innerHeight(self.$el.height() - headerHeight - footerHeight);
			}
		}
	},

	resizeContainer : function(e){
		var self = e.data.context;
		// fit the container height to body height when 
		// the height is auto;
		if( self.viewModel.height() === "auto" ||
			! self.viewModel.height() ){	
			if( self._$body ){
				var headerHeight = self._$header.height(),
					footerHeight = self._$footer.height(),
					bodyInnerHeight = self._$body.innerHeight();
				self.$el.height(headerHeight + footerHeight + bodyInnerHeight);
			}
		}
	},

	dispose : function(){
		this._$body.unbind("resize", this.resizeContainer);
		this.$el.unbind("resize", this.resizeBody);
		Container.prototype.dispose.call(this);
	}
})

Container.provideBinding("panel", Panel);

return Panel;

})


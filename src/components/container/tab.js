//============================================
// Tab Container
// Children of tab container must be a panel
//============================================
define(["./panel",
		"./container",
		"../base",
		"knockout"], function(Panel, Container, Base, ko){

var Tab = Panel.derive(function(){

return {
	viewModel : {
		
		children : ko.observableArray(),

		actived : ko.observable(0),

		maxTabWidth : 100,

		minTabWidth : 30

	}
}}, {

	type : "TAB",

	css : 'tab',

	add : function(item){
		if( item.instanceof(Panel) ){
			Panel.prototype.add.call(this, item);
		}else{
			console.error("Children of tab container must be instance of panel");
		}
		this.active( this.viewModel.actived() );
	},

	eventsProvided : _.union('change', Container.prototype.eventsProvided),

	initialize : function(){
		this.viewModel.actived.subscribe(function(idx){
			this.active(idx);
		}, this)
		this.active( this.viewModel.actived() );

		this.$el.bind("resize", {
			context : this
		}, this.resizeBody);

		// compute the tab value;
		this.viewModel.children.subscribe(this._updateTabSize, this)
	},

	template : '<div class="wse-tab-header">\
					<ul class="wse-tab-tabs" data-bind="foreach:children">\
						<li data-bind="css:{actived:$index()===$parent.actived()},\
										click:$parent.actived.bind($data, $index())">\
							<a data-bind="html:viewModel.title"></a>\
						</li>\
					</ul>\
					<div class="wse-tab-tools"></div>\
				</div>\
				<div class="wse-tab-body">\
					<div class="wse-tab-views" data-bind="foreach:children">\
						<div data-bind="wse_view:$data"></div>\
					</div>\
				</div>\
				<div class="wse-tab-footer"></div>',

	afterRender : function(){
		this._updateTabSize();
		// cache the $element will be used
		var $el = this.$el;
		this._$header = $el.children(".wse-tab-header");
		this._$tools = this._$header.children(".wse-tab-tools");
		this._$body = $el.children(".wse-tab-body");
		this._$footer = $el.children('.wse-tab-footer');

		this._$body.bind("resize", {context : this}, this.resizeContainer);

		this.active( this.viewModel.actived() );
	},

	_unActiveAll : function(){
		_.each(this.viewModel.children(), function(child){
			child.$el.css("display", "none");
		});
	},

	_updateTabSize : function(){
		var length = this.viewModel.children().length,
			tabSize = Math.floor((this.$el.width()-20)/length);
		// clamp
		tabSize = Math.min(this.viewModel.maxTabWidth, Math.max(this.viewModel.minTabWidth, tabSize) );

		this.$el.find(".wse-tab-header>.wse-tab-tabs>li").width(tabSize);
	},

	active : function(idx){
		this._unActiveAll();
		var child = this.viewModel.children()[idx];
		if( child ){
			child.$el.css("display", "block");
			this.trigger('change', idx, child);
		}
	},

	resizeBody : function(e){
		var self = e.data.context;
		if( self.viewModel.height() &&
			self.viewModel.height() !== "auto"){
			if( self._$body){
				var headerHeight = self._$header.height(),
					footerHeight = self._$footer.height();
				var height = self.$el.height() - headerHeight - footerHeight;
				// use Jquery's innerHeight method here, because we need to consider 
				// the padding of body;
				self._$body.innerHeight(height);
				// stretch the panel size;
				_.each(self.viewModel.children(), function(child){
					child.viewModel.height(height);
				});
			}
		}

		self._updateTabSize();
	}

})

Container.provideBinding("tab", Tab);

return Tab;

})
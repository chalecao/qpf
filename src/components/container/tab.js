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

		active : ko.observable(0),

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
		// compute the tab value;
		this.viewModel.children.subscribe(this._updateTabSize, this)
	},

	eventsProvided : _.union('change', Container.prototype.eventsProvided),

	initialize : function(){
		this.viewModel.active.subscribe(function(idx){
			this.trigger('change', idx, this.viewModel.children()[idx]);
		}, this)
	},

	template : '<div class="wse-tab-header">\
					<ul class="wse-tab-tabs" data-bind="foreach:children">\
						<li data-bind="css:{active:$index()===$parent.active()},\
										click:$parent.active.bind($data, $index())">\
							<a data-bind="html:viewModel.title"></a>\
						</li>\
					</ul>\
					<div class="wse-tab-tools"></div>\
				</div>\
				<div class="wse-tab-body">\
					<div class="wse-tab-views" data-bind="foreach:children">\
						<div data-bind="wse_tab_view:$data,\
										visible:$index()===$parent.active()"></div>\
					</div>\
				</div>\
				<div class="wse-tab-footer"></div>',

	afterRender : function(){
		this._updateTabSize();
	},

	_updateTabSize : function(){
		var length = this.viewModel.children().length,
			tabSize = Math.floor((this.$el.width()-20)/length);
		// clamp
		tabSize = Math.min(this.viewModel.maxTabWidth, Math.max(this.viewModel.minTabWidth, tabSize) );

		this.$el.find(".wse-tab-header>.wse-tab-tabs>li").width(tabSize);
	}

})

ko.bindingHandlers["wse_tab_view"] = {

	_afterRender : function(){
		var element = this.element,
			subView = this.view;

		// put a placeholder in the body for replace back
		element.appendChild(subView.$el[0]);

		subView.off("render", ko.bindingHandlers["wse_tab_view"]._afterRender );
	},

	init : function(element, valueAccessor){

		var subView = ko.utils.unwrapObservable( valueAccessor() );
		if( subView && subView.$el){
			subView.$el.detach();
			Base.disposeDom(element);
			element.innerHTML = "";
			if( subView._$header ){
				ko.bindingHandlers["wse_tab_view"]._afterRender.call({element:element, view:subView});
			}else{
				// append the view after render
				subView.on("render", ko.bindingHandlers["wse_tab_view"]._afterRender, {
					element : element,
					view : subView
				});
			}
		}

		//handle disposal (if KO removes by the template binding)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
        });

		return { 'controlsDescendantBindings': true };
	}
}

Container.provideBinding("tab", Tab);

return Tab;

})
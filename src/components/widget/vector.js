//===================================
// Vector widget
// 
// @VMProp	items
// @VMProp	constrainProportion
// @VMProp	constrainType
// @VMProp	constrainRatio
//===================================
define(['./widget',
		'../base',
		'knockout',
		'../meta/spinner',
		'../meta/range'], function(Widget, Base, ko){

var Vector = Widget.derive(function(){
return {

	viewModel : {
		// data source of item can be spinner type
		// or range type, distinguish with type field
		// @field type	spinner | range
		items : ko.observableArray(),

		// set true if you want to constrain the proportions
		constrainProportion : ko.observable(false),

		constrainType : ko.observable("diff"),	//diff | ratio

		_toggleConstrain : function(){
			this.constrainProportion( ! this.constrainProportion() );
		}
	},
	// Constrain ratio is only used when constrain type is ratio
	_constrainRatio : [],
	// Constrain diff is only uese when constrain type is diff
	_constrainDiff : [],
	// cache all sub spinner or range components
	_sub : []
}}, {

	type : "VECTOR",

	initialize : function(){
		this.$el.attr("data-bind", 'css:{"wse-vector-constrain":constrainProportion}')
		// here has a problem that we cant be notified 
		// if the object in the array is updated
		this.viewModel.items.subscribe(function(item){
			// make sure self has been rendered
			if( this._$list ){
				this._cacheSubComponents();
				this._updateConstraint();
			}
		}, this);

		this.viewModel.constrainProportion.subscribe(function(constrain){
			if( constrain ){
				this._computeContraintInfo();
			}
		}, this)
	},

	template : '<div class="wse-left">\
					<div class="wse-vector-link" data-bind="click:_toggleConstrain"></div>\
				</div>\
				<div class="wse-right" >\
					<ul class="wse-list" data-bind="foreach:items">\
						<li data-bind="wse_meta:$data"></li>\
					</ul>\
				</div>',

	afterrender : function(){
		// cache the list element
		this._$list = this.$el.find(".wse-list");

		this._cacheSubComponents();
		this._updateConstraint();
	},

	dispose : function(){
		_.each(this._sub, function(item){
			item.dispose();
		});
		Base.prototype.dispose.call( this );
	},

	_cacheSubComponents : function(){

		var self = this;
		self._sub = [];

		this._$list.children().each(function(){
			
			var component = Base.getByDom(this);
			self._sub.push( component );
		});

		this._computeContraintInfo();
	},

	_computeContraintInfo : function(){
		this._constrainDiff = [];
		this._constrainRatio = [];
		_.each(this._sub, function(sub, idx){
			var next = this._sub[idx+1];
			if( ! next){
				return;
			}
			var value = sub.viewModel.value(),
				nextValue = next.viewModel.value();
			this._constrainDiff.push( nextValue-value);

			this._constrainRatio.push(value == 0 ? 1 : nextValue/value);

		}, this);
	},

	_updateConstraint : function(){

		_.each(this._sub, function(sub){

			sub.on("change", this._constrainHandler, this);
		}, this)
	},

	_constrainHandler : function(newValue, prevValue, sub){

		if(this.viewModel.constrainProportion()){

			var selfIdx = this._sub.indexOf(sub),
				constrainType = this.viewModel.constrainType();

			for(var i = selfIdx; i > 0; i--){
				var current = this._sub[i].viewModel.value,
					prev = this._sub[i-1].viewModel.value;
				if( constrainType == "diff"){
					var diff = this._constrainDiff[i-1];
					prev( current() - diff );
				}else if( constrainType == "ratio"){
					var ratio = this._constrainRatio[i-1];
					prev( current() / ratio );
				}

			}
			for(var i = selfIdx; i < this._sub.length-1; i++){
				var current = this._sub[i].viewModel.value,
					next = this._sub[i+1].viewModel.value;

				if( constrainType == "diff"){
					var diff = this._constrainDiff[i];
					next( current() + diff );
				}else if( constrainType == "ratio"){
					var ratio = this._constrainRatio[i];
					next( current() * ratio );
				}
			}
		}
	}
})

Widget.provideBinding("vector", Vector);

return Vector;

})
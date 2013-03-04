/**
 * GooJS
 *
 * A simple, flexible canvas drawing library,
 * Provides:
 * + Retained mode drawing
 * + Drawing element management
 * + Render tree management
 * + Both pixel based picking and shape based picking
 * + Mouse events dispatch
 * + Common shape 
 * + Word wrap and wordbreak of text
 * @author shenyi01@baidu.com
 *
 */
 (function(factory){
 	// AMD
 	if( typeof define !== "undefined" && define["amd"] ){
 		define(["exports"], factory);
 	// No module loader
 	}else{
 		factory( window["GooJS"] = {} );
 	}

})(function(_exports){

var GooJS = _exports;

GooJS.create = function(dom){
		//elements to be rendered in the scene
	var renderPool = {},
		//canvas element
		container = null,
		//context of canvans
		context = null,
		//width of canvas
		clientWidth = 0,
		//height of canvas
		clientHeight = 0,
		//a ghost canvas for pixel based picking
		ghostCanvas = null,
		//context of ghost canvas
		ghostCanvasContext = null,
		//store the element for picking, 
		//index is the color drawed in the ghost canvas
		elementLookupTable = [],

		ghostImageData;

	function add(elem){
		elem && 
			(renderPool[elem.__GUID__] = elem);
	}
	/**
	 * @param elem element id || element
	 */
	function remove(elem){
		if(typeof(elem) == 'string'){
			elem = elementsMap[elem];
		}
		
		delete renderPool[elem.__GUID__];
	}
	
	function render(){

		context.clearRect(0, 0, clientWidth, clientHeight);
		ghostCanvasContext.clearRect(0, 0, clientWidth, clientHeight);
		
		elementLookupTable = [];

		var renderQueue = getSortedRenderQueue(renderPool);		

		for(var i =0; i < renderQueue.length; i++){
			var r = renderQueue[i];
			
			draw(r);

			drawGhost(r);
		}
		////////get image data
		ghostImageData = ghostCanvasContext.getImageData(0, 0, ghostCanvas.width, ghostCanvas.height);

		function draw(r){
			
			if( ! r.visible){
				return ;
			}

			context.save();

			// set style
			if(r.style){
				// support mutiple style bind
				if( ! r.style instanceof GooJS.Style){

					for(var name in r.style){
						
						r.style[name].bind(context);
 					}
				}else{

					r.style.bind(context);
				}
			}
			// set transform
			r._transform && context.transform(r._transform[0],
											r._transform[1],
											r._transform[2],
											r._transform[3],
											r._transform[4],
											r._transform[5]);

			r.draw(context);
			//clip from current shape;
			r.clip && context.clip();
			//draw its children
			var renderQueue = getSortedRenderQueue(r.children);
			for(var i = 0; i < renderQueue.length; i++){
				draw(renderQueue[i]);
			}

			context.restore();
		}

		function drawGhost(r){
			if( ! r.visible){
				return;
			}

			elementLookupTable.push(r);

			ghostCanvasContext.save();

			var rgb = packID(elementLookupTable.length),
				color = 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')';

			ghostCanvasContext.fillStyle = color;
			ghostCanvasContext.strokeStyle = color;

			if(r.intersectLineWidth){
				ghostCanvasContext.lineWidth = r.intersectLineWidth;
			}
			else if(r.style && r.style.lineWidth){
				ghostCanvasContext.lineWidth = r.style.lineWidth;
			}

			// set transform
			r._transform && ghostCanvasContext.transform(r._transform[0],
											r._transform[1],
											r._transform[2],
											r._transform[3],
											r._transform[4],
											r._transform[5]);
		
			if(r instanceof GooJS.Text){
			}
			else if(r instanceof GooJS.Image){
			}
			else{
				r.draw(ghostCanvasContext);
			}
			// set clip
			r.clip && ghostCanvasContext.clip();

			//draw its children
			var renderQueue = getSortedRenderQueue(r.children);
			for(var i = 0; i < renderQueue.length; i++){
				drawGhost(renderQueue[i]);
			}

			ghostCanvasContext.restore();
		}

		function getSortedRenderQueue(pool){
			var renderQueue = [];

			for (var guid in pool) {
			
				renderQueue.push(pool[guid]);
			};

			//z值从小到大排, 相同按照GUID的顺序
			renderQueue.sort(function(x, y){
				if(x.z == y.z)
					return x.__GUID__ > y.__GUID__ ? 1 : -1;
				
				return x.z > y.z ? 1 : -1;
			})
			return renderQueue;
		}
	}

	function getMousePosition(e){
		var offsetX = e.pageX - this.offsetLeft,
			offsetY = e.pageY - this.offsetTop,
			p = this,
			props = {};
			
		while(p = p.offsetParent){
			offsetX -= p.offsetLeft;
			offsetY -= p.offsetTop;
		}
		return {
			x : offsetX,
			y : offsetY,
			pageX : e.pageX,
			pageY : e.pageY
		}
	}
	
	function clickHandler(e){
	
		findTrigger.call(this, e, 'click');
	}
	
	function mouseDownHandler(e){
		
		findTrigger.call(this, e, 'mousedown');
	}
	
	function mouseUpHandler(e){

		var props = getMousePosition.call(this, e);

		for(var i = 0; i < elementLookupTable.length; i++){
			
			var elem = elementLookupTable[i];
			
			MouseEvent.throw("mouseup", elem, props);
		}
	}
	
	function mouseMoveHandler(e){
		
		var props = getMousePosition.call(this, e);

		for(var i = 0; i < elementLookupTable.length; i++){
			
			var elem = elementLookupTable[i];

			MouseEvent.throw("mousemove", elem, props);
		}

		var trigger = findTrigger.call(this, e, 'mouseover');
		trigger && (trigger.__mouseover__ = true);
	}
	
	function mouseOutHandler(e){
		
		var props = getMousePosition.call(this, e);

		for(var i = 0; i < elementLookupTable.length; i++){

			var elem = elementLookupTable[i];
			if(elem.__mouseover__){
				MouseEvent.throw("mouseout", elem, props);
				elem.__mouseover__ = false;
			}
		}
	}

	function packID(id){
		var r = id >> 16,
			g = (id - (r << 8)) >> 8,
			b = id - (r << 16) - (g<<8);
		return {
			r : r,
			g : g,
			b : b
		}
	}

	function unpackID(r, g, b){
		return (r << 16) + (g<<8) + b;
	}
	/**
	 * 查询被点击的元素
	 */
	function findTrigger(e, type){

		var props = getMousePosition.call(this, e),
			x = props.x,
			y = props.y,
			trigger = null;

		var cursor = ((y-1) * ghostCanvas.width + x-1)*4,
			r = ghostImageData.data[cursor],
			g = ghostImageData.data[cursor+1],
			b = ghostImageData.data[cursor+2],
			a = ghostImageData.data[cursor+3],
			id = unpackID(r, g, b);

		if( id && ( a == 255 || a == 0)){
			trigger = elementLookupTable[id-1];

			if(type == 'mouseover' && trigger.__mouseover__){
				return null;
			}
			MouseEvent.throw(type, trigger, props);
		}
		for(var i = 0; i < elementLookupTable.length; i++){
			var elem = elementLookupTable[i];

			if(elem.__mouseover__ && elem != trigger){
				MouseEvent.throw('mouseout', elem, props);
				elem.__mouseover__ = false;
			}
		}
		return trigger;
	}
	
	function initContext(dom){
		if(typeof(dom) == "string"){
			dom = document.getElementById(dom);
		}
		container = dom;
		// dom.addEventListener('click', clickHandler);
		// dom.addEventListener('mousedown', mouseDownHandler);
		// dom.addEventListener('mouseup', mouseUpHandler);
		// dom.addEventListener('mousemove', mouseMoveHandler);
		// dom.addEventListener('mouseout', mouseOutHandler);
		
		clientWidth = dom.width;
		clientHeight = dom.height;
		
		context = dom.getContext('2d');

		//ghost canvas for hit test
		ghostCanvas = document.createElement('canvas');
		ghostCanvas.width = clientWidth;
		ghostCanvas.height = clientHeight;
		ghostCanvasContext = ghostCanvas.getContext('2d');

	}

	function resize(width, height){
		container.width = width;
		container.height = height;

		ghostCanvas.width = width;
		ghostCanvas.height = height;

		clientWidth = width;
		clientHeight = height;
	}
	
	initContext(dom);
	
	return {
		
		'add' : add,
		
		'remove' : remove,
		
		'render' : render,
		
		'initContext' : initContext,

		'resize' : resize,

		'getContext' : function(){return context;},
		
		'getClientWidth' : function(){return clientWidth},
		
		'getClientHeight' : function(){return clientHeight},
		
		'getContainer' : function(){return container},

		'getGhostCanvas' : function(){return ghostCanvas},

		'getGhostContext' : function(){return ghostCanvasContext}
	}
}

/**********************
 * Util methods of GooJS
 *********************/
GooJS.Util = {}

var genGUID = (function(){
	var guid = 0;
	
	return function(){
		return ++guid;
	}
})()

function each(arr, callback, context){
	if( ! arr){
		return;
	}
	if( Array.prototype.forEach ){
		Array.prototype.forEach.call( arr, callback, context );
	}else{
		for( var i = 0; i < arr.length; i++){
			callback.call( context, arr[i], i);
		}
	}
}

function extend(obj){
	each(Array.prototype.slice.call(arguments, 1), function(source, idx){
		if( source ){	
			for (var prop in source) {
				obj[prop] = source[prop];
			}
		}
    });
    return obj;
}

function trim(str){
	return (str || '').replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, '');
}


function derive(makeDefaultOpt, initialize/*optional*/, proto/*optional*/){

	if( typeof initialize == "object"){
		proto = initialize;
		initialize = null;
	}

	// extend default prototype method
	var extendedProto = {
		// instanceof operator cannot work well,
		// so we write a method to simulate it
		'instanceof' : function(constructor){
			var selfConstructor = sub;
			while(selfConstructor){
				if( selfConstructor === constructor ){
					return true;
				}
				selfConstructor = selfConstructor.__super__;
			}
		}
	}

	var _super = this;

	var sub = function(options){

		// call super constructor
		_super.call( this );

		// call makeDefaultOpt each time
		// if it is a function, So we can make sure each 
		// property in the object is fresh
		extend( this, typeof makeDefaultOpt == "function" ?
						makeDefaultOpt.call(this) : makeDefaultOpt );

		for( var name in options ){
			if( typeof this[name] == "undefined" ){
				console.warn( name+" is not an option");
			}
		}
		extend( this, options );

		if( this.constructor == sub){
			// find the base class, and the initialize function will be called 
			// in the order of inherit
			var base = sub,
				initializeChain = [initialize];
			while(base.__super__){
				base = base.__super__;
				initializeChain.unshift( base.__initialize__ );
			}
			for(var i = 0; i < initializeChain.length; i++){
				if( initializeChain[i] ){
					initializeChain[i].call( this );
				}
			}
		}
	};
	// save super constructor
	sub.__super__ = _super;
	// initialize function will be called after all the super constructor is called
	sub.__initialize__ = initialize;

	// extend prototype function
	extend( sub.prototype, _super.prototype, extendedProto, proto);

	sub.prototype.constructor = sub;
	
	// extend the derive method as a static method;
	sub.derive = _super.derive;


	return sub;
}
/***********************
 * Mouse Event
 * @prop 	cancelBubble
 * @prop 	target
 * @prop 	sourceTarget
 * @prop 	x
 * @prop 	y
 * @prop 	pageX
 * @prop 	pageY
 ***********************/
function MouseEvent(props){

	this.cancelBubble = false;

	extend(this, props);
}

MouseEvent.prototype.stopPropagation = function(){
	
	this.cancelBubble = true;
}

MouseEvent.throw = function(eventType, target, props){

	var e = new MouseEvent(props);
	e.sourceTarget = target;

	// enable bubble
	while(target && !e.cancelBubble ){
		e.target = target;
		target.trigger(eventType, e);

		target = target.parent;
	}
}
/***************************************
 * Event interface
 * + on(eventName, handler)
 * + trigger(eventName[, arg1[, arg2]])
 * + off(eventName[, handler])
 **************************************/
var Event = {
	
	trigger : function(){
		if( ! this.__handlers__){
			return;
		}
		var name = arguments[0];
		var params = Array.prototype.slice.call( arguments, 1 );

		var handlers = this.__handlers__[ name ];
		if( handlers ){
			for( var i = 0; i < handlers.length; i+=2){
				var handler = handlers[i],
					context = handlers[i+1];
				handler.apply(context || this, params);
			}
		}
	},

	on : function( target, handler, context ){

		if( ! target){
			return;
		}
		var handlers = this.__handlers__ || ( this.__handlers__={} );
		if( ! handlers[target] ){
			handlers[target] = [];
		}
		if( handlers[target].indexOf(handler) == -1){
			// struct in list
			// [handler,context,handler,context,handler,context..]
			handlers[target].push( handler );
			handlers[target].push( context );
		}
	},

	off : function( target, handler ){
		
		var handlers = this.__handlers__;

		if( handlers[target] ){
			if( handler ){
				var arr = handlers[target];
				// remove handler and context
				arr.splice( arr.indexOf(handler), 2 )
			}else{
				handlers[target] = [];
			}
		}
	}
}
GooJS.Event = Event;

/******************************************
 * Math Library of GooJS 
 *****************************************/
_Math = {};
GooJS.Math = _Math;

_Math.max = function(array){
	var max = 0;
	for(var i =0; i < array.length; i++){
		if(array[i] > max){
			max = array[i];
		}
	}
	return max;
}
_Math.min = function(array){
	var min = 9999999999;
	for(var i = 0; i < array.length; i++){
		if(array[i] < min){
			min = array[i];
		}
	}
	return min;
}

_Math.computeAABB = function(points){
	var left = points[0][0],
		right = points[0][0],
		top = points[0][1],
		bottom = points[0][1];
	
	for(var i = 1; i < points.length; i++){
		left = points[i][0] < left ? points[i][0] : left;
		right = points[i][0] > right ? points[i][0] : right;
		top = points[i][1] < top ? points[i][1] : top;
		bottom = points[i][1] > bottom ? points[i][1] : bottom;
	}
	return [[left, top], [right, bottom]];
}

_Math.intersectAABB = function(point, AABB){
	var x = point[0],
		y = point[1];
	return  (AABB[0][0] < x && x < AABB[1][0]) && (AABB[0][1] < y && y< AABB[1][1]);
}
var _offset = [0.5, 0.5];
_Math.fixPos = function(pos){
	return _Math.Vector.add(pos, _offset);
}
_Math.fixPosArray = function(poslist){
	var ret = [],
		len = poslist.length;
	for(var i = 0; i < len; i++){
		ret.push( _Math.Vector.add(poslist[i], _offset) );
	}
	return ret;
}

_Math.unfixAA = function(pos){
	return _Math.Vector.sub(pos, [0.5, 0.5]);
}

_Math.Vector = {};

_Math.Vector.add = function(v1, v2){
	
	return [v1[0]+v2[0], v1[1]+v2[1]];
}

_Math.Vector.sub = function(v1, v2){
	
	return [v1[0]-v2[0], v1[1]-v2[1]];
}

_Math.Vector.abs = function(v){
	
	return Math.sqrt(v[0]*v[0]+v[1]*v[1]);
}

_Math.Vector.mul = function(p1, p2){
	return [p1[0]*p2[0], p1[1]*p2[1]];
}

_Math.Vector.scale = function(v, s){
	return [v[0]*s, v[1]*s];
}

_Math.Vector.expand = function(v){
	return [v[0], v[0], 1];
}
/**
 * dot 
 */
_Math.Vector.dot = function(p1, p2){
	return p1[0]*p2[0]+p1[1]*p2[1];
}
/**
 * normalize
 */
_Math.Vector.normalize = function(v){
	var d = _Math.Vector.length(v),
		r = [];
	r[0] = v[0]/d;
	r[1] = v[1]/d;
	return r
}
/**
 * 距离
 */
_Math.Vector.distance = function(v1, v2){
	return this.length(this.sub(v1, v2));
}

_Math.Vector.middle = function(v1, v2){
	return [(v1[0]+v2[0])/2,
			(v1[1]+v2[1])/2];
}


_Math.Matrix = {};

_Math.Matrix.identity = function(){
	return [1, 0, 
			0, 1, 
			0, 0];
}
/**
 * Multiplication of 3x2 matrix
 *	a	c	e
 *	b	d	f
 *	0	0	1
 */
_Math.Matrix.mul = function(m1, m2){
	return [
      m1[0] * m2[0] + m1[2] * m2[1],
      m1[1] * m2[0] + m1[3] * m2[1],
      m1[0] * m2[2] + m1[2] * m2[3],
      m1[1] * m2[2] + m1[3] * m2[3],
      m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
      m1[1] * m2[4] + m1[3] * m2[5] + m1[5]
   ];
}

_Math.Matrix.translate = function(m, v){
	return this.mul([1, 0, 0, 1, v[0], v[1]], m);
}

_Math.Matrix.rotate = function(m, angle){
	var sin = Math.sin(angle),
		cos = Math.cos(angle);
	return this.mul([cos, sin, -sin, cos, 0, 0], m);
}

_Math.Matrix.scale = function(m, v){
	return this.mul([v[0], 0, 0, v[1], 0, 0], m);
}

/**
 * Inverse of 3x3 matrix, from tdl
 * http://code.google.com/p/webglsamples/source/browse/tdl/math.js
 */
_Math.Matrix.inverse = function(m){
	var t00 = m[1*3+1] * m[2*3+2] - m[1*3+2] * m[2*3+1],
		t10 = m[0*3+1] * m[2*3+2] - m[0*3+2] * m[2*3+1],
		t20 = m[0*3+1] * m[1*3+2] - m[0*3+2] * m[1*3+1],
		d = 1.0 / (m[0*3+0] * t00 - m[1*3+0] * t10 + m[2*3+0] * t20);
	return [ d * t00, -d * t10, d * t20,
			-d * (m[1*3+0] * m[2*3+2] - m[1*3+2] * m[2*3+0]),
			d * (m[0*3+0] * m[2*3+2] - m[0*3+2] * m[2*3+0]),
			-d * (m[0*3+0] * m[1*3+2] - m[0*3+2] * m[1*3+0]),
			d * (m[1*3+0] * m[2*3+1] - m[1*3+1] * m[2*3+0]),
			-d * (m[0*3+0] * m[2*3+1] - m[0*3+1] * m[2*3+0]),
			d * (m[0*3+0] * m[1*3+1] - m[0*3+1] * m[1*3+0])];
}
/**
 * Expand a 3x2 matrix to 3x3
 *	a	c	e
 *	b	d	f
 *	0	0	1
 * http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#transformations
 */
_Math.Matrix.expand = function(m){
	return [
		m[0], m[1], 0, 
		m[2], m[3], 0, 
		m[4], m[5], 1
	]
}
/**
 * 矩阵左乘
 */
_Math.Matrix.mulVector = function(m, v){
	var r = [];
	for(var i =0; i < 3; i++){
		r[i] = v[0]*m[i]+v[1]*m[i+3]+v[2]*m[i+6];
	}
	return r;
}
/*************************************
 * Base Element
 ************************************/
GooJS.Element = function(){
	
	//a flag to judge if mouse is over the element
	this.__mouseover__ = false;
	
	this.id = 0;
	// auto generated guid
	this.__GUID__ = genGUID();
	
	//Axis Aligned Bounding Box
	this.AABB = [[0, 0], [0, 0]];
	// z index
	this.z = 0;
	// GooJS.Style
	this.style = null;
	
	this._position = [0, 0],
	this._rotation = 0,
	this._scale = [1, 1];

	this._transform = null;
	// inverse matrix of transform matrix
	this._transformInverse = null;
	// data stored by user
	this._data = {};
	// visible flag
	this.visible = true;

	this.children = {};
	// virtual width of the stroke line for intersect
	this.intersectLineWidth = 0;
}

GooJS.Element.prototype = {
	
	// flag of fill when drawing the element
	fill : true,
	// flag of stroke when drawing the element
	stroke : true,
	// Clip flag
	// If it is true, this element can be used as a mask
	// and all the children will be clipped in its shape
	//
	// TODO: add an other mask flag to distinguish with the clip?
	clip : false,
	// fix aa problem
	// https://developer.mozilla.org/en-US/docs/HTML/Canvas/Tutorial/Applying_styles_and_colors?redirectlocale=en-US&redirectslug=Canvas_tutorial%2FApplying_styles_and_colors#section_8
	fixAA : true,

	// intersect with the bounding box
	intersectAABB : function(x, y){
		return _Math.intersectAABB([x,y], this.AABB);
	},
	// set position on the xy plane
	position : function(x, y){
		this._position = [x, y];
		this.updateTransform();
		// this.updateTransformInverse();
	},
	// set rotation on the xy plane
	rotation : function(angle){
		this._rotation = angle;
		this.updateTransform();
		// this.updateTransformInverse();
	},
	// do scale on the xy plane
	scale : function(v){
		if(typeof v == 'number'){
			v = [v, v];
		}
		this._scale = v;
		this.updateTransform();
		// this.updateTransformInverse();
	},
	updateTransform : function(){
		var M = _Math.Matrix;
		var _transform = M.identity();
		if( this._scale)
			_transform = M.scale(_transform, this._scale);
		if( this._rotation)
			_transform = M.rotate(_transform, this._rotation);
		if( this._position)
			_transform = M.translate(_transform, this._position);
		this._transform = _transform;
		return _transform;
	},

	updateTransformInverse : function(){
		this._transformInverse = _Math.Matrix.inverse(
									_Math.Matrix.expand(this._transform));
	},

	getTransformInverse : function(){
		return this._transformInverse;	
	},

	getTransform : function(){
		if( ! this._transform){
			this.updateTransform();
		}
		return this._transform;
	},

	setTransform : function(m){
		this._transform = m;
		// this.updateTransformInverse();
	},

	pushMatrix : function(m){
		this._transform = _Math.Matrix.mul(m, this._transform);
	},

	popMatrix : function(){
		var t = this._transform;
		this._transform = _Math.Matrix.identity();
		return t;
	},

	getTransformedAABB : function(){
		var point = [],
			M = _Math.Matrix,
			V = _Math.Vector;
		point[0] = M.mulVector(this._transform, V.expand(this.AABB[0]));
		point[1] = M.mulVector(this._transform, V.expand(this.AABB[1]));
		point[2] = M.mulVector(this._transform, [this.AABB[0][0], this.AABB[1][1], 1]);
		point[3] = M.mulVector(this._transform, [this.AABB[1][0], this.AABB[0][1], 1]);
		return _Math.computeAABB(point);
	},

	intersect : function(x, y, ghost){},
	
	draw : function(context){},
	
	computeAABB : function(){},

	add : function(elem){
		if( elem ){
			this.children[elem.__GUID__] = elem;
			elem.parent = this;
		}
	},

	remove : function(elem){
		delete this.children[elem.__GUID__];
		elem.parent = null;
	},

	data : function(key, value){
		if( typeof value == "undefined" ){
			return this._data[key];
		}else{
			this._data[key] = value;
			return this._data[key];
		}
	}
}

extend( GooJS.Element.prototype, Event );
GooJS.Element.derive = derive;

/***********************************************
 * Style
 * @config 	fillStyle | fill,
 * @config 	strokeStyle | stroke,
 * @config	lineWidth,
 * @config	shadowColor,
 * @config	shadowOffsetX,
 * @config	shadowOffsetY,
 * @config	shadowBlur,
 * @config 	globalAlpha | alpha
 * @config	shadow
 **********************************************/
GooJS.Style = function(opt_options){
	
	extend(this, opt_options);
}

GooJS.Style.__STYLES__ = ['fillStyle', 
						'strokeStyle', 
						'lineWidth', 
						'shadowColor', 
						'shadowOffsetX', 
						'shadowOffsetY',
						'shadowBlur',
						'globalAlpha',
						'font'];

GooJS.Style.__STYLEALIAS__ = {			//extend some simplify style name
						 'fill' : 'fillStyle',
						 'stroke' : 'strokeStyle',
						 'alpha' : 'globalAlpha',
						 'shadow' : ['shadowOffsetX', 
						 			'shadowOffsetY', 
						 			'shadowBlur', 
						 			'shadowColor']
						}
var shadowSyntaxRegex = /(.*?)\s+(.*?)\s+(.*?)\s+(rgb\(.*?\))/
GooJS.Style.prototype.bind = function(ctx){

	var styles = GooJS.Style.__STYLES__,
		styleAlias = GooJS.Style.__STYLEALIAS__;
	for( var alias in styleAlias ){
		if( this.hasOwnProperty(alias) ){
			var name = styleAlias[alias];
			var value = this[alias];
			// composite styles, like shadow, the value can be "0 0 10 #000"
			if( name.constructor == Array ){
				var res = shadowSyntaxRegex.exec(trim(value));
				if( ! res )
					continue;
				value = res.slice(1);
				each( value, function(item, idx){
					if( name[idx] ){
						ctx[ name[idx] ] = item;
					}
				}, this)
			}else{
				ctx[ name ] = value;
			}
		}
	}
	each(styles, function(styleName){
		if( this.hasOwnProperty( styleName ) ){
			ctx[styleName] = this[styleName];
		}	
	}, this)

}

/*************************************************
 * Line Shape
 *************************************************/
GooJS.Line = GooJS.Element.derive(function(){
return {
	start : [0, 0],
	end : [0, 0],
	width : 0	//virtual width of the line for intersect computation 
}}, {
computeAABB : function(){

	this.AABB = _Math.computeAABB([this.start, this.end]);
	
	if(this.AABB[0][0] == this.AABB[1][0]){	//line is vertical
		this.AABB[0][0] -= this.width/2;
		this.AABB[1][0] += this.width/2;
	}
	if(this.AABB[0][1] == this.AABB[1][1]){	//line is horizontal
		this.AABB[0][1] -= this.width/2;
		this.AABB[1][1] += this.width/2;
	}
},
draw : function(ctx){
	
	var start = this.fixAA ? _Math.fixPos(start) : start,
		end = this.fixAA ? _Math.fixPos(end) : end;

	ctx.beginPath();
	ctx.moveTo(start[0], start[1]);
	ctx.lineTo(end[0], end[1]);
	ctx.stroke();

},
intersect : function(x, y){
	
	if(!this.intersectAABB(x, y)){
		return false;
	}
	//计算投影点
	var V = _Math.Vector,
		a = [x, y]
		b = this.start,
		c = this.end,
		ba = [a[0]-b[0], a[1]-b[1]],
		bc = [c[0]-b[0], c[1]-b[1]],
		dd = V.dot(V.normalize(bc), ba),	//ba在bc上的投影长度
		d = V.add(b, V.scale(V.normalize(bc), dd));		//投影点	
		
		var distance = V.length(V.sub(a, d));
		return distance < this.width/2;
}
});

/**********************************************
 * Rectangle Shape
 ***********************************************/
GooJS.Rectangle = GooJS.Element.derive(function(){
return {
	start 	: [0, 0],
	size 	: [0, 0]
}}, {
computeAABB : function(){
	
	this.AABB = _Math.computeAABB([this.start, _Math.Vector.add(this.start, this.size)]);
},
draw : function(ctx){

	var start = this.fixAA ? _Math.fixPos(this.start) : this.start;

	ctx.beginPath();
	ctx.rect(start[0], start[1], this.size[0], this.size[1]);
	if(this.stroke){
		ctx.stroke();
	}
	if(this.fill){
		ctx.fill();
	}
},
intersect : function(x, y){
	
	return this.intersectAABB(x, y);
}
});
/**************************************************
 * Rounded Rectangle Shape
 **************************************************/
GooJS.RoundedRectangle = GooJS.Element.derive(function(){
return {
	start 	: [0, 0],
	size	: [0, 0],
	radius 	: 0
}}, {
computeAABB : function(){
	this.AABB = _Math.computeAABB([this.start, _Math.Vector.add(this.start, this.size)])
},
draw : function(ctx){

	if( this.radius.constructor == Number){
		// topleft, topright, bottomright, bottomleft
		var radius = [this.radius, this.radius, this.radius, this.radius];
	}else if( this.radius.length == 2){
		var radius = [this.radius[0], this.radius[1], this.radius[0], this.radius[1]];
	}else{
		var radius = this.radius;
	}

	var V = _Math.Vector,
		start = this.fixAA ? _Math.fixPos(this.start) : this.start,
		size = this.size;
	var v1 = V.add(start, [radius[0], 0]),	//left top
		v2 = V.add(start, [size[0], 0]),//right top
		v3 = V.add(start, size),		//right bottom
		v4 = V.add(start, [0, size[1]]);//left bottom
	ctx.beginPath();
	ctx.moveTo( v1[0], v1[1] );
	radius[1] ? 
		ctx.arcTo( v2[0], v2[1], v3[0], v3[1], radius[1]) :
		ctx.lineTo( v2[0], v2[1] );
	radius[2] ?
		ctx.arcTo( v3[0], v3[1], v4[0], v4[1], radius[2]) :
		ctx.lineTo( v3[0], v3[1] );
	radius[3] ?
		ctx.arcTo( v4[0], v4[1], start[0], start[1], radius[3]) :
		ctx.lineTo( v4[0], v4[1] );
	radius[0] ? 
		ctx.arcTo( start[0], start[1], v2[0], v2[1], radius[0]) :
		ctx.lineTo( start[0], start[1]);
	
	if( this.stroke ){
		ctx.stroke();
	}
	if( this.fill ){
		ctx.fill();
	}
},
intersect : function(x, y){
	// TODO
	return false;
}
})

/**************************************************
 * circle
 **************************************************/
GooJS.Circle = GooJS.Element.derive(function(){
return {
	'center' : [0, 0],
	'radius' : 0
}}, {
computeAABB : function(){
	
	this.AABB = [[this.center[0]-this.radius, this.center[1]-this.radius],
				 [this.center[0]+this.radius, this.center[1]+this.radius]]
},
draw : function(ctx){

	var center = this.fixAA ? _Math.fixPos( this.center ) : this.center;

	ctx.beginPath();
	ctx.arc(center[0], center[1], this.radius, 0, 2*Math.PI, false);
	if(this.stroke){
		ctx.stroke();
	}
	if(this.fill){
		ctx.fill();
	}
},
intersect : function(x, y){

	return _Math.Vector.length([this.center[0]-x, this.center[1]-y]) < this.radius;
}
})

/**************************************************
 * Arc shape
 **************************************************/
GooJS.Arc = GooJS.Element.derive(function(){
return {
	center 		: [0, 0],
	radius 		: 0,
	startAngle 	: 0,
	endAngle 	: Math.PI*2,
	clockwise 	: true
}}, {
computeAABB : function(){
	// TODO
	this.AABB = [[0, 0], [0, 0]];
},
draw : function(ctx){

	var center = this.fixAA ? _Math.fixPos( this.center ) : this.center;

	ctx.beginPath();
	ctx.arc(center[0], center[1], this.radius, this.startAngle, this.endAngle,  ! this.clockwise);
	if(this.stroke){
		ctx.stroke();
	}
	if(this.fill){
		ctx.fill();
	}

},
intersect : function(x, y){
	// TODO
	return false;
}
});
/*********************************************
 * Polygon Shape
 ********************************************/
GooJS.Polygon = GooJS.Element.derive(function(){
return {
	'points' : []
}}, {
computeAABB : function(){
	
	this.AABB = _Math.computeAABB(this.points);
},
draw : function(ctx){

	var points = this.fixAA ? _Math.fixPosArray(this.points) : this.points;

	ctx.beginPath();
	
	ctx.moveTo(points[0][0], points[0][1]);
	for(var i =1; i < points.length; i++){
		ctx.lineTo(points[i][0], points[i][1]);
	}
	ctx.closePath();
	if(this.stroke){
		ctx.stroke();
	}
	if(this.fill){
		ctx.fill();
	}
},
intersect : function(x, y){
	
	if(!this.intersectAABB(x, y)){
		return false;
	}

	var len = this.points.length,
		angle = 0,
		V = _Math.Vector,
		points = this.points;
	for(var i =0; i < len; i++){
		var vec1 = V.normalize([points[i][0]-x, points[i][1]-y]),
			j = (i+1)%len,
			vec2 =  V.normalize([points[j][0]-x, points[j][1]-y]),
			foo = Math.acos(V.dot(vec1, vec2));
			
			angle += foo;
	}
	return Math.length(angle - 2*Math.PI) < 0.1;
}
});

/*********************************************
 * Sector Shape
 ********************************************/
GooJS.Sector = GooJS.Element.derive(function(){
return {
	center 		: [0, 0],
	innerRadius : 0,
	outerRadius : 0,
	startAngle 	: 0,
	endAngle 	: 0,
	clockwise 	: true
}},{
computeAABB : function(){

	this.AABB = [0, 0];
},
intersect : function(x, y){

	var V = _Math.Vector,
		startAngle = this.startAngle,
		endAngle = this.endAngle,
		r1 = this.innerRadius,
		r2 = this.outerRadius,
		c = this.center,
		v = V.sub([x, y], c),
		r = V.length(v),
		pi2 = Math.PI * 2;

	if(r < r1 || r > r2){
		return false;
	}
	var angle = Math.atan2(v[1], v[0]);

	//need to constraint the angle between 0 - 360

	if(angle < 0){
		angle = angle+pi2;
	}
	
	if(this.clockwise){
		
		return angle < endAngle && angle > startAngle;
	}else{
		startAngle =  pi2 - startAngle;
		endAngle = pi2 - endAngle;
		return angle > endAngle && angle < startAngle;
	}

},
draw : function(ctx){

	var V = _Math.Vector;
		startAngle = this.startAngle,
		endAngle = this.endAngle,
		r1 = this.innerRadius,
		r2 = this.outerRadius,
		c = this.fixAA ? _Math.fixPos( this.center ) : this.center;

	if( ! this.clockwise ){
		startAngle =  Math.PI*2 - startAngle;
		endAngle =  Math.PI*2 - endAngle;
	}

	var	startInner = V.add(c, [r1 * Math.cos(startAngle), r1 * Math.sin(startAngle)]),
		startOuter = V.add(c, [r2 * Math.cos(startAngle), r2 * Math.sin(startAngle)]),
		endInner = V.add(c, [r1 * Math.cos(endAngle), r1 * Math.sin(endAngle)]),
		endOuter = V.add(c, [r2 * Math.cos(endAngle), r2 * Math.sin(endAngle)]);

	ctx.beginPath();
	ctx.moveTo(startInner[0], startInner[1]);
	ctx.lineTo(startOuter[0], startOuter[1]);
	ctx.arc(c[0], c[1], r2, startAngle, endAngle, ! this.clockwise);
	ctx.lineTo(endInner[0], endInner[1]);
	ctx.arc(c[0], c[1], r1, endAngle, startAngle, this.clockwise);

	if(this.stroke){
		ctx.stroke();
	}
	if(this.fill){
		ctx.fill();
	}

}
});

/*********************************************
 * Path Shape
 *********************************************/
GooJS.Path = GooJS.Element.derive(function(){
return {
	segments 	: [],
	globalStyle : true
}}, {
computeAABB : function(){
	this.AABB = [[0, 0], [0, 0]];
},
draw : function(ctx){
	
	if(this.globalStyle){
		this.drawWithSameStyle(ctx);
	}else{
		this.drawWithDifferentStyle(ctx);
	}
},
drawWithSameStyle : function(ctx){
	
	var l = this.segments.length,
		segs = this.segments;

	ctx.beginPath();
	ctx.moveTo(segs[0].point[0], segs[0].point[1]);
	for(var i =1; i < l; i++){

		if(segs[i-1].handleOut || segs[i].handleIn){
			var prevHandleOut = segs[i-1].handleOut || segs[i-1].point,
				handleIn = segs[i].handleIn || segs[i].point;
			ctx.bezierCurveTo(prevHandleOut[0], prevHandleOut[1],
					handleIn[0], handleIn[1], segs[i].point[0], segs[i].point[1]);
		}
		else{
			ctx.lineTo(segs[i].point[0], segs[i].point[1]);
		}

	}
	if(this.fill){
		ctx.fill();
	}
	if(this.stroke){
		ctx.stroke();
	}	
},
drawWithDifferentStyle : function(ctx){
	
	var l = this.segments.length,
		segs = this.segments;

	for(var i =0; i < l-1; i++){

		ctx.save();
		segs[i].style && segs[i].style.bind(ctx);

		ctx.beginPath();
		ctx.moveTo(segs[i].point[0], segs[i].point[1]);

		if(segs[i].handleOut || segs[i+1].handleIn){
			var handleOut = segs[i].handleOut || segs[i].point,
				nextHandleIn = segs[i+1].handleIn || segs[i+1].point;
			ctx.bezierCurveTo(handleOut[0], handleOut[1],
					nextHandleIn[0], nextHandleIn[1], segs[i+1].point[0], segs[i+1].point[1]);
		}
		else{
			ctx.lineTo(segs[i+1].point[0], segs[i+1].point[1]);
		}

		if(this.stroke){
			ctx.stroke();
		}
		if(this.fill){
			ctx.fill();
		}
		ctx.restore();
	}
},
smooth : function(degree){
	var Vector = _Math.Vector,
		len = this.segments.length,
		middlePoints = [],
		segs = this.segments;

	function computeVector(a, b, c){
		var m = Vector.middle(b, c);
		return Vector.sub(a, m);
	}

	for(var i = 0; i < len; i++){
		var point = segs[i].point,
			nextPoint = (i == len-1) ? segs[0].point : segs[i+1].point;
		middlePoints.push(
				Vector.middle(point, nextPoint));
	}

	for(var i = 0; i < len; i++){
		var point = segs[i].point,
			middlePoint = middlePoints[i],
			prevMiddlePoint = (i == 0) ? middlePoints[len-1] : middlePoints[i-1],
			degree = segs[i].smoothLevel || degree || 1;
		var middleMiddlePoint = Vector.middle(middlePoint, prevMiddlePoint);
			v1 = Vector.sub(middlePoint, middleMiddlePoint),
			v2 = Vector.sub(prevMiddlePoint, middleMiddlePoint);

		var dv = computeVector(point, prevMiddlePoint, middlePoint);
		//use degree to scale the handle length
		segs[i].handleIn = Vector.add(Vector.add(middleMiddlePoint, Vector.scale(v2, degree)), dv);
		segs[i].handleOut = Vector.add(Vector.add(middleMiddlePoint, Vector.scale(v1, degree)), dv);
	}
	segs[0].handleOut = segs[0].handleIn = null;
	segs[len-1].handleIn = segs[len-1].handleOut = null;
	
},
pushPoints : function(points){
	for(var i = 0; i < points.length; i++){
		this.segments.push({
			point : points[i],
			handleIn : null,
			handleOut : null
		})
	}
}
});
/**
 * Image
 */
GooJS.Image = GooJS.Element.derive(function(){
return {
	img 	: '',
	start 	: [0, 0],
	size 	: 0,
	onload 	: function(){}
}}, function(){
	if(typeof this.img == 'string'){
		var self = this;
		GooJS.Image.load( this.img, function(img){
			self.img = img;
			self.onload.call( self );
		})
	}
}, {
computeAABB : function(){

	this.AABB = _Math.computeAABB([this.start, [this.start[0]+this.size[0], this.start[1]+this.size[1]]]);
},
draw : function(ctx){

	var start = this.fixAA ? _Math.fixPos(this.start) : this.start;

	if(typeof this.img != 'string'){
		this.size ? 
			ctx.drawImage(this.img, start[0], start[1], this.size[0], this.size[1]) :
			ctx.drawImage(this.img, start[0], start[1]);
	}

},
intersect : function(x, y){

	return this.intersectAABB(x, y);
}
});

_imageCache = {};

GooJS.Image.load = function( src, callback ){

	if( _imageCache[src] ){
		var img = _imageCache[src];
		if( img.constructor == Array ){
			img.push( callback );
		}else{
			callback(img);
		}
	}else{
		_imageCache[src] = [callback];
		var img = new Image();
		img.onload = function(){
			each( _imageCache[src], function(cb){
				cb( img );
			})
			_imageCache[src] = img;
		}
		img.src = src;
	}
}

/************************************************
 * Text
 ***********************************************/
GooJS.Text = GooJS.Element.derive(function(){

return {
	text 			: '',
	start 			: [0, 0],
	size 			: [0, 0],
	font 			: '',
	textAlign 		: '',
	textBaseline 	: ''
}}, {
computeAABB : function(){

	this.AABB = _Math.computeAABB([this.start, [this.start[0]+this.size[0], this.start[1]+this.size[1]]]);
},
draw : function(ctx){
	var start = this.fixAA ? _Math.fixPos(this.start) : this.start;
	if(this.font){
		ctx.font = this.font;
	}
	if(this.textAlign){
		ctx.textAlign = this.textAlign;
	}
	if(this.textBaseline){
		ctx.textBaseline = this.textBaseline
	}
	if(this.fill){
		this.size.length && this.size[0] ?
			ctx.fillText(this.text, start[0], start[1], this.size[0]) :
			ctx.fillText(this.text, start[0], start[1]);
	}
	if(this.stroke){
		this.size.length && this.size[0] ?
			ctx.strokeText(this.text, start[0], start[1], this.size[0]) :
			ctx.strokeText(this.text, start[0], start[1]);
	}
},
resize : function(ctx){

	if(! this.size[0] || this.needResize){
		this.size[0] = ctx.measureText(this.text).width;
		this.size[1] = ctx.measureText('m').width;
	}
},
intersect : function(x, y){

	return this.intersectAABB(x, y);
}
});
/***********************************
 * Text Box
 * Support word wrap and word break
 * Drawing is based on the GooJS.Text
 * TODO: support word wrap of non-english text
 * 		shift first line by (lineHeight-fontSize)/2
 ***********************************/
GooJS.TextBox = GooJS.Element.derive(function(){
return {
	text 			: '',
	textAlign 		: '',
	textBaseline 	: 'top',
	font			: '',

	start 			: [0, 0],
	width 			: 0,
	wordWrap		: false,
	wordBreak		: false,
	lineHeight 		: 0,
	stroke 			: false,
	// private prop, save GooJS.Text instances
	_texts 			: []
}}, function(){
	// to verify if the text is changed
	this._oldText = "";
}, {
computeAABB : function(){
},
draw : function(ctx){
	if( this.text != this._oldText){
		this._oldText = this.text;

		//set font for measureText
		if( this.font ){
			ctx.font = this.font;
		}
		if( this.wordBreak){
			this._texts = this.computeWordBreak( ctx );
		}
		else if(this.wordWrap){
			this._texts = this.computeWordWrap( ctx );
		}
		else{
			var txt = new GooJS.Text({
				text : this.text,
				textBaseline : this.textBaseline
			})
			this.extendCommonProperties(txt);
			this._texts = [txt]
		}
	}
	each(this._texts, function(_text){
		_text.draw(ctx);
	})
},
computeWordWrap : function( ctx ){
	if( ! this.text){
		return;
	}
	var words = this.text.split(' '),
		len = words.length,
		lineWidth = 0,
		wordWidth,
		wordText,
		texts = [],
		txt;

	for( var i = 0; i < len; i++){
		wordText = i == len-1 ? words[i] : words[i]+' ';
		wordWidth = ctx.measureText( wordText ).width;
		if( lineWidth + wordWidth > this.width ||
			! txt ){	//first line
			// create a new text line and put current word
			// in the head of new line
			txt = new GooJS.Text({
				text : wordText, //append last word
				start : _Math.Vector.add(this.start, [0, this.lineHeight*texts.length])
			})
			this.extendCommonProperties(txt);
			texts.push( txt );

			lineWidth = wordWidth;
		}else{
			lineWidth += wordWidth;
			txt.text += wordText;
		}
	}
	return texts;
},
computeWordBreak : function( ctx ){
	if( ! this.text){
		return;
	}
	var len = this.text.length,
		letterWidth,
		letter,
		lineWidth = ctx.measureText(this.text[0]).width,
		texts = [],
		txt;
	for(var i = 0; i < len; i++){
		letter = this.text[i];
		letterWidth = ctx.measureText( letter ).width;
		if( lineWidth + letterWidth > this.width || 
			! txt ){	//first line
			var txt = new GooJS.Text({
				text : letter,
				start : _Math.Vector.add(this.start, [0, this.lineHeight*texts.length])
			});
			this.extendCommonProperties(txt);
			texts.push(txt);
			// clear prev line states
			lineWidth = letterWidth;
		}else{
			lineWidth += letterWidth;
			txt.text += letter;
		}
	}
	return texts;
},
extendCommonProperties : function(txt){
	var props = {};
	extend(txt, {
		textAlign : this.textAlign,
		textBaseline : this.textBaseline,
		style : this.style,
		font : this.font,
		fill : this.fill,
		stroke : this.stroke
	})
},
intersect : function(x, y){

}
})

});// end of factory function
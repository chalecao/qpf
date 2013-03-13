//============================
// view model for color
// supply hsv and rgb color space
// http://en.wikipedia.org/wiki/HSV_color_space.
//============================
define(function(require){

var	ko = require("knockout"),
	Clazz = require("core/clazz");


function rgbToHsv(r, g, b){
    r = r/255, g = g/255, b = b/255;

    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if(max == min){
        h = 0; // achromatic
    }else{
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h*360, s*100, v*100];
}

function hsvToRgb(h, s, v){

	h = h/360;
	s = s/100;
	v = v/100;

    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}


function intToRgb(value){
	var r = (value >> 16) & 0xff,
		g = (value >> 8) & 0xff,
		b = value & 0xff;
	return [r, g, b];
}

function rgbToInt(rgb){
	var r = rgb[0],
		g = rgb[1],
		b = rgb[2];
	return r << 16 | g << 8 | b;
}

function intToHsv(value){
	var rgb = intToRgb(value);
	return rgbToHsv(rgb[0], rgb[1], rgb[2]);
}

function hsvToInt(h, s, v){
	return rgbToInt(hsvToRgb(h, s, v));
}

function makeComputed(space, idx, read, write){
	return ko.computed({
		read : function(){
			var ret = space()[idx];
			// read pre process
			return read ? read( ret ) : ret;
		},
		write : function(value){
			// write pre process
			value = write ? write(value) : value;
			var s = space();
			s[idx] = value;
			space(s);
		}
	})
}
// color view model
var Color = Clazz.derive({
	hex : ko.observable(0xffffff),
	alpha : ko.observable(1).extend({numeric:2, clamp:{min:0, max:1}})
}, function(){

	//-------------rgb color space
	this.rgb = ko.computed({
		read : function(){
			return intToRgb(parseInt(this.hex()));
		},
		// value is rgb array
		write : function(value){
			this.hex( rgbToInt(value) );
		}
	}, this);

	this.r = makeComputed(this.rgb, 0).extend({numeric:0});
	this.g = makeComputed(this.rgb, 1).extend({numeric:0});
	this.b = makeComputed(this.rgb, 2).extend({numeric:0});

	//---------------hsv color space
	this.hsv = ko.computed({
		read : function(){
			return intToHsv(parseInt(this.hex()));
		},
		// value is hsv array
		write : function(value){
			this.hex( hsvToInt(value[0], value[1], value[2]) );
		}
	}, this);
	this.h = makeComputed(this.hsv, 0).extend({clamp:{min:0,max:360}});
	this.s = makeComputed(this.hsv, 1).extend({clamp:{min:0,max:100}});
	this.v = makeComputed(this.hsv, 2).extend({clamp:{min:0,max:100}});

	//---------------string of hex
	this.hexString = ko.computed({
		read : function(){
			var string = this.hex().toString(16),
				fill = []
			for(var i = 0; i < 6-string.length; i++){
				fill.push('0');
			}
			return fill.join("")+string;
		},
		write : function(str){
			this.hex( parseInt(str, 16) );
		}
	}, this);

	//-----------------rgb color of hue when value and saturation is 100%
	this.hueRGB = ko.computed(function(){
		return "rgb(" + hsvToRgb(this.h(), 100, 100).join(",") + ")";
	}, this)

	//---------------items data for vector(rgb and hsv)
	var vector = ['r', 'g', 'b'];
	this.rgbVector = [];
	for(var i = 0; i < 3; i++){
		this.rgbVector.push({
			type : "spinner",
			min : 0,
			max : 255,
			step : 1,
			precision : 0,
			value : this[vector[i]]
		})
	}
	var vector = ['h', 's', 'v'];
	this.hsvVector = [];
	for(var i = 0; i < 3; i++){
		this.hsvVector.push({
			type : "spinner",
			min : 0,
			max : 100,
			step : 1,
			precision : 0,
			value : this[vector[i]]
		})
	}
	// modify the hue
	this.hsvVector[0].max = 360;
});

return Color;
})
define(function(require) {

    'use strict';

    var Clazz = require('../core/Clazz');
    var Draggable = require('./Draggable');
    var ko = require("knockout");
    var _ = require("_");
    var $ = require("$");

    var Resizable = Clazz.derive(function() {
        return {
            
            container : null,

            $container : null,
            
            maxWidth : Infinity,
            
            minWidth : 0,
            
            maxHeight : Infinity,
            
            minHeight : 0,

            handles : 'r,b,rb',

            handleSize : 10,

            _x0 : 0,
            _y0 : 0,

            _isContainerAbsolute : false
        }
    }, {

        enable : function() {
            this.$container = $(this.container);
            this._addHandlers();

            if (!this._isContainerAbsolute) {
                this.$container.css('position', 'relative');
            }
        },

        disable : function() {
            this.$container.children('.qpf-resizable-handler').remove();
        },

        _addHandlers : function() {
            var handles = this.handles.split(/\s*,\s*/);
            _.each(handles, function(handle) {
                switch(handle) {
                    case 'r':
                        this._addRightHandler();
                        break;
                    case 'b':
                        this._addBottomHandler();
                        break;
                    case 'l':
                        this._addLeftHandler();
                        break;
                    case 't':
                        this._addTopHandler();
                        break;
                    case 'rb':

                        break;
                }
            }, this);
        },

        _addRightHandler : function() {
            var $handler = this._createHandler('right');
            $handler.css({
                right: '0px',
                top: '0px',
                bottom: '0px',
                width: this.handleSize + 'px'
            });
            var draggable = new Draggable();
            draggable.updateDomPosition = false;
            draggable.add($handler);
            draggable.on('dragstart', this._onResizeStart, this);
            draggable.on('drag', this._onRightResize, this);
        },

        _addTopHandler : function() {
            var $handler = this._createHandler('top');
            $handler.css({
                left: '0px',
                top: '0px',
                right: '0px',
                height: this.handleSize + 'px'
            });
            var draggable = new Draggable();
            draggable.updateDomPosition = false;
            draggable.add($handler);
            draggable.on('dragstart', this._onResizeStart, this);
            draggable.on('drag', this._onTopResize, this);
        },

        _addLeftHandler : function() {
            var $handler = this._createHandler('left');
            $handler.css({
                left: '0px',
                top: '0px',
                bottom: '0px',
                width: this.handleSize + 'px'
            });
            var draggable = new Draggable();
            draggable.updateDomPosition = false;
            draggable.add($handler);
            draggable.on('dragstart', this._onResizeStart, this);
            draggable.on('drag', this._onLeftResize, this);
        },

        _addBottomHandler : function() {
            var $handler = this._createHandler('bottom');
            $handler.css({
                left: '0px',
                bottom: '0px',
                right: '0px',
                height: this.handleSize + 'px'
            });
            var draggable = new Draggable();
            draggable.updateDomPosition = false;
            draggable.add($handler);
            draggable.on('dragstart', this._onResizeStart, this);
            draggable.on('drag', this._onBottomResize, this);
        },

        _onResizeStart : function(e) {
            this._x0 = e.pageX;
            this._y0 = e.pageY;
        },

        _onTopResize : function(e, width, height, silent) {
            var oy = -(e.pageY - this._y0);

            var width = width || this.$container.width();
            var height = height || this.$container.height();
            var topName = this.$container.css('position') == 'absolute' ?
                                'top' : 'marginTop';

            var top = parseInt(this.$container.css(topName)) || 0;

            if (height + oy > this.maxHeight) {
                oy = this.maxHeight - height;
            } else if (height + oy < this.minHeight) {
                oy = this.minHeight - height;
            }
            this.$container.height(height + oy);
            this.$container.css(topName, (top - oy) + 'px');

            this._y0 = e.pageY;

            if (!silent) {
                this.trigger('resize', {
                    width : width,
                    height : height + oy
                });   
            }
        },

        _onBottomResize : function(e, width, height, silent) {
            var oy = e.pageY - this._y0;

            var width = width || this.$container.width();
            var height = height || this.$container.height();

            if (height + oy > this.maxHeight) {
                oy = this.maxHeight - height;
            } else if (height + oy < this.minHeight) {
                oy = this.minHeight - height;
            }
            this.$container.height(height + oy);

            this._y0 = e.pageY;

            if (!silent) {
                this.trigger('resize', {
                    width : width,
                    height : height + oy
                });
            }
        },

        _onLeftResize : function(e, width, height, silent) {
            var ox = -(e.pageX - this._x0);

            var width = width || this.$container.width();
            var height = height || this.$container.height();

            var leftName = this.$container.css('position') == 'absolute'
                                ? 'left' : 'marginLeft';
            var left = parseInt(this.$container.css(leftName)) || 0;

            if (width + ox > this.maxWidth) {
                ox = this.maxWidth - width;
            } else if (width + ox < this.minWidth) {
                ox = this.minWidth - width;
            }

            this.$container.width(width + ox);
            this.$container.css(leftName, (left - ox) + 'px');

            this._x0 = e.pageX;

            if (!silent) {
                this.trigger('resize', {
                    width : width + ox,
                    height : height
                });
            }
        },

        _onRightResize : function(e, width, height, silent) {
            var ox = e.pageX - this._x0;
            var width = width || this.$container.width();

            if (width + ox > this.maxWidth) {
                ox = this.maxWidth - width;
            } else if (width + ox < this.minWidth) {
                ox = this.minWidth - width;
            }

            this.$container.width(width + ox);

            this._x0 = e.pageX;

            if (!silent) {
                this.trigger('resize', {
                    width : width + ox,
                    height : height
                });
            }
        },

        _onRightBottomResize : function(e) {
            // Avoid width() and height() cause reflow
            var width = this.$container.width();
            var height = this.$container.height();

            this._onRightResize(e, width, height, true);
            this._onBottomResize(e, height, height, true);

            this.trigger('resize', {
                width : width,
                height : height
            })
        },

        _createHandler : function(className) {
            var $handler = $('<div></div>').css("position", "absolute");
            $handler.addClass('qpf-resizable-handler');
            $handler.addClass('qpf-' + className);
            this.$container.append($handler);
            return $handler;
        }
    });

    Resizable.applyTo = function(target, options) {
        target.resizable = new Resizable(options);
        target.resizable.enable();
    }

    return Resizable;
});
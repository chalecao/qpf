define(function() {

    function Handler(action, context) {
        this.action = action;
        this.context = context;
    }

    return{
        trigger : function(name) {
            if (! this.hasOwnProperty('__handlers__')) {
                return;
            }
            if (!this.__handlers__.hasOwnProperty(name)) {
                return;
            }

            var hdls = this.__handlers__[name];
            var l = hdls.length, i = -1, args = arguments;
            // Optimize from backbone
            switch (args.length) {
                case 1: 
                    while (++i < l)
                        hdls[i].action.call(hdls[i].context);
                    return;
                case 2:
                    while (++i < l)
                        hdls[i].action.call(hdls[i].context, args[1]);
                    return;
                case 3:
                    while (++i < l)
                        hdls[i].action.call(hdls[i].context, args[1], args[2]);
                    return;
                case 4:
                    while (++i < l)
                        hdls[i].action.call(hdls[i].context, args[1], args[2], args[3]);
                    return;
                case 5:
                    while (++i < l)
                        hdls[i].action.call(hdls[i].context, args[1], args[2], args[3], args[4]);
                    return;
                default:
                    while (++i < l)
                        hdls[i].action.apply(hdls[i].context, Array.prototype.slice.call(args, 1));
                    return;
            }
        },
        
        on : function(name, action, context/*optional*/) {
            if (!name || !action) {
                return;
            }
            var handlers = this.__handlers__ || (this.__handlers__={});
            if (! handlers[name]) {
                handlers[name] = [];
            } else {
                if (this.has(name, action)) {
                    return;
                }   
            }
            var handler = new Handler(action, context || this);
            handlers[name].push(handler);

            return this;
        },

        once : function(name, action, context/*optional*/) {
            if (!name || !action) {
                return;
            }
            var self = this;
            function wrapper() {
                self.off(name, wrapper);
                action.apply(this, arguments);
            }
            return this.on(name, wrapper, context);
        },

        // Alias of on('before')
        before : function(name, action, context/*optional*/) {
            if (!name || !action) {
                return;
            }
            name = 'before' + name;
            return this.on(name, action, context);
        },

        // Alias of on('after')
        after : function(name, action, context/*optional*/) {
            if (!name || !action) {
                return;
            }
            name = 'after' + name;
            return this.on(name, action, context);
        },

        // Alias of once('success')
        success : function(action, context/*optional*/) {
            return this.once('success', action, context);
        },

        // Alias of once('error')
        error : function(action, context/*optional*/) {
            return this.once('error', action, context);
        },

        off : function(name, action/*optional*/) {
            
            var handlers = this.__handlers__ || (this.__handlers__={});

            if (!action) {
                handlers[name] = [];
                return;
            }
            if (handlers[name]) {
                var hdls = handlers[name];
                // Splice is evil!!
                var retains = [];
                for (var i = 0; i < hdls.length; i++) {
                    if (action && hdls[i].action !== action) {
                        retains.push(hdls[i]);
                    }
                }
                handlers[name] = retains;
            } 

            return this;
        },

        has : function(name, action) {
            var handlers = this.__handlers__;

            if (! handlers ||
                ! handlers[name]) {
                return false;
            }
            var hdls = handlers[name];
            for (var i = 0; i < hdls.length; i++) {
                if (hdls[i].action === action) {
                    return true;
                }
            }
        }
    }
    
});
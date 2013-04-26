//=============================================================
// application.js
// 
// Container of the whole web app, mainly for monitor the resize
// event of Window and resize all the component in the app
//=============================================================

define(["./container",
        "knockout"], function(Container, ko){
    
    var Application = Container.derive(function(){

    }, {

        type : "APPLICATION",
        
        css : "application",

        initialize : function(){

            $(window).resize( this._resize.bind(this) );
            this._resize();
        },

        _resize : function(){
            this.width( $(window).width() );
            this.height( $(window).height() );
        }
    })

    Container.provideBinding("application", Application);

    return Application;
})
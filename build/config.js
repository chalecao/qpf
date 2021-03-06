({
    paths : {
        // libraries
        "knockout" : "empty:",
        "$" : "empty:",
        "_" : "empty:"
    },
    shim : {
        '$' : {
            exports : "$"
        },
        '_' : {
            exports : "_"
        }
    },
    packages: [{
        name: 'qpf',
        location: '../src',
        main: 'qpf'
    }],
    exclude : ['knockout', '$', "_"],
    // name : "build/almond",
    include : [ "qpf"],
    out : "../dist/js/qpf.js",
    wrap : {
        startFile : ['wrap/start.js', "almond.js", "wrap/config.js"],
        endFile : 'wrap/end.js'
    },
    optimize:"none"
})
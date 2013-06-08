({
    baseUrl : "../",
    paths : {
        "qpf" : "src/qpf",
        "core" : "src/core",
        "components" : "src/components",
        // libraries
        "knockout" : "empty:",
        "$" : "empty:",
        "_" : "thirdparty/underscore"
    },
    shim : {
        '$' : {
            exports : "$"
        },
        '_' : {
            exports : "_"
        }
    },
    exclude : ['knockout', '$', "_"],
    // name : "build/almond",
    include : [ "src/qpf"],
                
    out : "../dist/qpf.js",
    wrap : {
        startFile : ['wrap/start.js', "almond.js", "wrap/config.js"],
        endFile : 'wrap/end.js'
    },
    optimize:"none"
})
({
    baseUrl : "../",
    paths : {
        "qpf" : "src/qpf",
        "core" : "src/core",
        "components" : "src/components",
        // libraries
        "knockout" : "thirdparty/knockout",
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
    excludeShallow : ['knockout', '$', "_"],
    // name : "build/almond",
    include : [ "src/qpf"],
                
    out : "../dist/qpf.js",
    wrap : {
        startFile : ['wrap/start.js', "almond.js", "wrap/knockout.js", "wrap/jquery.js"],
        endFile : 'wrap/end.js'
    },
    optimize:"none"
})
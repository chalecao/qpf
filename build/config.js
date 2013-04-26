({
    baseUrl : "../",
    paths : {
        "qpf" : "src/qpf",
        "core" : "src/core",
        "components" : "src/components",
        // libraries
        "knockout" : "thirdparty/knockout",
        "ko.mapping": "thirdparty/ko.mapping",
        "goo" : "thirdparty/goo"
    },
    excludeShallow : ['knockout', 'goo'],
    // name : "build/almond",
    include : [ "src/qpf"],
                
    out:"./output/qpf.js",
    wrap : {
        startFile : ['wrap/start.js', "almond.js", "wrap/knockout.js"],
        endFile : 'wrap/end.js'
    },
    optimize:"none"
})
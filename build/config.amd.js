({
    paths : {
        // libraries
        "knockout" : "empty:",
        "$" : "empty:",
        "_" : "empty:"
    },
    packages: [{
        name: 'qpf',
        location: '../src',
        main: 'qpf'
    }],
    include : [ "qpf"],
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
    out : "../dist/js/qpf.amd.js",
    optimize: "none"
})
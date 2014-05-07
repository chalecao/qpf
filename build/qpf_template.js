define(function(require){
    
    var qpf =  {{$exportsObject}};

    qpf.create = qpf.Base.create;
    
    qpf.init = qpf.util.init;

    return qpf;
})
"use strict";


export default class LinkerOutput {

  constructor(graph, mname){
    this.graph = graph;
    this.nmap = [];
    this.data = "";
    this.mname = mname;
    this.setup();
    this.make();
  }

  setup(){

    var arr = this.graph;
    var len = arr.length;

    this.nmap = arr.sort((a, b)=>{
      var idxA = a.index + a.depth*len;
      var idxB = b.index + b.depth*len;
      return idxB - idxA;
    });
  }

  make(m){

    this.data = this.mname + " = {stylenodes: [], cleanup: function(){ var arr = "+this.mname+".stylenodes; for(var i = 0; i < arr.length; i++){ document.head.removeChild(arr[i]); } "+this.mname+" = [];  }};\n";
    var arr = this.nmap;

    for(var i = 0; i < arr.length; i++){
      var n = arr[i];
      this.data += n.output + "\n";
    }

    var index = arr[arr.length - 1];
    this.data += "var setargv = function(args){};";
    this.data += "var main = " + this.mname + "[\"" + index.path + "_trigger\"];";
  }

}

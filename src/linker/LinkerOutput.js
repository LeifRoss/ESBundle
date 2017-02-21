"use strict";

/**
* LinkerOutput
* @author Leif Andreas Rudlang
* @version 0.0.1
* @since 0.0.1
*/
class LinkerOutput {

  /**
  * Creates a instance of LinkerOutput
  *
  * @constructor
  * @this {LinkerOutput}
  * @param {array} graph
  * @param {string} mname
  */
  constructor(graph, tag){
    this.graph = graph;
    this.tag = tag;
    this.nmap = [];
    this.setup();
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

  /**
  * Build the linker output into a bundle string
  *
  * @this {LinkerOutput}
  * @return {string}
  */
  make(){
    var data = this.tag + " = {};\n";
    var arr = this.nmap, i = 0;

    for(; i < arr.length; i++){
      data += arr[i].module.getModuleString() + "\n";
    }

    var index = arr[arr.length - 1];
    data += "var setargv = function(args){};";
    data += "var main = " + this.tag + "[\"" + index.path + "_trigger\"];";
    return data;
  }

}

export default LinkerOutput;

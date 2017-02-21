import ModuleParser from "./ModuleParser";
import LinkerOutput from "./LinkerOutput";
import LinkerResolver from "./LinkerResolver";
import Resource from "./Resource";
import fs from "filesystem";
"use strict";


export default class Linker {

  constructor(f, mname){
    this.root = f;
    this.mname = mname;
    this.map = {};
    this.graph = [];
    this.lmap = null;
    this.call = null;
    this.alive = true;
    this.counter = 0;
    this.output = null;
    this.manifest = null;
  }

  /**
  Callback (err, resultData)
  */
  link(call){
    this.call = call;
    this.linkModule(this.root, this.root.path, 0, 0);
  }

  linkModule(f, alias, depth, index){

    if(!this.alive){
      return;
    }

    this.counter++;

    this.map[f.path] = {
      path: f.path,
      output: "",
      depth: depth,
      index: index,
      imports: []
    };

    var m = null;

    switch(f.getFileType()){

      case "js":
      case "jsx":
      m = new ModuleParser(this.root, f, alias, this.mname);
      break;

      default:
      m = new Resource(this.root, f, alias, this.mname);
    }

    m.parse((err)=>{

      if(err){ // TODO
        console.log("Error parsing module", err);
        //this.error(err);
        //return;
      }

      if (f.name === "manifest.json") {
        this.manifest = m.data;
      }

      this.add(m, depth);
      this.finish();
    });
  }

  add(m, depth){

    var modules = m.getImports();

    for (var i = 0; i < modules.length; i++) {
      var nmPath = modules[i];
      if (this.map.hasOwnProperty(nmPath)) {
        var mod = this.map[nmPath];
        mod.depth = Math.max(mod.depth, depth + 1);
        mod.index = Math.max(mod.index, i);
      } else {
        var path = LinkerResolver.resolve(nmPath);
        this.linkModule(fs.open(path), nmPath, depth + 1, i);
      }
    }

    var output = m.getModuleString();
    var absPath = m.file.path;

    this.map[absPath].output = output;
    this.map[absPath].imports = modules;
    this.graph.push(this.map[absPath]);
  }

  getOutput(){
    return new LinkerOutput(this.graph, this.mname);
  }

  finish(){
    if(--this.counter > 0){
      return;
    }
    this.call(null, this.getOutput());
  }

  error(data){
    this.alive = false;
    this.call(data);
  }

}

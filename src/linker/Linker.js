import Module from "./Module";
import Resource from "./Resource";
import LinkerOutput from "./LinkerOutput";
import FileDescriptor from "../file/FileDescriptor";
"use strict";



/**
* Linker
* @author Leif Andreas Rudlang
* @version 0.0.1
* @since 0.0.1
*/
export default class Linker {

  /**
  * Create a instance of the Linker class
  *
  * @constructor
  * @this {Linker}
  * @param {FileDescriptor} f
  * @param {string} tag Tag to use when naming the bundle
  * @param {boolean} strict Enable strict mode, will fail on syntax errors and missing brackets in modules
  * @param {requestCallback} fileCallback Callback used to request file data, called with fileCallback({FileDescriptor}, requestCallback(error, data))
  * @param {resolveCallback} resolveCallback Callback used to resolve alias into path, called with resolveCallback({string} alias, {FileDescriptor} caller, requestCallback(error, path))
  */
  constructor(f, tag, strict, fileCallback, resolveCallback){
    this.root = f;
    this.tag = tag;
    this.strict = strict;
    this.fileCallback = fileCallback;
    this.resolveCallback = resolveCallback;
    this.map = {};
    this.graph = [];
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
      m = new Module(this.root, f, alias, this.tag);
      break;

      default:
      m = new Resource(this.root, f, alias, this.tag);
    }

    this.fileCallback(m.file, (err, data)=>{

      if(err) {
        this.error(err);
        return;
      }

      m.parse(data, (err)=>{
        if(err && this.strict === true){
          this.error(err);
          return;
        }

        if (f.name === "manifest.json") {
          this.manifest = m.data;
        }

        this.add(m, depth);
        this.finish();
      });
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
        this.resolve(nmPath, m.file, (err, path)=>{
          this.linkModule(new FileDescriptor(path), nmPath, depth + 1, i);
        });
      }
    }

    var absPath = m.file.path;
    this.map[absPath].module = m;
    this.graph.push(this.map[absPath]);
  }

  resolve(query, parent, call) {
    if(query.indexOf('/') !== -1){
      call(null, query);
    }else {
      this.counter++;
      this.resolveCallback(query, parent, (err, path)=>{
        this.counter--;
        call(err, path);
      });
    }
  }

  getOutput(){
    return new LinkerOutput(this.graph, this.tag);
  }

  finish(){
    if(--this.counter <= 0){
      this.call(null, this.getOutput());
    }
  }

  error(data){
    this.alive = false;
    this.call(data);
  }

}

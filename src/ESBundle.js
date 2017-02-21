import Linker from "./linker/Linker";
import FileDescriptor from "./file/FileDescriptor";
"use strict";

/**
* ESBundle
* @author Leif Andreas Rudlang
* @version 0.0.1
* @since 0.0.1
*/
class ESBundle {

  /**
  *
  * @constructor
  * @this {ESBundle}
  * @param {object} attr Attributes ()
  */
  constructor(attr) {
    // attr for resolve map, per file so they can link multiple projects?
    //constructor(f, mname, fileCallback, resolveCallback){
    this.linker = new Linker(
      new FileDescriptor(attr.entry),
      attr.tag ? attr.tag : "__ES_BUNDLE",
      attr.strict ? attr.strict : false, 
      attr.onFile,
      attr.onResolve
    );
  }

  /**
  * Create the bundle
  *
  * @this {ESBundle}
  * @param {requestCallback} call (err)
  */
  make(call) {
    this.linker.link((err, output)=>{
      if(err) {
        call(err, null);
      } else {
        call(null, output.make());
      }
    });
  }

}

export default ESBundle;

import {uintToString, stringToUint} from "../utility/Utility";
"use strict";

/**
* FileDescriptor
* @author Leif Andreas Rudlang
* @version 0.0.1
* @since 0.0.1
*/
class FileDescriptor {

  /**
  * Creates a instance of FileDescriptor
  *
  * @constructor
  * @this {FileDescriptor}
  * @param {string} path
  * @param {string} parent relative parent
  */
  constructor(path, parent){
    this.path = path;

    if(parent && this.path.startsWith("./")){
      var idx = parent.lastIndexOf("/");
      this.path = idx !== -1 ? parent.substr(0,idx+1) + path.substr(2) : path.substr(2);

    }else if(parent && this.path.startsWith("../")){
      while(this.path.startsWith("../")){
        this.path = this.path.substr(3);
        parent = parent.substr(0, parent.lastIndexOf('/', parent.length - 2) + 1);
        if(parent.length === 0){
          parent = '/';
        }
      }
      this.path = parent + this.path;
    }

    this.path = this.path.replace(/\\/g, '/');
    var idx1 = this.path.lastIndexOf('/', this.path.length - 2);
    this.name = this.path.length <= 1 ? '/' : this.path.substr(idx1 + 1);
    this.isDir = this.name[this.name.length - 1] === '/';
  }

  /**
  * Get a new instance with the parent file
  *
  * @this {FileDescriptor}
  * @return {FileDescriptor}
  */
  getParent(){
    return this.path.length <= 1 ? null : new FileHandle("../", this.path);
  }

  /**
  * Get the filetype ".js"
  *
  * @this {FileDescriptor}
  * @return {string}
  */
  getFileType(){
    return this.path.substr((~-this.path.lastIndexOf(".") >>> 0) + 2).toLowerCase();
  }

}

export default FileDescriptor;

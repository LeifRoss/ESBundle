import ES6Import from "../targets/ES6Import";
import ES6ExportHandler from "../targets/ES6ExportHandler";
import CodeIterator from "./CodeIterator";
import LinkerResolver from "./LinkerResolver";
import FileDescriptor from "../file/FileDescriptor";
"use strict";


class Module {

  constructor(root, file, alias, mname){ // called when a linked module is discovered
    this.input = "";
    this.output = "";
    this.root = root;
    this.file = file;
    this.alias = alias;
    this.iterator = null;
    this.offset = 0;
    this.imports = [];
    this.mname = mname;
    this.call = null;
  }

  parse(data, call) {
    this.input = data;
    this.output = data;
    this.iterator = new CodeIterator(data, 0);
    this.exportHandler = new ES6ExportHandler(this.iterator);

    // if alias
    //LinkerResolver.scan(this.file, (err)=>{
    //  this.run();
    //});

    this.run();

    if(this.iterator.hasError()){
      this.error(call, "Parsing Error");
    }else{
      call();
    }
  }

  parseRequire() {
    var iter = this.iterator;
    var index = iter.index();
    var path = this.addPath(iter.advanceString());
    this.append(index, this.mname+"[\""+path+"\"].default", 8);
  }

  parseImport() {
    var iter = this.iterator;
    var index = iter.index();
    var prt = new ES6Import(iter);
    prt.parse();
    this.append(index, prt.getImportString(this.addPath(prt.path), this.mname), 7);
  }

  parseExport() {
    var index = this.iterator.index();
    var e = this.exportHandler.getExportInstance();
    e.parse();
    this.append(index, e.getExportString(this.addPath(e.path), this.mname), 7);
  }

  append(index, str, len) {
    var slen = this.output.length;
    var iter = this.iterator;
    var start = index + this.offset;
    var end = iter.index() + this.offset;
    this.output = this.output.substr(0, start - len ) + str + this.output.substr( end + 1 );
    var nlen = this.output.length;
    this.offset = this.offset + (nlen - slen);
  }

  run() {
    var iter = this.iterator;
    var c = iter.advance();

    while(iter.active()) {

      c = iter.get();

      if(iter.isInDefinition() || !iter.isValidPreExpression()) {
        iter.advance();
        continue;
      }

      if(
        c === 'i' &&
        iter.advance() === 'm' &&
        iter.advance() === 'p' &&
        iter.advance() === 'o' &&
        iter.advance() === 'r' &&
        iter.advance() === 't' &&
        iter.advance() === ' '
      ) { // import
        this.parseImport();
      } else if (
        c === 'r' &&
        iter.advance() === 'e' &&
        iter.advance() === 'q' &&
        iter.advance() === 'u' &&
        iter.advance() === 'i' &&
        iter.advance() === 'r' &&
        iter.advance() === 'e' &&
        iter.advance() === '('
      ) { // require
        this.parseRequire();
      } else if (
        c === 'e' &&
        iter.advance() === 'x' &&
        iter.advance() === 'p' &&
        iter.advance() === 'o' &&
        iter.advance() === 'r' &&
        iter.advance() === 't' &&
        iter.advance() === ' '
      ) { // export
        this.parseExport();
      } else {
        iter.advance();
      }
    }

    //console.log("out: ", this.getModuleString());
    //console.log(iter.getStackTrace());
    //console.log(iter.escapes);
  }

  addPath(path) {
    if (path === null || path.length === 0) {
      return this.file.path;

    } else if (path.indexOf("/") === -1) { // Alias used
      var rPath = LinkerResolver.resolve(path);
      this.imports.push(rPath);
      return rPath;
    }

    var f = new FileDescriptor(path, this.file.path);
    var rpath = f.path + (f.getFileType() === "" ? ".js" : "");
    this.imports.push(rpath);
    return rpath;
  }

  getPath(str) {
    var f = new FileDescriptor(str, this.root.path);
    return this.getRelativePath(f.path);
  }

  getRelativePath(path) {
    return path.substr(this.root.path.length);
  }

  getModuleString() {
    //var path = this.alias;
    var path = this.file.path;

    //console.log(path);
    return (
      this.mname + "[\"" + path + "_trigger\"] = (function(){\n" +
      "if(" + this.mname + "[\"" + path + "_loaded\"] === true){\nreturn;\n}\n" +
      this.mname + "[\"" + path + "_loaded\"] = true;\n" +
      this.mname + "[\"" + path + "\"] = {default: null};\n" +
      "var module = {exports: null};\n" +
      this.output + "\n" +
      "if(module.exports !== null){\n" +
      this.mname + "[\"" + path + "\"].default = module.exports;\n" +
      "}});"
    );
  }

  getImports() {
    return this.imports;
  }

  error(call, msg) {
    call({
      reason: msg,
      path: this.file.path,
      stackTrace: this.iterator ? this.iterator.getStackTrace() : null
    });
  }

}

export default Module;

"use strict";

class ES6Export {

  constructor(iterator) {
    this.iterator = iterator;
    this.exports = [];
    this.path = null;
  }

  parse() {}

  add(alias, module, variable) {
    this.exports.push({
      module: module,
      alias: alias,
      variable: variable
    });
  }

  addImports(arr) {
    if (this.path !== null) {
      var apath = "";
      arr.push(apath);
    }
  }

  getExportString(rpath, mod) {
    var buffer = "", e = null, calias = "", mdesc = "";

    for (var i = 0; i < this.exports.length; i++) {
      e = this.exports[i];
      calias = e.alias === '*' ? "default" : e.alias;
      mdesc = mod + "[\"" + rpath + "\"]" + "[\"" + calias + "\"] = ";

      if (e.variable) { // Variable exports
        buffer += this.type + " " + calias + e.module + "\n";
        buffer += mdesc + calias + ";\n";

      } else if (this.path !== null) { // from exports

        if (e.module === '*') {
          buffer += mdesc + mod + "[\"" + rpath + "\"];\n";
        } else {
          buffer += mdesc + mod + "[\"" + rpath + "\"][\"" + e.module + "\"];\n";
        }

      } else {
        buffer += mdesc + e.module + ";\n";
      }
    }

    return buffer;
  }

}


export default ES6Export;

"use strict";


export default class ES6Import {

  constructor(iterator) {
    this.iterator = iterator;
    this.imports = [];
    this.buffer = "";
    this.alias = false;
    this.word = "";
    this.as = "";
    this.depth = 0;
    this.path = null;
  }

  parse() {

    switch (this.iterator.nextSymbol()) {

      case '\"':
      case '\'':
      break;

      default:
      this.getWords();
    }

    this.path = this.iterator.advanceString();
  }

  getWords() {

    var iter = this.iterator;
    var c = ''
    var alias = false;

    while (iter.active()) {
      var word = iter.advanceWord();

      if (this.alias) {
        this.add(word);
        continue;
      }

      var symbol = iter.nextSymbol();

      switch (word) {

        case "from":
        this.add();
        return;

        case "as":
        this.alias = true;
        break;

        default:
        this.word = word;
        if (symbol === ',' || symbol === '{' || symbol === '}') {
          this.add();
        } else if (symbol === ';') {
          this.add();
          return;
        }
      }

      if(symbol === '{') {
        this.depth++;
      }
    }

    this.add();
  }

  add(alias) {

    if (this.word === "") {
      return;
    }

    if (this.alias) {
      this.imports.push({
        module: this.word,
        alias: alias,
        submodule: this.depth !== 0
      });
      this.alias = false;

    } else {
      this.imports.push({
        module: this.word,
        alias: this.word,
        submodule: this.depth !== 0
      });
    }

    this.word = "";
  }

  addImports(arr) {
    var relativePath = "";
    arr.push(relativePath);
  }

  getImportString(rpath, pkgobj) {

    if (this.imports.length === 0) {
      this.imports.push({
        module: "*",
        alias: "*",
        submodule: false
      });
    }

    var str = pkgobj + "[\"" + rpath + "_trigger\"]();\n";

    for (var i = 0; i < this.imports.length; i++) {
      var m = this.imports[i];
      if (m.module === "*") {
        str += "var " + m.alias + " = " + pkgobj + "[\"" + rpath + "\"];\n";
      } else {
        var sub = m.submodule ? m.module : "default";
        str += "var " + m.alias + " = " + pkgobj + "[\"" + rpath + "\"][\"" + sub + "\"];\n";
      }
    }

    return str;
  }

  toString() {

  }

}

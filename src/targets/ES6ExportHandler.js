import VariableExport from "./VariableExport";
import DefaultExport from "./DefaultExport";
import NamedExport from "./NamedExport";
import FromExport from "./FromExport";
"use strict";


export default class ES6ExportHandler {

  constructor(iterator){
    this.iterator = iterator;
    this.exports = [];
  }

  getExportInstance(){

    //var word = Util.getNextWord(this.input, this.counter);
    var iter = this.iterator;

    var symbol = iter.nextSymbol();
    var index = iter.index();
    var word = iter.advanceWord();

    switch(word){

      case "default":
      return new DefaultExport(iter);

      case "var":
      case "let":
      case "const":
      case "class":
      case "function":
      return new VariableExport(iter, word);

    }

    if(symbol === '*'){ // from export
      return new FromExport(iter);

    }else if(symbol === '{'){
      return new NamedExport(iter, index);
    }

    return null;
  }

  addExport(){

    this.exports.push({
      alias: "",
      block: "",
      path: ""
    });
  }

  getExportString(){

  }

}

import ES6Export from "./ES6Export";


export default class VariableExport extends ES6Export {

  constructor(iterator, type){
    super(iterator);
    this.type = type;
  }

  parse(){


    var iter = this.iterator;
    var word = iter.advanceWord();
    var startDepth = iter.depth();
    var c = iter.get(), d = 0, block = false;
    var buffer = '';

    while(iter.active()){
      d = iter.depth();
      buffer += c;
      c = iter.advance();
      if(d > startDepth){
        block = true;
      }else if(block){
        break;
      }else if(c === ';'){
        break;
      }
    }

    buffer += c;
    this.add(word, buffer, true);
  }




}

import ES6Export from "./ES6Export";


class DefaultExport extends ES6Export {

  constructor(iterator){
    super(iterator);
  }

  parse(){
    var iter = this.iterator;
    var startDepth = iter.depth();
    var c = '', d = 0, block = false;
    var buffer = '';

    while(iter.active()){
      c = iter.advance();
      d = iter.depth();
      buffer += c;

      if(d > startDepth){
        block = true;
      }else if(block){
        break;
      }else if(c === ';'){
        break;
      }
    }

    this.add("default", buffer);
  }
}


export default DefaultExport;

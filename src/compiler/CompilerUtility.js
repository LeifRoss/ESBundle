


class CompilerUtility {

  getNextWord(input, index){

    var len = input.length - 1;
    var str = "";
    var counter = index;

    while(counter <= len){
      var c = input[counter++];

      switch(c){
        case ' ':
        case '\t':
        case ',':
        case '{':
        case '}':
        if(str.length !== 0){
          return str;
        }
        break;
        default:
        str += c;
      }
    }

    return str;
  }


  getNextSymbol(input, index){


    var len = input.length - 1;
    var counter = index;

    while(counter <= len){
      var c = input[counter++];
      switch(c){
        case ' ':
        case '\t':
        break;
        default:
        return c;
      }
    }

    return '';
  }

  isEndOfStatement(c){

    switch(c){
      case '}':
      case ',':
      case ';':
      case '\n':
      return true;
    }

    return false;
  }


}


export const Util = new CompilerUtility();

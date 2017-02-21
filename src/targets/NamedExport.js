import ES6Export from "./ES6Export";


class NamedExport extends ES6Export {

  constructor(iterator, index) {
    super(iterator);
    this.index = index;
    this.buffer = "";
  }

  parse() {
    var iter = this.iterator;

    var idx = this.getWords();
    iter.counter = idx;
    var word = iter.advanceWord();

    if(word === "from"){
      this.path = iter.advanceString();
    }
  }

  getWords() {
    var iter = this.iterator;
    var input = iter.input;
    var counter = this.index;
    this.buffer = "";
    var c = '';

    while (counter < iter.length) {

      c = input[counter++];
      iter.advance();

      switch (c) {

        case '}':
        this.add();
        return counter;

        case '{':
        case '\n':
        case '\t':
        break;

        case ',':
        case ';':
        this.add();
        break;

        default:
        this.buffer += c;
      }
    }

    this.add();
    return counter;
  }

  add() {

    if (this.buffer === "") {
      return;
    }

    var query = this.buffer.trim();
    this.buffer = "";

    var idx0 = query.indexOf(" as ");
    var idx1 = query.indexOf("\tas\t");

    var index = Math.max(idx0, idx1);
    var word = query;
    var alias = word;

    if (index !== -1) {
      word = query.substr(0, index).trim();
      alias = query.substr(index + 3).trim();
    }

    super.add(alias, word, false);
  }

}


export default NamedExport;

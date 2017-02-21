"use strict";


export default class CodeIterator {

  constructor(input, index) {
    this.input = input;
    this.start = index;
    this.counter = index;
    this.escapes = [];
    this.escapeLines = [];
    this.stack = [];
    this.line = 1;
    this.length = input.length - 1;
    this.escaped = false;
    this.errors = [];
  }

  index() {
    return this.counter;
  }

  get() {
    return this.input[this.counter - 1];
  }

  peek() {
    return this.counter < this.length ? this.input[this.counter] : '';
  }

  advance() {

    var c = this.input[this.counter++];

    if (this.escapes.length !== 0) {

      var ce = this.escapes[this.escapes.length - 1];
      this.line += (ce === '*' || ce === '\n') && c === '\n';

      if (ce === c && this.escaped === false) {
        if (c === '*') {
          if (this.peek() === '/') {
            this.popEscape();
            this.escaped = true;
            return c;
          }
        } else {
          this.popEscape();
        }

      } else if (c === '\\' && ce !== '*' && ce !== '\n') {
        this.escaped = true;
        return c;
      }

      this.escaped = false;

    } else if (!this.escaped) {

      switch (c) { // TODO fix error with comment escape
        case '\"': // String
        case '\'': // String
        this.pushEscape(c);
        break;
        case '/': // Regex or comment
        if (this.peek() === '*') {
          this.pushEscape('*');
        } else if (this.peek() === '/') {
          this.pushEscape('\n');
        } else if (this.isValidRegex()) {
          this.pushEscape(c);
        }
        break;
        case '{':
        this.pushStack();
        break;
        case '}':
        this.popStack();
        break;
        case '\n':
        this.line++;
      }
    } else {
      this.escaped = false;
    }

    return c;
  }

  pushStack() {
    this.stack.push(this.line);
  }

  popStack() {
    if (this.stack.length === 0) {
      this.addError("Missing bracket to closing }");
    } else {
      this.stack.pop();
    }
  }

  pushEscape(c) {
    this.escapes.push(c);
    this.escapeLines.push(this.line);
  }

  popEscape() {
    this.escapes.pop();
    this.escapeLines.pop();
  }

  advanceWord() {

    var str = "";

    while (this.active()) {
      var c = this.advance();

      if (this.isEscaped()) {
        return str;
      }

      switch (c) {

        case ' ':
        case '\t':
        case '\r':
        case '\n':
        case ',':
        case '{':
        case '}':
        case '(':
        if (str.length !== 0) {
          return str;
        }
        break;

        default:
        str += c;
      }
    }

    return str;
  }

  nextSymbol() {

    var counter = this.counter;

    while (counter < this.length) {
      var c = this.input[counter++];
      switch (c) {

        case ' ':
        case '\t':
        case '\n':
        case '\r':
        break;

        default:
        return c;
      }
    }

    return '';
  }

  advanceSymbol() {
    while (this.active()) {
      var c = this.advance();
      switch (c) {

        case ' ':
        case '\t':
        case '\n':
        case '\r':
        break;

        default:
        return c;
      }
    }
    return '';
  }

  advanceString() {

    var str = "";
    var strChar = '';
    var inStr = false;

    while (this.active()) {
      var c = this.advance();

      switch (c) {

        case '\'':
        case '\"':
        if (inStr && c == strChar) {
          return str;
        } else {
          inStr = true;
          strChar = c;
        }
        break;

        default:
        if (inStr) {
          str += c;
        }
      }
    }

    return null;
  }

  advanceBlock() {

    var depth = this.depth();
    var str = "";
    var active = false;

    while (this.active()) {

      str += this.advance();
      var d = this.depth();

      if (active && d <= depth || d < depth) {
        return str;
      }

      if (d > depth) {
        active = true;
      }
    }

    return null;
  }

  advanceArgument() {

  }

  isEscaped() {
    return this.escapes.length > 0;
  }

  active() {
    return this.counter < this.length;
  }

  depth() {
    return this.stack.length;
  }

  hasError(){
    return this.counter >= this.length && (this.stack.length !== 0 || this.escapes.length !== 0);
  }

  isValidRegex() {

    var i = this.counter;

    while (i > 0) {
      var c = this.input[--i];
      switch (c) {
        case '=':
        case '.':
        case '(':
        case ':':
        case '{':
        case ',':
        case '[':
        case '!':
        case '|':
        case '?':
        case '}':
        case ';':
        case '&':
        return true;
      }

      if (c >= '0' && c <= '9' || c >= 65 && c <= 90 || c >= 97 && c <= 122) {
        return true;
      }
    }

    return false;
  }

  isValidPreExpression() {

    if (this.counter < 2) {
      return true;
    }

    var c = this.input[this.counter - 2];

    switch (c) {
      case '=':
      case '(':
      case ':':
      case '{':
      case ',':
      case '[':
      case '!':
      case '|':
      case '?':
      case '}':
      case ';':
      case '&':
      case ' ':
      case '\n':
      case '\t':
      case '\r':
      return true;
    }

    return false;
  }

  isInDefinition() {
    return this.escapes.length > 0;
  }

  addError(reason, line) {
    this.errors.push({
      line: line ? line : this.line,
      reason: reason
    });
  }

  getStackTrace() {

    for(var i = 0; i < this.stack.length; i++){
      var e = this.stack[i];
      this.addError("Missing } to matching bracket", e);
    }

    for (var i = 0; i < this.escapes.length; i++) {
      var line = this.escapeLines[i];
      var escape = this.escapes[i];
      this.addError("Invalid " + escape, line);
    }

    return this.errors;
  }

}

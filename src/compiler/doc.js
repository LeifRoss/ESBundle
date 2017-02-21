

// ES6 Export syntax
// http://stackoverflow.com/questions/25494365/es6-module-export-options
export { name1, name2, …, nameN };
export { variable1 as name1, variable2 as name2, …, nameN };
export let name1, name2, …, nameN; // also var
export let name1 = …, name2 = …, …, nameN; // also var, const

export default expression;
export default function (…) { … } // also class, function*
export default function name1(…) { … } // also class, function*
export { name1 as default, … };

Ends when
  depth = startDepth && (symbol == ; || returns to startDepth after block)

export * from …;
export { name1, name2, …, nameN } from …;
export { import1 as name1, import2 as name2, …, nameN } from …;


// ES6 -> CommonJS transpilation

// named export
export {A, B};
=>
module.exports["A"] = A;
module.exports["B"] = B;

export {A as B};
=>
module.exports["B"] = A;


// default export
export default class A ...
=>
module.exports["default"] = class A ...

// variables export
export var A = ...
=>
module.exports["A"] = ...

// from exports
export {A} from "lib";
module.exports["A"] = MODULES["/lib.js"]["A"];



// detection of variable export
if first word is var | let | const | function | class

// detection of default export
if first word is default

// detection of named export
if first character is {

// detection of from export
if last word is from, and is followed by a string



// regression detection of export type

if first symbol is {
  if clamp is followed by from
    from export
  else
    named export

if first symbol is *
  from export

if first word is default
  default export

if first word is var | let | const | function | class
  variable export



Parser needs analysis methods
 getNextWord()
 getLastWord()
 getNextSymbol()
 wordIsStatement()
 wordIsDefault()

End-of-statement symbols
  }
  ,
  ;
  *?
  \n?

Parser needs functionality
 stack analysis for {}, end of statement happens during when bracket level is 0 and a end-of-statement symbol has been reached.
 Initial clamps are ignored for stack, but used as a end-of-statement symbol

Parse named and from exports with alias like the import module.

Parsing needs to happen realtime and return the generated code block and end-index in input.


export entry structure
{
  alias: string = can be wordname, as name (alis) or default,
  block: string = internal of block,
  path: string = empty if not named export
}

import ESBundle from "../../src/index";
import fs from "fs";
import path from "path";

if(process.argv.length < 3) {
  console.log("Supply path");
  process.exit(0);
}

var bundle = new ESBundle({
  entry: path.join(__dirname, process.argv[2]),
  tag: "__BUNDLE",
  onFile: (handle, call)=>fs.readFile(handle.path, "utf8", call),
  onResolve: (alias, parent, call)=>{
    console.log("resolve", alias, parent, call);
  }
});

bundle.make((err, data)=>{
  if(err) {
    console.log(err);
  }else{
    console.log(data);
  }
});

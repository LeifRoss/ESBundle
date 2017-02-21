import Linker from "./linker/Linker";
import Optimizer from "./optimizer/Optimizer";
import fs from "filesystem";
"use strict";


export default class Compiler {

  constructor() {

  }

  clear() {

  }

  compile(attr, call) {
    this.clear();

    /*
    attr
    path: string
    format: string
    optimization: string
    eslevel: string
    */

    var path = attr.path;
    var file = fs.open(path);
    var linker = new Linker(file, "__MODULE_BUNDLE");

    linker.link((err, output) => {
      if (err) {
        console.log("Linker Error", err);
        call(err, null);
        return;
      }

      var optimizer = new Optimizer();

      optimizer.run(attr, output.data, (err, code) => {
        if (err) {
          call(err);
        } else {

          call(
            null,
            attr.format === "html"
            ?
            this.makeHTML(code, linker.manifest, attr)
            :
            this.makePackage(code, linker.manifest, attr)
          );
        }
      });
    });
  }

  makePackage(code, manifest, attr) {
    return {
      type: "runnable",
      script: code,
      manifest: manifest !== null ? JSON.parse(manifest) : {}
    };
  }

  makeHTML(code, manifest, attr) { // TODO
    var sysImport = "\nvar System = {package: {}, window: function(){}};\n";
    var year = new Date().getFullYear();
    var entry = "\nwindow.onload = main;";

    return (
      "<!DOCTYPE html>\n" +
      (attr.copyright ? ("<!--Copyright "+attr.copyright+" "+year+"-->\n") : "")+
      "<html>\n"+
      "<head>\n"+
      "<title>Multiplex</title>\n"+
      "<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n"+
      "<meta charset=\"UTF-8\">\n"+
      "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n"+
      "<script>" + code + sysImport + entry + "</script>\n"+
      "</head>\n"+
      "<body>\n"+
      "</body>\n"+
      "</html>\n"
    );
  }

}

"use strict";



export default class Resource {

  constructor(root, file, alias, mname){
    this.root = root;
    this.file = file;
    this.alias = alias;
    this.mname = mname;
    this.data = null;
    this.output = null;
  }

  parse(call){

    this.file.read("utf8", (err, data)=>{

      if(err){
        console.log("err", this.file);
        call(err);
        return;
      }

      this.data = data;

      switch(this.file.getFileType()){

        case "json":
        this.output = "JSON.parse(atob(\"" + btoa(data) + "\"))";
        break;

        case "css":
        this.output = "atob(\"" + btoa(this.compressCSS(data)) + "\")";
        break;

        default:
        this.output = "atob(\"" + btoa(data) + "\")";
      }

      call();
    });
  }

  handle(){

  }

  getImports(){
    return [];
  }

  compressCSS(str){

    //var res = str.replaceAll(/(\r\n|\n|\r)/gm,"",false);
    var arr = [];
    var len = str.length;
    var comment = false;
    var prev = "";

    for(var i = 0; i < len; i++){

      var c = str.charAt(i);

      if(!comment){

        switch(c){

          case '\n':
          case '\r\n':
          case '\t':
          case '\r':
          break;

          case '*':
          if(prev === "/"){
            comment = true;
            prev = "";
            arr.pop();
            break;
          }

          default:
          if(prev !== " " || c !== " "){
            arr.push(c);
          }
          prev = c;
        }

      }else{

        switch(c){

          case '/':
          if(prev === "*"){
            comment = false;
            prev = "";
            break;
          }

          default:
          prev = c;
        }
      }
    }

    var result = arr.join("");

    return result;
  }

  getModuleString(){
    var path = this.alias;

    switch(this.file.getFileType()){
      case "css":
      return this.mname+"[\""+path+"_trigger\"] = (function(){\nif("+this.mname+"[\""+path+"_loaded\"] === true || typeof document === \"undefined\"){\nreturn;\n}\nvar n = document.createElement(\"style\");\nn.innerHTML = "+this.output+";\ndocument.head.appendChild(n);\n"+this.mname+"[\""+path+"\"] = {default: n};\n"+this.mname+".stylenodes.push(n);\n});"
    }

    return this.mname+"[\""+path+"_trigger\"] = (function(){\nif("+this.mname+"[\""+path+"_loaded\"] === true){\nreturn;\n}\n"+ this.mname+"[\""+path+"\"] = {default: "+this.output+"}; \n});";
  }

}

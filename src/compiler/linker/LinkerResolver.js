

class LinkerResolver {

  constructor(){
    this.alias = {
      "filesystem": "~modules/filesystem/index.js",
      "window": "~modules/display/ApplicationWindow.js",
      "events": "~modules/events/events.js",
      "jquery": "~modules/jquery/dist/jquery.min.js"
    };
  }

  scan(dir, call){
    call();
  }

  /**
  Resolve query into a file path
  */
  resolve(query) { // TODO make this shit work async

    // If path
    if(query.indexOf('/') !== -1){
      return query
    }

    // TODO if alias

    if(this.alias.hasOwnProperty(query)){
      return this.alias[query];
    }else{
      return query;
      //call("Module not found: " + query);
    }
  }
}


var res = new LinkerResolver();
export default res;

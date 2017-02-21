
/**
* LinkerOutput
* @author Leif Andreas Rudlang
* @version 0.0.1
* @since 0.0.1
*/
class LinkerResolver {

  /**
  * Create a instance of the LinkResolver
  *
  * @this {LinkResolver}
  */
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

// TODO, scan per package, node_modules and that jazz
var res = new LinkerResolver();
export default res;


function stringToUint(str){
  var arr = new Uint8Array(str.length);
  for(var i=0,j=str.length;i<j;++i){
    arr[i] = str.charCodeAt(i);
  }
  return arr;
}

function uintToString(arr) {
  var s = "";
  for(var i=0,l=arr.length; i<l; i++){
    s += String.fromCharCode(arr[i]);
  }
  return s;
}


export {
  stringToUint,
  uintToString
};

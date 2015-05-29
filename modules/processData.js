var processDataSource = require("./processDataSource");

var processData =  (function(data){

  var data = data;


  function removeExtraAttributes(){
    for(var obj in data){
      var tuple = data[obj];
      for(var prop in tuple){
        if(attributes.hasOwnProperty(prop)){

        }else {
          delete tuple[prop]
        }
      }
    }    
  }






  return {
    process: function(data){    
      removeExtraAttributes();
      processDataDescription(data);
      applyCrossfilter(data);
    }
  }
})();

module.exports = processData;
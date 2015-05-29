var fs = require("fs");

//
//#### processDataDescription()
//Reads the backend schema and fills the ```visualAttributes``` and ```filteringAttributes``` 
//
var processDataDescription = function(data){
  var dataDescription = fs.readFileSync("public/config/dataDescription.json"),
    filteringAttributes = [],
    visualAttributes = [];

  var process = function (){
    dataDescription = JSON.parse(dataDescription);

    for(var attributeIndex in dataDescription){
      var attribute = dataDescription[attributeIndex];
      for(var typeIndex in attribute["attributeType"]){
        if(attribute["attributeType"][typeIndex] == "filtering"){
          filteringAttributes.push(attribute);
          //attributes[attribute.name] = attribute;
        }
        else
          visualAttributes.push(attribute);
      }
    }

  }


  return {
    process: process,
    getFilteringAttributes: function(){
      return filteringAttributes;
    },
    getVisualAttributes: function(){
      return visualAttributes;
    }
  };

}();

module.exports = processDataDescription;

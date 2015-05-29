var processDataDescription = require("./processDataDescription");
var crossfilter = require("crossfilter")

//
//#### applyCrossfilter()
//Applies crossfilter to all the ```dimensions``` and ```groups```
//

var applyCrossfilter = function(data, callback){




  return {
    apply:   function(){
    var ndx = {},
      dimensions = {},
      groups = {},
      filteringAttributes = processDataDescription.getFilteringAttributes();

    console.log(data)
    ndx = crossfilter(data);

    for(var attr in filteringAttributes){

      var filteringAttribute = filteringAttributes[attr];
      //Create a crossfilter dimension on this attribute
      var dimension = {}
      if(filteringAttribute["datatype"] == "float"){
        dimension = ndx.dimension(function(d){
          //set binning parameter here
          return Math.round(d[filteringAttribute["name"]]*10)/10;
        });
      } else if(filteringAttribute["datatype"] == "integer"){
        dimension = ndx.dimension(function(d){
          return parseInt(d[filteringAttribute["name"]]);
        })
      } else {
        dimension = ndx.dimension(function(d){
          return d[filteringAttribute["name"]];
        });
      }

      dimensions[filteringAttribute["name"]] = dimension;

      group = dimension.group()
      groups[filteringAttribute["name"]] = group;
    }

    size = ndx.size(),
    all = ndx.groupAll();

    callback();   
  }
  }


}();

module.exports = applyCrossfilter;
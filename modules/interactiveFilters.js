//JSON Schema validation
var Validator = require('jsonschema').Validator;
var schemaValidator = new Validator();
var fs = require("fs");
var dataDescription = require("./dataDescription");

var crossfilter = require("crossfilter")

var interactiveFilters = (function(){

    //Crossfilter specific
    // - **dimensions** stores an array of dimensions.
    // - **groups** stores an array of groups.
    // - **ndx** is the crossfilter object.
    var dimensions = {},
      groups = {},
      ndx,
      filter = {};

    var filteringAttributes = dataDescription.getFilteringAttributes();


    var interactiveFiltersConfig = {},
        interactiveFiltersConfigPath = "public/config/interactiveFilters.json";

    var _loadConfig = function(path) {
        interactiveFiltersConfigPath = path || interactiveFiltersConfigPath;
        interactiveFiltersConfig = fs.readFileSync(interactiveFiltersConfigPath);
        interactiveFiltersConfig = JSON.parse(interactiveFiltersConfig);
    };

    var _init = function(path){
        _loadConfig(path);
    }



    //
    //#### applyCrossfilter()
    //Applies crossfilter to all the ```dimensions``` and ```groups```
    //

    var _applyCrossfilter = function(data){

        
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
    }

    return {
        init: _init,
        applyCrossfilter: _applyCrossfilter,
        getDimensions: function(){
            return dimensions;
        },
        getGroups: function(){
            return groups;
        },
        getndx: function(){
            return ndx;
        }
    }

})();
 
module.exports = interactiveFilters;
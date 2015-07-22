//JSON Schema validation
var Validator = require('jsonschema').Validator;
var schemaValidator = new Validator();
var fs = require("fs");
var dataDescription = require("./dataDescription");
//var visualization = require("./visualization");
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

    var ATTRIBUTENAME = "attributeName";

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

    var _getFilterConfig = function(attributeName){
      for(var i in interactiveFiltersConfig){
        var filterConfig = interactiveFiltersConfig[i];
        if(filterConfig[ATTRIBUTENAME] == attributeName){
          return filterConfig;
        }
      }
    }

    //
    //#### applyCrossfilter()
    //Applies crossfilter to all the ```dimensions``` and ```groups```
    //

    var _applyCrossfilter = function(data){

        
        ndx = crossfilter(data);

        for(var attr in filteringAttributes){

          var filteringAttribute = filteringAttributes[attr];

          var fconfig = _getFilterConfig(filteringAttribute.attributeName);

          if(fconfig)
            var binFactor = fconfig["visualization"]["binFactor"] || 1; 
          //Create a crossfilter dimension on this attribute
          var dimension = {}
          if(filteringAttribute["datatype"] == "float"){
            dimension = ndx.dimension(function(d){
              //set binning parameter here
              var binFactor = fconfig["visualization"]["binFactor"] || 10; 

              return Math.round(d[filteringAttribute[ATTRIBUTENAME]]*binFactor)/binFactor;
            });
          } else if(filteringAttribute["datatype"] == "integer"){
            //console.log(binFactor)
            dimension = ndx.dimension(function(d){
              return Math.round(d[filteringAttribute[ATTRIBUTENAME]]*binFactor)/binFactor;
            })
          } else {
            dimension = ndx.dimension(function(d){
              return d[filteringAttribute[ATTRIBUTENAME]];
            });
          }

          dimensions[filteringAttribute[ATTRIBUTENAME]] = dimension;

          group = dimension.group()
          groups[filteringAttribute[ATTRIBUTENAME]] = group;
        }
        /*
        var xAttr = "AgeatInitialDiagnosis";
        var yAttr = "KarnofskyScore";
        dimensions["imageGrid"] = ndx.dimension(function(d){
          return d.image;
        });
        //groups["imageGrid"] = dimensions["imageGrid"].group();
        dimensions["heatMapDim"] = ndx.dimension(function(d){
          return ([+d[xAttr]*1, +d[yAttr]*1]);
        });
        groups["heatMapGroup"] = dimensions["heatMapDim"].group();
        /*
        dimensions["imageGrid"] = ndx.dimension(function(d){
          return d["image"];        
        });
        groups["imageGrid"] = dimensions["imageGrid"].group();
        */
        size = ndx.size(),
        all = ndx.groupAll();
    }

    return {
        init: _init,
        applyCrossfilter: _applyCrossfilter,
        addDimension: function(name,body){
          dimensions[name] = body;

        },
        addGroup: function(name, body){
          groups[name] = body;
        },
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
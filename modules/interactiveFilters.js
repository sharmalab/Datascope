//JSON Schema validation
var Validator = require('jsonschema').Validator;
var schemaValidator = new Validator();
var fs = require("fs");
var dataDescription = require("./dataDescription");
//var visualization = require("./visualization");
var crossfilter = require("crossfilter");
  
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
    };

    var _getFilterConfig = function(attributeName){
        for(var i in interactiveFiltersConfig){
            var filterConfig = interactiveFiltersConfig[i];
            if(filterConfig[ATTRIBUTENAME] == attributeName){
                return filterConfig;
            }
        }
    };

    //
    //#### applyCrossfilter()
    //Applies crossfilter to all the ```dimensions``` and ```groups```
    //

    var _applyCrossfilter = function(data){

        
        ndx = crossfilter(data);
       
      
        for(var attr in filteringAttributes){

            var filteringAttribute = filteringAttributes[attr];
            //console.log(filteringAttribute.datatype);
            
            var fconfig = _getFilterConfig(filteringAttribute.attributeName);
           
            if(fconfig){
                var binFactor = fconfig.visualization.binFactor || 1; 
                //Create a crossfilter dimension on this attribute
                var dimension = {};
               
                if(filteringAttribute.datatype  === "float"){
                    dimension = ndx.dimension(function(d){
                        //set binning parameter here
                        var binFactor = fconfig.visualization.binFactor || 10; 
                        if(d[filteringAttribute[ATTRIBUTENAME]]) 
                            return d[filteringAttribute[ATTRIBUTENAME]];
                        else{ return null;}
                          
                    });
                } else if(filteringAttribute.datatype === "integer"){
                   
                    dimension = ndx.dimension(function(d){
                        //console.log(d);
                        //console.log(d[5]);
                        //console.log(d[filteringAttribute[ATTRIBUTENAME]]);
                        //console.log(+d[filteringAttribute[ATTRIBUTENAME]])
                        //binFactor = 1;
                        if(d[filteringAttribute[ATTRIBUTENAME]]) {

                            return (+d[filteringAttribute[ATTRIBUTENAME]]);
                        } 
                        else{
                            //console.log(d)
                            //console.log(d);
                            //console.log("null");
                            return null;

                        }
                        
                       
                    });
                    /*
                    dimension = ndx.dimension(function(d){
                        return Math.round(+d[filteringAttribute[ATTRIBUTENAME]]*binFactor)/binFactor;
                    });
                    */
                } else {
               
                    dimension = ndx.dimension(function(d){
                        return d[filteringAttribute[ATTRIBUTENAME]];
                    });
                }

                dimensions[filteringAttribute[ATTRIBUTENAME]] = dimension;

                var group = {};
                if(binFactor != 1){
                    //group = dimension.group(function(d){ return Math.floor( +d[filteringAttribute[ ATTRIBUTENAME ] ] * binFactor);
                    //})
                    binwidth = 1/binFactor;
                    //console.log("binnning!");
                    
                    group = dimension.group(function(d){
                        //console.log(Math.floor(+d/binwidth));
                        //console.log(d)
                        if(d){
                            var binned = Math.floor(+d/binFactor)*binFactor;
                            //console.log(binned);
                            if(binned == 0)
                                return 0.000001;
                            else
                                return (Math.floor(+d/binFactor)*binFactor);
                        }
                        else{

                            return null;
                        }
                        //return +d[filteringAttribute[ATTRIBUTENAME]]; 
                    });
                    //console.log(group.all()); 
                    //group = dimension.group();
                } else {
                    group = dimension.group();
                }
                //console.log(filteringAttribute[ATTRIBUTENAME])
                groups[filteringAttribute[ATTRIBUTENAME]] = group;
            }
        }

        /*
        var size = ndx.size(),
            all = ndx.groupAll();
        */
    };

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
    };

})();
 
module.exports = interactiveFilters;

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
        interactiveFiltersConfigPath = "config/interactiveFilters.json";

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

    var _getFilterDescription = function(attributeName) {
        return filteringAttributes.filter(
            function(attr) {
                return attr.attributeName === attributeName})[0];
    }

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
                dimension = ndx.dimension(function(d) {
                    /*  If is a scatterplot than is 2 dimensional chart and thus needs a special treatment
                    */
                    if(fconfig.visualization.visType === "scatterPlot") {
                        var xAttr = fconfig.visualization.xAttribute,
                            yAttr = fconfig.visualization.yAttribute;

                        if (d[xAttr] && d[yAttr]) {
                            xDesc = _getFilterDescription(xAttr)
                            yDesc = _getFilterDescription(yAttr)

                            if (xDesc.datatype === "integer") {
                                d[xAttr] = +d[xAttr];
                            }
                            if (yDesc.datatype === "integer") {
                                d[yAttr] = +d[yAttr];
                            }

                            return [d[xAttr], d[yAttr]];
                        } else {
                            return null;
                        }
                    } else {
                        if(d[filteringAttribute[ATTRIBUTENAME]]) {
                            if(filteringAttribute.datatype === "integer") {
                                d[filteringAttribute[ATTRIBUTENAME]] = +d[filteringAttribute[ATTRIBUTENAME]]
                            }
                            return d[filteringAttribute[ATTRIBUTENAME]];
                        } 
                        else {
                            return null;
                        }
                    }
                });

                dimensions[filteringAttribute[ATTRIBUTENAME]] = dimension;

                var group = {};
                if(binFactor != 1){
                    binwidth = 1/binFactor;
                    
                    group = dimension.group(function(d){
                        if(d){
                            var binned = Math.floor(+d/binFactor)*binFactor;
                            if(binned == 0)
                                return 0.000001;
                            else
                                return (Math.floor(+d/binFactor)*binFactor);
                        }
                        else {
                            return null;
                        }
                    });
                } else {
                    group = dimension.group();
                }

                groups[filteringAttribute[ATTRIBUTENAME]] = group;
            }
        }
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
        },
        getFilterConfig: _getFilterConfig
    };

})();
 
module.exports = interactiveFilters;

//JSON Schema validation
var Validator = require('jsonschema').Validator;
var schemaValidator = new Validator();
var fs = require("fs");




var visualization = (function(){


    var visualizationConfig = {},
        visualizationConfigPath = "public/config/visualization.json";


    var imageGridFilters = function (){
      var dimension;
      for(var attr in visualization.attributes){
        var attribute = visualization.attributes[attr];
        if(attribute.type == "image"){  
          dimension = attribute.name;
          dimensions["visualization"] = ndx.dimension(function(d){
            return d[attribute.name];        
          });
        }

      }
      groups["visualization"] = dimensions["visualization"].group();
    }


    var bubbleChartFilters = function(){
        var xAttr;
        var yAttr;
        var rAttr;
        var colorAttr;
        var dimension;
        for(var attr in visualization.attributes){
          var attribute = visualization.attributes[attr];
          if(attribute.dimension){  
            dimension = attribute.name;
            dimension["visualization"] = ndx.dimension(function(d){
              return d[attribute.name];        
            });
          }
          if(attribute.type == "x"){
            xAttr = attribute.name;
          }
          if(attribute.type == "y"){
            yAttr = attribute.name;
          }
          if(attribute.type == "r"){
            rAttr = attribute.name;
          }
          if(attribute.type == "color"){
            colorAttr = attribute.name;
          }
        }
        groups["visualization"] = dimensions[dimension].group().reduce(
          function(p,v){
            p[xAttr] += v[xAttr];
            p[yAttr] += v[yAttr];
            p[rAttr] += v[rAttr];
            p[colorAttr] += v[colorAttr];
            return p;
          },
          function(p,v){
            p[xAttr] -= v[xAttr];
            p[yAttr] -= v[yAttr];
            p[rAttr] -= v[rAttr];
            p[colorAttr] -= v[colorAttr];
            return p;
          },
          function(){
            var obj = {};
            obj[xAttr] = 0;
            obj[yAttr] = 0;
            obj[rAttr] = 0;
            obj[colorAttr] = 0;
            return obj;
          }
        );  
    };

    var _visualizationFilters = function(){

        var visualizationType = visualization.type;
        switch(visualizationType){
            case "bubbleChart":
                bubbleChartFilters();
          break;
            case "imageGrid":
                imageGridFilters();
          break;
        }

    };


    var _loadConfig = function(path) {
        visualizationConfigPath = path || visualizationConfigPath;
        visualizationConfig = fs.readFileSync(visualizationConfigPath);
        visualizationConfig = JSON.parse(visualizationConfig);
    };

    var _init = function(path){
        _loadConfig(path);
    }

    return{
        init: _init,
        visualizationFilters: _visualizationFilters,
        getVisualizationType: function(){
            return visualizationConfig.type;
        }
    }
})();
 
module.exports = visualization;
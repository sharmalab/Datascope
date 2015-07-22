//JSON Schema validation
var Validator = require('jsonschema').Validator;
var schemaValidator = new Validator();
var fs = require("fs");

//Information about 
//  1) filtering and visualization attributes
//  2) datatypes of attributes
//  3) 


var dataDescription = (function(){

    var filteringAttributes = [],
        visualAttributes = [],
        dataDescriptionConfig = {},
        attributes = {},
        dataDescriptionConfigPath="public/config/dataDescription.json",
        _init,
        _loadConfig;

    var _loadConfig = function (path){

            dataDescriptionConfigPath = path || dataDescriptionConfigPath;
            dataDescriptionConfig = fs.readFileSync(dataDescriptionConfigPath);
            dataDescriptionConfig = JSON.parse(dataDescriptionConfig);   
    };


    var _init = function (path){
        _loadConfig(path);
        for(var attributeIndex in dataDescriptionConfig){
          var attribute = dataDescriptionConfig[attributeIndex];    
          attributes[attribute.attributeName] = attribute; 
          for(var typeIndex in attribute["attributeType"]){
            if(attribute["attributeType"][typeIndex] == "filtering"){
              filteringAttributes.push(attribute);
              //attributes[attribute.name] = attribute;
            }
            else
              visualAttributes.push(attribute);
          }
        }
        return(path);
    }

    return {
        init: _init,
        getVisualAttributes: function(){
            return visualAttributes;
        },
        getFilteringAttributes: function(){
            return filteringAttributes;
        },
        getDataType: function(attribute){
            return attributes[attribute].datatype;
        }
    }

})();
 
module.exports = dataDescription;
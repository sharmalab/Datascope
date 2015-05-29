//JSON Schema validation
var Validator = require('jsonschema').Validator;
var schemaValidator = new Validator();
var fs = require("fs");
var loadDataSource = require("./loadDataSource");

var dataSource = (function(){
    var dataSourceConfig = {},
        dataSources = [],
        source = {},
        dataSourceConfigPath = "public/config/dataSource.json",
        _init,
        _loadDataSourceConfig,
        attributes = {},
        dataSourceSchema,
        validation;
    

    var _init = function (){



        for(var i in dataSourcesConfig){
          source = dataSourcesConfig[i];
          dataSources.push(source);
          for(var j in dataSource.attributes){
            attribute = dataSource.attributes[j];
            attributes[attribute] = true;
          }
        }
    };
    var _loadDataSourceConfig = function (path){

            dataSourceConfigPath = path || dataSourceConfigPath;
            dataSourcesConfig = fs.readFileSync(dataSourceConfigPath);
            dataSourcesConfig = JSON.parse(dataSourcesConfig);   
    };

    var _loadData = function(callback){
        loadDataSource(dataSources, callback);

    }

    return{
        loadDataSourceConfig: _loadDataSourceConfig,
        init: function(path){
            _loadDataSourceConfig(path);
            _init();
        },
        getAttributes: function(){
            return attributes;
        },
        validate: function(){
            dataSourceSchema = JSON.parse(fs.readFileSync("./schemas/dataSourceSchema.json"));
            validation = schemaValidator.validate(dataSourceConfig, dataSourceSchema);
        },
        loadData: _loadData
    }
})();

module.exports = dataSource;
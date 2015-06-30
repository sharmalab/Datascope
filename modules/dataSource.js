//JSON Schema validation
var Validator = require('jsonschema').Validator;
var schemaValidator = new Validator();
var fs = require("fs");
var loadDataSource = require("./loadDataSource");
var async = require("async");
var extend = require("extend");
var dataSource = (function(){
    var dataSourceConfig = {},
        dataSources = [],
        source = {},
        dataSourceConfigPath = "public/config/dataSource.json",
        _init,
        _loadDataSourceConfig,
        attributes = {},
        dataSourceSchema,
        validation,
        keys = [];
    
 
    _init = function (){
        for(var i in dataSourcesConfig){
          source = dataSourcesConfig[i];
          dataSources.push(source);
          /*
          for(var j in source.attributes){
            attribute = source.attributes[j];
            attributes[attribute] = true;
          }
          */
          //console.log(dataSources)
        }
        return dataSources;

    };
    _loadDataSourceConfig = function (path){
        dataSourceConfigPath = path || dataSourceConfigPath;
        dataSourcesConfig = fs.readFileSync(dataSourceConfigPath);
        dataSourcesConfig = JSON.parse(dataSourcesConfig);   
        return dataSourcesConfig;
    };

    _loadDataSources = function(dataSources, callback){
        var loadFunctionArray = [];
        //console.log(callback);
        if(dataSources.length > 1){
            for(var i=0; i < dataSources.length; i++) {
                var source = function(){
                    var dataSourceConfig = dataSources[i];

                    var lds = function(cb) {
                        loadDataSource(dataSourceConfig, function(data){
                            cb(null, data);
                        });
                    };
                    return lds;
                }();
                keys.push(dataSources[i].key);
                loadFunctionArray.push(source);
            }

            async.parallel(loadFunctionArray, function(err, results){
                //Results is an array of arrays of data from each source
                
                var merged = _merge(results);
                
                callback(merged);
            });

        }


    };

    var _mergetwo = function(data1, data2){
        var merged = [];
        for(var i=0; i<data1.length; i++){
            var row1 = data1[i];
            for(var j=0; j<data2.length; j++){
                var row2 = data2[j];
                if(row1[keys[0]] == row2[keys[0]]){
                    var rowM = extend({}, row1, row2);
                        merged.push(rowM);
                }
            }
        }
        var flat = [];
        merged = merged.concat.apply(flat, merged);
        return merged;
    };
    var _merge = function(results){
            console.log(results.length)
            if(results.length == 1){
                return results;
            } else if(results.length == 2){
                return _mergetwo(results[0],results[1])
            } else {
                //merge first 2
                var m2 = _mergetwo(results[0], results[1])
                results.shift(2);
                results = results.push(m2);
                _merge(results)
            }
            /*
            var merged = results.map(function(data, id){

                if(id < results.length-1){
                    return _mergetwo(results[id], results[id+1]);
                }
            });
            merged = merged.filter(function(n){ return n !== undefined }); 
            */
            return merged[0];
    };

    var _loadData = function(callback){
        //Load data from sources
        if(dataSources.length > 1){
            _loadDataSources(dataSources, callback);    
        }
        else {
            loadDataSource(dataSources[0], function(data){
                callback(data);
            });
                 
        }
        //Merge them
        //_mergeDataSources(dataSources);


        //loadDataSource(dataSources, callback);

    };

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
    };
})();

module.exports = dataSource;

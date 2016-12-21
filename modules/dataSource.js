//JSON Schema validation
var Validator = require('jsonschema').Validator;
var schemaValidator = new Validator();
var fs = require("fs");
//var loadDataSource = require("./loadDataSource");
var async = require("async");
var extend = require("extend");

 var anyToJSON = require("anytojson");

var FILETYPES = {
  "CSVFILE": "csvFile",
  "JSONFILE": "jsonFile",
  "CSVREST": "csvREST",
  "JSONREST": "jsonREST"
}



var dataSource = (function(){
    var dataSourceConfig = {},
        dataSources = [],
        source = {},
        dataSourceConfigPath = "config/dataSource.json",
        _init,
        _loadDataSourceConfig,
        attributes = {},
        dataSourceSchema,
        validation,
        totalRecordsSize = {},
        DATA = {},
        keys = [];


    var DATASOURCEALIAS = "dataSourceAlias",
    	JOINKEY = "joinKey",
    	DATASOURCES = "dataSources",
    	DATAATTRIBUTES = "dataAttributes";

	//#### loadData()
	//Loads data using the type and path specified in ```public/config/dataSource.json```.
	//Currently supports
	// * JSON
	// * CSV
	// * REST JSON
	// * REST CSV
	// * ODBC
	//
	//The system can be extended to support more types using ```loadDataSources.js```
	function loadData(dataSource, processData)
	{


	    var type=  dataSource.sourceType;
	    var options = dataSource.options;

        var JSONStream = require('JSONStream');
        var es = require('event-stream');
        /*
        fileStream = fs.createReadStream(filePath, {encoding: 'utf-8'});
        fileStream.pipe(JSONStream.parse('*')).pipe(es.through(function(data){
          console.log(data);
        },function end(){
          console.log("end")
          this.emit('end')
        }));
        function processOneCustomer(data, es){
          
        };
        */
        function json(options, callback){
          var path = options.path;
          var stream = JSONStream.parse('*');
          var fullData = [];
          var fileStream = fs.createReadStream(path, {encoding: 'utf-8'})
            .pipe(stream);
          stream.on('data', function(data){
            fullData.push(data);
            //console.log(data);
          });
          stream.on('footer', function(){
            console.log('end');
            callback(fullData);
          });
        };
        /*
        function json(options, callback){
              console.log("json");
              console.log("....");
              var path = options.path;
              source.on("startObject", function(d){
                console.log(d);
              });
              source.on("end", function(){
                console.log("end");
                callback([]);
              
              callback([]);});
              fs.createReadStream(path).pipe(source.input);
              //Read the file using filepath
              /*
              fs.readFile(path, 'utf8', function(err, d){
                if(err){
                  console.log("Error: "+ err);
                  return;
                }
                data = JSON.parse(d);
                //console.log(data); 
                //Send data back to app.js
                callback(data);
              });
        
        }
        */


        
	    if(type== FILETYPES.JSONFILE){
          json(options, processData);
          //anyToJSON.json(options, processData);
	    } else if(type == FILETYPES.CSVFILE) {
	      anyToJSON.csv(options, processData);
	    } else if(type == FILETYPES.JSONREST) {
	      anyToJSON.restJSON(options, processData);
	    } else if (type == FILETYPES.CSVREST){
	      anyToJSON.restCSV(options, processData);
	    } else if (type == "odbc") {
	      anyToJSON.odbc(options, processData);
	    }
        
	}
	//### _init()
	//Returns an array of dataSources
    _init = function (){
        dataSources = [];
        for(var i in dataSourcesConfig[DATASOURCES]){
          source = dataSourcesConfig[DATASOURCES][i];
          dataSources.push(source);

          for(var j in source["dataAttributes"]){

            attribute = source["dataAttributes"][j];
            attributes[attribute] = true;
          }

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

        if(dataSources.length > 1){
            for(var i=0; i < dataSources.length; i++) {
                var source = function(){
                    var dataSourceConfig = dataSources[i];
                    //Callback function definition
                    var lds = function(cb) {
                        loadData(dataSourceConfig, function(data){

                            cb(null, data);
                        });
                    };
                    return lds;
                }();
                loadFunctionArray.push(source);
            }
            keys.push(dataSourcesConfig["joinKey"]);
            async.parallel(loadFunctionArray, function(err, results){


                //Results is an array of arrays of data from each source

                var merged = _merge(results);
                var count=0;
                for(var i in merged){
                    var row = merged[i];
                	for(var attr in row){
                		//console.log(attr)
                		flag = false;
                		var x = attributes[attr]
                		if(x === undefined){
                			//delete row[attr];
                		}
                	}
                	merged[i] = row;
                    count++;
                	//console.log(row)
                }
                totalRecordsSize[_getDataSourceName()] = count;
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

            return merged[0];
    };

    var _loadData = function(callback){
        //Load data from sources
        if(dataSources.length > 1){
            _loadDataSources(dataSources, callback);
        }
        else {
            loadData(dataSources[0], function(data){

                var count=0;
                for(var i in data){
                    var row = data[i];

                    for(var attr in row){
                        flag = false;
                        var x = attributes[attr]
                        if(x === undefined){
                            //delete row[attr]
                        }
                    }
                    data[i] = row
                    count++;
                }
                totalRecordsSize[_getDataSourceName()] = count;
                callback(_getDataSourceName(), data);
            });
        }
    };

    var _getDataSourceName = function() {
        return dataSourcesConfig["dataSourceName"] || "main";
    };

    return{
        loadDataSourceConfig: _loadDataSourceConfig,
        getDataSourceName: _getDataSourceName,
        init: function(path){
            _loadDataSourceConfig(path);
            var sources = _init();
            return sources;
        },
        getAttributes: function(){
            return attributes;
        },
        validate: function(){
            dataSourceSchema = JSON.parse(fs.readFileSync("./schemas/dataSourceSchema.json"));
            validation = schemaValidator.validate(dataSourceConfig, dataSourceSchema);
        },
        getTotalRecords: function(dataSourceName) {
            //console.log(totalRecordsSize)
            return totalRecordsSize[dataSourceName];
        },
        //loadData: _loadData,
        loadData: _loadData
    };
})();

module.exports = dataSource;

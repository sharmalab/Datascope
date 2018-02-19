//JSON Schema validation
var Validator = require('jsonschema').Validator;
var schemaValidator = new Validator();
var fs = require("fs");
//var loadDataSource = require("./loadDataSource");
var async = require("async");
var extend = require("extend");

var anyToJSON = require("anytojson");
var superagent = require("superagent");

var plywood = require('plywood');
var ply = plywood.ply;
var $ = plywood.$;

var DruidLoader = require('./druidLoader');
var External = plywood.External;
var druidRequesterFactory = require('plywood-druid-requester').druidRequesterFactory;



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
	_isDruid = false,
        _druidSourceName, 
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
        var name = dataSource.sourceName;
        var options = dataSource.options;
        var JSONStream = require('JSONStream');
        var es = require('event-stream');

        function json(options, callback){
          var path = options.path;
          var stream = JSONStream.parse('*');
          var fullData = [];
          var fileStream = fs.createReadStream(path, {encoding: 'utf-8'})
            .pipe(stream);
          stream.on('data', function(data){
            fullData.push(data);

          });
          stream.on('footer', function(){
            callback(fullData);
          });
        };
        
        if(type== FILETYPES.JSONFILE){
          anyToJSON.json(options, processData);
          //anyToJSON.json(options, processData);
        } else if(type == FILETYPES.CSVFILE) {
          anyToJSON.csv(options, processData);
        } else if(type == FILETYPES.JSONREST) {
          anyToJSON.restJSON(options, processData);
        } else if (type == FILETYPES.CSVREST){
          anyToJSON.restCSV(options, processData);
        } else if (type == "odbc") {
          anyToJSON.odbc(options, processData);
        } else if(type == "druid") {
            _isDruid = true;
            _druidSourceName = name;
            _connectDruid(options);
            console.log("Running in druid mode🚀");
            //check if data is already loaded in druid  
            _dataSourceExistsInDruid(dataSource, function(){
              console.log("Loading data source name from druid: "+name);
              
              processData();             
            });


       }        
    }

    _dataSourceExistsInDruid = function(dataSource, callback){
      var sourceName = dataSource.sourceName;
      var url = "localhost:8082/druid/v2/datasources/"+sourceName+"s";

      superagent.get(url, function(err,res){
        console.log("response");

        var body = res.body;

        if(body.metrics){ // datasource exists
          console.log("Data source exists! Will use Datascope against existing datasource: "+sourceName);
        }else {
          //Load druid data here
          DruidLoader.loadData(dataSource);

        }
        callback();
      });
    };

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

    _connectDruid = function(options) {

      var druidRequester = druidRequesterFactory({
        host: options.host // Where ever your Druid may be
      });  


      var dataSet = External.fromJS({
        engine: 'druid', 
        source: options.source,
        context: {
          timeout: 1000 
        },
        allowSelectQueries: true
         
      });  
      
    }
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
                            flag = false;
                            var x = attributes[attr]
                            if(x === undefined){
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
    var _getIsDruid = function() {
      return _isDruid;
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
        getIsDruid: function() {
          return _isDruid;
        },
        getDruidSourceName: function(){
          return _druidSourceName;
        },
        connectDruid: _connectDruid,
	//druid: _isDruid, 
        //loadData: _loadData,
        loadData: _loadData
    };
})();

module.exports = dataSource;

var fs = require("fs");

//
//#### processDataSource()
//Reads data-source.json which provides information about the type, path and the attributes of the data.
//
var processDataSource = (function(){
  var dataSourceConfig,
    dataSources = [],
    attributes = {};

  function _loadDataSourceConfig (){
    dataSourcesConfig = fs.readFileSync("public/config/dataSource.json");
    dataSourcesConfig = JSON.parse(dataSourcesConfig);
  }
  function process(){
    _loadDataSourceConfig();
    for(var i in dataSourceConfig){
      var dataSource = dataSourceConfig[i];
      dataSources.push(dataSource);
      for(var j in dataSource.attributes){
        var attribute = dataSource.attributes[j];
        attributes[attribute] = true;
      }
    }
  }
  function getAttributes(){
    return attributes;
  }

  return {
    attributes: attributes,
    process: process,
    getAttributes: getAttributes
  }

})();

module.exports = processDataSource;

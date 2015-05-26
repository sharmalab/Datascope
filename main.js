//The application server
//All the filtering and data processing happens here.
//Processes the ```data-sources.json``` and ```data-description.json``` files


//Dependencies
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var rest = require('./routes/rest');
var http = require('http');
var path = require('path');
var assert = require('assert')
//var process = require('process')
var crossfilter = require("./crossfilter").crossfilter;
var fs = require('fs');
var async = require("async");

//App modules
var loadDataSource = require('./modules/loadDataSource');   //Module for loading various data formats
var processConfig  = require('./modules/processConfig');


var app = express();


// all environments
app.set('port', 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(express.cookieParser('S3CRE7'));
app.use(express.cookieSession());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));



var attributes = {};
//Stores all visual attributes from data-description.json
var visualAttributes = []; 
var visualization;
//Stores all filtering attributes from data-description.json
var filteringAttributes = [];

var dataSources = [];

//Crossfilter specific
// - **dimensions** stores an array of dimensions.
// - **groups** stores an array of groups.
// - **ndx** is the crossfilter object.
var dimensions = {};
var groups = {};
var ndx;

var filter = {};

console.log("starting");

var end = function(){};


//
//#### init()
//Initializtion function
//

function init(callback){

  console.log("init")
  processConfig.validate();
	processDataSource();
  var data = {};
  end = callback;
  loadDataSource(processConfig.dataSource, processData);

  //async.waterfall([loadDataSource(dataSources, processData), processVisualization(), visualizationFilters(), listen(end)])
/*
    processVisualization();
    visualizationFilters();
    listen();
    end();
*/
}




var processData = function(data){

  var data = data;

  console.log("processing...")
  for(var obj in data){
    var tuple = data[obj];
    for(var prop in tuple){
      if(attributes.hasOwnProperty(prop)){

      }else {
        delete tuple[prop]
      }
    }
  }
  console.log("data processes")
  processDataDescription(data);

  applyCrossfilter(data);
  
};



//
//#### processDataSource()
//Reads data-source.json which provides information about the type, path and the attributes of the data.
//
function processDataSource(){
  //Read the ```data-source.json``` file
  var dataSourcesConfig = fs.readFileSync("public/config/dataSource.json");
  dataSourcesConfig = JSON.parse(dataSourcesConfig);
  //For each data source in the ```data-source.json``` file add to the ```dataSources``` array
  console.log("processDataSource...")
  for(var dataSource in dataSourcesConfig){

    dataSources.push(dataSourcesConfig[dataSource]);
  
    for(var attributeIndex in dataSourcesConfig[dataSource].attributes){
      var a = dataSourcesConfig[dataSource].attributes[attributeIndex];
      attributes[a] = true;

    }
  }

}

function processVisualization(){
  visualization = fs.readFileSync("public/config/visualization.json");
  visualization = JSON.parse(visualization);
  console.log("visualization...")
  if(visualization.type == "dataTable"){

  }

}







//
//#### processDataDescription()
//Reads the backend schema and fills the ```visualAttributes``` and ```filteringAttributes``` 
//
function processDataDescription(data){
  var dataDescription = fs.readFileSync("public/config/dataDescription.json");
  dataDescription = JSON.parse(dataDescription);

  for(var attributeIndex in dataDescription){
    var attribute = dataDescription[attributeIndex];
    for(var typeIndex in attribute["attributeType"]){
      if(attribute["attributeType"][typeIndex] == "filtering"){
        filteringAttributes.push(attribute);
        attributes[attribute.name] = attribute;
      }
      else
        visualAttributes.push(attribute);
    }
  }

}




//
//#### applyCrossfilter()
//Applies crossfilter to all the ```dimensions``` and ```groups```
//
function applyCrossfilter(data){
  //apply crossfilter to the data
  console.log("crossfilter")
  ndx = crossfilter(data);
  for(var attr in filteringAttributes){

    var filteringAttribute = filteringAttributes[attr];
    //Create a crossfilter dimension on this attribute
    var dimension = {}
    if(filteringAttribute["datatype"] == "float"){
      dimension = ndx.dimension(function(d){
        //set binning parameter here
        return Math.round(d[filteringAttribute["name"]]*10)/10;
      });
    } else if(filteringAttribute["datatype"] == "integer"){
      dimension = ndx.dimension(function(d){
        return parseInt(d[filteringAttribute["name"]]);
      })
    } else {
      dimension = ndx.dimension(function(d){
        return d[filteringAttribute["name"]];
      });
    }

    dimensions[filteringAttribute["name"]] = dimension;

    group = dimension.group()
    groups[filteringAttribute["name"]] = group;
  }

  size = ndx.size(),
  all = ndx.groupAll();
  processVisualization();
  visualizationFilters();
  listen(end);
}

function bubbleChartFilters(){
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
}

function imageGridFilters(){
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


function visualizationFilters(){

	var visualizationType = visualization.type;
  switch(visualizationType){
		case "bubbleChart":
			bubbleChartFilters();
      break;
		case "imageGrid":
			imageGridFilters();
      break;
	}

}


//
// listen to the specified port for HTTP requests
//
function listen(){
  console.log("listening...")
  var port = app.settings["port"];
  app.listen(port,function() {
    console.log("listening to port "+port);

    end();
  })

}

var TABLE_STATE = 0;



//
//#### handleFilterRequest(request, response, next)
//Is fired on GET '/data' request. Performs filtering using the filtering information provided in the GET parameter:  ```filter```  
//
function handleFilterRequest(req,res,next) {
  
  filter = req.param("filter") ? JSON.parse(req.param("filter")) : {};
  //req.session["f"] = filter;
  // Loop through each dimension and check if user requested a filter

  // Assemble group results and and the maximum value for each group
  var results = {} 
  var filterDim;
  var filterRange=[];
  for(var key in filter){
    filterDim= key;
  }
  
  Object.keys(dimensions).forEach(function (dim) {

    if (filter[dim]) {
      //array
      if(filter[dim].length > 1){
        if(attributes[dim].datatype == "enum"){
          dimensions[dim].filterFunction(function(d){
            return filter[dim].indexOf(d) >= 0; 
          })
        }
        else{
          dimensions[dim].filterRange(filter[dim])
        }

      } else {

        dimensions[dim].filter(filter[dim][0])
      }
    } else {
      dimensions[dim].filterAll(null)
    }
  });
  Object.keys(groups).forEach(function(key) {
      results[key] = {values:groups[key].all(),top:groups[key].top(1)[0].value}
  })

  if(visualization.type == "imageGrid")
    results["visualization"] = {values:(dimensions["visualization"].top(100)),
      active:all.value(),
      size: size
    }
  else if(visualization.type == "dataTable"){
    TABLE_DATA = dimensions[filteringAttributes[0]["name"]].top(Infinity);
    results["table_data"] = {
      data:TABLE_DATA.slice(0,100),
      active: all.value(),
      state: TABLE_STATE,
      size: size
    }
  }
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end((JSON.stringify(results)))
}

app.use("/dataTable/next", function(req, res, next){
  var state = req.param("state") ? JSON.parse(req.param("state")) : {};
  var results = {}
  TABLE_DATA = dimensions[filteringAttributes[0]["name"]].top(Infinity);
  results["table_data"] = {
    data:TABLE_DATA.slice(state*100,state*100 +100),
    active: all.value(),
    state: state
  }
  res.writeHead(200, {'content-type': 'application/json'});
  res.end(JSON.stringify(results));
})


function handleState(req, res, next){
  res.writeHead(200, { 'content-type': 'application/json' });

}

// Listen for filtering requests on ```/data```
app.use("/data",handleFilterRequest);
app.use("/state", handleState);

// Change this to the static directory of the index.html file
app.get('/', routes.index);
app.get('/rest/json', rest.index);
app.get('/index2.html', routes.index2)
app.get('/index3.html', routes.index3)
app.get('/index4.html', routes.index4)
app.get('/test.html', routes.test)
app.get('/users', user.list);
  

exports.init = init;
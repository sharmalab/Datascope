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
var crossfilter = require("crossfilter");
var fs = require('fs');
var load_data_source = require('./modules/loadDataSources');   //Module for loading various data formats
var Validator = require('jsonschema').Validator;
var schemaValidator = new Validator();

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


//
//Stores all the data from various data soruces
//
var data="";

//Stores all visual attributes from data-description.json
var visual_attributes = []; 
var visualization;
//Stores all filtering attributes from data-description.json
var filtering_attributes = [];

var data_sources = [];

//Crossfilter specific
// - **dimensions** stores an array of dimensions.
// - **groups** stores an array of groups.
// - **ndx** is the crossfilter object.
var dimensions = {};
var groups = {};
var ndx;

var filter = {};

init();


//
//#### init()
//Initializtion function
//

function init(){
  schema_validation();
	process_data_source();
  process_visualization();
}

//
//### schema_validation()
//Validates all the configuration files against their
//
function schema_validation(){
  var dataDescription = JSON.parse(fs.readFileSync("public/config/dataDescription.json"));
  var interactiveFilters = JSON.parse(fs.readFileSync("public/config/interactiveFilters.json"));
  var dataSource = JSON.parse(fs.readFileSync("public/config/dataSource.json"));

  var dataDescriptionSchema = JSON.parse(fs.readFileSync("schemas/dataDescriptionSchema.json"));
  var interactiveFiltersSchema = JSON.parse(fs.readFileSync("schemas/interactiveFiltersSchema.json"));
  var dataSourceSchema = JSON.parse(fs.readFileSync("schemas/dataSourceSchema.json"));


  var res1 = schemaValidator.validate(dataSource, dataSourceSchema);
  console.log(res3);
  var res2 = schemaValidator.validate(dataDescription, dataDescriptionSchema);
  console.log(res1);
  var res3 = schemaValidator.validate(interactiveFilters, interactiveFiltersSchema);
  console.log(res2);
  if(res1.errors.length == 0){}
  else{
      console.log(res1.errors)
  }
  if(res2.errors.length == 0){}
  else 
    console.log(res2.errors)
  if(res3.errors.length == 0){}
  else
    console.log(res3.errors)

}

//
//#### process_data_source()
//Reads data-source.json which provides information about the type, path and the attributes of the data.
//
function process_data_source(){
  //Read the ```data-source.json``` file
  var data_source_schema = fs.readFileSync("public/config/dataSource.json");
  data_source_schema = JSON.parse(data_source_schema);
  //For each data source in the ```data-source.json``` file add to the ```data_sources``` array
  for(var data_source in data_source_schema){
    console.log(data_source_schema[data_source]);
    data_sources.push(data_source_schema[data_source]);
  }
  //**Todo** Join logic. Joining data from multiple data sources

  console.log(data_sources);
  load_data();

}

function process_visualization(){
  visualization = fs.readFileSync("public/config/visualization.json");
  visualization = JSON.parse(visualization);

  if(visualization.type == "dataTable"){

  }

}


//
//#### load_data()
//Loads data using the type and path specified in ```data-sources.json```.
//Currently supports
// * JSON
// * CSV
// * REST JSON
// * REST CSV
//
//The system can be extended to support more types using ```load_data_sources.js```
//
function load_data()
{
  for(var data_source in data_sources){
  
    var type=  data_sources[data_source].type;
    var options = data_sources[data_source].options;
    console.log(options);
    console.log(type);
    if(type== "json"){
      load_data_source.json(options, process_data);
    } else if(type == "csv") {
      load_data_source.csv(options, process_data);
    } else if(type == "rest/json") {
      load_data_source.rest_json(options, process_data);
    } else if (type == "rest/csv"){
      load_data_source.rest_json(options, process_data);
    }
  }

}


function process_data(){
        data = load_data_source.data;
        process_data_description();
}


//
//#### process_backend_schema()
//Reads the backend schema and fills the ```visual_attributes``` and ```filtering_attributes``` 
//
function process_data_description(){
  var dataDescription = fs.readFileSync("public/config/dataDescription.json");
  dataDescription = JSON.parse(dataDescription);

  for(var attribute_index in dataDescription){
    var attribute = dataDescription[attribute_index];
    console.log(attribute["attributeType"].length)
    for(var type_index in attribute["attributeType"]){
      if(attribute["attributeType"][type_index] == "filtering")
        filtering_attributes.push(attribute);
      else
        visual_attributes.push(attribute);
    }
  }

  apply_crossfilter();
}




//
//#### apply_crossfilter()
//Applies crossfilter to all the ```dimensions``` and ```groups```
//
function apply_crossfilter(){
  //apply crossfilter to the data
  ndx = crossfilter(data);

  for(var attr in filtering_attributes){

    var filtering_attribute = filtering_attributes[attr];
    //Create a crossfilter dimension on this attribute
    var dimension = ndx.dimension(function(d){
        return d[filtering_attribute["name"]]
    });
    dimensions[filtering_attribute["name"]] = dimension;

    group = dimension.group()
    groups[filtering_attribute["name"]] = group;
  }
  visualization_filters();


  size = ndx.size(),
  all = ndx.groupAll();

  listen();
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
      console.log(attribute.name)
      dimensions["visualization"] = ndx.dimension(function(d){
        return d[attribute.name];        
      });
    }

  }
  groups["visualization"] = dimensions["visualization"].group();
}


function visualization_filters(){
	var visualizationType = visualization.type;
	switch(visualizationType){
		case "bubbleChart":
			bubbleChartFilters();
		case "imageGrid":
			imageGridFilters();

	}

}


//
// listen to the specified port for HTTP requests
//
function listen(){

  var port = app.settings["port"];
  app.listen(port,function() {
    console.log("listening to port "+port)  
  })

}






//
//#### handle_filter_request(request, response, next)
//Is fired on GET '/data' request. Performs filtering using the filtering information provided in the GET parameter:  ```filter```  
//
function handle_filter_request(req,res,next) {
  
  filter = req.param("filter") ? JSON.parse(req.param("filter")) : {};
  req.session["f"] = filter;
  // Loop through each dimension and check if user requested a filter

  // Assemble group results and and the maximum value for each group
  var results = {} 
  var filter_dim;
  var filter_range=[];
  for(var key in filter){
    filter_dim= key;
  }
  
  Object.keys(dimensions).forEach(function (dim) {

    if (filter[dim]) {
    
      //If enumerated
      //todo fix for numerical enumerated types
      if(filter[dim].length > 1){
      	
        //if(typeof filter[dim][0] == "string"){
          /*
          dimensions[dim].filterFunction(
          function(d){
            for(var i=0; i<filter[dim].length; i++){
              var f = filter[dim][i];
              if(f == d ){
                return true;
              }
            }
            return false;  
          });
        */
        //} else {
        if(filter[dim].length > 2){
          dimensions[dim].filterFunction(
          function(d){
            for(var i=0; i<filter[dim].length; i++){
              var f = filter[dim][i];
              if(f == d ){
                return true;
              }
            }
            return false;  
          });
        }else{
          dimensions[dim].filter(filter[dim])
        }
      }
      else{
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
    results["visualization"] = {values:(dimensions["visualization"].top(100))}
  else if(visualization.type == "dataTable")
    results["table_data"] = {data:dimensions[filtering_attributes[0]["name"]].top(100)}
  
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end((JSON.stringify(results)))
}



function handle_state(req, res, next){
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end((JSON.stringify(req.session["f"])))
}

// Listen for filtering requests on ```/data```
app.use("/data",handle_filter_request);
app.use("/state", handle_state);

// Change this to the static directory of the index.html file
app.get('/', routes.index);
app.get('/rest/json', rest.index);
app.get('/index2.html', routes.index2)
app.get('/index3.html', routes.index3)
app.get('/index4.html', routes.index4)
app.get('/test.html', routes.test)
app.get('/users', user.list);
  
// Requires Express.js

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var crossfilter = require("./crossfilter.v1.min.js").crossfilter;
var fs = require('fs');
var d3 = require('d3');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));



var visual_attributes = [];
var filtering_attributes = [];

var data_sources = [];


function load_data()
{
  console.log("here ");
  console.log(data_sources)
  for(var data_source in data_sources){
    if(data_sources[data_source].type == "json"){
      var dataraw = fs.readFileSync(data_sources[data_source].path);
      data = JSON.parse(dataraw);
      console.log()
    } else if(type == "csv") {
      
      data = fs.readFileSync(data_sources[data_source].path).toString().replace(/\r/g,"").split("\n");
      //console.log(data)
      var header = data[0].split(",");
      data = data.slice(1).map(function(d){
        var line = {};
        d.split(",").forEach(function(d,i){
          line[header[i]] = d;
        });
        return line;
      });    

    }
  }
}

function process_data_source(){
  var data_source_schema = fs.readFileSync("public/data-source.json");
  data_source_schema = JSON.parse(data_source_schema);


  for(var data_source in data_source_schema){
    console.log(data_source_schema[data_source]);
    data_sources.push(data_source_schema[data_source]);
    //Join Logic?

  }

  console.log(data_sources);

  load_data();

}

var dimensions = {};
var groups = {};
var ndx;
function apply_crossfilter(){
  ndx = crossfilter(data);




  
  for(var attr in filtering_attributes){
    console.log(filtering_attributes[attr])
    dimension = ndx.dimension(function(d){return d[filtering_attributes[attr]]});
    dimensions[filtering_attributes[attr]] = dimension;
    group = dimension.group();
    groups[filtering_attributes[attr]] = group;
  }
    size = ndx.size(),
    all = ndx.groupAll(); 
}

function process_backend_schema(){
  //Read the schema
  var schema = fs.readFileSync("public/backend-schema.json");
  schema = JSON.parse(schema);
  //console.log(schema)
  for(var attribute in schema){
    console.log(attribute)
    if(schema[attribute]["visual-attribute"])
      visual_attributes.push(schema[attribute]["name"]);
    if(schema[attribute]["filtering-attribute"])
      filtering_attributes.push(schema[attribute]["name"]);
  }

  apply_crossfilter();

}


process_data_source();
process_backend_schema();




/*
var dataraw = fs.readFileSync("data/small-data.json");
//var dataraw = fs.readFileSync("250_data.json")
data = JSON.parse(dataraw)
*/


// Handle the AJAX requests
app.use("/data",function(req,res,next) {
  
  console.log("Getting /data")
  filter = req.param("filter") ? JSON.parse(req.param("filter")) : {}
  // Loop through each dimension and check if user requested a filter

  // Assemble group results and and the maximum value for each group
  var results = {} 
  var filter_dim;
  var filter_range=[];
  //console.log(filter[dim])
  for(var key in filter){
    filter_dim= key;
  }
  
  Object.keys(dimensions).forEach(function (dim) {
    if (filter[dim]) {
      console.log(filter[dim])
      dimensions[dim].filter(filter[dim])
    } else {
      dimensions[dim].filterAll(null)
    }
  })
  
  if(Object.keys(filter).length === 0){
      results["table_data"] = {data:dimensions["Ai"].top(100)}
  }
  else{
      //dimensions[filter_dim].filterRange(filter_range)
      results["table_data"] = {data:dimensions[filter_dim].top(100)}
  }
  Object.keys(groups).forEach(function(key) {
      results[key] = {values:groups[key].all(),top:groups[key].top(1)[0].value}
  })

  // Send back as json
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end((JSON.stringify(results)))
})

// Change this to the static directory of the index.html file
app.get('/', routes.index);
app.get('/index2.html', routes.index2)
app.get('/index3.html', routes.index3)
app.get('/index4.html', routes.index4)
app.get('/test.html', routes.test)
app.get('/users', user.list);

var port = process.env.PORT || 3000;
app.listen(port,function() {
  console.log("listening to port "+port)  
})

//The application server
//All the filtering and data processing happens here.
//Processes the ```data-sources.json``` and ```data-description.json``` files


//Dependencies
var express = require("express"),
    routes = require("./routes"),
    user = require("./routes/user"),
    rest = require("./routes/rest"),
    visualizationRoutes = require("./routes/visualizations"),
    process = require("process"),
    compress = require("compression")(),
    path = require("path");
    //assert = require("assert"),
    //crossfilter = require("./crossfilter").crossfilter,
    //fs = require("fs"),
    //async = require("async");

//App modules

var dataSource = require("./modules/dataSource"),
    dataDescription = require("./modules/dataDescription"),
    interactiveFilters = require("./modules/interactiveFilters"),
    visualization = require("./modules/visualization");
/*
var loadDataSource = require("./modules/loadDataSource"),   //Module for loading various data formats
  processConfig  = require("./modules/processConfig"),
  processDataSource = require("./modules/processDataSource"),
  processDataDescription = require("./modules/processDataDescription"),
  applyCrossfilter = require("./modules/applyCrossfilter");
*/
var app = express();

/*
var attributes = {};
//Stores all visual attributes from data-description.json
var visualAttributes = []; 
var visualization;
//Stores all filtering attributes from data-description.json
var filteringAttributes = [];

var dataSources = [];
*/
//var  end = function(){};


// all environments
app.set("port", process.env.PORT || 3001);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(express.favicon());
app.use(express.logger("dev"));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(compress);
app.use(express.cookieParser("S3CRE7"));
app.use(express.cookieSession());
app.use(app.router);
app.use(express.static(path.join(__dirname, "public")));






//
//#### init()
//Initializtion function
//

function init(callback){
    dataSource.init();
    dataDescription.init();
    interactiveFilters.init();
    visualization.init();

    dataSource.loadData(function(data){
        if(!data){
            console.log("Error! Couldn't fetch the data.");
            process.exit(1);
        }
        //console.log(data);
        console.log("Loaded Data");
        interactiveFilters.applyCrossfilter(data);
        visualization.applyCrossfilter();
        visualizationRoutes.heatInit();
        console.log("Initialized filters");
        listen(callback);
    });
}

//
// listen to the specified port for HTTP requests
//
function listen(callback){
    console.log("listening...");
    var port = app.settings["port"];
    app.listen(port,function() {
        console.log("listening to port "+port);
        callback();
    });

}


function handleState(req, res, next){
    res.writeHead(200, { "content-type": "application/json" });

}

// Listen for filtering requests on ```/data```
app.use("/data",routes.handleFilterRequest);
app.use("/populationInfo", routes.populationInfo);
app.use("/dataTable/next", routes.tableNext);
app.use("/state",  handleState);
app.use("/save", routes.save);
app.use("/heat", visualizationRoutes.heat);
app.use("/imageGrid/next", routes.imageGridNext);
app.use("/statistics", routes.getStatistics);

// Change this to the static directory of the index.html file
app.get("/", routes.index);
app.get("/rest/json", rest.index);
app.get("/users", user.list);
  

exports.init = init;

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
    path = require("path"),
    favicon = require("serve-favicon"),
    morgan = require("morgan"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    cookieParser = require("cookie-parser"),
    cookieSession = require("cookie-session");

//App modules

var dataSource = require("./modules/dataSource"),
    dataDescription = require("./modules/dataDescription"),
    interactiveFilters = require("./modules/interactiveFilters"),
    visualization = require("./modules/visualization");

var app = express();

// all environments
app.set("port", process.env.PORT || 3001);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
//app.use(favicon());
app.use(morgan("dev"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.use(methodOverride());
app.use(compress);
app.use(cookieParser("S3CRE7"));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
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

    dataSource.loadData(function(dataSourceName, data){
	console.log("isDuid: "+ dataSource.getIsDruid());
        console.log(dataSource);
        if(dataSource.getIsDruid()){

          //dataSource.connectDruid();
          console.log("Connected to druid!" );   
        } else  if(!data){
            console.log("Error! Couldn't fetch the data.");
            process.exit(1);
        } else {

        console.log("Loaded Data");


          interactiveFilters.applyCrossfilter(data, dataSourceName);
          visualization.applyCrossfilter(dataSourceName);
          visualizationRoutes.heatInit(dataSourceName);
          console.log("Initialized filters");

        }
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
app.use("/druid/tableNext", routes.druidTableNext);
app.use("/druid/populationInfo", routes.druidPopulationInfo);
app.use("/state",  handleState);
app.use("/save", routes.save);
app.use("/heat", visualizationRoutes.heat);
app.use("/imageGrid/next", routes.imageGridNext);
app.use("/statistics", routes.getStatistics);
app.use("/druid/filter", routes.handleDruidRequest);
app.post('/uploadDataSource', rest.postDataSource);
app.post('/uploadVisualization', rest.postVisualization);
app.post('/uploadInteractiveFilters', rest.postInteractiveFilters);

// Change this to the static directory of the index.html file
app.get("/", routes.index);
app.get("/rest/json", rest.index);
app.get("/users", user.list);

app.get("/config/dataDescription", rest.getDataDescriptionConfig);
app.get("/config/interactiveFilters", rest.getInteractiveFiltersConfig);
app.get("/config/visualization", rest.getVisualizationConfig);
app.get("/config/dashboard", rest.getDashboardConfig);

exports.init = init;

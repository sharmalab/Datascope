
/*
 * GET REST data
 */

var interactiveFilters 	= require("../modules/interactiveFilters"),
	dataSource 			= require("../modules/dataSource"),
	visualization       = require("../modules/visualization");

var fs = require('fs'),
	multer = require("multer");

exports.index = function(req, res){ 
	var dataraw = fs.readFileSync("data/small-data.json");
	data = JSON.parse(dataraw);
	res.writeHead(200, { 'content-type': 'application/json' });
	res.end((JSON.stringify(data)));
};

/*
    Route for getting the interactive filters configuration file.
*/
exports.getInteractiveFiltersConfig = function (req, res) {
	var file = fs.readFileSync("config/interactiveFilters.json");
	data = JSON.parse(file);
	res.writeHead(200, { 'content-type': 'application/json' });
	res.end((JSON.stringify(data)));
}

/*
    Route for returning the visualizations configuration file.
*/
exports.getVisualizationConfig = function (req, res) {
	var file = fs.readFileSync("config/visualization.json");
	data = JSON.parse(file);
	res.writeHead(200, { 'content-type': 'application/json' });
	res.end((JSON.stringify(data)));
}

/*
    Route for returning the dashboard configuration file.
*/
exports.getDashboardConfig = function (req, res) {
	var file = fs.readFileSync("config/dashboard.json");
	data = JSON.parse(file);
	res.writeHead(200, { 'content-type': 'application/json' });
	res.end((JSON.stringify(data)));
}

/*
    Route for posting a new data source configuration file.
    It uploads the new file in '/config' folder and then creates a new dashboard endpoint using the new dataset.
*/
exports.postDataSource = function (req, res) {
    var fileName;
    var storage = multer.diskStorage({
        destination: function (request, file, callback) {
            callback(null, './config');
        },
        filename: function (request, file, callback) {
            fileName = file.originalname;
            callback(null, file.originalname)
        }
    });

    var upload = multer({storage: storage}).single('file');

    upload(req, res, function(err) {
        if(err) {
            res.status(500).send('Error uploading.');
        }

        _loadNewDataSource(fileName);

        res.status(200).send('Your File Uploaded.');
    });
};

/*
    Helper function for posting a new data source configuration file.
    It loads the new dataset and then creates a new dashboard endpoint using it.
*/
var _loadNewDataSource = function (fileName) {
    dataSource.init("config/" + fileName);
    var dataSourceName = dataSource.getDataSourceName();

    dataSource.loadData(function (dataSourceName, data){
        if (!data) {
            console.log("Error! Couldn't fetch the data.");
            process.exit(1);
        }

        interactiveFilters.applyCrossfilter(data, dataSourceName);
        visualization.applyCrossfilter(dataSourceName);
        //visualizationRoutes.heatInit(dataSourceName);
        console.log("Loaded new data source config file.");
    });
}

/*
    Route for posting a new visualizations configuration file.
    It uploads the new file in the '/congfig' folder. When the user will reload its browser, he will get the new
    visualizations.
*/
exports.postVisualization = function (req, res) {
    var storage = multer.diskStorage({
        destination: function (request, file, callback) {
            callback(null, './config');
        },
        filename: function (request, file, callback) {
            fileName = file.originalname;
            callback(null, "visualization.json")
        }
    });

    var upload = multer({storage: storage}).single('file');

    upload(req, res, function(err) {
        if(err) {
            res.status(500).send('Error uploading.');
        }

        visualization.init();

        var allDataSources = interactiveFilters.getAllDataSources();
		for (var i in allDataSources) {
			var dataSourceName = allDataSources[i];
			visualization.applyCrossfilter(dataSourceName);
        }

        console.log("Loaded new visualization config file.");
        res.status(200).send('Your File Uploaded.');
    });
}

/*
    Route for posting a new interactive filters configuration file.
    It uploads the new file in the '/congfig' folder. When the user will reload its browser, he will get the new
    interactive filters.
*/
exports.postInteractiveFilters = function (req, res) {
	var storage = multer.diskStorage({
        destination: function (request, file, callback) {
            callback(null, './config');
        },
        filename: function (request, file, callback) {
            fileName = file.originalname;
            callback(null, "interactiveFilters.json")
        }
    });

    var upload = multer({storage: storage}).single('file');

    upload(req, res, function(err) {
        if(err) {
            res.status(500).send('Error uploading.');
        }

        interactiveFilters.init();
		visualization.init();

		var allDataSources = interactiveFilters.getAllDataSources();
		for (var i in allDataSources) {
			var dataSourceName = allDataSources[i];
			interactiveFilters.applyCrossfilter(null, dataSourceName);
			visualization.applyCrossfilter(dataSourceName);
		}

		console.log("Loaded new interactive filters config file.");
		res.status(200).send('Your File Uploaded.');
	});
}

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

exports.getInteractiveFiltersConfig = function (req, res) {
	var file = fs.readFileSync("config/interactiveFilters.json");
	data = JSON.parse(file);
	res.writeHead(200, { 'content-type': 'application/json' });
	res.end((JSON.stringify(data)));
}

exports.getVisualizationConfig = function (req, res) {
	var file = fs.readFileSync("config/visualization.json");
	data = JSON.parse(file);
	res.writeHead(200, { 'content-type': 'application/json' });
	res.end((JSON.stringify(data)));
}

exports.getDashboardConfig = function (req, res) {
	var file = fs.readFileSync("config/dashboard.json");
	data = JSON.parse(file);
	res.writeHead(200, { 'content-type': 'application/json' });
	res.end((JSON.stringify(data)));
}

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

/*
 * GET REST data
 */

var fs = require('fs');

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

/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var crossfilter = require("./crossfilter.v1.min.js").crossfilter;
var fs = require('fs');

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

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Handle the AJAX requests
app.use("/data",function(req,res,next) {
	//Lets read the file
	var importStream = fs.createReadStream("small-data.json", {flags: 'r', encoding:'utf-8'});

	//Initialize crossfilter
	var ndx = crossfilter([]);
	var data='';

	importStream.on('data', function(chunk){
		data+=chunk
	});
		
	importStream.on('end', function(item){
		data = JSON.parse(data);
		ndx = crossfilter(data);
		console.log("Done!");

		var dimensions = {
			id: ndx.dimension(function (d) {return d.id}),
			age: ndx.dimension(function (d) {return d.age }),
			gender: ndx.dimension(function (d){return d.gender}),
			isActive: ndx.dimension(function (d){return d.isActive}),
			Ai: ndx.dimension(function (d) {return d.Ai}),
			Bi: ndx.dimension(function (d) {return d.Bi}),
			Ci: ndx.dimension(function (d) {return d.Ci}),
			Di: ndx.dimension(function (d) {return d.Di}),
			Eb: ndx.dimension(function (d) {return d.Eb}),
			Ff: ndx.dimension(function (d) {return d.Ff}),
			Gf: ndx.dimension(function (d) {return d.Gf})
		};

		var groups = {
			id: dimensions.id.group(),
			age: dimensions.age.group(),
			gender: dimensions.gender.group(),
			isActive: dimensions.isActive.group(),
			Ai: dimensions.Ai.group(),
			Bi: dimensions.Bi.group(),
			Ci: dimensions.Ci.group(),
			Di: dimensions.Di.group(),
			Eb: dimensions.Eb.group(),
			Ff: dimensions.Ff.group(),
			Gf: dimensions.Gf.group()
		};


		filter = req.param("filter") ? JSON.parse(req.param("filter")) : {}
		// Loop through each dimension and check if user requested a filter
		Object.keys(dimensions).forEach(function(dim) {
			if (filter[dim]) {
				dimensions[dim].filterAll()
			}
		})

		// Assemble group results and and the maximum value for each group
		var results = {}
		Object.keys(groups).forEach(function(key) {
			results[key] = {values:groups[key].all(),top:groups[key].top(1)[0].value}
		})

		// Send back as json
		res.writeHead(200, { 'content-type': 'application/json' });
		res.end((JSON.stringify(results)))
	});

})
app.get('/', routes.index);
app.get('/index2.html', routes.index2)
app.get('/index3.html', routes.index3)
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

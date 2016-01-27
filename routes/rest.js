
/*
 * GET REST data
 */

var fs = require('fs');

exports.index = function(req, res){ 
	var dataraw = fs.readFileSync("data/small-data.json");
    data = JSON.parse(dataraw);
  	res.writeHead(200, { 'content-type': 'application/json' });
  	res.end((JSON.stringify(data)))
};
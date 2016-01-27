
var interactiveFilters = require("../modules/interactiveFilters"),
    dataDescription = require("../modules/dataDescription"),
    visualization = require("../modules/visualization"),
    json2csv = require("json2csv");
var ndx, dimension, group;
var _heatInit = function(req, res){
      ndx = interactiveFilters.getndx();
      //console.log(ndx)
      xAttr = "AgeatInitialDiagnosis";
      yAttr = "KarnofskyScore";

      dimension = ndx.dimension(function(d) {
        return ([+d[xAttr]*1, +d[yAttr]*1]);
      });
      group = dimension.group(); 
}

var _heat = function(req, res){
    var results = {visualization: {values:group.all(),top:group.top(1)[0].value}};
    console.log(results);
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end((JSON.stringify(results)));
}
exports.heatInit = _heatInit;
exports.heat = _heat;
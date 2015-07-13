
/*
 * GET home page.
 */

var interactiveFilters = require("../modules/interactiveFilters"),
    dataDescription = require("../modules/dataDescription"),
    visualization = require("../modules/visualization"),
    json2csv = require("json2csv");
var TABLE_STATE = 0;



//
//#### handleFilterRequest(request, response, next)
//Is fired on GET '/data' request. Performs filtering using the filtering information provided in the GET parameter:  ```filter```  
//
var _handleFilterRequest = function(req,res,next) {
  var dimensions = interactiveFilters.getDimensions();
  var groups = interactiveFilters.getGroups();
  var filteringAttributes = dataDescription.getFilteringAttributes();
  filter = req.param("filter") ? JSON.parse(req.param("filter")) : {};
  //req.session["f"] = filter;
  // Loop through each dimension and check if user requested a filter

  // Assemble group results and and the maximum value for each group
  var results = {} 
  var filterDim;
  var filterRange=[];
  for(var key in filter){
    filterDim= key;
  }
  
  Object.keys(dimensions).forEach(function (dim) {

    if (filter[dim]) {
      //array
      if(filter[dim].length > 1){
        if(dataDescription.getDataType(dim) == "enum"){

          dimensions[dim].filterFunction(function(d){
            return filter[dim].indexOf(d) >= 0; 
          })
        }
        else{
          dimensions[dim].filterRange(filter[dim])
        }

      } else {

        dimensions[dim].filter(filter[dim][0])
      }
    } else {
      dimensions[dim].filterAll(null)
    }
  });
  Object.keys(groups).forEach(function(key) {
      results[key] = {values:groups[key].all(),top:groups[key].top(1)[0].value}
  })
  //console.log(visualization.getVisualizationType())

  //if(visualization.getVisualizationType() == "imageGrid"){
    //console.log(dimensions["imageGrid"].top(100))
    results["imageGrid"] = {values:(dimensions["imageGrid"].top(100)),
      active:all.value(),
      size: size
    }

  //}

  if(visualization.getVisualizationType() == "dataTable"){
    TABLE_DATA = dimensions[filteringAttributes[0]["name"]].top(Infinity);
    results["table_data"] = {
      data:TABLE_DATA.slice(0,100),
      active: all.value(),
      state: TABLE_STATE,
      size: size
    }
  }

  res.writeHead(200, { 'content-type': 'application/json' });
  res.end((JSON.stringify(results)))
}

var _imageGridNext = function(req, res, next){
  var dimensions = interactiveFilters.getDimensions(),
    groups = interactiveFilters.getGroups(),
    filteringAttributes = dataDescription.getFilteringAttributes(),
    state = req.param("state") ? JSON.parse(req.param("state")) : 1,
    results = {};
    imageGridData = dimensions["imageGrid"].top(Infinity);


  var state = req.query.state;
  var length = req.query.length || 100;
  var finalState = Math.floor(imageGridData.length/length);

  var start = state*length;
  results["imageGrid"] = {
    "values": imageGridData.slice(start, start+length),
    state: state,
    finalState: finalState
  };
  console.log(results)
  console.log(imageGridData.length)
  res.writeHead(200, {'content-type': 'application/json'});
  res.end(JSON.stringify(results));
}

var _tableNext = function(req, res, next){
  var dimensions = interactiveFilters.getDimensions(),
    groups = interactiveFilters.getGroups(),
    filteringAttributes = dataDescription.getFilteringAttributes(),
    state = req.param("state") ? JSON.parse(req.param("state")) : 1,
    results = {};
    TABLE_DATA = dimensions[filteringAttributes[0]["name"]].top(Infinity);
 
  
  var DATA_ARRAY = [];
  for(var i in TABLE_DATA){
    var row = Object.keys(TABLE_DATA[i]).map(function(k) { return TABLE_DATA[i][k] });
    DATA_ARRAY.push(row);
  }

  //var reqParams = iDisplayLength, iDisplayStart
  var start = req.query.start;
  var length = req.query.length;
  results = {
    data: DATA_ARRAY.slice(start,start +length),
    active: all.value(),
    state: state,
    draw: req.query.draw,
    recordsTotal: 372,      //FIX THIS!!!!!!!!!!!!!!!!!!!!!!!!!!!
    recordsFiltered: DATA_ARRAY.length
  }
  res.writeHead(200, {'content-type': 'application/json'});
  res.end(JSON.stringify(results));
};

var _save = function(req, res, next){

  var dimensions = interactiveFilters.getDimensions();
  var groups = interactiveFilters.getGroups();
  var filteringAttributes = dataDescription.getFilteringAttributes();


  var requiredAttributes = req.param("attributes") ? JSON.parse(req.param("attributes")) : {};
  
  requiredAttributes = requiredAttributes["list"]
  type = requiredAttributes["type"] || "csv"; 
  var results = {}
  TABLE_DATA = dimensions[filteringAttributes[0]["name"]].top(Infinity);
  
  if(type == "json"){
    res.writeHead(200,{'content-type': 'application/json'});
    var EXPORT_DATA = [];
    for(i in TABLE_DATA){
      var row = TABLE_DATA[i];
      EXPORT_DATA.push({})
      for(j in row){
        for(k in requiredAttributes["list"]){
          if(j == requiredAttributes["list"][k]){

            col = row[j];
            EXPORT_DATA[i][j] = row[j];
          }
        }
      }
    }

    res.end(JSON.stringify(EXPORT_DATA));
  }
  else if(type == "csv"){
    res.writeHead(200,{'content-type': 'text/csv'});

    json2csv({data: TABLE_DATA, fields: requiredAttributes}, function(err, csv){
      if(err){
        console.log(err);
      }

      res.end((csv));
    });

  }
  /*
  console.log(EXPORT_DATA)

  var attributes = Object.keys(TABLE_DATA[0])
  //console.log(attributes)
  */
}

var _heatInit = function(){
      var ndx = interactiveFilters.getndx();
      var dimension;
      var xAttr = "AgeatInitialDiagnosis";
      var yAttr = "KarnofskyScore";

      dimension = ndx.dimension(function(d){
        return ([+d[xAttr]*1, +d[yAttr]*1]);
      });
      var group = dimension.group(); 
}

var _heat = function(req, res){

      var results = {visualization: {values:group.all(),top:group.top(1)[0].value}};

    res.writeHead(200, { 'content-type': 'application/json' });
    res.end((JSON.stringify(results)))
}

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};
exports.handleFilterRequest = _handleFilterRequest;
exports.tableNext = _tableNext;
exports.imageGridNext = _imageGridNext;
exports.save = _save;

exports.index3 = function(req,res){
	res.render('index3')
}
exports.test = function(req,res){
	res.render('test')
}
exports.index4 = function(req,res){
	res.render('index4')
}
exports.heat = _heat;
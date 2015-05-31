
/*
 * GET home page.
 */

var interactiveFilters = require("../modules/interactiveFilters"),
    dataDescription = require("../modules/dataDescription"),
    visualization = require("../modules/visualization");
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
  if(visualization.getVisualizationType() == "imageGrid")
    results["visualization"] = {values:(dimensions["visualization"].top(100)),
      active:all.value(),
      size: size
    }
  else if(visualization.getVisualizationType() == "dataTable"){
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

var _tableNext = function(req, res, next){
  var dimensions = interactiveFilters.getDimensions();
  var groups = interactiveFilters.getGroups();
  var filteringAttributes = dataDescription.getFilteringAttributes();
  var state = req.param("state") ? JSON.parse(req.param("state")) : {};
  var results = {}
  TABLE_DATA = dimensions[filteringAttributes[0]["name"]].top(Infinity);
  results["table_data"] = {
    data:TABLE_DATA.slice(state*100,state*100 +100),
    active: all.value(),
    state: state
  }
  res.writeHead(200, {'content-type': 'application/json'});
  res.end(JSON.stringify(results));
};


exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};
exports.handleFilterRequest = _handleFilterRequest;
exports.tableNext = _tableNext;

exports.index3 = function(req,res){
	res.render('index3')
}
exports.test = function(req,res){
	res.render('test')
}
exports.index4 = function(req,res){
	res.render('index4')
}
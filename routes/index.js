var interactiveFilters = require("../modules/interactiveFilters"),
    dataSource          = require("../modules/dataSource"),
    dataDescription     = require("../modules/dataDescription"),
    visualization       = require("../modules/visualization"),
    customStatistics    = require("../modules/customStatistics"),
    json2csv = require("json2csv");

//var TABLE_STATE = 0;

// Load datalib.
var dl = require('datalib');

var CURRENTDATA = {};


var _containsTwoDimensional = function (f, d) {
    var fromBottomLeft;

    if(f[0] instanceof Array) {
        fromBottomLeft = [
            [Math.min(f[0][0], f[1][0]), Math.min(f[0][1], f[1][1])],
            [Math.max(f[0][0], f[1][0]), Math.max(f[0][1], f[1][1])]
        ];
    } else {
        fromBottomLeft = [[filter[0], -Infinity], [filter[1], Infinity]];
    }

    var x = d[0];
    var y = d[1];

    return x >= fromBottomLeft[0][0] && x < fromBottomLeft[1][0] && y >= fromBottomLeft[0][1] && y < fromBottomLeft[1][1];
};

var _containsMarker = function (f, d) {
    var fSouthWest=f._southWest,fNorthEast=f._northEast;
    var dLatLng = d.split(",");
    var dLat = dLatLng[0], dLng = dLatLng[1];

    return dLat >= fSouthWest.lat
        && dLat <= fNorthEast.lat
        && dLng >= fSouthWest.lng
        && dLng <= fNorthEast.lng;
}

var _filterFunction = function(filter, dataSourceName){
    var dimensions = interactiveFilters.getDimensions(dataSourceName);
    var groups = interactiveFilters.getGroups(dataSourceName);

    var results = {};

    Object.keys(dimensions).forEach(function (dim) {

        if (filter[dim]) {
            if(filter[dim].type) {
                var f = filter[dim].filters[0];
                if (filter[dim].type === "marker") {
                    dimensions[dim].filterFunction(function (d) {
                        return _containsMarker (f, d);
                    });
                }
                else {
                    dimensions[dim].filterFunction(function (d) {
                        return _containsTwoDimensional (f, d);
                    });
                }
            }
            else {
                //array
                if (filter[dim].length > 1) {
                    if (dataDescription.getDataType(dim) == "enum") {
                        dimensions[dim].filterFunction(function(d) {
                            return filter[dim].indexOf(d) >= 0; 
                        });
                    }
                    else {
                        dimensions[dim].filterRange(filter[dim]);
                    }

                } else {
                    dimensions[dim].filter(filter[dim][0]);
                }
            }
        } else {
            dimensions[dim].filterAll(null);
        }
    });

    Object.keys(groups).forEach(function(key) {
        results[key] = {values:groups[key].all(),top:groups[key].top(1)[0].value};
    });
    var interactiveFiltersConfig = interactiveFilters.getInteractiveFiltersConfig();
    var filteredData = dimensions[interactiveFiltersConfig[0]["attributeName"]].top(Infinity);

    if(visualization.hasVisualization("imageGrid")){

        CURRENTDATA = dimensions[interactiveFiltersConfig[0]["attributeName"]].top(100);

        var reqLength = 100;
        var paginate = true;
        if(CURRENTDATA.length < reqLength)
            paginate = false;
        //console.log(CURRENTDATA);
        results["imageGrid"] = {
            values: CURRENTDATA.slice(0,500),
            active: 100,
            size: 100,
            state: Math.floor(reqLength/100),
            paginate: paginate,
            finalState: Math.floor(CURRENTDATA.length/reqLength)
        };
    }

    return {
        results: results,
        filteredData: filteredData
    };
};

//
//#### handleFilterRequest(request, response, next)
//Is fired on GET "/data" request. Performs filtering using the filtering information provided in the GET parameter:    ```filter```    
//
//

/**
 * @api {get} data Request binned aggregated data
 * @apiGroup Datascope
 * @apiName GetData
 * @apiParam {String} filter Stringified JSON filter object
 * @apiParam {String} dataSourceName Use 'main' for default or specify dataSourceName
 * @apiSuccessExample Success-Response:
 * [{
 *   "Netflix": {
 *   "values": [{
 *     "key": "No",
 *     "value": 3013
 *   }, {
 *     "key": "Yes",
 *     "value": 188
 *  }],
 *   "top": 3013
 * }]
 */

var _handleFilterRequest = function(req,res) {

    var dataSourceName = req.query.dataSourceName;
    var filter = {};
    filter = req.query.filter ? JSON.parse(req.query.filter) : {};
    // Loop through each dimension and check if user requested a filter

    // Assemble group results and and the maximum value for each group
    var results = {};
    results = _filterFunction(filter, dataSourceName);
    res.writeHead(200, { "content-type": "application/json" });
    res.end((JSON.stringify(results.results)));
};



var _imageGridNext = function(req, res){
    var dataSourceName = req.query.dataSourceName;
    var dimensions = interactiveFilters.getDimensions(dataSourceName),
        results = {},
        imageGridData = dimensions["imageGrid"].top(Infinity);


    var state = req.query.state;
    var length = req.query.length || 100;
    var finalState = Math.floor(imageGridData.length/length);
    var paginate = true;
    if(imageGridData.length < length){
        paginate = false;
    }
    var start = state*length;
    results["imageGrid"] = {
        "values": imageGridData.slice(start, start+length),
        state: state,
        finalState: finalState,
        paginate: paginate
    };
    
    res.writeHead(200, {"content-type": "application/json"});
    res.end(JSON.stringify(results));
};


/**
 * @api {get} dataTable/next Request paginated data for datatable
 * @apiGroup dataTable
 * @apiName DataTableNext
 * @apiParam {String} dataSourceName Use 'main' for default or specify dataSourceName
 * @apiParam {Number} start
 * @apiParam {Number} number
 * @apiParam {Number} draw
 * @apiParam {Number} state
 */


var _tableNext = function(req, res){
    var dataSourceName = req.query.dataSourceName;

    var dimensions = interactiveFilters.getDimensions(dataSourceName),
        state = req.query.state ? JSON.parse(req.query.state) : 1,
        results = {};
    var interactiveFiltersConfig = interactiveFilters.getInteractiveFiltersConfig();
    var start = 1*req.query.start;

    var TABLE_DATA = dimensions[interactiveFiltersConfig[0]["attributeName"]].top(10,start);
    ///console.log(TABLE_DATA);
    //console.log(state);
    var dataTableAttributes = visualization.getAttributes("dataTable");
    //var dataTableAttributes = [];

    for( i in req.query.columns){
      dataTableAttributes.push(req.query.columns[i].name);
    }
   
    /* if the query contains a value to be searched,
        then filter the rows that don't contain the value

    var searchValue = req.query.search.value;
    if (searchValue) {
        dimensions[interactiveFiltersConfig[0]["attributeName"]].filter(function(d){
          console.log(d);
          return d.toString().match(searchValue);
        });
        /*
        TABLE_DATA = TABLE_DATA.filter(function (row) {
            for (key in row) {
                if (row[key].toString().match(searchValue))
                    return true;
            }
            return false;
        })


    }
    */
    /* perform sorting of columns */
    /*
    var order = req.query.order;

    if(order) {

        var sortColumnI = order[0].column;
        var sortDir = order[0].dir;

        var sortColumn = dataTableAttributes[sortColumnI].attributeName;

    
        TABLE_DATA.sort(function(a,b){
            var strcol1 = ""+a[sortColumn];
            var strcol2 = ""+b[sortColumn];
            var comparison;           
            if(sortDir == "asc"){
                comparison = (strcol1.localeCompare(strcol2));
            } else {
                comparison = (strcol2.localeCompare(strcol1));
            }

            return comparison;
            //return 
            //return 1;
            
        });
        
    }
    */
    var len = TABLE_DATA.length;

    var length = 1*req.query.length;
    var end = start+length;

    var DATA_ARRAY = [];
    TABLE_DATA = dimensions[interactiveFiltersConfig[0]["attributeName"]].top(10,start);   
    //console.log(dataTableAttributes); 
    for(var i in TABLE_DATA){
        var row = [];
        for(var j in dataTableAttributes){
            var attrName = dataTableAttributes[j]["attributeName"];
            row.push(TABLE_DATA[i][attrName]);
        }

        DATA_ARRAY.push(row);
    }
    
    //DATA_ARRAY = TABLE_DATA;

    var all = {};
    all.value = function(){return 0;};
    results = {
        data: DATA_ARRAY,
        active: all.value(),
        state: state,
        draw: req.query.draw,
        recordsTotal: dataSource.getTotalRecords(dataSourceName),
        recordsFiltered: dimensions[interactiveFiltersConfig[0]["attributeName"]].top(Infinity).length
    };
    res.writeHead(200, {"content-type": "application/json"});
    res.end(JSON.stringify(results));
};

/**
 * @api {get} save Request complete filtered data in JSON format
 * @apiGroup Datascope
 * @apiName Save
 * @apiParam {String} filter Stringified JSON filter object 
 */

var _save = function(req, res) {

    var filter = req.query.filter ? JSON.parse(req.query.filter) : {};

    var result = _filterFunction(filter, "main");
    var filteredData = result.filteredData;
    json2csv({data: filteredData}, function(err, csv){
      res.attachment('cohort.csv');
      res.writeHead(200, {"content-type": "test/csv"});
      res.end(csv);
    });
};

/**
 * @api {get} populationInfo Request global population info
 * @apiGroup Datascope
 * @apiName PopulationInfo
 * @apiParam {String} filter Stringified JSON filter object 
 * @apiParam {String} dataSourceName name of the datasource
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "Current": 371,
 *      "Total": 3201
 *  }
 */

var _populationInfo = function(req, res, next){
    var filter = req.query.filter ? JSON.parse(req.query.filter) : {},
        dataSourceName = req.query.dataSourceName;

    var result = _filterFunction(filter, dataSourceName);
    var filteredData = result.filteredData;
    var filteredLength = filteredData.length;
    var originalLength = dataSource.getTotalRecords(dataSourceName);

    return res.json({"Current": filteredLength, "Total": originalLength});
};

/*
    Function that gets called when the user requires one or more one dimensional statistic for an attribute or
    one or more two dimensional statistcs for two attributes.
    It uses datalib for usual statistics (mean, median, count, etc.) and custom statistics defined in
    'customStatistics.js' file.
*/


/**
 * @api {get} statistics Request statistics associated with an attribute
 * @apiGroup Datascope
 * @apiName Statistics
 * @apiParam {String} attr Name of the attribute
 * @apiParam {String} dataSourceName name of the datasource
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
 *  {
    "count": 371,
	"distinct": 16,
	"min": 7.7,
	"max": 9.2,
	"mean": 8.073854447439347,
	"median": 8,
	"stdev": 0.3217199896341025
 *  
 *  }
 */


var _getStatistics = function(req, res) {
    var attr = req.query.attr,
        dataSourceName = req.query.dataSourceName;

    var dimensions = interactiveFilters.getDimensions(dataSourceName),
        interactiveFiltersConfig = interactiveFilters.getInteractiveFiltersConfig();

    var TABLE_DATA = dimensions[interactiveFiltersConfig[0]["attributeName"]].top(Infinity);

    var statisticsToReturn = {};
    if (attr) {
        var statistics = interactiveFilters.getFilterConfig(attr).statistics;
        if (statistics) {
            var summary = dl.summary(TABLE_DATA, [attr])[0];

            if (statistics.constructor === String) {
                if (statistics == "default") {
                    if (summary["type"] == "number" ||
                            summary["type"] == "integer") {
                        statistics = ["count", "distinct", "min", "max", "mean", "median", "stdev"];
                    } else {
                        statistics = ["count", "distinct"];
                    }
                }
            }

            if (statistics.constructor === Array) {
                statistics.forEach(function(stat) {
                    if (stat.startsWith("custom")) {
                        var statName = stat.split("-")[1];
                        if (statName in global && typeof global[statName] === "function") {
                            var fn = global[statName];
                            statisticsToReturn[statName] = fn(TABLE_DATA, attr);
                        }
                    } else {
                        statisticsToReturn[stat] = summary[stat];
                    }
                })
            }
        }
    } else {
        var attr1 = req.query.attr1;
        var attr2 = req.query.attr2;
        if (attr1 && attr2) {
            var statistics = visualization.getStatistics("twoDimStat");
            if (statistics.constructor === String) {
                if (statistics == "default") {
                    statistics = ["correlation", "rankCorrelation", /*"distanceCorrelation",*/ "dotProduct",
                        "euclidianDistance", "covariance", "cohensd"];
                }
            }

            if (statistics.constructor === Array) {
                statistics.forEach(function(stat) {
                    if (stat.startsWith("custom")) {
                        var statName = stat.split("-")[1];
                        if (statName in global && typeof global[statName] === "function") {
                            var fn = global[statName];
                            statisticsToReturn[statName] = fn(TABLE_DATA, attr1, attr2);
                        }
                    } else if (stat === "correlation") {
                        // Pearson product-moment correlation
                        statisticsToReturn["correlation"] = dl.cor(TABLE_DATA, attr1, attr2);
                    } else if (stat === "rankCorrelation") {
                        // Spearman rank correlation of two arrays of values
                        statisticsToReturn["rankCorrelation"] = dl.cor.rank(TABLE_DATA, attr1, attr2);
                    } else if (stat === "distanceCorrelation") {
                        // Removed since is not working // distance correlation of two arrays of numbers
                        // statisticsToReturn["distanceCorrelation"] = dl.cor.dist(TABLE_DATA, attr1, attr2);
                    } else if (stat === "dotProduct") {
                        // vector dot product of two arrays of numbers
                        statisticsToReturn["dotProduct"] = dl.dot(TABLE_DATA, attr1, attr2);
                    } else if (stat === "euclidianDistance") {
                        //vector Euclidian distance between two arrays of numbers
                        statisticsToReturn["euclidianDistance"] = dl.dist(TABLE_DATA, attr1, attr2);
                    } else if (stat === "covariance") {
                        // covariance between two arrays of numbers
                        statisticsToReturn["covariance"] = dl.covariance(TABLE_DATA, attr1, attr2);
                    } else if (stat === "cohensd") {
                        // Cohen's d effect size between two arrays of numbers
                        statisticsToReturn["cohensd"] = dl.cohensd(TABLE_DATA, attr1, attr2);
                    }
                });
            }
        } else {
            statisticsToReturn = dl.summary(TABLE_DATA);
        }
    }

    res.writeHead(200, {"content-type": "application/json"});
    res.end(JSON.stringify(statisticsToReturn));
};

exports.index = function(req, res){
    res.render("index", { title: "Express" });
};
exports.populationInfo = _populationInfo;
exports.handleFilterRequest = _handleFilterRequest;
exports.tableNext = _tableNext;
exports.imageGridNext = _imageGridNext;
exports.save = _save;
exports.getStatistics = _getStatistics;

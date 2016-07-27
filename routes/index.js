
/*
 * GET home page.
 */

var interactiveFilters = require("../modules/interactiveFilters"),
    dataSource          = require("../modules/dataSource"),
    dataDescription     = require("../modules/dataDescription"),
    visualization       = require("../modules/visualization");

//var TABLE_STATE = 0;

 // Load datalib.
var dl = require('datalib'),
    multer = require("multer");

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
    var filteringAttributes = dataDescription.getFilteringAttributes();
    var filteredData = dimensions[filteringAttributes[0]["attributeName"]].top(Infinity);

    if(visualization.hasVisualization("imageGrid")){

        CUdataSourceNameRRENTDATA = dimensions[filteringAttributes[0]["attributeName"]].top(Infinity);

        var reqLength = 100;
        var paginate = true;
        if(CURRENTDATA.length < reqLength)
            paginate = false;

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
    //res.writeHead(200, { "content-type": "application/json" });
    //res.end((JSON.stringify(results)));
};

//
//#### handleFilterRequest(request, response, next)
//Is fired on GET "/data" request. Performs filtering using the filtering information provided in the GET parameter:    ```filter```    
//
var _handleFilterRequest = function(req,res) {

    var dataSourceName = req.query.dataSourceName;

    //var filteringAttributes = dataDescription.getFilteringAttributes();
    var filter = {};
    filter = req.query.filter ? JSON.parse(req.query.filter) : {};
    //req.session["f"] = filter;
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
        //groups = interactiveFilters.getGroups(),
        //filteringAttributes = dataDescription.getFilteringAttributes(),
        //state = req.param("state") ? JSON.parse(req.param("state")) : 1,
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

var _tableNext = function(req, res){
    var dataSourceName = req.query.dataSourceName;

    var dimensions = interactiveFilters.getDimensions(dataSourceName),
        filteringAttributes = dataDescription.getFilteringAttributes(),
        state = req.query.state ? JSON.parse(req.query.state) : 1,
        results = {};
    var TABLE_DATA = dimensions[filteringAttributes[0]["attributeName"]].top(Infinity);
    var dataTableAttributes = visualization.getAttributes("dataTable");

    /* if the query contains a value to be searched,
        then filter the rows that don't contain the value
    */
    var searchValue = req.query.search.value;
    if (searchValue) {
        TABLE_DATA = TABLE_DATA.filter(function (row) {
            for (key in row) {
                if (row[key].toString().match(searchValue))
                    return true;
            }
            return false;
        })
    }

    var len = TABLE_DATA.length;

    var start = 1*req.query.start;
    var length = 1*req.query.length;

    //console.log(start);
    //console.log(length);
    var end = start+length;
    //console.log(end);
    TABLE_DATA = TABLE_DATA.slice(start, start+length);
    //console.log(TABLE_DATA.length);
    var DATA_ARRAY = [];
    for(var i in TABLE_DATA){

        var row = [];
        for(var j in dataTableAttributes){
            var attrName = dataTableAttributes[j]["attributeName"];
            row.push(TABLE_DATA[i][attrName]);
        }

        DATA_ARRAY.push(row);
    }
    var all = {};
    all.value = function(){return 0;};
    results = {
        data: DATA_ARRAY,
        active: all.value(),
        state: state,
        draw: req.query.draw,
        recordsTotal: dataSource.getTotalRecords(dataSourceName),
        recordsFiltered: len
    };
    res.writeHead(200, {"content-type": "application/json"});
    res.end(JSON.stringify(results));
};

var _save = function(req, res){





    
    var filter = req.query.filter ? JSON.parse(req.query.filter) : {};

    //console.log(filter);
    var result = _filterFunction(filter);
    var filteredData = result.filteredData;
    res.writeHead(200, {"content-type": "application/json"});
    res.end(JSON.stringify(filteredData));



    /*
    var requiredAttributes = req.param("attributes") ? JSON.parse(req.param("attributes")) : {};
    var TABLE_DATA = dimensions[filteringAttributes[0]["attributeName"]].top(Infinity);
    if(requiredAttributes){
        console.log(typeof TABLE_DATA);
        res.writeHead(200, {"content-type": "application/json"});
        res.end(JSON.stringify(TABLE_DATA));
        return;
    } 
    requiredAttributes = requiredAttributes["list"];
    var type = requiredAttributes["type"] || "csv"; 
    var results = {};

    
    if(type == "json"){
        res.writeHead(200,{"content-type": "application/json"});
        var EXPORT_DATA = [];
        for(var i in TABLE_DATA){
            var row = TABLE_DATA[i];
            EXPORT_DATA.push({});
            for(var j in row){
                for(var k in requiredAttributes["list"]){
                    if(j == requiredAttributes["list"][k]){

                        //var col = row[j];
                        EXPORT_DATA[i][j] = row[j];
                    }
                }
            }
        }

        res.end(JSON.stringify(EXPORT_DATA));
    }
    else if(type == "csv"){
        res.writeHead(200,{"content-type": "text/csv"});

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
};
/*
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
*/
/*
var _heat = function(req, res){

    var results = {visualization: {values: group.all(),top: group.top(1)[0].value}};

    res.writeHead(200, {"content-type": "application/json" });
    res.end((JSON.stringify(results.re)));
};
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
var _getStatistics = function(req, res) {
    var attr = req.query.attr,
        dataSourceName = req.query.dataSourceName;

    var dimensions = interactiveFilters.getDimensions(dataSourceName),
        filteringAttributes = dataDescription.getFilteringAttributes();

    var TABLE_DATA = dimensions[filteringAttributes[0]["attributeName"]].top(Infinity);

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
                statistics.forEach(function(stat){
                    statisticsToReturn[stat] = summary[stat];
                })
            }
        }
    } else {
        var attr1 = req.query.attr1;
        var attr2 = req.query.attr2;
        if (attr1 && attr2) {
            // Pearson product-moment correlation
            statisticsToReturn["correlation"] = dl.cor(TABLE_DATA, attr1, attr2);
            // Spearman rank correlation of two arrays of values
            statisticsToReturn["rankCorrelation"] = dl.cor.rank(TABLE_DATA, attr1, attr2);
            // Removed since is not working // distance correlation of two arrays of numbers
            // statisticsToReturn["distanceCorrelation"] = dl.cor.dist(TABLE_DATA, attr1, attr2);
            // vector dot product of two arrays of numbers
            statisticsToReturn["dotProduct"] = dl.dot(TABLE_DATA, attr1, attr2);
            //vector Euclidian distance between two arrays of numbers
            statisticsToReturn["euclidianDistance"] = dl.dist(TABLE_DATA, attr1, attr2);
            // covariance between two arrays of numbers
            statisticsToReturn["covariance"] = dl.covariance(TABLE_DATA, attr1, attr2);
            // Cohen's d effect size between two arrays of numbers
            statisticsToReturn["cohensd"] = dl.cohensd(TABLE_DATA, attr1, attr2);
        } else {
            statisticsToReturn = dl.summary(TABLE_DATA);
        }
    }

    res.writeHead(200, {"content-type": "application/json"});
    res.end(JSON.stringify(statisticsToReturn));
};

var _postDataSource = function (req, res) {
    var dataSourceName;
    var storage = multer.diskStorage({
        destination: function (request, file, callback) {
            callback(null, './config');
        },
        filename: function (request, file, callback) {
            dataSourceName = file.originalname;
            callback(null, file.originalname)
        }
    });

    var upload = multer({storage: storage}).single('file');

    upload(req, res, function(err) {
        if(err) {
            res.status(500).send('Error uploading.');
        }

        _loadNewDataSource(dataSourceName);

        res.status(200).send('Your File Uploaded.');
    });
};

var _loadNewDataSource = function (dataSourceName) {
    console.log(dataSourceName);

    dataSource.init("config/" + dataSourceName);
    var dataSourceName = dataSource.getDataSourceName();

    dataSource.loadData(function (dataSourceName, data){
        if(!data) {
            console.log("Error! Couldn't fetch the data.");
            process.exit(1);
        }
        //console.log(data);
        console.log("Loaded New Data");
        interactiveFilters.applyCrossfilter(data, dataSourceName);
        visualization.applyCrossfilter(dataSourceName);
        //visualizationRoutes.heatInit();
    });
}

exports.index = function(req, res){
    res.render("index", { title: "Express" });
};
exports.populationInfo = _populationInfo;
exports.handleFilterRequest = _handleFilterRequest;
exports.tableNext = _tableNext;
exports.imageGridNext = _imageGridNext;
exports.save = _save;
exports.getStatistics = _getStatistics;
exports.postDataSource = _postDataSource;

//exports.heat = _heat;

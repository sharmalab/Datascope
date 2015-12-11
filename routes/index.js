
/*
 * GET home page.
 */

var interactiveFilters = require("../modules/interactiveFilters"),
    dataSource          = require("../modules/dataSource"),
    dataDescription     = require("../modules/dataDescription"),
    visualization       = require("../modules/visualization"),
    json2csv            = require("json2csv");
//var TABLE_STATE = 0;


var CURRENTDATA = {};


//
//#### handleFilterRequest(request, response, next)
//Is fired on GET "/data" request. Performs filtering using the filtering information provided in the GET parameter:    ```filter```    
//
var _handleFilterRequest = function(req,res, next) {
    var dimensions = interactiveFilters.getDimensions();
    var groups = interactiveFilters.getGroups();
    //var filteringAttributes = dataDescription.getFilteringAttributes();
    var filter = {};
    filter = req.param("filter") ? JSON.parse(req.param("filter")) : {};
    //req.session["f"] = filter;
    // Loop through each dimension and check if user requested a filter

    // Assemble group results and and the maximum value for each group
    var results = {};
    /*
    var filterDim = {};
    filterDim = {};
    //var filterRange=[];
    for(var key in filter){
        filterDim = key;
    }
    */
    
    Object.keys(dimensions).forEach(function (dim) {

        if (filter[dim]) {
            //array
            if(filter[dim].length > 1){
                //console.log("len > 1")
                if(dataDescription.getDataType(dim) == "enum"){
                    //console.log("enum")

                    dimensions[dim].filterFunction(function(d){
                        return filter[dim].indexOf(d) >= 0; 
                    });
                }
                else{
                    dimensions[dim].filterRange(filter[dim]);
                }

            } else {

                dimensions[dim].filter(filter[dim][0]);
            }
        } else {
            dimensions[dim].filterAll(null);
        }
    });
    Object.keys(groups).forEach(function(key) {
        //console.log(key)
        results[key] = {values:groups[key].all(),top:groups[key].top(1)[0].value};
    });

    if(visualization.hasVisualization("imageGrid")){
        CURRENTDATA = dimensions["imageGrid"].top(Infinity);

        //Image Grid stuff
        //console.log(typeof(CURRENTDATA["values"]));
        //console.log(CURRENTDATA)
        //console.log(visualization.getVisualizationType())

        //if(visualization.getVisualizationType() == "imageGrid"){
            //console.log(dimensions["imageGrid"].top(100))
        var reqLength = 100;
        var paginate = true;
        if(CURRENTDATA.length < reqLength)
            paginate = false;
        results["imageGrid"] = {
            values: CURRENTDATA.slice(0,100),
            active: all.value(),
            size: size,
            state: Math.floor(reqLength/100),
            paginate: paginate,
            finalState: 3
        };


    }


    res.writeHead(200, { "content-type": "application/json" });
    res.end((JSON.stringify(results)));
};

var _imageGridNext = function(req, res, next){
    var dimensions = interactiveFilters.getDimensions(),
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

var _tableNext = function(req, res, next){
    var dimensions = interactiveFilters.getDimensions(),
        groups = interactiveFilters.getGroups(),
        filteringAttributes = dataDescription.getFilteringAttributes(),
        state = req.param("state") ? JSON.parse(req.param("state")) : 1,
        results = {};
        TABLE_DATA = dimensions[filteringAttributes[0]["attributeName"]].top(Infinity);
        var dataTableAttributes = visualization.getAttributes("dataTable");


        var len = TABLE_DATA.length;
    //var reqParams = iDisplayLength, iDisplayStart
    var start = req.query.start;
    var length = req.query.length;
    var TABLE_DATA = TABLE_DATA.slice(start, start+length);
    var DATA_ARRAY = [];
    for(var i in TABLE_DATA){
        //var row = Object.keys(TABLE_DATA[i]).map(function(k) { return TABLE_DATA[i][k] });
        var row = [];
        for(var j in dataTableAttributes){
            var attrName = dataTableAttributes[j]["attributeName"];
            row.push(TABLE_DATA[i][attrName]);
        }
        /*

        for(var j in TABLE_DATA[i]){
            //console.log(j)

            row.push(TABLE_DATA[i][j])
        }
        */
        DATA_ARRAY.push(row);
    }
    var all = {};
    all.value = function(){return 0;};
    results = {
        data: DATA_ARRAY,
        active: all.value(),
        state: state,
        draw: req.query.draw,
        recordsTotal: dataSource.getTotalRecords(),          //FIX THIS!!!!!!!!!!!!!!!!!!!!!!!!!!!
        recordsFiltered: len
    };
    res.writeHead(200, {"content-type": "application/json"});
    res.end(JSON.stringify(results));
};

var _save = function(req, res, next){

    var dimensions = interactiveFilters.getDimensions();
    var groups = interactiveFilters.getGroups();
    var filteringAttributes = dataDescription.getFilteringAttributes();



    var requiredAttributes = req.param("attributes") ? JSON.parse(req.param("attributes")) : {};
    
    requiredAttributes = requiredAttributes["list"];
    type = requiredAttributes["type"] || "csv"; 
    var results = {}
    TABLE_DATA = dimensions[filteringAttributes[0]["name"]].top(Infinity);
    
    if(type == "json"){
        res.writeHead(200,{"content-type": "application/json"});
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
var _heat = function(req, res){

    var results = {visualization: {values: group.all(),top: group.top(1)[0].value}};

    res.writeHead(200, {"content-type": "application/json" });
    res.end((JSON.stringify(results)));
};

exports.index = function(req, res){
        res.render("index", { title: "Express" });
};
exports.handleFilterRequest = _handleFilterRequest;
exports.tableNext = _tableNext;
exports.imageGridNext = _imageGridNext;
exports.save = _save;

exports.heat = _heat;

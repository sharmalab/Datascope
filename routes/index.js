
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


/*
var RangedTwoDimensionalFilter = function(filter){

};
*/

//
//#### handleFilterRequest(request, response, next)
//Is fired on GET "/data" request. Performs filtering using the filtering information provided in the GET parameter:    ```filter```    
//
var _handleFilterRequest = function(req,res) {
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

            if(filter[dim].type){
                //console.log(dim);
                //console.log(filter[dim].filters);
                dimensions[dim].filterFunction(function(d){
                    //console.log(d); 
                    var f = filter[dim].filters[0];
					//var filters=  filter[dim].filters;
					//var filter = filters[0];
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
                    //console.log(fromBottomLeft);
                    //console.log(x >= fromBottomLeft[0][0] && x < fromBottomLeft[1][0] && y >= fromBottomLeft[0][1] && y < fromBottomLeft[1][1]);
                    return x >= fromBottomLeft[0][0] && x < fromBottomLeft[1][0] && y >= fromBottomLeft[0][1] && y < fromBottomLeft[1][1];
                    //console.log(d);
                });
                //continue;
            }
            else
            {
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
        //CURRENTDATA = dimensions["imageGrid"].top(Infinity);
        //
        var filteringAttributes = dataDescription.getFilteringAttributes(),
        CURRENTDATA = dimensions[filteringAttributes[0]["attributeName"]].top(Infinity);

        //CURRENTDATA = dimensions["group"].top(Infinity);
        console.log("imageGrid");
        //Image Grid stuff
        //console.log(typeof(CURRENTDATA["values"]));
        //console.log(CURRENTDATA)
        //console.log(visualization.getVisualizationType())

        //if(visualization.getVisualizationType() == "imageGrid"){
            //console.log(dimensions["imageGrid"].top(100))
        console.log(CURRENTDATA.length);
        var reqLength = 100;
        var paginate = true;
        if(CURRENTDATA.length < reqLength)
            paginate = false;
        results["imageGrid"] = {
            values: CURRENTDATA.slice(0,100),
            active: 100,
            size: 100,
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

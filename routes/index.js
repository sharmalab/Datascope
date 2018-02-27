var interactiveFilters = require("../modules/interactiveFilters"),
    dataSource          = require("../modules/dataSource"),
    dataDescription     = require("../modules/dataDescription"),
    visualization       = require("../modules/visualization"),
    customStatistics    = require("../modules/customStatistics"),
    json2csv = require("json2csv");

//:var superagent = require

// Load datalib.
var dl = require('datalib');

var CURRENTDATA = {};

var GLOBAL_TIME_FILTER = {
      start: new Date("2018-01-01T06:00:00Z"),
      end: new Date("2018-01-02T07:00:00Z")
};

//var GLOBAL_TIME_FILTER = 

var _containsTwoDimensional = function (f, d) {
    var fromBottomLeft;

    if(f[0] instanceof Array) {
        fromBottomLeft = [
            [Math.min(f[0][0], f[1][0]), Math.min(f[0][1], f[1][1])],
            [Math.max(f[0][0], f[1][0]), Math.max(f[0][1], f[1][1])]
        ];
    } /*else {
        //fromBottomLeft = [[filter[0], -Infinity], [filter[1], Infinity]];
        continue;
    }*/

    var x = d[0];
    var y = d[1];

    return x >= fromBottomLeft[0][0] && x < fromBottomLeft[1][0] && y >= fromBottomLeft[0][1] && y < fromBottomLeft[1][1];
};

var _containsMarker = function (f, d) {
    var fSouthWest=f._southWest,fNorthEast=f._northEast;
    var dLatLng = d.split(",");
    var dLat = dLatLng[0], dLng = dLatLng[1];

    return dLat >= fSouthWest.lat && dLat <= fNorthEast.lat && dLng >= fSouthWest.lng && dLng <= fNorthEast.lng;
};

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
                    if (dataDescription.getDataType(dim) === "enum") {
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
    var filteredData = dimensions[interactiveFiltersConfig[0].attributeName].top(Infinity);

    if(visualization.hasVisualization("imageGrid")){

        CURRENTDATA = dimensions[interactiveFiltersConfig.attributeName].top(100);

        var reqLength = 100;
        var paginate = true;
        if(CURRENTDATA.length < reqLength){
            paginate = false;
        }

        results.imageGrid = {
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

var plywood = require('plywood');
var ply = plywood.ply;
var $ = plywood.$;


var External = plywood.External;
var druidRequesterFactory = require('plywood-druid-requester').druidRequesterFactory;



var rangedFilters = ["Weight"];



function druidToDatascopeFormat(json){
    var dsjson = {};
    json = (JSON.parse(JSON.stringify(json)));

    json = json.data[0];

    for (var i in json) {
        //console.log("aggregates... ");
        var aggregate = json[i];
             

        dsjson[i] = {};
        dsjson[i]["values"] = [];
        
	//handle barcharts, converti druid number bucket ranges to datascope key-value pair	

        if( rangedFilters.indexOf(i) != -1){

        
	 
          var ag =  aggregate.data;
          for(var x in ag){
       
            aggregate.data[x][i] = ag[x][i]["start"];
          }
          //console.log(ag);
        }
        
        //console.log(aggregate.data["Weight"]);
        aggregate.data.map(function(d){
             
            if(d["Count"]){
              var obj = {};
              obj["value"] = d["Count"];
              obj["key"] = d[i];
              dsjson[i]["values"].push(obj);
            } else {
              dsjson[i]["values"].push(d);
            }
            
        });
    }
    dsjson.tables = json[data];

    
    /*
    json = json[0];
    json.map(function(d){
        
    });
    /*
    for(var key in json){
        var vals = json[key];
        for(var i in vals){
            var agg  = vals[i];

        }
    } */
    return dsjson;
}


/*
 *
 */ 
var populateInitialFilters = function(data){
  var filters = [];
  var initialKeys = [];
  //console.log("populate initial filters");
  for(var i in data){
    //console.log(data[i]);
    initialKeys[data[i]] = [];
    /*
    for(var j in data[i][0].values){
      console.log("...");
      console.log(data[i][j]);
      initialKeys[data[i]].push(data[i][j]);
    }
    */
  }
  //console.log(initialKeys);
  /*
  for(var i in data){
    console.log(i);
    console.log(data[i]);
    initialKeys[data[i]] = [];
    for(var j in data[i][j]){
      initialKeys[data[i]].push(data[i][j]);
    }
  }
  console.log(initialKeys);
  */
  //console.log(initialKe
}
/*
 * @api {get} request binned aggregated data from druid
 */

var wikiDataset, druidRequester, speedDataset;
setTimeout(function(){
    druidRequester = druidRequesterFactory({
          host: '127.0.0.1:8082' // Where ever your Druid may be
    });

    speedDataset = External.fromJS({
      engine: 'druid', 
      source: "experiments2",
      timeAttribute: 'time',
      context: {
        timeout: 1000
      },
      allowSelectQueries: true

    }, druidRequester);


    wikiDataset = External.fromJS({
          engine: 'druid',
          source: dataSource.getDruidSourceName(),  // The datasource name in Druid
          timeAttribute: 'time',  // Druid's anonymous time attribute will be called 'time',
          context: {
                  timeout: 10000 // The Druid context
          },
        allowSelectQueries: true
    }, druidRequester);
    context = {
          wiki: wikiDataset,
            seventy: 70
    }; 
},1000);

var _handleImage = function(req, res){

    filter = req.query.filter ? JSON.parse(req.query.filter) : {};

    var interactiveFiltersConfig = (interactiveFilters.getInteractiveFiltersConfig());
    var F = $("time").in(GLOBAL_TIME_FILTER)
    var filters =     $('wiki').filter(F)
    var ex = ply()
    // Define the external in scope with a filter on time and language
    .apply("wiki",filters)
    ex = ex.apply("Table", $('wiki').limit(10)); 
}


var initial_aggregations = {};

var GLOBAL_GRANULAR_SLICE = {
                      'start': new Date('2018-01-01T08:00:00Z'),
                      'end': new Date('2018-01-01T09:00:00Z')
};
var GLOBAL_OVERALL_TIME = {
  'start': new Date('2018-01-01T00:00:00Z'),
  'end': new Date('2018-01-02T00:00:00Z')
};

var _handleDruidRequest = function(req, res){
    var filter = {};
    filter = req.query.filter ? JSON.parse(req.query.filter) : {};
    var interactiveFiltersConfig = (interactiveFilters.getInteractiveFiltersConfig());

    var query = filter;
    console.log(Object.keys(query));
    if(Object.keys(query).length == 0){
      console.log("initial query");
    }

    var aggregations = [];

    for(var i in interactiveFiltersConfig) {
      var aggregate = interactiveFiltersConfig[i].attributeName;
      aggregations.push(aggregate);
    }
 


    var init_F = $("time").in(GLOBAL_TIME_FILTER); //filter first on time
    var F_time = $("time").in(GLOBAL_OVERALL_TIME)
    var ex = ply();
    ex = ex.apply('wiki', $('wiki').filter(init_F))

    //handle time here


     // ex.a
    for(var i in aggregations){
        var attribute = aggregations[i];
        var F = $("time").in(GLOBAL_GRANULAR_SLICE)
        //var F = $("time").in(GLOBAL_TIME_FILTER);
        if(Object.keys(query).includes('time')){
            var start_time = new Date(query['time'][0]);
            var end_time = new Date(query['time'][1]);  
          //if(time in query){
            var copy_start_time = new Date(query['time'][0]);
            var copy_start_time2 = new Date(query['time'][0]);
            if(copy_start_time2 > end_time){
              copy_start_time2 = end_time;
            }
          copy_start_time2.setHours(copy_start_time2.getHours()+1)           
          //}
          F = $("time").in({  
            'start': copy_start_time,
            'end': copy_start_time2
          });
          F_time = $("time").in({
            'start': start_time,
            'end': end_time
          });
        } else {
          F = $("time").in(GLOBAL_GRANULAR_SLICE);
          F_time = $("time").in(GLOBAL_OVERALL_TIME);
        }
        for(var f in query){

          if(f == attribute){
            continue;
          }

          if(f == "time"){
 

            continue;
          }
          var filterval = query[f];
          if(typeof filterval == "string"){
          
          } else if (typeof filterval == "object") {
            //F = F.and($(f).in(query[f]))
            if(f == "HR"){
              if(Object.keys(F).length === 0){
                F = $(f).in(query[f][0], query[f][1]);
              } else {
                F = F.and($(f).in(query[f][0], query[f][1]));
              }
              F_time = F_time.and($(f).in(query[f][0], query[f][1]));
            } else {
              if(Object.keys(F).length === 0){
                F = $(f).in(query[f]);
              } else {
                F = F.and($(f).in(query[f]));
              }
              F_time = F_time.and($(f).in(query[f]));
            }
          }
        }
        


        var dataSlice = "Data"+attribute;
      
       
        //if(attribute == "Gender"){ 
        //
        if(Object.keys(F).length === 0){
          
          ex = ex.apply(attribute, $('wiki').split("$"+attribute, attribute)
              .apply("Count", $('wiki').count()));
        } else {
         
          ex = ex.apply(dataSlice, $('wiki').filter(F))
            .apply(attribute, $(dataSlice).split("$"+attribute, attribute)
              .apply("Count", $(dataSlice).count()));
        }
        /*} else {
          var dataSlice = 'wiki';
        ex = ex.apply(attribute, $('wiki').split("$"+attribute, attribute)
              .apply("Count", $(dataSlice).count()));
        }*/
        
       
    }
      ex = ex.apply("HR2", $('wiki').filter(F_time))

      ex = ex.apply("HR", $("wiki").filter($("patientId").in($("HR2").split({"id": "$patientId"}).collect($("id")))).select("HR", "time", "patientId"));
    ex.compute(context).then(function(data){
      var datascopeData = druidToDatascopeFormat(data);
      var d = data.data[0].HR.data;
      var out = [];
      var i =0;
      d.map(function(x){
            var row = {};
            row.key = [x.patientId, x.time];
            row.value = x.HR;
            out.push(row);
      });
      //res.json(out);
      datascopeData.HR = d;
      res.json(datascopeData);
    });
};

var _handleDruidRequest2 = function(req, res){


    console.log("druid data source" +dataSource.getDruidSourceName());

    var filter = {};
    filter = req.query.filter ? JSON.parse(req.query.filter) : {};

    var interactiveFiltersConfig = (interactiveFilters.getInteractiveFiltersConfig());
  
    var query = filter;
    console.log(Object.keys(query));
    if(Object.keys(query).length == 0){
      console.log("initial query");
    }

    var aggregations = [];

    for(var i in interactiveFiltersConfig) {
      var aggregate = interactiveFiltersConfig[i].attributeName;
      aggregations.push(aggregate);
    }
    //console.log(aggregations);

    var F = $("time").in(GLOBAL_TIME_FILTER);
    var F_non_time = {};
  
    console.log(query);
    
    if(Object.keys(query).includes('time')){
      console.log("filtering on time");
      console.log(query['time']);
      var start_time = new Date(query['time'][0]);
      var end_time = new Date(query['time'][1]);  
      console.log("start time:"+ start_time)
      console.log("end time: "+end_time);

      var copy_start_time = new Date(query['time'][0]);
      var copy_start_time2 = new Date(query['time'][0]);
      if(copy_start_time2 > end_time){
        copy_start_time2 = end_time;
      }

      copy_start_time2.setHours(copy_start_time2.getHours()+1)
      console.log("hour time: "+copy_start_time);
      /*F = $("time").in({
  //                    'start': new Date('2018-02-08T00:00:00Z'),
//                      'end': new Date('2018-02-09T00:00:00Z')
      //start: new Date("2018-02-08T06:00:00Z"),
      //end: new Date("2018-02-08T07:00:00Z")
        'start': copy_start_time,
        'end': copy_start_time2
      });
      */
      console.log("hour end: "+copy_start_time2);
      F_non_time = $("time").in({
      
        'start': start_time,
        'end': end_time
      });
      
    } else{
      console.log("couldn't find time");
      F_non_time = $("time").in({
                      'start': new Date('2018-02-06T00:00:00Z'),
                      'end': new Date('2018-02-09T00:00:00Z')
      });
    }
//    console.log(F_non_time);
    /*  
    F_non_time = $("time").in({
                      'start': new Date('2018-02-06T00:00:00Z'),
                      'end': new Date('2018-02-09T00:00:00Z')
    });
  
    for(var f in query){
        //console.log(f);
        if(f == "time"){
          continue;
        }
        var filterval = query[f];
        if(typeof filterval == "string"){
            F_non_time = F_non_time.and($(f).is(filterval));
            F = F.and($(f).is(filterval));
        } else if (typeof filterval == "object") {
            if(f == "HR"){
              F = F.and($(f).in(query[f][0], query[f][1]));
              F_non_time = F_non_time.and($(f).in(query[f][0], query[f][1]));
            } else {
              F = F.and($(f).in(query[f]));
              F_non_time = F_non_time.and($(f).in(query[f]));
            }
        }
    }*/
    //F = F.and($("HR").in(0.08,0.3));
    //F_non_time = F_non_time.and($("HR").in(0.08, 0.3));
    //console.log(F);
    //console.log("Filters: "+F);
    //console.log("Aggregtaions: "+aggregations);
    //var filters =     $('wiki').filter(F);
   
    //var ex = ply()
    // Define the external in scope with a filter on time and language
    //.apply("wiki",filters)
    var ex = ply()
    ex = ex.apply("Table", $('wiki').limit(10));	
    //ex = ex.apply(

    for(var i in aggregations){
        var attribute = aggregations[i];
        var F = $("time").in(GLOBAL_TIME_FILTER);

        for(var f in query){

          if(f == attribute){
            continue;
          }

          if(f == "time"){
            continue;
          }
          var filterval = query[f];
          if(typeof filterval == "string"){
          
          } else if (typeof filterval == "object") {
            //F = F.and($(f).in(query[f]))
            if(f == "HR"){
              F = F.and($(f).in(query[f][0], query[f][1]));
              F_non_time = F_non_time.and($(f).in(query[f][0], query[f][1]));
            } else {
              F = F.and($(f).in(query[f]));
              F_non_time = F_non_time.and($(f).in(query[f]));
            }
          }
        }

        var dataSlice = "Data"+attribute;
        console.log(F);
        console.log(dataSlice);
        console.log(attribute);
        ex = ex.apply(dataSlice, $('wiki').filter(F))
          .apply(attribute, $(dataSlice).split("$"+attribute, attribute)
              .apply("Count", $('wiki').count()));


        /*
        ex = ex.apply(attribute, $('wiki').split("$"+attribute, attribute)
                .apply("Count", $('wiki').count()).sort('$Count', 'descending').limit(10));*/
    }
    //ex = ex.apply("HRSlice", $('wiki').filter().select('HR', 'time', 'patientId'))
    //ex = ex.apply(attribute, $('wiki').split('$'+attribute, attribute).apply("Count");
    /*
    var F2 = $("time").in({
			'start': new Date('2018-02-06T00:00:00Z'),
			'end': new Date('2018-02-09T00:00:00Z')
		})
    for(var f in query){
        var filterval = query[f];
        if(typeof filterval == "string"){
            F2 = F2.and($(f).is(filterval));
        } else if (typeof filterval == "object") {

            F2 = F2.and($(f).in(filterval));
        }
    }*/
    

    /*
    var filters2 = $('wiki').filter(F2);
    var ex3 = ply()
	.apply("wiki", filters2);
    ex3 = ex3.apply("time", $('wiki').select('HR', 'time', 'patientId')); 
    */

   // ex3 = ex3.select('HR', 'time', 'patientId');
    //var ex3 = ply().apply("wiki",
      //      $('wiki').filter(F_non_time).select('HR', 'time', 'patientId'));



  

    //ex = ex.apply('Weight', $('wiki').split($('Weight').numberBucket(100),'Weight').apply("Count", $('wiki').count()))
    //ex = ex.apply("imageGrid", $('wiki').limit(100));
    //ex = ex.apply("added",$("wiki").apply("ad", ($('added').numberBucket(10))));
    //ex = ex.apply("added", $('wiki').apply('added', ($('added').numberBucket(10))));
    //add table data c
    ex.compute(context).then(function(data){
        //console.log(data);
        console.log("this one went through");
        //var datascopeData = druidToDatascopeFormat(data);
        var datascopeData = {};
	//datascopeData["Image"] = {};

        //datascopeData.Gender.values = [ { value: 20, key: '0' }, { value: 14, key: '1' } ];


        var aggregates = Object.keys(datascopeData);
        var current_filters = Object.keys(query);
        var intersection = aggregates.filter(function(d){
          return current_filters.indexOf(d) !== -1;
        });

        var Q = req.query.filter ? JSON.parse(req.query.filter) : {};
        console.log("Queryyy");
        console.log(Q);
        

        if(Object.keys(filter).length === 1 ){
          //console.log("populating initial filters..");
          populateInitialFilters(datascopeData);
        }
        
        function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
        res.json(datascopeData);
	res.end();
      /*
       ex3.compute(context).then(function(data2){
            console.log("this is the timeseries data");
	      var d = data2.data[0].wiki.data;
	      var out = [];
	      var i =0;
	      d.map(function(x){
		    //console.log(x);
		    var row = {};
		    row.key = [x.patientId, x.time];
		    row.value = x.HR;
		    //console.log(row);
		    out.push(row);
	      });
	      //res.json(out);
	      datascopeData.time = d;
              /*
              if(Object.keys(query).length == 0){
                //console.log("initial query");
                initial_aggregations[query] = datascopeData;
              }
              //console.log
              Q_str = JSON.stringify(Q);
              initial_aggregations[Q_str] = datascopeData;
              //console.log(initial_aggregations);
              //console.log(JSON.stringify(Object.keys(initial_aggregations)[0]));
              //var Q = JSON.parse(filter);
              console.log(Q);

              for(var i in intersection){
                var attribute = intersection[i];
                console.log(datascopeData[attribute]);
            
                var currAttrData = datascopeData[attribute];
                console.log("Query: ");
                console.log(query);
                //delete Q[attribute];
                console.log("initial aggregation keys");
                //console.log(initial_aggregations);
                console.log(Object.keys(initial_aggregations));
                var Q2 = _objectWithoutProperties(Q, [f]);
                console.log("original query");
                console.log(Q);
                //datascopeData[attribute] = initial_aggregations[Q];
                console.log("new query without current attribute");
                console.log(Q2);
                console.log(Object.keys(initial_aggregations));
                Q2_str = JSON.stringify(Q2);
                console.log(initial_aggregations[Q2_str][attribute]);
                //datascopeData[attribute] = initial_aggregations[Q.splice(Q.indexOf(attribute))];
                //datascopeData[attribute] = initial_aggregations[Q2_str][attribute];
              }            
	      res.json(datascopeData);
	      res.end();
	      //res.end();
       });
       */
    });     
};


var _timeSeriesData = function(req, res){


}


var _imageGridNext = function(req, res){
    var dataSourceName = req.query.dataSourceName;
    var dimensions = interactiveFilters.getDimensions(dataSourceName),
        results = {},
        imageGridData = dimensions.imageGrid.top(Infinity);


    var state = req.query.state;
    var length = req.query.length || 100;
    var finalState = Math.floor(imageGridData.length/length);
    var paginate = true;
    if(imageGridData.length < length){
        paginate = false;
    }
    var start = state*length;
    results.imageGrid = {
        "values": imageGridData.slice(start, start+length),
        state: state,
        finalState: finalState,
        paginate: paginate
    };
    
    res.writeHead(200, {"content-type": "application/json"});
    res.end(JSON.stringify(results));
};


var _druidTableNext = function(req, res){
    var filter = {};
    filter = req.query.filter ? JSON.parse(req.query.filter) : {};
    //console.log("filters:");
    //console.log(filter);
    var query = filter;
    var aggregations = [
        //"countryIsoCode", "page", "isAnonymous", "isUnpatrolled", "isMinor", "isRobot", "channel"
        "Creative_Type", "Major_Genre"
    ];

    var F = $("time").in(GLOBAL_TIME_FILTER)


    for(var f in query){
        var filterval = query[f];
        if(typeof filterval == "string"){
            F = F.and($(f).is(filterval));
        } else if (typeof filterval == "object") {
            F = F.and($(f).in(filterval));
        }

    }
    var filters =     $('wiki').filter(F)
    //console.log("druidTableNext");
    //console.log(filters);

     
    var ex = ply()
    // Define the external in scope with a filter on time and language
    .apply("wiki",filters)

    ex = ex.apply("Table", $('wiki').limit(10));
   
    ex.compute(context).then(function(data){
        //console.log("filtered data: ");
        //console.log(data.data[0].added.data);
        //var datascopeData = druidToDatascopeFormat(data);
        var d = (data.data[0].Table.data);
        var response = {};
        var out = [];
        for(var i in d){
            var row = d[i];
            var nrow = [];
            for(var j in row){
                nrow.push(row[j]);
            }
            out.push(nrow);
        }
        //console.log(out);
        response.data = out;
        res.json(response);
        res.end();
    });
}


/*
 *  @api {get] /timeseries Request timeseries data 
 */
var _getTimeSeriesData = function(req, res){

  var filters = req.query.filters;

  var ctx = {
        wiki: speedDataset,
        seventy: 70
  }; 


  var ex2 = ply().apply("wiki", 
          $('wiki').filter($('time').in({
		  start: new Date("2014-02-08T06:00:00Z"),
	  	end: new Date("2018-02-08T07:00:00Z")
	   }).and($('Speed').lessThan(1000)))//.and($('Expt').lessThan(6i))));
          .select('Speed', 'Expt', 'Run', 'time'));


 ex2.compute(ctx).then(function(data){
    res.json(data);
    res.end();
 });


};


var _getSepsisTimeData = function(req, res){
	var filters = req.query.filters;
	var ctx = {
		  wiki: wikiDataset,
		  seventy: 70
	}; 
	var ex3 = ply().apply("wiki",
		$('wiki').filter($('time').in({
			'start': new Date('2018-02-06T00:00:00Z'),
			'end': new Date('2018-02-09T00:00:00Z')
		})).select('HR', 'time', 'patientId'));


   ex3.compute(ctx).then(function(data){
	  var d = data.data[0].wiki.data;
	  var out = [];
          var i =0;
	  d.map(function(x){
		//console.log(x);
		var row = {};
		row.key = [x.patientId, x.time];
		row.value = x.HR;

		out.push(row);
	  });
	  res.json(out);


	  res.end();
   });



};

/**
 * @api {get} dataTable/next Request paginated data for datatable
 * @apiGroup dataTable
 * @apiName DataTableNext
 * @apiParam {String} dataSourceName Use 'main' for default or specify dataSourceName
 * @apiParam {Number} start Starting offset
 * @apiParam {Number} length Number of rows
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

    var TABLE_DATA = dimensions[interactiveFiltersConfig[0].attributeName].top(10,start);


    var dataTableAttributes = visualization.getAttributes("dataTable");
    //var dataTableAttributes = [];

    for( var i in req.query.columns){
      if(1){
      dataTableAttributes.push(req.query.columns[i].name);
      }
    }
   
    /* if the query contains a value to be searched,
        then filter the rows that don't contain the value

    var searchValue = req.query.search.value;
    if (searchValue) {
        dimensions[interactiveFiltersConfig[0]["attributeName"]].filter(function(d){
         
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
    //var len = TABLE_DATA.length;

    var length = 1*req.query.length;
    //var end = start+length;

    var DATA_ARRAY = [];
    TABLE_DATA = dimensions[interactiveFiltersConfig[0].attributeName].top(length,start);   

    for(var i2 in TABLE_DATA){
        if(! TABLE_DATA.hasOwnProperty(i2)){
          continue;
        }
        var row = [];
        for(var j in dataTableAttributes){
          if(!dataTableAttributes.hasOwnProperty(j)){
            continue;
          }
            var attrName = dataTableAttributes[j].attributeName;
            row.push(TABLE_DATA[i2][attrName]);
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
        recordsFiltered: dimensions[interactiveFiltersConfig[0].attributeName].top(Infinity).length
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


var _druidPopulationInfo = function(req, res, next){
 

    var filter = {};
    filter = req.query.filter ? JSON.parse(req.query.filter) : {};


    var query = filter;
    var total = 39244;
    console.log(query);
    var F = $("time").in(GLOBAL_GRANULAR_SLICE)
    var F_time = F;
    if(Object.keys(query).includes('time')){
        var start_time = new Date(query['time'][0]);
        var end_time = new Date(query['time'][1]);  
      //if(time in query){
        var copy_start_time = new Date(query['time'][0]);
        var copy_start_time2 = new Date(query['time'][0]);
        if(copy_start_time2 > end_time){
          copy_start_time2 = end_time;
        }
      copy_start_time2.setHours(copy_start_time2.getHours()+1)           
      //}
      F = $("time").in({  
        'start': copy_start_time,
        'end': copy_start_time2
      });
      F_time = $("time").in({
        'start': start_time,
        'end': end_time
      });
    } else {
      F = $("time").in(GLOBAL_GRANULAR_SLICE);
      F_time = $("time").in(GLOBAL_OVERALL_TIME);
    }
    for(var f in query){

          if(f == "time"){
 

            continue;
          }
          var filterval = query[f];
          if(typeof filterval == "string"){
          
          } else if (typeof filterval == "object") {
            //F = F.and($(f).in(query[f]))
            if(f == "HR"){
              if(Object.keys(F).length === 0){
                F = $(f).in(query[f][0], query[f][1]);
              } else {
                F = F.and($(f).in(query[f][0], query[f][1]));
              }
              F_time = F_time.and($(f).in(query[f][0], query[f][1]));
            } else {
              if(Object.keys(F).length === 0){
                F = $(f).in(query[f]);
              } else {
                F = F.and($(f).in(query[f]));
              }
              F_time = F_time.and($(f).in(query[f]));
            }
          }
    }
    console.log(F);
    /*   
    for(var f in query){
        var filterval = query[f];

        if(typeof filterval == "string"){
            F = F.and($(f).is(filterval));
        } else if (typeof filterval == "object") {
            F = F.and($(f).in(filterval));
        }

    }*/
    var filters =     $('wiki').filter(F_time);
    var original_filters = $('wiki').filter(F_time);

    var ex2 = ply()
      .apply("wiki", F_time)
      .apply("Count", $("wiki").count())


    var ex = ply()
    // Define the external in scope with a filter on time and language
    .apply("wiki", $("wiki").filter($("time").in(GLOBAL_GRANULAR_SLICE)))
    .apply("Original", $("wiki").count())
    .apply("wiki2", filters)
    .apply("Count", $('wiki2').count());

 
    ex.compute(context).then(function(data){
       //var datascopeData = druidToDatascopeFormat(data);
       //
//        ex2.compute(context).then(function(original_data){
        var response = {};
        response.Current = data.data[0].Count;
        response.Total = data.data[0].Original;
        res.json(response);
        res.end();         
//        });

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
    var statistics = {};
    var dimensions = interactiveFilters.getDimensions(dataSourceName),
        interactiveFiltersConfig = interactiveFilters.getInteractiveFiltersConfig();

    var TABLE_DATA = dimensions[interactiveFiltersConfig[0].attributeName].top(Infinity);

    var statisticsToReturn = {};
    if (attr) {
        statistics = interactiveFilters.getFilterConfig(attr).statistics;
        if (statistics) {
            var summary = dl.summary(TABLE_DATA, [attr])[0];

            if (statistics.constructor === String) {
                if (statistics === "default") {
                    if (summary.type === "number" ||
                            summary.type === "integer") {
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
                });
            }
        }
    } else {
        var attr1 = req.query.attr1;
        var attr2 = req.query.attr2;

        if (attr1 && attr2) {
            statistics = visualization.getStatistics("twoDimStat");
            if (statistics.constructor === String) {
                if (statistics === "default") {
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
                        statisticsToReturn.correlation = dl.cor(TABLE_DATA, attr1, attr2);
                    } else if (stat === "rankCorrelation") {
                        // Spearman rank correlation of two arrays of values
                        statisticsToReturn.rankCorrelation = dl.cor.rank(TABLE_DATA, attr1, attr2);
                    }else if (stat === "dotProduct") {
                        // vector dot product of two arrays of numbers
                        statisticsToReturn.dotProduct = dl.dot(TABLE_DATA, attr1, attr2);
                    } else if (stat === "euclidianDistance") {
                        //vector Euclidian distance between two arrays of numbers
                        statisticsToReturn.euclidianDistance = dl.dist(TABLE_DATA, attr1, attr2);
                    } else if (stat === "covariance") {
                        // covariance between two arrays of numbers
                        statisticsToReturn.covariance = dl.covariance(TABLE_DATA, attr1, attr2);
                    } else if (stat === "cohensd") {
                        // Cohen's d effect size between two arrays of numbers
                        statisticsToReturn.cohensd = dl.cohensd(TABLE_DATA, attr1, attr2);
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

exports.getSepsisTimeData = _getSepsisTimeData;
exports.getTimeSeriesData = _getTimeSeriesData;
exports.populationInfo = _populationInfo;
exports.druidPopulationInfo = _druidPopulationInfo;
exports.handleFilterRequest = _handleFilterRequest;
exports.handleDruidRequest = _handleDruidRequest; 
exports.druidTableNext = _druidTableNext;
exports.tableNext = _tableNext;
exports.imageGridNext = _imageGridNext;
exports.save = _save;
exports.getStatistics = _getStatistics;

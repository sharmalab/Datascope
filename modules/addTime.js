/* Adds fake time dimension, loads data to druid */

var fs = require('fs');
var randomDate = require('random-datetime');
var request = require('superagent');



var loadJson = function(path, cb) {
    //console.log("path: "+path);
    fs.readFile(path, 'utf8', function(err,data){
        data = (JSON.parse(data));
        cb(data);
    });
}


var addTime = function(data){
    var out_data = [];
    data.map(function(d){

        d["time"] = randomDate({month: 12, year: 2016});
        out_data.push(d);
    });

    return out_data;

};




if(process.argv.length != 5){
	console.log("Usage: node addTime.js <input_path> <output_path> <source_name>");
	process.exit(1);
}

//var dimensions = ["Creative_Type", "Major_Genre", "IMDB_Votes", "Rotten_Tomatoes_Rating", "MPAA_Rating", "Worldwide_Gross", "Source", "Running_Time_min", "Netflix", "IMDB_Rating", "Production_Budget"];
var dimensions = ["When__Time_of_day", "When__Phase_of_flight", "Wildlife__Size", "Wildlife__Species", "Effect__Amount_of_damage", "Aircraft__Airline_Operator"];
var inPath = process.argv[2];
var outPath = process.argv[3];

var sourceName = process.argv[4];

var dataSource = {
    "sourceName": sourceName, 
    "sourceType": "jsonFile"
};

var out = loadJson(process.argv[2], function(data){

    var str = "";
    var outdata = addTime(data);
    outdata.map(function(d){
        str+= JSON.stringify(d);
        str+="\n";
    });
    fs.writeFile(outPath, str , function(err, data){
        //console.log("saved");  
        // console.log(str);
    });

    //generate spec
    
    var ingestionSpec = {};

    ingestionSpec.type = "index_hadoop";
    ingestionSpec.spec = {};
    ingestionSpec.spec.dataSchema = {};
    ingestionSpec.spec.dataSchema.dataSource = dataSource.sourceName;
    ingestionSpec.spec.dataSchema.parser = {
        "type": "hadoopyString",
        "parseSpec": {
            "format": "json",
            "timestampSpec": {
                "column": "time",
                "format": "auto"
            },
	    "dimensionsSpec": {
	    	"dimensions": dimensions,
		"dimensionExclusions": [],
		"spatialDimensions": []
	    }
        }
    };

    ingestionSpec.spec.dataSchema.metricsSpec =  [];
    ingestionSpec.spec.dataSchema.granularitySpec =  {
        "type" : "uniform",
        "segmentGranularity" : "day",
        "queryGranularity" : "none",
        "intervals":  ["2015-09-12/2017-09-13"]
    };
    ingestionSpec.spec.ioConfig = {
        "type": "hadoop", 
        "inputSpec": {
            "type": "static",
            "paths": outPath
        }
    };
    ingestionSpec.spec.tuningConfig = {
      "type" : "hadoop",
      "partitionsSpec" : {
        "type" : "hashed",
        "targetPartitionSize" : 5000000
      },
      "jobProperties" : {}
    }

    request.post('http://localhost:8090/druid/indexer/v1/task')
        .send(ingestionSpec)
//        .set()
        .end(function(err, res){
            if(err){
                //console.log("Error");
                //console.log(err);
            } 
            //console.log(res);
        });
    console.log(JSON.stringify(ingestionSpec));    
});




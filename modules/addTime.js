

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


var dataSource = {
    "sourceName": "movies", 
    "sourceType": "jsonFile"
};


var inPath = process.argv[2];
var outPath = process.argv[3];
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
        "parserSpec": {
            "format": "json",
            "timestampSpec": {
                "column": "timestamp",
                "format": "auto"
            }
        },
        "dimensionsSpec": {
            "dimensions": ["Creative_Type", "Major_Genre", "IMDB_Votes", "Rotten_Tomatoes_Rating", "MPAA_Rating", "Worldwide_Gross", "Source", "Running_Time_min", "Netflix", "IMDB_Rating", "Production_Budget"],
            "dimensionExclusions": [],
            "spatialDimensions": []
        }
    };

    ingestionSpec.spec.metricSpec =  [];
    ingestionSpec.spec.granularitySpec =  {
        "type": "uniform",
        "segmentGranularity": "DAY",
        "queryGranularity": "NONE",
        "intervals": ["2016-12-31/2016-12-01"]
    };
    ingestionSpec.spec.ioConfig = {
        "type": "hadoop", 
        "inputSpec": {
            "type": "static",
            "paths": "/home/griyer/dev/Datascope/data/out.json"
        }
    };
    ingestionSpec.spec.tuningConfig = {
        "type": "hadoop"
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




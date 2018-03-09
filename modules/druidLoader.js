
//take a json file
//add time to it
//create ingestion spec
//load it to druid 
class DruidLoader {

  constructor(){

  }

  //adds a time dimension to a given data json array
  //should convert it to a steaming function
  addTime(data){
    var out_data = [];
    data.map(function(d){
        d["time"] = randomDate({month: 12, year: 2016});
        out_data.push(d);
    });
    return out_data;
  }

  createIngestionSpec(dimensions){
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
    return ingestionSpec;
  }


}

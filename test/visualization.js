var should = require("should");

var http = require("http");
var request = require("superagent");
var expect = require("expect.js");


describe("visualization", function() {

    describe("multiple visualizations", function(){
      var visualization = require("../modules/visualization");

      var vconfig = visualization.init("./examples/newDataSourceConfig/config/visualization.json");

      it("dataTable test", function(done){
        
      });
      

    });
});

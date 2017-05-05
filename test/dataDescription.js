var should = require("should");

var http = require("http");
var request = require("superagent");
var expect = require("expect.js");


describe("dataDescription", function() {
  var dataSource, dataDescription, ds, dd;

  it("should load correctly through require", function(done){
    dataSource = require("../modules/dataSource");
    dataDescription = require("../modules/dataDescription");
    done();
  });

  it("should initalize correctly", function(done){
    ds = dataSource.init(
      "./examples/newDataSourceConfig/config/dataSource.json");
    dd = dataDescription.init(
      "./examples/newDataSourceConfig/config/dataDescription.json");
    done();
  });

  it("should return filteringAttributes and visualAttributes", function(
    done) {

    //console.log(ds)
    dataSource.loadData(function(data) {
      //console.log(data)
      var filteringAttributes = dataDescription.getFilteringAttributes();
      var filteringAttributesTruth = ["A", "B", "C", "D"];
      var farray = [];
      for (var i in filteringAttributes) {
        var filteringAttribute = filteringAttributes[i][
          "attributeName"
        ];
        farray.push(filteringAttribute);
      }

      var visualAttributes = dataDescription.getVisualAttributes();
      var visualAttributesTruth = ["A", "C", "D"];
      var varray = [];

      for (var i in visualAttributes) {
        var visualAttribute = visualAttributes[i]["attributeName"];
        varray.push(visualAttribute);
      }

      (farray).should.be.eql(filteringAttributesTruth);
      (varray).should.be.eql(visualAttributesTruth);

    });
    done()
  });
});
